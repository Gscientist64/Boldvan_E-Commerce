// backend/src/routes/wishlist.routes.ts

import express from 'express';
import { prisma } from '../utils/database';

const router = express.Router();

// Get user's wishlist (denormalized product info for the UI)
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, price: true, image: true, stock: true, isActive: true, images: true } }
      }
    });

    res.json({
      success: true,
      count: items.length,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        inStock: item.product.stock > 0 && item.product.isActive,
        addedAt: item.createdAt
      }))
    });
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

    // Upsert so re-adding an existing item is idempotent
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } }
    });

    if (existing) {
      return res.json({ success: true, message: 'Product already in wishlist', productId, already: true });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId, productId }
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      productId,
      item
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist (registered BEFORE /:productId so 'clear' isn't matched as a productId)
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user!.id;

    const result = await prisma.wishlistItem.deleteMany({ where: { userId } });

    res.json({ 
      success: true, 
      message: 'Wishlist cleared',
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    const result = await prisma.wishlistItem.deleteMany({
      where: { userId, productId }
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ 
      success: true, 
      message: 'Product removed from wishlist' 
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;