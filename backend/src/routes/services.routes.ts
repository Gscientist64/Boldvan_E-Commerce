import express from 'express';
import { prisma } from '../utils/database';

const router = express.Router();


// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const services = await prisma.service.findMany({
      where: { 
        type: type.toUpperCase() as any,
        isActive: true 
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(services);
  } catch (error) {
    console.error('Get services by type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;