// backend/src/routes/products.routes.ts

import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      featured, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 100
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      isActive: true
    };

    // FIXED: Handle category filter without isActive check
    if (category) {
      // Find category by slug or ID (removed isActive since it doesn't exist)
      const foundCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category as string },
            { id: category as string }
          ]
        }
      });
      
      if (foundCategory) {
        where.categoryId = foundCategory.id;  // Use categoryId, not category
      } else {
        // If category not found, return empty results
        return res.json({
          products: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0
          }
        });
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Handle sorting
    let orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = sortOrder === 'desc' ? 'desc' : 'asc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { 
              id: true, 
              name: true, 
              slug: true,
              image: true 
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      
      return {
        ...product,
        rating: avgRating,
        reviews: undefined
      };
    });

    res.json({
      products: productsWithRating,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { 
            id: true,
            name: true, 
            slug: true,
            image: true 
          }
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    res.json({
      ...product,
      rating: avgRating
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create review (authenticated users only)
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
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
        productId: id,
        userId
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;