import { Router, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../db/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);

// Middleware to check if user is ADMIN
const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

router.use(requireAdmin);

// Dashboard Stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;

    // Total earnings from completed rentals
    const totalEarnings = await prisma.rental.aggregate({
      where: {
        car: { ownerId: adminId },
        paymentStatus: 'PAID',
        status: { in: ['COMPLETED', 'ACTIVE'] },
      },
      _sum: { totalAmount: true },
    });

    // Active rentals count
    const activeRentals = await prisma.rental.count({
      where: {
        car: { ownerId: adminId },
        status: 'ACTIVE',
      },
    });

    // Total cars available for rent
    const totalCars = await prisma.car.count({
      where: {
        ownerId: adminId,
        isForRent: true,
      },
    });

    // Pending Aadhaar verifications
    const pendingVerifications = await prisma.user.count({
      where: {
        isAadhaarVerified: false,
        aadhaarNumber: { not: null },
      },
    });

    // Today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEarnings = await prisma.rental.aggregate({
      where: {
        car: { ownerId: adminId },
        paymentStatus: 'PAID',
        createdAt: { gte: todayStart },
      },
      _sum: { totalAmount: true },
    });

    // This month's earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyEarnings = await prisma.rental.aggregate({
      where: {
        car: { ownerId: adminId },
        paymentStatus: 'PAID',
        createdAt: { gte: monthStart },
      },
      _sum: { totalAmount: true },
    });

    res.json({
      stats: {
        totalEarnings: totalEarnings._sum.totalAmount || 0,
        activeRentals,
        totalCars,
        pendingVerifications,
        todayEarnings: todayEarnings._sum.totalAmount || 0,
        monthlyEarnings: monthlyEarnings._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all cars owned by admin (for rent)
router.get('/cars', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const cars = await prisma.car.findMany({
      where: {
        ownerId: adminId,
        isForRent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ cars });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new car for rent
router.post('/cars', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const {
      brand,
      model,
      year,
      color,
      mileage,
      ownersCount,
      transmission,
      fuelType,
      seats,
      rentalPrice,
      description,
      images,
      primaryImage,
      city,
    } = req.body;

    if (!brand || !model || !year || !rentalPrice) {
      return res.status(400).json({
        error: 'Brand, model, year, and rental price are required',
      });
    }

    // Ensure primaryImage is in images array
    const allImages = images || [];
    if (primaryImage && !allImages.includes(primaryImage)) {
      allImages.unshift(primaryImage); // Add primary image at the beginning
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        color,
        mileage:
          mileage !== undefined && mileage !== null && mileage !== ''
            ? parseFloat(mileage)
            : null,
        ownersCount:
          ownersCount !== undefined && ownersCount !== null && ownersCount !== ''
            ? Number(ownersCount)
            : null,
        transmission,
        fuelType,
        seats: seats ? parseInt(seats) : null,
        rentalPrice: parseFloat(rentalPrice),
        description,
        images: allImages,
        primaryImage: primaryImage || allImages[0] || null,
        city,
        isForRent: true,
        status: 'AVAILABLE',
        ownerId: adminId,
      },
    });

    res.status(201).json({ car });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update car
router.put('/cars/:id', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    const updateData = req.body;

    // Verify car belongs to admin
    const existingCar = await prisma.car.findFirst({
      where: { id, ownerId: adminId },
    });

    if (!existingCar) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Convert numeric fields
    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.mileage !== undefined) {
      updateData.mileage =
        updateData.mileage !== null && updateData.mileage !== ''
          ? parseFloat(updateData.mileage)
          : null;
    }
    if (updateData.ownersCount !== undefined) {
      updateData.ownersCount =
        updateData.ownersCount !== null && updateData.ownersCount !== ''
          ? Number(updateData.ownersCount)
          : null;
    }
    if (updateData.seats) updateData.seats = parseInt(updateData.seats);
    if (updateData.rentalPrice) updateData.rentalPrice = parseFloat(updateData.rentalPrice);

    const car = await prisma.car.update({
      where: { id },
      data: updateData,
    });

    res.json({ car });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete car
router.delete('/cars/:id', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;

    // Verify car belongs to admin
    const existingCar = await prisma.car.findFirst({
      where: { id, ownerId: adminId },
    });

    if (!existingCar) {
      return res.status(404).json({ error: 'Car not found' });
    }

    await prisma.car.delete({ where: { id } });

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all rentals
router.get('/rentals', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { status } = req.query;

    const where: any = {
      car: { ownerId: adminId },
    };

    if (status) {
      where.status = status;
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ rentals });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get earnings report
router.get('/earnings', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { period = 'month' } = req.query;

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const earnings = await prisma.rental.findMany({
      where: {
        car: { ownerId: adminId },
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        car: {
          select: {
            brand: true,
            model: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarnings = earnings.reduce((sum, rental) => sum + rental.totalAmount, 0);

    res.json({
      period,
      totalEarnings,
      earnings,
      count: earnings.length,
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users pending Aadhaar verification
router.get('/users/pending-verification', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isAadhaarVerified: false,
        aadhaarNumber: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        aadhaarNumber: true,
        aadhaarFrontImage: true,
        aadhaarBackImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify user Aadhaar
router.post('/users/:id/verify-aadhaar', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.aadhaarNumber) {
      return res.status(400).json({ error: 'User has not submitted Aadhaar' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isAadhaarVerified: true,
        aadhaarVerifiedAt: new Date(),
        aadhaarVerifiedBy: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAadhaarVerified: true,
        aadhaarVerifiedAt: true,
      },
    });

    res.json({ user: updatedUser, message: 'Aadhaar verified successfully' });
  } catch (error) {
    console.error('Error verifying Aadhaar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { role, verified } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (verified !== undefined) where.isAadhaarVerified = verified === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isAadhaarVerified: true,
        aadhaarVerifiedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// Public (no auth) support-user endpoint can be registered separately if needed
export const supportRouter = Router();
// Public endpoint to pick a support user (ADMIN preferred, fallback SELLER)
supportRouter.get('/support-user', async (req, res) => {
  try {
    const roleParam = (req.query.role as string) || 'ADMIN';
    const allowedRoles: UserRole[] = ['ADMIN', 'SELLER', 'BUYER'];
    const normalizedRole = roleParam.toUpperCase() as UserRole;
    const role = allowedRoles.includes(normalizedRole) ? normalizedRole : 'ADMIN';
    const user = await prisma.user.findFirst({ where: { role }, select: { id: true } });
    if (!user) return res.status(404).json({ error: 'No support user available' });
    res.json({ userId: user.id });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only: mint short-lived JWT to impersonate the other participant in a conversation
router.post('/conversations/:id/impersonate', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { id } = req.params;
    const convo = await prisma.conversation.findUnique({
      where: { id },
      select: { participant1Id: true, participant2Id: true },
    });
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    // Determine counterpart user id (not the admin)
    const isAdminP1 = convo.participant1Id === adminId;
    const isAdminP2 = convo.participant2Id === adminId;
    if (!isAdminP1 && !isAdminP2) {
      return res.status(403).json({ error: 'Admin must be a participant' });
    }
    const otherUserId = isAdminP1 ? convo.participant2Id : convo.participant1Id;

    const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!otherUser) return res.status(404).json({ error: 'User not found' });

    // Token with short expiration (15 minutes)
    const token = generateToken({ userId: otherUser.id, email: otherUser.email, role: otherUser.role }, '15m');
    res.json({ token });
  } catch (error) {
    console.error('Impersonate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

