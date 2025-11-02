import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import {
  getActivePlatformFee,
  updatePlatformFee,
  calculatePlatformFee,
} from '../services/platformFeeService';

const router = Router();

// Get current platform fee (public endpoint)
router.get('/current', async (req: Request, res: Response) => {
  try {
    const feePercentage = await getActivePlatformFee();
    res.json({ feePercentage });
  } catch (error) {
    console.error('Error fetching platform fee:', error);
    res.status(500).json({ error: 'Failed to fetch platform fee' });
  }
});

// Get platform fee history (Admin only)
router.get('/history', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const fees = await prisma.platformFee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // Note: We'd need to add a relation to User if we want to show who updated it
      },
    });

    res.json({ fees });
  } catch (error) {
    console.error('Error fetching platform fee history:', error);
    res.status(500).json({ error: 'Failed to fetch platform fee history' });
  }
});

// Update platform fee (Admin only)
router.put('/update', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { feePercentage } = req.body;

    if (feePercentage === undefined || feePercentage === null) {
      return res.status(400).json({ error: 'feePercentage is required' });
    }

    if (typeof feePercentage !== 'number') {
      return res.status(400).json({ error: 'feePercentage must be a number' });
    }

    await updatePlatformFee(feePercentage, userId!);

    res.json({
      message: 'Platform fee updated successfully',
      feePercentage,
    });
  } catch (error) {
    console.error('Error updating platform fee:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update platform fee',
    });
  }
});

// Calculate platform fee for a given sale price (for preview)
router.post('/calculate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { salePrice } = req.body;

    if (!salePrice || typeof salePrice !== 'number') {
      return res.status(400).json({ error: 'salePrice is required and must be a number' });
    }

    const result = await calculatePlatformFee(salePrice);
    const feePercentage = await getActivePlatformFee();

    res.json({
      salePrice,
      feePercentage,
      ...result,
    });
  } catch (error) {
    console.error('Error calculating platform fee:', error);
    res.status(500).json({ error: 'Failed to calculate platform fee' });
  }
});

// Get transaction report with fees (Admin only)
router.get('/transactions', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    const where: any = {
      paymentStatus: 'PAID',
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            sellerId: true,
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
      take: Number(limit),
    });

    // Calculate totals
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const totalSales = purchases.reduce((sum, p) => sum + p.salePrice, 0);
    const totalSellerEarnings = purchases.reduce((sum, p) => sum + (p.sellerEarnings || 0), 0);

    res.json({
      transactions: purchases,
      summary: {
        totalTransactions: purchases.length,
        totalSales,
        totalPlatformFees: totalRevenue,
        totalSellerEarnings,
      },
    });
  } catch (error) {
    console.error('Error fetching transaction report:', error);
    res.status(500).json({ error: 'Failed to fetch transaction report' });
  }
});

export default router;

