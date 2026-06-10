import express from 'express';
import dashboardRoutes from './admin/dashboard.routes';
import productRoutes from './admin/products.routes';
import orderRoutes from './admin/orders.routes';
import bookingRoutes from './admin/bookings.routes';
import categoryRoutes from './admin/categories.routes';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Apply admin middleware to ALL admin routes
router.use(authenticate);
router.use(authorizeAdmin);

// Mount admin sub-routes (ONCE each, not duplicated)
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/bookings', bookingRoutes);
router.use('/categories', categoryRoutes);

// REMOVE all auth routes (register/login/me) - they belong in auth.routes.ts

export default router;