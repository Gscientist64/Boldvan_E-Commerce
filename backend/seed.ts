import { prisma } from './src/utils/database';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Create admin user (use env-provided password or generate a strong random one)
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD || require('crypto').randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(adminPasswordPlain, 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@solar.com' },
    update: {},
    create: {
      email: 'admin@solar.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'ADMIN'
    }
  });

  // Create categories only (no products)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'solar-panels' },
      update: {},
      create: {
        name: 'Solar Panels',
        slug: 'solar-panels',
        description: 'High-efficiency solar panels for residential and commercial use'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'inverters' },
      update: {},
      create: {
        name: 'Inverters',
        slug: 'inverters',
        description: 'Solar inverters for converting DC to AC power'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'batteries' },
      update: {},
      create: {
        name: 'Batteries',
        slug: 'batteries',
        description: 'Energy storage solutions for solar systems'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mounting-systems' },
      update: {},
      create: {
        name: 'Mounting Systems',
        slug: 'mounting-systems',
        description: 'Solar panel mounting hardware and systems'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'charge-controllers' },
      update: {},
      create: {
        name: 'Charge Controllers',
        slug: 'charge-controllers',
        description: 'MPPT and PWM solar charge controllers'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'monitoring-systems' },
      update: {},
      create: {
        name: 'Monitoring Systems',
        slug: 'monitoring-systems',
        description: 'Solar system monitoring and management tools'
      }
    }),
  ]);

  // Create services (these are fixed service offerings)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Residential Solar Installation',
        description: 'Complete installation of solar panel systems for homes including mounting, wiring, and connection to the grid',
        price: 1999.99,
        type: 'INSTALLATION',
        duration: 48,
        image: 'https://images.unsplash.com/photo-1548613053-8aee570c15b7?w=500'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Commercial Solar Installation',
        description: 'Large-scale solar installation for businesses and commercial properties',
        price: 4999.99,
        type: 'INSTALLATION',
        duration: 120,
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Annual Maintenance Check',
        description: 'Comprehensive maintenance service for existing solar systems including panel cleaning, connection checks, and performance testing',
        price: 299.99,
        type: 'MAINTENANCE',
        duration: 4,
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Emergency Repair Service',
        description: '24/7 emergency repair service for solar systems including inverter repair, wiring issues, and component replacement',
        price: 499.99,
        type: 'REPAIR',
        duration: 6,
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500'
      }
    }),
    prisma.service.create({
      data: {
        name: 'System Optimization',
        description: 'Performance optimization for existing solar systems to maximize energy production',
        price: 799.99,
        type: 'MAINTENANCE',
        duration: 8,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
      }
    }),
  ]);

  // Create a regular user for testing (env-provided or generated)
  const userPasswordPlain = process.env.SEED_USER_PASSWORD || require('crypto').randomBytes(8).toString('hex');
  const userPassword = await bcrypt.hash(userPasswordPlain, 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567891',
      role: 'USER'
    }
  });

  console.log('✅ Seeding completed successfully!');
  console.log('========================================');
  console.log('👑 Admin Credentials:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${process.env.SEED_ADMIN_PASSWORD ? 'from SEED_ADMIN_PASSWORD env' : adminPasswordPlain}`);
  console.log('========================================');
  console.log('👤 Test User Credentials:');
  console.log('   Email: user@example.com');
  console.log(`   Password: ${process.env.SEED_USER_PASSWORD ? 'from SEED_USER_PASSWORD env' : userPasswordPlain}`);
  console.log('========================================');
  console.log(`📦 Created ${categories.length} categories`);
  console.log(`🔧 Created ${services.length} services`);
  console.log('========================================');
  console.log('ℹ️  No products created - Admin can add products via dashboard');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });