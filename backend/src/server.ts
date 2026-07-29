import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// @ts-ignore - optional dev dependency for types may not be installed in every environment
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { prisma } from './utils/database';
import { authenticate } from './middleware/auth.middleware'; // ✅ ADD THIS

// Routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import orderRoutes from './routes/orders.routes';
import serviceRoutes from './routes/services.routes';
import bookingRoutes from './routes/bookings.routes';
import adminRoutes from './routes/admin.routes';
import categoryRoutes from './routes/categories.routes';
import deliveryRoutes from './routes/admin/delivery.routes';
import publicDeliveryRoutes from './routes/public/delivery.routes';
import adminCategoryRoutes from './routes/admin/categories.routes';
import adminSettingsRoutes from './routes/admin/settings.routes'; // ✅ RENAMED
import usersRoutes from './routes/admin/users.routes';
import rolesRoutes from './routes/admin/roles.routes';
import logsRoutes from './routes/admin/logs.routes';
import reviewsRoutes from './routes/reviews.routes';
import sellerRoutes from './routes/seller.routes';
import publicSettingsRoutes from './routes/settings.routes'; // ✅ RENAMED
import wishlistRoutes from './routes/wishlist.routes';
import cartRoutes from './routes/cart.routes';
import profileRoutes from './routes/profile.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// If running behind a proxy (like Render), trust first proxy
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet());

// Basic rate limiting to mitigate brute-force and DDOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all LAN IPs and localhost variants
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // Also check explicit origins from env
      const explicitOrigins = [
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (explicitOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/delivery', publicDeliveryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/settings', publicSettingsRoutes); // ✅ USING RENAMED IMPORT
app.use('/api/profile', profileRoutes);

// Protected Routes (require authentication)
app.use('/api/wishlist', authenticate, wishlistRoutes);
app.use('/api/cart', authenticate, cartRoutes);

// Admin Routes (require authentication and admin role)
app.use('/api/admin', adminRoutes);
app.use('/api/admin/delivery', deliveryRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/settings', adminSettingsRoutes); // ✅ USING RENAMED IMPORT
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/roles', rolesRoutes);
app.use('/api/admin/logs', logsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Solar E-commerce API',
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation:`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Products: http://localhost:${PORT}/api/products`);
      console.log(`   Services: http://localhost:${PORT}/api/services`);
      console.log(`   Delivery: http://localhost:${PORT}/api/delivery/locations`);
      console.log(`   Cart: http://localhost:${PORT}/api/cart (requires auth)`);
      console.log(`   Wishlist: http://localhost:${PORT}/api/wishlist (requires auth)`);
      console.log(`   Admin: http://localhost:${PORT}/api/admin/dashboard/stats (requires admin)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();