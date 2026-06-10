import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default shop settings
  await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      freeShippingThreshold: 50000,
      returnPolicy: '30-day return policy for defective items. Items must be in original packaging.',
      warrantyInfo: '1-year warranty on all solar panels and inverters, 6 months on accessories.',
      contactEmail: 'oneclickresourcesng@gmail.com',
      contactPhone: '08178363424',
      whatsappNumber: '08178363424'
    }
  });

  // Create default seller info
  await prisma.sellerInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
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

  // Create default delivery locations
  const locations = [
    { name: 'Lagos Mainland', baseFee: 2500, estimatedDays: '1-2', sortOrder: 1 },
    { name: 'Lagos Island', baseFee: 3500, estimatedDays: '1-2', sortOrder: 2 },
    { name: 'Abuja', baseFee: 4500, estimatedDays: '2-3', sortOrder: 3 },
    { name: 'Port Harcourt', baseFee: 4500, estimatedDays: '2-3', sortOrder: 4 },
    { name: 'Ibadan', baseFee: 4000, estimatedDays: '2-3', sortOrder: 5 },
    { name: 'Kano', baseFee: 5500, estimatedDays: '3-4', sortOrder: 6 },
    { name: 'Enugu', baseFee: 4500, estimatedDays: '2-3', sortOrder: 7 },
    { name: 'Benin', baseFee: 4000, estimatedDays: '2-3', sortOrder: 8 },
    { name: 'Kaduna', baseFee: 5500, estimatedDays: '3-4', sortOrder: 9 },
    { name: 'Other Locations', baseFee: 6000, estimatedDays: '3-5', sortOrder: 10 }
  ];

  for (const location of locations) {
    await prisma.deliveryLocation.upsert({
      where: { name: location.name },
      update: location,
      create: location
    });
  }

  // Create default delivery methods
  const methods = [
    { 
      name: 'Standard Delivery', 
      description: 'Delivered to your doorstep within 2-5 business days',
      baseFee: 0, 
      estimatedDays: '0', 
      sortOrder: 1 
    },
    { 
      name: 'Express Delivery', 
      description: 'Priority processing and faster shipping',
      baseFee: 5000, 
      estimatedDays: '-1', // Reduces delivery time
      sortOrder: 2 
    },
    { 
      name: 'Pickup Station', 
      description: 'Pick up from nearest pickup station',
      baseFee: 0, 
      estimatedDays: '0', 
      sortOrder: 3 
    }
  ];

  for (const method of methods) {
    await prisma.deliveryMethod.upsert({
      where: { name: method.name },
      update: method,
      create: method
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });