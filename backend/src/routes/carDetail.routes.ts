import { Router, Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { getCarAvailability, getUnavailableDates } from '../services/availabilityService.js';

const router = Router();

// Get single car by ID (public endpoint with seller details)
// This route is registered separately to avoid conflicts with /rent and /buy
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Calculate availability using already-fetched rentals (no extra query!)
    let carWithAvailability: any = { ...car };
    if (car.isForRent) {
      const rentals = car.rentals || [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (rentals.length === 0) {
        carWithAvailability = {
          ...carWithAvailability,
          availability: {
            status: 'AVAILABLE' as const,
            isCurrentlyRented: false,
            bookedDates: [],
            activeRentalsCount: 0,
          },
        };
      } else {
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

        carWithAvailability = {
          ...carWithAvailability,
          availability: {
            status,
            isCurrentlyRented,
            nextAvailableDate: nextAvailableDate.toISOString().split('T')[0],
            bookedUntil: latestEndDate.toISOString().split('T')[0],
            bookedDates,
            activeRentalsCount: rentals.length,
          },
        };
      }
    }

    res.json({ car: carWithAvailability });
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unavailable dates for a car (for date picker)
router.get('/:id/unavailable-dates', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { excludeRentalId } = req.query;

    const unavailableDates = await getUnavailableDates(
      id,
      excludeRentalId as string | undefined
    );

    res.json({ unavailableDates });
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

