import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { getCarAvailability, getUnavailableDates } from '../services/availabilityService';

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

    // Add availability info for rental cars
    let carWithAvailability = car;
    if (car.isForRent) {
      try {
        const availability = await getCarAvailability(car.id);
        carWithAvailability = {
          ...car,
          availability,
        };
      } catch (error) {
        // If error, include default availability
        carWithAvailability = {
          ...car,
          availability: {
            status: 'AVAILABLE' as const,
            bookedDates: [],
            isCurrentlyRented: false,
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

