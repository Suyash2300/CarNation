import prisma from '../db/prisma.js';

export const getActivePlatformFee = async (): Promise<number> => {
  // Get the active platform fee configuration
  const feeConfig = await prisma.platformFee.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Default to 5% if no configuration exists
  return feeConfig?.feePercentage || 5.0;
};

export const calculatePlatformFee = async (salePrice: number): Promise<{
  platformFee: number;
  sellerEarnings: number;
}> => {
  const feePercentage = await getActivePlatformFee();
  const platformFee = (salePrice * feePercentage) / 100;
  const sellerEarnings = salePrice - platformFee;

  return {
    platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimal places
    sellerEarnings: Math.round(sellerEarnings * 100) / 100,
  };
};

export const updatePlatformFee = async (
  feePercentage: number,
  updatedBy: string
): Promise<void> => {
  // Validate fee percentage (should be between 0 and 100)
  if (feePercentage < 0 || feePercentage > 100) {
    throw new Error('Platform fee percentage must be between 0 and 100');
  }

  // Deactivate all existing fee configurations
  await prisma.platformFee.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Create new active fee configuration
  await prisma.platformFee.create({
    data: {
      feePercentage,
      isActive: true,
      updatedBy,
    },
  });
};

export const applyPlatformFeeToPurchase = async (purchaseId: string): Promise<void> => {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      car: {
        select: {
          sellerId: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.paymentStatus !== 'PAID') {
    throw new Error('Cannot apply platform fee to unpaid purchase');
  }

  // Calculate fees if not already calculated
  if (!purchase.platformFee || !purchase.sellerEarnings) {
    const { platformFee, sellerEarnings } = await calculatePlatformFee(purchase.salePrice);

    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        platformFee,
        sellerEarnings,
      },
    });
  }
};

