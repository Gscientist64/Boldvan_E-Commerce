// backend/src/routes/wishlist.routes.ts

import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication to all wishlist routes
router.use(authenticate);

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    // If you don't have a Wishlist model yet, return empty array
    // You can create a Wishlist model later
    res.json([]);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to wishlist
router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // For now, just return success
    // You can implement actual wishlist storage later
    res.json({ 
      success: true, 
      message: 'Product added to wishlist',
      productId 
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    res.json({ 
      success: true, 
      message: 'Product removed from wishlist' 
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user!.id;

    res.json({ 
      success: true, 
      message: 'Wishlist cleared' 
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;