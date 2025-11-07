import { Router } from 'express';
import prisma from '../db/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: list active shops by city
router.get('/', async (req, res) => {
  try {
    const { city } = req.query as { city?: string };
    const where: any = { isActive: true };
    if (city) where.city = { equals: String(city), mode: 'insensitive' } as any;
    const shops = await prisma.shopLocation.findMany({ where, orderBy: { city: 'asc' } });
    res.json({ shops });
  } catch (e) {
    console.error('List shops error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: create shop
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { city, addressLine, landmark, pincode, lat, lng, hoursStart, hoursEnd, phone, isActive } = req.body;
    if (!city || !addressLine) return res.status(400).json({ error: 'city and addressLine required' });
    const shop = await prisma.shopLocation.create({
      data: { city, addressLine, landmark, pincode, lat, lng, hoursStart, hoursEnd, phone, isActive: isActive ?? true },
    });
    res.status(201).json({ shop });
  } catch (e) {
    console.error('Create shop error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update shop
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { id } = req.params;
    const shop = await prisma.shopLocation.update({ where: { id }, data: req.body });
    res.json({ shop });
  } catch (e) {
    console.error('Update shop error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete shop
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
    const { id } = req.params;
    await prisma.shopLocation.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Delete shop error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


