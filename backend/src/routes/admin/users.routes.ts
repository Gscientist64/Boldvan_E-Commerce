// src/routes/admin/users.routes.ts

import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';
import bcrypt from 'bcrypt';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Get all users with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      role = 'all' 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (role !== 'all') {
      where.role = role as string;
    }

    // Determine whether to include RBAC role data
    const includeRoles = role === 'ADMIN';
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          // Include RBAC role assignments when fetching admins
          roleAssignments: includeRoles ? {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  permissions: true,
                  isSystem: true,
                  createdAt: true
                }
              }
            }
          } : false,
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    // Transform: map roleAssignments to roles array for frontend compatibility
    const transformedUsers = users.map(user => ({
      ...user,
      roles: includeRoles ? (user as any).roleAssignments?.map((ra: any) => ra.role) || [] : undefined,
      roleAssignments: undefined, // Remove raw data
      status: 'active' as const, // Add status field frontend expects
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        role: role || 'USER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email, // Added missing adminEmail
        action: 'CREATE',
        entityType: 'USER',
        entityId: user.id,
        entityName: user.email, // Added entityName
        newValues: user,
        status: 'SUCCESS'
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, role } = req.body;

    // Get old values for audit log
    const oldUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email, // Added missing adminEmail
        action: 'UPDATE',
        entityType: 'USER',
        entityId: id,
        entityName: user.email, // Added entityName
        oldValues: oldUser,
        newValues: user,
        status: 'SUCCESS'
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent removing last admin
    if (role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      const targetUser = await prisma.user.findUnique({
        where: { id }
      });

      if (targetUser?.role === 'ADMIN' && adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot remove the last admin. Promote another user to admin first.' 
        });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email, // Added missing adminEmail
        action: 'UPDATE_ROLE',
        entityType: 'USER',
        entityId: id,
        entityName: user.email, // Added entityName
        newValues: { role },
        status: 'SUCCESS'
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
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

    // Prevent deleting last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the last admin. Promote another user to admin first.' 
        });
      }
    }

    // Delete user (cascading will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email, // Added missing adminEmail
        action: 'DELETE',
        entityType: 'USER',
        entityId: id,
        entityName: user.email, // Added entityName
        oldValues: { email: user.email, role: user.role },
        status: 'SUCCESS'
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalUsers, adminCount, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1))
          }
        }
      })
    ]);
    
    const [totalOrders, totalReviews] = await Promise.all([
      prisma.order.count(),
      prisma.review.count()
    ]);
    
    res.json({
      totalUsers,
      adminCount,
      newUsersThisMonth,
      totalOrders,
      totalReviews
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;