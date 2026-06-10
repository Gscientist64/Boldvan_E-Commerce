import express from 'express';
import { prisma } from '../../utils/database';

const router = express.Router();

// Get all active delivery locations with their methods
router.get('/locations', async (req, res) => {
  try {
    const locations = await prisma.deliveryLocation.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        methods: {
          where: { 
            isActive: true,
            method: { isActive: true }
          },
          include: {
            method: true
          }
        }
      }
    });

    // Transform the data for frontend
    const transformedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      description: location.description,
      baseFee: location.baseFee,
      estimatedDays: location.estimatedDays,
      methods: location.methods.map(m => ({
        id: m.method.id,
        name: m.method.name,
        description: m.method.description,
        baseFee: m.method.baseFee,
        customFee: m.customFee,
        estimatedDays: m.customDays || m.method.estimatedDays,
        isActive: m.isActive
      }))
    }));

    res.json(transformedLocations);
  } catch (error) {
    console.error('Get public delivery locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active delivery methods
router.get('/methods', async (req, res) => {
  try {
    const methods = await prisma.deliveryMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(methods);
  } catch (error) {
    console.error('Get public delivery methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate delivery price for specific location and method
router.post('/calculate', async (req, res) => {
  try {
    const { locationId, methodId } = req.body;

    if (!locationId || !methodId) {
      return res.status(400).json({ message: 'Missing locationId or methodId' });
    }

    // Get location and method
    const [location, method] = await Promise.all([
      prisma.deliveryLocation.findUnique({
        where: { id: locationId }
      }),
      prisma.deliveryMethod.findUnique({
        where: { id: methodId }
      })
    ]);

    if (!location || !method) {
      return res.status(404).json({ message: 'Location or method not found' });
    }

    if (!location.isActive || !method.isActive) {
      return res.status(400).json({ message: 'Delivery option is not available' });
    }

    // Check for custom mapping
    const mapping = await prisma.deliveryLocationMethod.findUnique({
      where: {
        locationId_methodId: {
          locationId,
          methodId
        }
      }
    });

    // Calculate price and days
    const price = mapping?.customFee ?? (location.baseFee + method.baseFee);
    
    // Calculate estimated days
    let estimatedDays;
    if (mapping?.customDays) {
      estimatedDays = mapping.customDays;
    } else {
      const locationDays = location.estimatedDays.split('-').map(Number);
      const methodDays = method.estimatedDays.split('-').map(Number);
      
      const minDays = Math.max(1, (locationDays[0] || 1) + (methodDays[0] || 0));
      const maxDays = (locationDays[1] || locationDays[0] || 1) + (methodDays[1] || methodDays[0] || 0);
      
      estimatedDays = `${minDays}-${maxDays}`;
    }

    res.json({
      locationId: location.id,
      locationName: location.name,
      methodId: method.id,
      methodName: method.name,
      price,
      estimatedDays,
      baseLocationFee: location.baseFee,
      baseMethodFee: method.baseFee,
      customFee: mapping?.customFee || null,
      customDays: mapping?.customDays || null
    });
  } catch (error) {
    console.error('Calculate delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shop settings (public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.shopSettings.findFirst();
    
    if (!settings) {
      settings = {
        id: 'default',
        freeShippingThreshold: 50000,
        returnPolicy: '30-day return policy for defective items',
        warrantyInfo: '1-year warranty on all products',
        aboutText: null,
        contactEmail: null,
        contactPhone: null,
        whatsappNumber: null,
        updatedAt: new Date()
      };
    }
    
    // Only return public settings
    res.json({
      freeShippingThreshold: settings.freeShippingThreshold,
      returnPolicy: settings.returnPolicy,
      warrantyInfo: settings.warrantyInfo,
      aboutText: settings.aboutText
    });
  } catch (error) {
    console.error('Get public shop settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get seller info (public)
router.get('/seller', async (req, res) => {
  try {
    let seller = await prisma.sellerInfo.findFirst();
    
    if (!seller) {
      seller = {
        id: 'default',
        name: 'OneClick Resources',
        description: 'Your trusted partner for solar energy solutions in Nigeria',
        rating: 4.9,
        totalSales: 1547,
        successRate: 100,
        memberSince: '2019',
        responseTime: '< 1 hour',
        badges: ['Verified Seller', 'Top Rated', 'Fast Shipper'],
        email: null,
        phone: null,
        whatsapp: null,
        address: null,
        logo: null,
        updatedAt: new Date()
      };
    }
    
    // Return public seller info (exclude private contact info if not wanted)
    res.json({
      name: seller.name,
      description: seller.description,
      rating: seller.rating,
      totalSales: seller.totalSales,
      successRate: seller.successRate,
      memberSince: seller.memberSince,
      responseTime: seller.responseTime,
      badges: seller.badges,
      address: seller.address,
      logo: seller.logo
    });
  } catch (error) {
    console.error('Get public seller info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;