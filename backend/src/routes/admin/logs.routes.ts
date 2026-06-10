// src/routes/admin/logs.routes.ts

import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);

// Get activity logs with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      adminId,
      action,
      entityType,
      startDate,
      endDate,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};

    if (adminId) {
      where.adminId = adminId as string;
    }

    if (action) {
      where.action = action as string;
    }

    if (entityType) {
      where.entityType = entityType as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (search) {
      where.OR = [
        { adminEmail: { contains: search as string, mode: 'insensitive' } },
        { entityName: { contains: search as string, mode: 'insensitive' } },
        { action: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          admin: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.adminLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get log statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    const [totalLogs, todayLogs, weekLogs, monthLogs, actionStats] = await Promise.all([
      prisma.adminLog.count(),
      prisma.adminLog.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.adminLog.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.adminLog.count({
        where: { createdAt: { gte: monthAgo } }
      }),
      prisma.adminLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      totalLogs,
      todayLogs,
      weekLogs,
      monthLogs,
      actionStats
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export logs (for admin download)
router.get('/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const logs = await prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=admin-logs.csv');
      return res.send(csv);
    }

    // Default JSON
    res.json(logs);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function convertToCSV(logs: any[]): string {
  const headers = ['Timestamp', 'Admin', 'Action', 'Entity Type', 'Entity Name', 'Status'];
  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.adminEmail,
    log.action,
    log.entityType,
    log.entityName || '-',
    log.status
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export default router;