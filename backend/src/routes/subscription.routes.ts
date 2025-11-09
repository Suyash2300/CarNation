import { Router, Response, Request } from 'express';
import prisma from '../db/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { SUBSCRIPTION_TIERS, checkSellerCanListCar, activateSubscription } from '../services/subscriptionService.js';
import { createPaymentIntent, retrievePaymentIntent, isTestMode, getPublishableKey } from '../services/stripeService.js';

type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;
const PAID_TIERS: SubscriptionTierKey[] = ['BASIC', 'PREMIUM'];

const router = Router();

// Get subscription tiers info
router.get('/tiers', (_req: Request, res: Response) => {
  res.json({ 
    tiers: SUBSCRIPTION_TIERS,
    testMode: isTestMode(), // Include test mode status
  });
});

// Get current subscription status
router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        carsForSale: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tierKey = (user.subscriptionTier ?? 'FREE') as SubscriptionTierKey;
    const tier = SUBSCRIPTION_TIERS[tierKey];
    const canListCheck = await checkSellerCanListCar(userId);

    const {
      canList,
      reason,
      currentListings,
      maxListings,
    } = canListCheck;

    res.json({
      tier: tierKey,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      tierInfo: tier,
      currentListings,
      maxListings,
      canListMore: canList,
      restrictionReason: reason,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Create subscription payment order
router.post('/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { tier } = req.body as { tier?: SubscriptionTierKey };

    if (!tier || !PAID_TIERS.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be BASIC or PREMIUM' });
    }

    const tierInfo = SUBSCRIPTION_TIERS[tier];
    if (!tierInfo) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Create Stripe payment intent
    const amount = tierInfo.price * 100; // Convert to paise (₹1 = 100 paise)
    const paymentIntent = await createPaymentIntent({
      amount,
      currency: 'inr',
      metadata: {
        userId,
        tier,
        type: 'subscription',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: getPublishableKey(),
    });
  } catch (error) {
    console.error('Error creating subscription order:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create order',
    });
  }
});

// Activate FREE tier (no payment required)
router.post('/activate-free', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'SELLER') {
      return res.status(403).json({ error: 'Only sellers can activate subscriptions' });
    }

    // Activate FREE tier (no payment required)
    const startDate = new Date();
    // Set end date far in future (FREE tier doesn't expire, or set to null)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100); // 100 years from now (effectively unlimited)

    await activateSubscription(userId, 'FREE', startDate, endDate);

    res.json({
      message: 'FREE tier activated successfully',
      tier: 'FREE',
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Error activating FREE tier:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to activate FREE tier',
    });
  }
});

// Verify and activate subscription
router.post('/verify-payment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { paymentIntentId, tier } = req.body as {
      paymentIntentId?: string;
      tier?: SubscriptionTierKey;
    };

    if (!paymentIntentId || !tier || !PAID_TIERS.includes(tier)) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Check if payment already processed
    const existingPayment = await prisma.subscriptionPayment.findFirst({
      where: {
        razorpayPaymentId: paymentIntentId, // Using same field for Stripe payment intent ID
      },
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Calculate subscription period (1 month from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Create subscription payment record
    await prisma.subscriptionPayment.create({
      data: {
        userId,
        amount: SUBSCRIPTION_TIERS[tier].price,
        tier,
        razorpayOrderId: paymentIntentId, // Store payment intent ID
        razorpayPaymentId: paymentIntentId, // Store payment intent ID
        paymentStatus: 'PAID',
        startDate,
        endDate,
      },
    });

    // Activate subscription
    await activateSubscription(userId, tier, startDate, endDate);

    res.json({
      message: 'Subscription activated successfully',
      tier,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to verify payment',
    });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get user to check current subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!user || user.role !== 'SELLER') {
      return res.status(403).json({ error: 'Only sellers can cancel subscriptions' });
    }

    // Prevent cancelling FREE tier subscriptions
    if (user.subscriptionTier === 'FREE') {
      return res.status(400).json({ error: 'Cannot cancel FREE tier subscription' });
    }

    // Only allow cancellation if status is ACTIVE
    if (user.subscriptionStatus !== 'ACTIVE') {
      return res.status(400).json({ error: 'Subscription is not active and cannot be cancelled' });
    }

    // Cancel subscription (keep endDate unchanged)
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'CANCELLED',
      },
    });

    res.json({
      message: 'Subscription cancelled successfully',
      endDate: user.subscriptionEndDate,
      note: 'Your subscription will remain active until the end of the billing period',
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    });
  }
});

export default router;

