import prisma from '../db/prisma';

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxListings: 2,
    features: ['2 active listings', 'Basic support'],
  },
  BASIC: {
    name: 'Basic',
    price: 500, // ₹500/month
    maxListings: 10,
    features: ['10 active listings', 'Priority support', 'Featured placement'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 1000, // ₹1000/month
    maxListings: -1, // Unlimited
    features: ['Unlimited listings', 'Top featured placement', 'Priority support', 'Analytics dashboard'],
  },
};

export const checkSellerCanListCar = async (sellerId: string): Promise<{
  canList: boolean;
  reason?: string;
  currentListings: number;
  maxListings: number;
}> => {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    include: {
      carsForSale: {
        where: {
          status: {
            in: ['AVAILABLE'],
          },
        },
      },
    },
  });

  if (!seller || seller.role !== 'SELLER') {
    return {
      canList: false,
      reason: 'User is not a seller',
      currentListings: 0,
      maxListings: 0,
    };
  }

  // Check if subscription is active
  const now = new Date();
  if (
    seller.subscriptionStatus !== 'ACTIVE' ||
    !seller.subscriptionEndDate ||
    new Date(seller.subscriptionEndDate) < now
  ) {
    // Check if user can still use FREE tier
    const freeTier = SUBSCRIPTION_TIERS.FREE;
    const currentListings = seller.carsForSale.length;
    
    if (currentListings >= freeTier.maxListings) {
      return {
        canList: false,
        reason: `You've reached the free tier limit (${freeTier.maxListings} listings). Please upgrade your subscription to list more cars.`,
        currentListings,
        maxListings: freeTier.maxListings,
      };
    }
    
    return {
      canList: true,
      currentListings,
      maxListings: freeTier.maxListings,
    };
  }

  // User has active subscription
  const tier = SUBSCRIPTION_TIERS[seller.subscriptionTier];
  const currentListings = seller.carsForSale.length;
  const maxListings = tier.maxListings === -1 ? Infinity : tier.maxListings;

  if (currentListings >= maxListings) {
    return {
      canList: false,
      reason: `You've reached your ${tier.name} tier limit (${maxListings === Infinity ? 'unlimited' : maxListings} listings). Please upgrade your subscription.`,
      currentListings,
      maxListings,
    };
  }

  return {
    canList: true,
    currentListings,
    maxListings,
  };
};

export const activateSubscription = async (
  userId: string,
  tier: 'FREE' | 'BASIC' | 'PREMIUM',
  startDate: Date,
  endDate: Date
): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: 'ACTIVE',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
    },
  });
};

export const checkSubscriptionExpiry = async (): Promise<void> => {
  const now = new Date();
  
  // Find all subscriptions that should be expired
  const expiredUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'ACTIVE',
      subscriptionEndDate: {
        lt: now,
      },
      subscriptionTier: {
        not: 'FREE',
      },
    },
  });

  // Update expired subscriptions to FREE tier
  for (const user of expiredUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'EXPIRED',
      },
    });
  }
};

