import express from 'express';
import { prisma } from '../utils/database';

const router = express.Router();

// Get public seller info
router.get('/', async (req, res) => {
  try {
    let seller = await prisma.sellerInfo.findFirst();

    if (!seller) {
      // Create default seller info if none exists
      seller = await prisma.sellerInfo.create({
        data: {
          name: 'OneClick Resources',
          description: 'Your trusted partner for solar energy solutions in Nigeria',
          email: 'oneclickresourcesng@gmail.com',
          phone: '08178363424',
          whatsapp: '08178363424',
          address: 'Calabar, Nigeria',
          rating: 4.9,
          totalSales: 200,
          successRate: 100,
          memberSince: '2019',
          responseTime: '< 1 hour',
          badges: ['Verified Seller', 'Top Rated', 'Fast Shipper']
        }
      });
    }

    // Return only public info (no sensitive data)
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
      logo: seller.logo,
      phone: seller.phone,
      whatsapp: seller.whatsapp,
      email: seller.email
    });
  } catch (error) {
    console.error('Get seller info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;