import express, { Request, Response } from 'express';
import { prisma } from '../../utils/database';

const router = express.Router();

// Get all bookings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status as string;
    }
    
    if (type) {
      const typeStr = Array.isArray(type) ? type[0] : type;
      where.service = { 
        type: (typeStr as string).toUpperCase() 
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true }
          },
          service: {
            select: { name: true, type: true, price: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true, phone: true }
        },
        service: {
          select: { name: true, type: true }
        }
      }
    });

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;