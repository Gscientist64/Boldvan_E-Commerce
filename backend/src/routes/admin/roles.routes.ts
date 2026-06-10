// src/routes/admin/roles.routes.ts

import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

// Apply authentication and admin authorization
router.use(authenticate);
router.use(authorizeAdmin);

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        users: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Add user count to each role
    const rolesWithCount = roles.map(role => ({
      ...role,
      userCount: role.users.length,
      users: undefined // Remove users array from response
    }));

    res.json(rolesWithCount);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get role by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new role
router.post('/', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        isSystem: false
      }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email,
        action: 'CREATE',
        entityType: 'ROLE',
        entityId: role.id,
        entityName: role.name,
        newValues: role,
        status: 'SUCCESS'
      }
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists
    const oldRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!oldRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent editing system role names
    if (oldRole.isSystem && name !== oldRole.name) {
      return res.status(400).json({ message: 'Cannot rename system roles' });
    }

    // Check if new name conflicts with existing role
    if (name && name !== oldRole.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name }
      });
      if (existingRole) {
        return res.status(400).json({ message: 'Role with this name already exists' });
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions
      }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email,
        action: 'UPDATE',
        entityType: 'ROLE',
        entityId: role.id,
        entityName: role.name,
        oldValues: oldRole,
        newValues: role,
        status: 'SUCCESS'
      }
    });

    res.json(role);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(400).json({ message: 'Cannot delete system roles' });
    }

    // Check if role has users assigned
    if (role.users.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete role with assigned users. Please reassign users first.',
        userCount: role.users.length
      });
    }

    // Delete role
    await prisma.role.delete({
      where: { id }
    });

    // Log activity - FIXED: Added all required fields
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email,
        action: 'DELETE',
        entityType: 'ROLE',
        entityId: id,
        entityName: role.name,
        oldValues: role,
        status: 'SUCCESS'
      }
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign roles to user
router.put('/users/:userId/roles', async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get old roles for logging - FIXED: Changed from userRole to userRoleAssignment
    const oldRoles = await prisma.userRoleAssignment.findMany({
      where: { userId },
      include: { role: true }
    });

    // Delete existing roles - FIXED: Changed from userRole to userRoleAssignment
    await prisma.userRoleAssignment.deleteMany({
      where: { userId }
    });

    // Create new role assignments - FIXED: Changed from userRole to userRoleAssignment
    const newRoles = await Promise.all(
      roleIds.map(async (roleId: string) => {
        return prisma.userRoleAssignment.create({
          data: {
            userId,
            roleId,
            assignedBy: req.user!.id
          },
          include: { role: true }
        });
      })
    );

    // Log activity
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        adminEmail: req.user!.email,
        action: 'UPDATE_ROLES',
        entityType: 'USER',
        entityId: userId,
        entityName: user.email,
        oldValues: { roles: oldRoles.map(r => r.role.name) },
        newValues: { roles: newRoles.map(r => r.role.name) },
        status: 'SUCCESS'
      }
    });

    res.json({ 
      message: 'Roles updated successfully',
      roles: newRoles.map(r => r.role)
    });
  } catch (error) {
    console.error('Assign roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;