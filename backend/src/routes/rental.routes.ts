import { Router, Response } from 'express';
import prisma from '../db/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import {
  createRentalBooking,
  validateRentalDates,
  checkCarAvailability,
  calculateRentalPrice,
} from '../services/rentalService';

const router = Router();

// Create a new rental booking
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'carId, startDate, and endDate are required',
      });
    }

    // Check if user is verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAadhaarVerified: true },
    });

    if (!user?.isAadhaarVerified) {
      return res.status(403).json({
        error: 'Aadhaar verification is required before booking a rental car',
      });
    }

    // Validate dates
    const dateValidation = validateRentalDates(new Date(startDate), new Date(endDate));
    if (!dateValidation.isValid) {
      return res.status(400).json({ error: dateValidation.error });
    }

    // Check availability
    const availability = await checkCarAvailability(carId, new Date(startDate), new Date(endDate));
    if (!availability.isAvailable) {
      return res.status(400).json({ error: availability.error });
    }

    // Create rental
    const rental = await createRentalBooking({
      carId,
      buyerId: userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.status(201).json({ rental });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create rental booking',
    });
  }
});

// Get rentals for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const where: any = {};
    
    // If user is admin, show all rentals; otherwise show only their rentals
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'ADMIN') {
      // Admin can see all rentals or filter by car owner
      if (status) {
        where.status = status;
      }
    } else {
      // Regular users see only their rentals
      where.buyerId = userId;
      if (status) {
        where.status = status;
      }
    }

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            primaryImage: true,
            city: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isAadhaarVerified: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ rentals });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get a single rental by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isAadhaarVerified: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
          },
        },
      },
    });

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      user?.role !== 'ADMIN' &&
      rental.buyerId !== userId &&
      rental.car.ownerId !== userId
    ) {
      return res.status(403).json({ error: 'Unauthorized access to rental' });
    }

    res.json({ rental });
  } catch (error) {
    console.error('Error fetching rental:', error);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
});

// Update rental status (Admin only or car owner)
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        car: {
          select: { ownerId: true, status: true },
        },
      },
    });

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      user?.role !== 'ADMIN' &&
      rental.car.ownerId !== userId
    ) {
      return res.status(403).json({ error: 'Unauthorized to update rental status' });
    }

    // Update rental status
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: { status },
      include: {
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            primaryImage: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
          },
        },
      },
    });

    // Update car status based on rental status
    if (status === 'ACTIVE') {
      await prisma.car.update({
        where: { id: rental.carId },
        data: { status: 'RENTED' },
      });
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      // Check if there are other active rentals
      const activeRentals = await prisma.rental.count({
        where: {
          carId: rental.carId,
          status: { in: ['PENDING', 'ACTIVE'] },
          id: { not: id },
        },
      });

      if (activeRentals === 0) {
        await prisma.car.update({
          where: { id: rental.carId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    res.json({ rental: updatedRental });
  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({ error: 'Failed to update rental status' });
  }
});

export default router;

