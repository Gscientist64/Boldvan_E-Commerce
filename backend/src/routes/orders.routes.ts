import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../utils/validate';
import { orderLimiter } from '../utils/rateLimits';

const router = express.Router();

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Call a payment provider's verification endpoint with a short timeout
const verifyWithProvider = async ({ url, secretKey }: { url: string; secretKey: string }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Provider request failed (${response.status}): ${text.slice(0, 300)}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

// Create order (checkout)
router.post('/', authenticate, orderLimiter, validate([
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shipping.firstName').isString().withMessage('First name is required').bail().trim().isLength({ min: 1, max: 100 }).withMessage('First name is required'),
  body('shipping.lastName').isString().withMessage('Last name is required').bail().trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required'),
  body('shipping.email').isEmail().withMessage('A valid email is required'),
  body('shipping.phone').isString().withMessage('Phone is required').bail().trim().isLength({ min: 1, max: 30 }).withMessage('Phone is required'),
  body('shipping.address').isString().withMessage('Address is required').bail().trim().isLength({ min: 1, max: 500 }).withMessage('Address is required'),
  body('shipping.city').isString().withMessage('City is required').bail().trim().isLength({ min: 1, max: 100 }).withMessage('City is required'),
  body('shipping.state').isString().withMessage('State is required').bail().trim().isLength({ min: 1, max: 100 }).withMessage('State is required'),
  body('paymentMethod').optional().isString().withMessage('Payment method must be text').bail().isLength({ max: 50 }).withMessage('Payment method is too long'),
  body('notes').optional().isString().withMessage('Notes must be text').bail().isLength({ max: 2000 }).withMessage('Notes are too long')
]), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { items, shipping, paymentMethod, notes, idempotencyKey, deliveryMethodId } = req.body;

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

    // IDEMPOTENCY: if the same checkout key was already used, return the existing order
    // instead of creating a duplicate (protects against double-clicks and network retries).
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: {
          items: { include: { product: { select: { name: true, image: true, sku: true, price: true } } } },
          shipping: true
        }
      });

      if (existing) {
        if (existing.userId !== userId) {
          return res.status(409).json({ message: 'This checkout key is already in use.' });
        }
        return res.json({
          success: true,
          idempotent: true,
          message: 'Order already exists for this checkout',
          id: existing.id,
          orderNumber: existing.orderNumber,
          trackingNumber: existing.trackingNumber,
          order: existing
        });
      }
    }

    // Calculate estimated delivery (5 days from now for standard shipping)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    // Validate line items and compute an AUTHORITATIVE subtotal from DB prices.
    // Client-supplied price / name / subtotal / total are never trusted for money.
    const productUpdates = [];
    let subtotal = 0;
    for (const item of items) {
      const productId = item?.productId;
      const quantity = Number(item?.quantity);

      if (typeof productId !== 'string' || !productId) {
        return res.status(400).json({ message: 'Each item must include a valid productId' });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: 'Item quantity must be a whole number between 1 and 99' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, price: true, stock: true, name: true, isActive: true }
      });

      if (!product || product.isActive === false) {
        return res.status(404).json({ message: `Product ${productId} not found` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      subtotal += product.price * quantity;
      productUpdates.push({
        productId: product.id,
        quantity,
        newStock: product.stock - quantity,
        price: product.price,
        name: product.name
      });
    }

    // Authoritative shipping fee from the admin-managed DeliveryMethod table.
    // The client only supplies the chosen method id; the fee is read from the DB.
    let shippingFee = 0;
    let resolvedDeliveryMethodId: string | undefined;
    if (deliveryMethodId) {
      const method = await prisma.deliveryMethod.findFirst({
        where: { id: deliveryMethodId, isActive: true },
        select: { id: true, baseFee: true }
      });
      if (method) {
        shippingFee = Math.max(0, method.baseFee || 0);
        resolvedDeliveryMethodId = method.id;
      }
    }

    // Fallback for legacy/test clients that don't send a method id: keep the
    // client-supplied fee bounded instead of trusting it blindly.
    if (!resolvedDeliveryMethodId) {
      const rawShippingFee = Number(shipping?.shippingFee);
      const MAX_SHIPPING_FEE = 5000;
      shippingFee = Number.isFinite(rawShippingFee) && rawShippingFee > 0
        ? Math.min(Math.max(rawShippingFee, 0), MAX_SHIPPING_FEE)
        : 0;
    }

    const totalAmount = Math.round((subtotal + shippingFee) * 100) / 100;

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
          totalAmount,
          subtotal,
          shippingFee,
          ...(resolvedDeliveryMethodId ? { deliveryMethodId: resolvedDeliveryMethodId, deliveryFee: shippingFee } : {}),
          paymentMethod,
          paymentStatus: 'pending',
          ...(idempotencyKey ? { idempotencyKey } : {}),
          notes,
          estimatedDelivery,
          items: {
            create: productUpdates.map((update) => ({
              productId: update.productId,
              quantity: update.quantity,
              price: update.price,
              name: update.name
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

  } catch (error: any) {
    // Race-condition safety: if two identical requests slip past the existence check,
    // the unique idempotencyKey constraint rejects the second - return the first order.
    if (error?.code === 'P2002' && req.body?.idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey: req.body.idempotencyKey }
      });
      if (existing && existing.userId === req.user!.id) {
        return res.json({
          success: true,
          idempotent: true,
          message: 'Order already exists for this checkout',
          id: existing.id,
          orderNumber: existing.orderNumber,
          trackingNumber: existing.trackingNumber,
          order: existing
        });
      }
    }
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

// Update order payment status (with server-side verification before marking 'paid')
router.put('/:id/payment', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference, paymentMethod } = req.body;
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

    // IDEMPOTENCY: once an order is recorded as paid, treat any repeat request as a no-op
    // and return the current state - no re-verification and no risk of duplicate charges.
    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        idempotent: true,
        message: 'Payment already recorded for this order',
        order
      });
    }

    // Non-'paid' updates (pending / bank transfer / notes) never auto-confirm an order
    if (paymentStatus !== 'paid') {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(paymentReference ? { paymentReference } : {})
        }
      });

      return res.json({
        success: true,
        message: 'Payment status updated',
        order: updatedOrder
      });
    }

    // Marking an order 'paid' must be verified with the payment provider first.
    const provider = String(paymentMethod || order.paymentMethod || '').toLowerCase();

    if (provider !== 'paystack' && provider !== 'flutterwave') {
      return res.status(400).json({
        success: false,
        message: 'Online payments must be verified with the payment provider. Bank transfers are confirmed manually by our team.'
      });
    }

    if (!paymentReference) {
      return res.status(400).json({ success: false, message: 'paymentReference is required for verification.' });
    }

    // Secret keys are stored in MarketplaceSettings (never exposed through the API)
    const settings = await prisma.marketplaceSettings.findFirst();

    let verified = false;
    let verifiedAmount = false;
    let providerStatus = '';

    if (provider === 'paystack') {
      const secretKey = settings?.paystackSecretKey;
      if (!secretKey) {
        return res.status(400).json({
          success: false,
          message: 'Paystack is not configured. Please add your Paystack secret key in Admin > Settings > Payment.'
        });
      }

      const result = await verifyWithProvider({
        url: `https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`,
        secretKey
      });
      const data = result && result.data;
      providerStatus = data && data.status;
      verified = data && data.status === 'success';
      // Paystack returns the amount in kobo (smallest currency unit)
      verifiedAmount = typeof data?.amount === 'number' &&
        Math.abs(data.amount - Math.round(order.totalAmount * 100)) <= 1;
    } else if (provider === 'flutterwave') {
      const secretKey = settings?.flutterwaveSecretKey;
      if (!secretKey) {
        return res.status(400).json({
          success: false,
          message: 'Flutterwave is not configured. Please add your Flutterwave secret key in Admin > Settings > Payment.'
        });
      }

      // Flutterwave reference may be a numeric transaction id or the tx_ref string
      const isNumeric = /^\d+$/.test(paymentReference);
      const url = isNumeric
        ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(paymentReference)}/verify`
        : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(paymentReference)}`;

      const result = await verifyWithProvider({ url, secretKey });
      const tx = Array.isArray(result && result.data) ? result.data[0] : result && result.data;
      providerStatus = tx && tx.status;
      verified = tx && tx.status === 'successful';
      // Flutterwave returns the amount in the currency major unit (naira)
      verifiedAmount = typeof tx?.amount === 'number' &&
        Math.abs(Number(tx.amount) - Number(order.totalAmount)) <= 1;
    }

    if (!verified || !verifiedAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment verification failed (${providerStatus || 'unverified'}). If you were charged, contact support and we will confirm your order manually.`
      });
    }

    // Only trust the payment and confirm the order after verification passes
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'paid',
        paymentReference,
        paymentMethod: provider,
        status: 'CONFIRMED'
      }
    });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed',
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