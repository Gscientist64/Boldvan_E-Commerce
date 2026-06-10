// backend/src/routes/profile.routes.ts

import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';

const router = express.Router();

// Apply authentication to all profile routes
router.use(authenticate);

// Get user profile
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        address
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Log activity
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        adminEmail: req.user!.email,
        action: 'UPDATE_PROFILE',
        entityType: 'USER',
        entityId: userId,
        newValues: { firstName, lastName, phone, address }
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Log activity
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        adminEmail: req.user!.email,
        action: 'CHANGE_PASSWORD',
        entityType: 'USER',
        entityId: userId
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.id;

    const [totalOrders, totalSpent, reviewCount] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.aggregate({
        where: { userId, paymentStatus: 'paid' },
        _sum: { totalAmount: true }
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    // Get notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    res.json({
      totalOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
      reviewCount,
      wishlistCount: 0,
      recentOrders,
      notificationPrefs: user?.notificationPrefs || { orderUpdates: true, promotions: false, newsletter: true }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { orderUpdates, promotions, newsletter, theme, language } = req.body;

    const prefs: any = {};
    if (typeof orderUpdates === 'boolean') prefs.orderUpdates = orderUpdates;
    if (typeof promotions === 'boolean') prefs.promotions = promotions;
    if (typeof newsletter === 'boolean') prefs.newsletter = newsletter;
    if (theme) prefs.theme = theme;
    if (language) prefs.language = language;

    // Merge with existing preferences
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    const existingPrefs = (existingUser?.notificationPrefs as any) || {};
    const mergedPrefs = { ...existingPrefs, ...prefs };

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: mergedPrefs }
    });

    res.json({ message: 'Preferences updated', preferences: mergedPrefs });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;