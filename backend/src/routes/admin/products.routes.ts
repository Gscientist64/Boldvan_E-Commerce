// backend/src/routes/admin/products.routes.ts

import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);

// Get all products (admin view)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
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

// Create product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      sku,
      stock,
      categoryId,
      image,
      images,
      features,
      specifications,
      isFeatured,
      isActive
    } = req.body;

    // Validate required fields
    if (!name || !price || !sku || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        sku,
        stock: parseInt(stock) || 0,
        categoryId,
        image: image || null,
        images: images || [],
        features: features || {},
        specifications: specifications || {},
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive)
      },
      include: {
        category: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If SKU is being changed, check if new SKU exists
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      });

      if (skuExists) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        stock: updateData.stock ? parseInt(updateData.stock) : undefined
      },
      include: {
        category: true
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;