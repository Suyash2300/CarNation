import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { getCarAvailability, getUnavailableDates } from '../services/availabilityService.js';
import { dynamicCache, staticCache } from '../middleware/cache.js';

const router = Router();

// Get rental cars (public endpoint) - with dynamic cache (1 minute)
router.get('/rent', dynamicCache, async (req: Request, res: Response) => {
  try {
    const {
      city,
      brand,
      minPrice,
      maxPrice,
      sortBy = 'rentalPrice',
      sortOrder = 'asc',
      page = '1',
      limit = '12',
      includeUnavailable,
    } = req.query;

    const where: any = {
      isForRent: true,
    };

    // By default show only AVAILABLE cars; if includeUnavailable=true, include RENTED/BOOKED as well
    const includeAll = String(includeUnavailable).toLowerCase() === 'true';
    if (!includeAll) {
      where.status = 'AVAILABLE';
    } else {
      where.status = { in: ['AVAILABLE', 'RENTED', 'MAINTENANCE'] };
    }

    // Filter by city
    if (city && city !== 'all') {
      where.city = city;
    }

    // Filter by brand
    if (brand && brand !== 'all') {
      where.brand = brand;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.rentalPrice = {};
      if (minPrice) where.rentalPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.rentalPrice.lte = parseFloat(maxPrice as string);
    }

    // Sorting
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.rentalPrice = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'brand') {
      orderBy.brand = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'city') {
      orderBy.city = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc'; // Default: newest first
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [cars, total, filterData] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          rentals: {
            where: {
              status: {
                in: ['PENDING', 'ACTIVE'],
              },
            },
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
            },
            orderBy: {
              startDate: 'asc',
            },
          },
        },
      }),
      prisma.car.count({ where }),
      // Optimize: Get filters in parallel with main query
      // Always include all brands/cities (regardless of status) so users can filter by any brand
      Promise.all([
        prisma.car.findMany({
          where: { 
            isForRent: true, 
            city: { not: null } 
          },
          select: { city: true },
          distinct: ['city'],
        }),
        prisma.car.findMany({
          where: { 
            isForRent: true
          },
          select: { brand: true },
          distinct: ['brand'],
        }),
      ]),
    ]);

    // Calculate availability for each car using already-fetched rentals (no extra queries!)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const carsWithAvailability = cars.map((car) => {
      const rentals = car.rentals || [];
      
      if (rentals.length === 0) {
        return {
          ...car,
          availability: {
            status: 'AVAILABLE' as const,
            isCurrentlyRented: false,
            bookedDates: [],
            activeRentalsCount: 0,
          },
        };
      }

      // Check if car is currently rented
      const isCurrentlyRented = rentals.some((rental) => {
        const start = new Date(rental.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(rental.endDate);
        end.setHours(23, 59, 59, 999);
        return now >= start && now <= end;
      });

      // Find the latest end date
      const latestEndDate = rentals.reduce((latest, rental) => {
        const rentalEnd = new Date(rental.endDate);
        return rentalEnd > latest ? rentalEnd : latest;
      }, new Date(rentals[0].endDate));

      // Calculate next available date
      const nextAvailableDate = new Date(latestEndDate);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
      nextAvailableDate.setHours(0, 0, 0, 0);

      // Format booked dates
      const bookedDates = rentals.map((rental) => ({
        startDate: rental.startDate.toISOString(),
        endDate: rental.endDate.toISOString(),
        status: rental.status,
      }));

      // Determine status
      let status: 'AVAILABLE' | 'RENTED' | 'BOOKED_UNTIL';
      if (isCurrentlyRented) {
        status = 'RENTED';
      } else if (nextAvailableDate > now) {
        status = 'BOOKED_UNTIL';
      } else {
        status = 'AVAILABLE';
      }

      return {
        ...car,
        availability: {
          status,
          isCurrentlyRented,
          nextAvailableDate: nextAvailableDate.toISOString().split('T')[0],
          bookedUntil: latestEndDate.toISOString().split('T')[0],
          bookedDates,
          activeRentalsCount: rentals.length,
        },
      };
    });

    const [cities, brands] = filterData;

    // Sort brands alphabetically and filter out null/undefined
    const sortedBrands = brands
      .map((b) => b.brand)
      .filter((brand): brand is string => Boolean(brand))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })); // Case-insensitive sort

    res.json({
      cars: carsWithAvailability,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        cities: cities.map((c) => c.city).filter(Boolean).sort(),
        brands: sortedBrands,
      },
    });
  } catch (error) {
    console.error('Error fetching rental cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cars for sale (public endpoint) - with dynamic cache (1 minute)
router.get('/buy', dynamicCache, async (req: Request, res: Response) => {
  try {
    const {
      city,
      brand,
      minPrice,
      maxPrice,
      sortBy = 'salePrice',
      sortOrder = 'asc',
      page = '1',
      limit = '12',
    } = req.query;

    const where: any = {
      isForSale: true,
      status: 'AVAILABLE',
    };

    // Filter by city
    if (city && city !== 'all') {
      where.city = city;
    }

    // Filter by brand
    if (brand && brand !== 'all') {
      where.brand = brand;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.salePrice = {};
      if (minPrice) where.salePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.salePrice.lte = parseFloat(maxPrice as string);
    }

    // Sorting
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.salePrice = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'brand') {
      orderBy.brand = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'city') {
      orderBy.city = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc'; // Default: newest first
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.car.count({ where }),
    ]);

    // Get unique cities and brands for filters (optimized - single parallel query)
    const [cities, brands] = await Promise.all([
      prisma.car.findMany({
        where: { isForSale: true, status: 'AVAILABLE', city: { not: null } },
        select: { city: true },
        distinct: ['city'],
      }),
      prisma.car.findMany({
        where: { isForSale: true, status: 'AVAILABLE' },
        select: { brand: true },
        distinct: ['brand'],
      }),
    ]);

    res.json({
      cars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        cities: cities.map((c) => c.city).filter(Boolean).sort(),
        brands: brands
          .map((b) => b.brand)
          .filter((brand): brand is string => Boolean(brand))
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })), // Case-insensitive sort
      },
    });
  } catch (error) {
    console.error('Error fetching cars for sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// IMPORTANT: Single car route must be registered separately after the main routes
// to avoid route conflicts. Register it in server.ts after carsRoutes

