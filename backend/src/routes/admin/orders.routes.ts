import express, { Request, Response } from 'express';
import { prisma } from '../../utils/database';

const router = express.Router();

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status as string;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updateData: any = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    res.json(order);
  } catch (error: any) {
    console.error('Update order status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update order payment status
router.patch('/:id/payment', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference, note } = req.body;

    const updateData: any = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentReference) updateData.paymentReference = paymentReference;
    if (note) updateData.notes = note;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    res.json(order);
  } catch (error: any) {
    console.error('Update payment status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;