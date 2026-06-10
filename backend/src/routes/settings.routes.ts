import express from 'express';
import { prisma } from '../utils/database';

const router = express.Router();

// Get public shop settings
router.get('/shop', async (req, res) => {
  try {
    let settings = await prisma.shopSettings.findFirst();

    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: {
          freeShippingThreshold: 50000,
          returnPolicy: '30-day return policy for defective items',
          warrantyInfo: '1-year warranty on all products',
          contactEmail: 'support@oneclickresources.com',
          contactPhone: '08178363424',
          whatsappNumber: '08178363424'
        }
      });
    }

    // Return public settings
    res.json({
      freeShippingThreshold: settings.freeShippingThreshold,
      returnPolicy: settings.returnPolicy,
      warrantyInfo: settings.warrantyInfo,
      aboutText: settings.aboutText
    });
  } catch (error) {
    console.error('Get shop settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;