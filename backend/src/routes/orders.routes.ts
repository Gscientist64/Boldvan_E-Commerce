import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create order (checkout)
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { items, shipping, paymentMethod, subtotal, total, notes } = req.body;

    console.log('Creating order for user:', userId);
    console.log('Order data:', req.body);

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    // Validate shipping
    if (!shipping) {
      return res.status(400).json({ message: 'Shipping information required' });
    }

    // Calculate estimated delivery (5 days from now for standard shipping)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    // Validate stock and prepare product updates
    const productUpdates = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, stock: true, name: true }
      });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      productUpdates.push({
        productId: product.id,
        quantity: item.quantity,
        newStock: product.stock - item.quantity
      });
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update product stocks
      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: { stock: update.newStock }
        });
      }

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          totalAmount: total,
          subtotal: subtotal,
          shippingFee: shipping.shippingFee || 0,
          paymentMethod,
          paymentStatus: 'pending',
          notes,
          estimatedDelivery,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              name: item.name
            }))
          },
          shipping: {
            create: {
              firstName: shipping.firstName,
              lastName: shipping.lastName,
              email: shipping.email,
              phone: shipping.phone,
              address: shipping.address,
              city: shipping.city,
              state: shipping.state,
              zipCode: shipping.zipCode || '',
              method: shipping.method || 'Standard Delivery',
              instructions: shipping.deliveryInstructions || ''
            }
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                  sku: true,
                  price: true
                }
              }
            }
          },
          shipping: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return newOrder;
    });

    // Generate tracking number
    const trackingNumber = `TRK${order.id.slice(-8).toUpperCase()}`;
    
    await prisma.order.update({
      where: { id: order.id },
      data: { trackingNumber }
    });

    console.log('Order created successfully:', order.id);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      id: order.id,
      orderNumber: order.orderNumber,
      trackingNumber,
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add this to your orders.routes.ts

// Get order by tracking number (public route - no auth required)
router.get('/tracking/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const order = await prisma.order.findFirst({
      where: { trackingNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true
              }
            }
          }
        },
        shipping: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                  price: true
                }
              }
            }
          },
          shipping: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where: { userId } })
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(userRole !== 'ADMIN' ? { userId } : {})
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                price: true,
                sku: true
              }
            }
          }
        },
        shipping: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order payment status
router.put('/:id/payment', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(userRole !== 'ADMIN' ? { userId } : {})
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        paymentReference,
        status: paymentStatus === 'paid' ? 'CONFIRMED' : order.status
      }
    });

    res.json({
      success: true,
      message: 'Payment status updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'PROCESSING'] }
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
    }

    // Restore stock in transaction
    await prisma.$transaction(async (tx) => {
      // Restore product stocks
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : order.notes
        }
      });
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/admin/all', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status as string;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true
                }
              }
            }
          },
          shipping: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;