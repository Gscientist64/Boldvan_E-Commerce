import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// ============ DELIVERY LOCATIONS ============

// Get all delivery locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await prisma.deliveryLocation.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(locations);
  } catch (error) {
    console.error('Get delivery locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create delivery location
router.post('/locations', async (req, res) => {
  try {
    const { name, description, baseFee, estimatedDays, isActive, sortOrder } = req.body;
    
    if (!name || baseFee === undefined || !estimatedDays) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const location = await prisma.deliveryLocation.create({
      data: {
        name,
        description: description || '',
        baseFee: parseFloat(baseFee),
        estimatedDays,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0
      }
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Create delivery location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery location
router.put('/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, baseFee, estimatedDays, isActive, sortOrder } = req.body;

    const location = await prisma.deliveryLocation.update({
      where: { id },
      data: {
        name,
        description,
        baseFee: baseFee !== undefined ? parseFloat(baseFee) : undefined,
        estimatedDays,
        isActive,
        sortOrder
      }
    });

    res.json(location);
  } catch (error) {
    console.error('Update delivery location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete delivery location
router.delete('/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if location is used in any order
    const orderCount = await prisma.order.count({
      where: { deliveryLocationId: id }
    });

    if (orderCount > 0) {
      // Soft delete - just deactivate
      await prisma.deliveryLocation.update({
        where: { id },
        data: { isActive: false }
      });
      res.json({ message: 'Location deactivated successfully' });
    } else {
      // Hard delete if no orders
      await prisma.deliveryLocation.delete({ where: { id } });
      res.json({ message: 'Location deleted successfully' });
    }
  } catch (error) {
    console.error('Delete delivery location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ DELIVERY METHODS ============

// Get all delivery methods
router.get('/methods', async (req, res) => {
  try {
    const methods = await prisma.deliveryMethod.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(methods);
  } catch (error) {
    console.error('Get delivery methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create delivery method
router.post('/methods', async (req, res) => {
  try {
    const { name, description, baseFee, estimatedDays, isActive, sortOrder } = req.body;
    
    if (!name || baseFee === undefined || !estimatedDays) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const method = await prisma.deliveryMethod.create({
      data: {
        name,
        description: description || '',
        baseFee: parseFloat(baseFee),
        estimatedDays,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0
      }
    });

    res.status(201).json(method);
  } catch (error) {
    console.error('Create delivery method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery method
router.put('/methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, baseFee, estimatedDays, isActive, sortOrder } = req.body;

    const method = await prisma.deliveryMethod.update({
      where: { id },
      data: {
        name,
        description,
        baseFee: baseFee !== undefined ? parseFloat(baseFee) : undefined,
        estimatedDays,
        isActive,
        sortOrder
      }
    });

    res.json(method);
  } catch (error) {
    console.error('Update delivery method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete delivery method
router.delete('/methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderCount = await prisma.order.count({
      where: { deliveryMethodId: id }
    });

    if (orderCount > 0) {
      await prisma.deliveryMethod.update({
        where: { id },
        data: { isActive: false }
      });
      res.json({ message: 'Method deactivated successfully' });
    } else {
      await prisma.deliveryMethod.delete({ where: { id } });
      res.json({ message: 'Method deleted successfully' });
    }
  } catch (error) {
    console.error('Delete delivery method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ LOCATION-METHOD MAPPING ============

// Get all mappings
router.get('/mappings', async (req, res) => {
  try {
    const { locationId, methodId } = req.query;
    
    const where: any = {};
    if (locationId) where.locationId = locationId as string;
    if (methodId) where.methodId = methodId as string;

    const mappings = await prisma.deliveryLocationMethod.findMany({
      where,
      include: {
        location: true,
        method: true
      }
    });

    res.json(mappings);
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update mapping
router.post('/mappings', async (req, res) => {
  try {
    const { locationId, methodId, customFee, customDays, isActive } = req.body;
    
    if (!locationId || !methodId) {
      return res.status(400).json({ message: 'Missing locationId or methodId' });
    }

    const mapping = await prisma.deliveryLocationMethod.upsert({
      where: {
        locationId_methodId: {
          locationId,
          methodId
        }
      },
      update: {
        customFee: customFee !== undefined ? parseFloat(customFee) : null,
        customDays: customDays || null,
        isActive: isActive !== undefined ? isActive : true
      },
      create: {
        locationId,
        methodId,
        customFee: customFee !== undefined ? parseFloat(customFee) : null,
        customDays: customDays || null,
        isActive: isActive !== false
      }
    });

    res.status(201).json(mapping);
  } catch (error) {
    console.error('Create mapping error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete mapping
router.delete('/mappings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.deliveryLocationMethod.delete({
      where: { id }
    });
    res.json({ message: 'Mapping deleted successfully' });
  } catch (error) {
    console.error('Delete mapping error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ SHOP SETTINGS ============

// Get shop settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.shopSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.shopSettings.create({
        data: {
          id: 'default',
          freeShippingThreshold: 50000,
          returnPolicy: '30-day return policy for defective items',
          warrantyInfo: '1-year warranty on all products',
          contactEmail: 'oneclickresourcesng@gmail.com',
          contactPhone: '08178363424',
          whatsappNumber: '08178363424'
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Get shop settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shop settings
router.put('/settings', async (req, res) => {
  try {
    const settings = await prisma.shopSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: {
        id: 'default',
        ...req.body
      }
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Update shop settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ SELLER INFO ============

// Get seller info
router.get('/seller', async (req, res) => {
  try {
    let seller = await prisma.sellerInfo.findFirst();
    
    if (!seller) {
      // Create default seller info if none exist
      seller = await prisma.sellerInfo.create({
        data: {
          id: 'default',
          name: 'OneClick Resources',
          description: 'Your trusted partner for solar energy solutions in Nigeria',
          email: 'sales@oneclickresources.com',
          phone: '08178363424',
          whatsapp: '08178363424',
          address: 'Lagos, Nigeria',
          rating: 4.9,
          totalSales: 1547,
          successRate: 100,
          memberSince: '2019',
          responseTime: '< 1 hour',
          badges: ['Verified Seller', 'Top Rated', 'Fast Shipper']
        }
      });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Get seller info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update seller info
router.put('/seller', async (req, res) => {
  try {
    const seller = await prisma.sellerInfo.upsert({
      where: { id: 'default' },
      update: req.body,
      create: {
        id: 'default',
        ...req.body
      }
    });
    
    res.json(seller);
  } catch (error) {
    console.error('Update seller info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;