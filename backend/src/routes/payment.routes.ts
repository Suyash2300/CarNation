import { Router, Response } from 'express';
import prisma from '../db/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createPaymentIntent, retrievePaymentIntent, isTestMode, getPublishableKey } from '../services/stripeService.js';
import { calculatePlatformFee } from '../services/platformFeeService.js';
import { paymentLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply rate limiting to payment routes
router.use(paymentLimiter);

// Create payment order for rental
router.post('/rental/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { rentalId } = req.body;

    if (!rentalId) {
      return res.status(400).json({ error: 'rentalId is required' });
    }

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        buyer: {
          select: { id: true },
        },
      },
    });

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    if (rental.buyerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (rental.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Rental already paid' });
    }

    const amount = Math.round(rental.totalAmount * 100); // Convert to paise (₹1 = 100 paise)

    const paymentIntent = await createPaymentIntent({
      amount,
      currency: 'inr',
      metadata: {
        type: 'rental',
        rentalId,
        userId,
      },
    });

    // Update rental with payment intent ID (stored in razorpayOrderId field for compatibility)
    await prisma.rental.update({
      where: { id: rentalId },
      data: { razorpayOrderId: paymentIntent.id },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: getPublishableKey(),
    });
  } catch (error) {
    console.error('Error creating rental payment order:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    });
  }
});

// Verify and complete rental payment
router.post('/rental/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { rentalId, paymentIntentId } = req.body;

    if (!rentalId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
    });

    if (!rental || rental.buyerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (rental.razorpayOrderId !== paymentIntentId) {
      return res.status(400).json({ error: 'Invalid payment intent ID' });
    }

    // Check if payment already processed
    if (rental.razorpayPaymentId) {
      return res.status(400).json({ error: 'Payment already processed for this rental' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: `Payment not completed. Status: ${paymentIntent.status}` 
      });
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update rental payment (stored in razorpayPaymentId for compatibility)
      await tx.rental.update({
        where: { id: rentalId },
        data: {
          razorpayPaymentId: paymentIntentId,
          paymentStatus: 'PAID',
          status: 'PENDING', // Will be activated by admin
        },
      });

      // Update car status
      await tx.car.update({
        where: { id: rental.carId },
        data: { status: 'RENTED' },
      });
    });

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying rental payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create payment order for purchase
router.post('/purchase/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ error: 'purchaseId is required' });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        buyer: {
          select: { id: true },
        },
        car: {
          select: {
            sellerId: true,
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

    if (purchase.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Purchase already paid' });
    }

    const amount = Math.round(purchase.salePrice * 100); // Convert to paise (₹1 = 100 paise)

    const paymentIntent = await createPaymentIntent({
      amount,
      currency: 'inr',
      metadata: {
        type: 'purchase',
        purchaseId,
        userId,
        carId: purchase.carId,
      },
    });

    // Update purchase with payment intent ID (stored in razorpayOrderId field for compatibility)
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { razorpayOrderId: paymentIntent.id },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: getPublishableKey(),
    });
  } catch (error) {
    console.error('Error creating purchase payment order:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    });
  }
});

// Verify and complete purchase payment
router.post('/purchase/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { purchaseId, paymentIntentId } = req.body;

    if (!purchaseId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        car: {
          select: {
            sellerId: true,
            status: true,
          },
        },
      },
    });

    if (!purchase || purchase.buyerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (purchase.razorpayOrderId !== paymentIntentId) {
      return res.status(400).json({ 
        error: 'Invalid payment intent ID'
      });
    }

    // Check if payment already processed
    if (purchase.razorpayPaymentId) {
      return res.status(400).json({ error: 'Payment already processed for this purchase' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: `Payment not completed. Status: ${paymentIntent.status}` 
      });
    }

    // Calculate platform fee
    const { platformFee, sellerEarnings } = await calculatePlatformFee(purchase.salePrice);

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update purchase payment (stored in razorpayPaymentId for compatibility)
      await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          razorpayPaymentId: paymentIntentId,
          paymentStatus: 'PAID',
          status: 'COMPLETED',
          platformFee,
          sellerEarnings,
        },
      });

      // Update car status
      await tx.car.update({
        where: { id: purchase.carId },
        data: { status: 'SOLD' },
      });

      // Find or create a deal for this purchase
      let existingDeal = await tx.deal.findFirst({
        where: {
          carId: purchase.carId,
          buyerId: purchase.buyerId,
        },
      });

      if (existingDeal) {
        // Update existing deal to COMPLETED status
        await tx.deal.update({
          where: { id: existingDeal.id },
          data: {
            status: 'COMPLETED',
            purchaseId: purchaseId,
          },
        });
      } else {
        // Create a new deal for this completed purchase
        // Get car to find seller
        const car = await tx.car.findUnique({
          where: { id: purchase.carId },
          select: { sellerId: true },
        });

        if (car?.sellerId) {
          // Find or create a conversation between buyer and seller for this car
          let conversation = await tx.conversation.findFirst({
            where: {
              carId: purchase.carId,
              OR: [
                { participant1Id: purchase.buyerId, participant2Id: car.sellerId },
                { participant1Id: car.sellerId, participant2Id: purchase.buyerId },
              ],
            },
          });

          if (!conversation) {
            // Create conversation for this deal
            conversation = await tx.conversation.create({
              data: {
                participant1Id: purchase.buyerId,
                participant2Id: car.sellerId,
                carId: purchase.carId,
              },
            });
          }

          // Create deal with conversation
          await tx.deal.create({
            data: {
              conversationId: conversation.id,
              carId: purchase.carId,
              buyerId: purchase.buyerId,
              sellerId: car.sellerId,
              agreedPrice: purchase.salePrice,
              dealType: 'PURCHASE',
              status: 'COMPLETED',
              purchaseId: purchaseId,
            },
          });
        }
      }
    });
    
    res.json({
      message: 'Payment verified successfully',
      purchaseId,
      paymentIntentId,
      platformFee,
      sellerEarnings,
    });
  } catch (error) {
    console.error('Error verifying purchase payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

