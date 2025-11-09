import { Router, Response } from 'express';
import prisma from '../db/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { applyPlatformFeeToPurchase } from '../services/platformFeeService.js';

const router = Router();

// Create a deal from a conversation
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { conversationId, carId, agreedPrice, dealType } = req.body;

    if (!conversationId || !carId || !agreedPrice || !dealType) {
      return res.status(400).json({
        error: 'conversationId, carId, agreedPrice, and dealType are required',
      });
    }

    if (!['PURCHASE', 'RENTAL'].includes(dealType)) {
      return res.status(400).json({
        error: 'dealType must be either PURCHASE or RENTAL',
      });
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    // Get the other participant
    const otherParticipantId = conversation.participant1Id === userId
      ? conversation.participant2Id
      : conversation.participant1Id;

    // Verify car exists and get seller/owner
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: {
        sellerId: true,
        ownerId: true,
        isForSale: true,
        isForRent: true,
      },
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Determine seller/owner based on deal type
    const sellerId = dealType === 'PURCHASE' ? car.sellerId : car.ownerId;
    
    if (!sellerId || sellerId === userId) {
      return res.status(400).json({ error: 'Invalid seller/owner for this deal' });
    }

    if (sellerId !== otherParticipantId) {
      return res.status(400).json({ error: 'The other participant must be the seller/owner' });
    }

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        conversationId,
        carId,
        buyerId: userId,
        sellerId,
        agreedPrice,
        dealType,
        status: 'PENDING',
      },
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
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ deal });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Helper function to create deal for a completed purchase
async function createDealForPurchase(purchase: any, options: { skipExistingCheck?: boolean } = {}) {
  try {
    if (!options.skipExistingCheck) {
      // Check if deal already exists
      const existingDeal = await prisma.deal.findFirst({
        where: {
          purchaseId: purchase.id,
        },
      });

      if (existingDeal) {
        return existingDeal;
      }
    }

    if (!purchase.car?.sellerId) {
      return null;
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        carId: purchase.carId,
        OR: [
          { participant1Id: purchase.buyerId, participant2Id: purchase.car.sellerId },
          { participant1Id: purchase.car.sellerId, participant2Id: purchase.buyerId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: purchase.buyerId,
          participant2Id: purchase.car.sellerId,
          carId: purchase.carId,
        },
      });
    }

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        conversationId: conversation.id,
        carId: purchase.carId,
        buyerId: purchase.buyerId,
        sellerId: purchase.car.sellerId,
        agreedPrice: purchase.salePrice,
        dealType: 'PURCHASE',
        status: 'COMPLETED',
        purchaseId: purchase.id,
      },
    });

    return deal;
  } catch (error) {
    console.error('Error creating deal for purchase:', error);
    return null;
  }
}

// Get deals for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    // First, check if there are any completed purchases without deals for this user
    // This fixes the issue where payments were completed before deal auto-creation was implemented
    const purchasesWithoutDeals = await prisma.purchase.findMany({
      where: {
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        OR: [
          { buyerId: userId },
          {
            car: {
              sellerId: userId,
            },
          },
        ],
      },
      include: {
        car: {
          select: {
            sellerId: true,
          },
        },
      },
    });

    const purchaseIds = purchasesWithoutDeals.map((purchase) => purchase.id);
    const existingDeals = await prisma.deal.findMany({
      where: {
        purchaseId: {
          in: purchaseIds,
        },
      },
      select: {
        purchaseId: true,
      },
    });

    const existingDealIds = new Set(existingDeals.map((deal) => deal.purchaseId));

    const purchasesNeedingDeals = purchasesWithoutDeals.filter(
      (purchase) => !existingDealIds.has(purchase.id)
    );

    await Promise.all(
      purchasesNeedingDeals.map((purchase) =>
        createDealForPurchase(purchase, { skipExistingCheck: true })
      )
    );

    // Now fetch all deals
    const where: any = {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
      ],
    };

    if (status) {
      where.status = status;
    }

    const deals = await prisma.deal.findMany({
      where,
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
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        purchase: {
          select: {
            id: true,
            platformFee: true,
            sellerEarnings: true,
            paymentStatus: true,
          },
        },
        rental: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Update deal status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const deal = await prisma.deal.findUnique({
      where: { id },
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (deal.buyerId !== userId && deal.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update deal' });
    }

    const updatedDeal = await prisma.deal.update({
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
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({ deal: updatedDeal });
  } catch (error) {
    console.error('Error updating deal status:', error);
    res.status(500).json({ error: 'Failed to update deal status' });
  }
});

// Link deal to purchase (when payment is completed)
router.post('/:id/link-purchase', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: dealId } = req.params;
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ error: 'purchaseId is required' });
    }

    // Verify deal exists and user is authorized
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (deal.buyerId !== userId && deal.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to link purchase' });
    }

    // Verify purchase exists and belongs to the deal
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        buyerId: true,
        carId: true,
        paymentStatus: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.buyerId !== deal.buyerId || purchase.carId !== deal.carId) {
      return res.status(400).json({ error: 'Purchase does not match deal' });
    }

    // Link purchase to deal
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        purchaseId,
        status: purchase.paymentStatus === 'PAID' ? 'COMPLETED' : 'ACCEPTED',
      },
    });

    // Apply platform fee if payment is completed
    if (purchase.paymentStatus === 'PAID') {
      await applyPlatformFeeToPurchase(purchaseId);
    }

    res.json({ message: 'Deal linked to purchase successfully' });
  } catch (error) {
    console.error('Error linking deal to purchase:', error);
    res.status(500).json({ error: 'Failed to link deal to purchase' });
  }
});

// Migration endpoint: Create deals for completed purchases that don't have deals
// This can be called once to fix existing data
router.post('/migrate-purchases', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Only allow admins to run migration
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can run migrations' });
    }

    // Find all completed purchases
    const allCompletedPurchases = await prisma.purchase.findMany({
      where: {
        status: 'COMPLETED',
        paymentStatus: 'PAID',
      },
      include: {
        car: {
          select: {
            sellerId: true,
          },
        },
      },
    });

    // Filter purchases that don't have deals
    const purchasesWithoutDeals = [];
    for (const purchase of allCompletedPurchases) {
      const existingDeal = await prisma.deal.findFirst({
        where: {
          purchaseId: purchase.id,
        },
      });
      if (!existingDeal) {
        purchasesWithoutDeals.push(purchase);
      }
    }

    let created = 0;
    let errors = 0;

    for (const purchase of purchasesWithoutDeals) {
      try {
        if (!purchase.car?.sellerId) continue;

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: {
            carId: purchase.carId,
            OR: [
              { participant1Id: purchase.buyerId, participant2Id: purchase.car.sellerId },
              { participant1Id: purchase.car.sellerId, participant2Id: purchase.buyerId },
            ],
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              participant1Id: purchase.buyerId,
              participant2Id: purchase.car.sellerId,
              carId: purchase.carId,
            },
          });
        }

        // Create deal
        await prisma.deal.create({
          data: {
            conversationId: conversation.id,
            carId: purchase.carId,
            buyerId: purchase.buyerId,
            sellerId: purchase.car.sellerId,
            agreedPrice: purchase.salePrice,
            dealType: 'PURCHASE',
            status: 'COMPLETED',
            purchaseId: purchase.id,
          },
        });

        created++;
      } catch (error) {
        console.error(`Error creating deal for purchase ${purchase.id}:`, error);
        errors++;
      }
    }

    res.json({
      message: 'Migration completed',
      purchasesProcessed: purchasesWithoutDeals.length,
      dealsCreated: created,
      errors,
    });
  } catch (error) {
    console.error('Error migrating purchases:', error);
    res.status(500).json({ error: 'Failed to migrate purchases' });
  }
});

export default router;

