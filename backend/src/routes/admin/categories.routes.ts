import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category statistics (product counts)
router.get('/stats', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    const stats = categories.reduce((acc, category) => {
      acc[category.id] = category._count.products;
      return acc;
    }, {} as Record<string, number>);

    res.json(stats);
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { name, description, slug, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category with same name or slug exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ 
        message: existing.name === name 
          ? 'Category with this name already exists' 
          : 'Category with this slug already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || '',
        slug,
        image: image || null
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug, image } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name or slug already exists on another category
    if (name || slug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          OR: [
            name ? { name } : {},
            slug ? { slug } : {}
          ],
          NOT: { id }
        }
      });

      if (duplicate) {
        return res.status(400).json({ 
          message: duplicate.name === name 
            ? 'Category with this name already exists' 
            : 'Category with this slug already exists'
        });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        slug: slug || undefined,
        image: image !== undefined ? image : undefined
      }
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    if (category._count.products > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products. Please reassign or delete the products first.',
        productCount: category._count.products
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;