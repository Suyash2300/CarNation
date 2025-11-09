import { Router, Response } from 'express';
import prisma from '../db/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { calculatePlatformFee } from '../services/platformFeeService.js';

const router = Router();

// Create purchase
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { carId, salePrice } = req.body;

    if (!carId || !salePrice) {
      return res.status(400).json({ error: 'carId and salePrice are required' });
    }

    // Get car
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    if (!car.isForSale || car.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Car is not available for sale' });
    }

    if (!car.sellerId || !car.seller) {
      return res.status(400).json({ error: 'Car seller information not found' });
    }

    if (car.sellerId === userId) {
      return res.status(400).json({ error: 'Cannot purchase your own car' });
    }

    // Calculate platform fee
    const { platformFee, sellerEarnings } = await calculatePlatformFee(salePrice);

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        carId,
        buyerId: userId,
        salePrice,
        platformFee,
        sellerEarnings,
        paymentStatus: 'PENDING',
        status: 'PENDING',
      },
      include: {
        car: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create purchase',
    });
  }
});

// Get user's purchases
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const where: any = { buyerId: userId };
    if (status) {
      where.status = status;
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        car: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get single purchase
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.buyerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ purchase });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

export default router;

