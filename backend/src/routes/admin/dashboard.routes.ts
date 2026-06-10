import express, { Request, Response } from 'express';
import { prisma } from '../../utils/database';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalBookings,
      totalUsers,
      recentOrders,
      recentBookings
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.booking.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          service: {
            select: { name: true, type: true }
          }
        }
      })
    ]);

    // Calculate revenue (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueData = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalAmount: true }
    });

    const monthlyRevenue = revenueData._sum.totalAmount || 0;

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalBookings,
        totalUsers,
        monthlyRevenue
      },
      recentOrders,
      recentBookings
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;