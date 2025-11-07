import { Router, Response } from 'express';
import prisma from '../db/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkSellerCanListCar } from '../services/subscriptionService';

const router = Router();

// Get seller's cars (their listings)
router.get('/cars', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.userId;
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { isAadhaarVerified: true, role: true },
    });

    if (seller?.role !== 'ADMIN' && !seller?.isAadhaarVerified) {
      return res.status(403).json({
        error: 'Aadhaar verification is required before listing cars for sale',
      });
    }

    const cars = await prisma.car.findMany({
      where: {
        sellerId: sellerId,
        isForSale: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ cars });
  } catch (error) {
    console.error('Error fetching seller cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new car listing (for sale)
router.post('/cars', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.userId;
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { isAadhaarVerified: true, role: true },
    });

    if (seller?.role !== 'ADMIN' && !seller?.isAadhaarVerified) {
      return res.status(403).json({
        error: 'Aadhaar verification is required before modifying car listings',
      });
    }
    
    // Check subscription limits
    const canListCheck = await checkSellerCanListCar(sellerId);
    if (!canListCheck.canList) {
      return res.status(403).json({
        error: canListCheck.reason || 'You have reached your listing limit',
        currentListings: canListCheck.currentListings,
        maxListings: canListCheck.maxListings,
      });
    }
    
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
      salePrice,
      description,
      images,
      primaryImage,
      city,
    } = req.body;

    // Validation
    if (!brand || !model || !year || !salePrice) {
      return res.status(400).json({
        error: 'Brand, model, year, and sale price are required',
      });
    }

    // Ensure primaryImage is in images array
    const allImages = images || [];
    if (primaryImage && !allImages.includes(primaryImage)) {
      allImages.unshift(primaryImage);
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        color,
        mileage: mileage ? parseFloat(mileage) : null,
        ownersCount:
          ownersCount !== undefined && ownersCount !== null && ownersCount !== ''
            ? Number(ownersCount)
            : null,
        transmission,
        fuelType,
        seats: seats ? parseInt(seats) : null,
        salePrice: parseFloat(salePrice),
        description,
        images: allImages,
        primaryImage: primaryImage || allImages[0] || null,
        city,
        isForSale: true,
        status: 'AVAILABLE',
        sellerId: sellerId,
      },
    });

    res.status(201).json({ car });
  } catch (error) {
    console.error('Error creating seller car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update seller's car
router.put('/cars/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.userId;
    const carId = req.params.id;

    // Check if car belongs to seller
    const existingCar = await prisma.car.findFirst({
      where: {
        id: carId,
        sellerId: sellerId,
      },
    });

    if (!existingCar) {
      return res.status(404).json({ error: 'Car not found or unauthorized' });
    }

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
      salePrice,
      description,
      images,
      primaryImage,
      city,
      status,
    } = req.body;

    // Ensure primaryImage is in images array
    const allImages = images || existingCar.images;
    if (primaryImage && !allImages.includes(primaryImage)) {
      allImages.unshift(primaryImage);
    }

    const car = await prisma.car.update({
      where: { id: carId },
      data: {
        ...(brand && { brand }),
        ...(model && { model }),
        ...(year && { year: parseInt(year) }),
        ...(color !== undefined && { color }),
        ...(mileage !== undefined && {
          mileage:
            mileage !== null && mileage !== '' ? parseFloat(mileage) : null,
        }),
        ...(ownersCount !== undefined && {
          ownersCount:
            ownersCount !== null && ownersCount !== ''
              ? Number(ownersCount)
              : null,
        }),
        ...(transmission !== undefined && { transmission }),
        ...(fuelType !== undefined && { fuelType }),
        ...(seats !== undefined && { seats: seats ? parseInt(seats) : null }),
        ...(salePrice && { salePrice: parseFloat(salePrice) }),
        ...(description !== undefined && { description }),
        ...(images && { images: allImages }),
        ...(primaryImage !== undefined && { primaryImage: primaryImage || allImages[0] || null }),
        ...(city !== undefined && { city }),
        ...(status && { status }),
      },
    });

    res.json({ car });
  } catch (error) {
    console.error('Error updating seller car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete seller's car
router.delete('/cars/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.userId;
    const carId = req.params.id;

    // Check if car belongs to seller
    const car = await prisma.car.findFirst({
      where: {
        id: carId,
        sellerId: sellerId,
      },
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found or unauthorized' });
    }

    await prisma.car.delete({
      where: { id: carId },
    });

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get seller stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.userId;

    const [totalCars, availableCars, soldCars] = await Promise.all([
      prisma.car.count({
        where: { sellerId, isForSale: true },
      }),
      prisma.car.count({
        where: { sellerId, isForSale: true, status: 'AVAILABLE' },
      }),
      prisma.car.count({
        where: { sellerId, isForSale: true, status: 'SOLD' },
      }),
    ]);

    // Calculate total value of available cars
    const availableCarsData = await prisma.car.findMany({
      where: { sellerId, isForSale: true, status: 'AVAILABLE' },
      select: { salePrice: true },
    });

    const totalValue = availableCarsData.reduce(
      (sum, car) => sum + (car.salePrice || 0),
      0
    );

    // Calculate total revenue from completed purchases (seller earnings)
    const completedPurchases = await prisma.purchase.findMany({
      where: {
        car: {
          sellerId: sellerId,
        },
        status: 'COMPLETED',
        paymentStatus: 'PAID',
      },
      select: {
        sellerEarnings: true,
      },
    });

    const totalRevenue = completedPurchases.reduce(
      (sum, purchase) => sum + (purchase.sellerEarnings || 0),
      0
    );

    res.json({
      stats: {
        totalCars,
        availableCars,
        soldCars,
        totalValue,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

