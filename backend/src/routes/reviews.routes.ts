import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.review.count({ where: { productId } })
    ]);

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
router.post('/product/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: averageRating }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
router.put('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating !== undefined ? Number(rating) : undefined,
        comment: comment !== undefined ? comment : undefined
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update product rating
    const productReviews = await prisma.review.findMany({
      where: { productId: review.productId },
      select: { rating: true }
    });

    const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: averageRating }
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        ...(userRole !== 'ADMIN' ? { userId } : {})
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.productId;

    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: averageRating }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;