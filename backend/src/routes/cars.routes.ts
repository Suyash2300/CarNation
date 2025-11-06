import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { getCarAvailability, getUnavailableDates } from '../services/availabilityService';

const router = Router();

// Get rental cars (public endpoint)
router.get('/rent', async (req: Request, res: Response) => {
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

    const [cars, total] = await Promise.all([
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
    ]);

    // Calculate availability for each car
    const carsWithAvailability = await Promise.all(
      cars.map(async (car) => {
        try {
          const availability = await getCarAvailability(car.id);
          return {
            ...car,
            availability,
          };
        } catch (error) {
          // If error calculating, return car without availability
          return {
            ...car,
            availability: {
              status: 'AVAILABLE' as const,
              bookedDates: [],
              isCurrentlyRented: false,
            },
          };
        }
      })
    );

    // Get unique cities and brands for filters
    const cities = await prisma.car.findMany({
      where: { isForRent: true, status: 'AVAILABLE', city: { not: null } },
      select: { city: true },
      distinct: ['city'],
    });

    const brands = await prisma.car.findMany({
      where: { isForRent: true, status: 'AVAILABLE' },
      select: { brand: true },
      distinct: ['brand'],
    });

    res.json({
      cars: carsWithAvailability,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        cities: cities.map((c) => c.city).filter(Boolean),
        brands: brands.map((b) => b.brand),
      },
    });
  } catch (error) {
    console.error('Error fetching rental cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cars for sale (public endpoint)
router.get('/buy', async (req: Request, res: Response) => {
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

    // Get unique cities and brands for filters
    const cities = await prisma.car.findMany({
      where: { isForSale: true, status: 'AVAILABLE', city: { not: null } },
      select: { city: true },
      distinct: ['city'],
    });

    const brands = await prisma.car.findMany({
      where: { isForSale: true, status: 'AVAILABLE' },
      select: { brand: true },
      distinct: ['brand'],
    });

    res.json({
      cars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        cities: cities.map((c) => c.city).filter(Boolean),
        brands: brands.map((b) => b.brand),
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

