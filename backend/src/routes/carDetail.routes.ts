import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';

const router = Router();

// Get single car by ID (public endpoint with seller details)
// This route is registered separately to avoid conflicts with /rent and /buy
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        owner: {
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

    res.json({ car });
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

