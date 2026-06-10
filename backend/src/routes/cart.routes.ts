import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication to all cart routes
router.use(authenticate);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { name: true }
                }
              }
            },
            deliveryLocation: true,
            deliveryMethod: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: { name: true }
                  }
                }
              },
              deliveryLocation: true,
              deliveryMethod: true
            }
          }
        }
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    const deliveryTotal = cart.items.reduce((sum, item) => 
      sum + (item.deliveryFee || 0), 0
    );

    const total = subtotal + deliveryTotal;

    res.json({
      id: cart.id,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        sku: item.product.sku,
        stock: item.product.stock,
        category: item.product.category?.name,
        deliveryLocation: item.deliveryLocation,
        deliveryMethod: item.deliveryMethod,
        deliveryFee: item.deliveryFee,
        subtotal: item.product.price * item.quantity
      })),
      subtotal,
      deliveryTotal,
      total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { 
      productId, 
      quantity = 1,
      deliveryLocationId,
      deliveryMethodId,
      deliveryFee
    } = req.body;
    const userId = req.user!.id;

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock for new quantity
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} available.` 
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          deliveryLocationId: deliveryLocationId || existingItem.deliveryLocationId,
          deliveryMethodId: deliveryMethodId || existingItem.deliveryMethodId,
          deliveryFee: deliveryFee !== undefined ? deliveryFee : existingItem.deliveryFee
        },
        include: {
          product: true,
          deliveryLocation: true,
          deliveryMethod: true
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          deliveryLocationId,
          deliveryMethodId,
          deliveryFee
        },
        include: {
          product: true,
          deliveryLocation: true,
          deliveryMethod: true
        }
      });
    }

    res.json({
      success: true,
      message: existingItem ? 'Cart updated' : 'Product added to cart',
      item: {
        id: cartItem.id,
        productId: cartItem.productId,
        name: cartItem.product.name,
        price: cartItem.product.price,
        quantity: cartItem.quantity,
        image: cartItem.product.image,
        deliveryLocation: cartItem.deliveryLocation,
        deliveryMethod: cartItem.deliveryMethod,
        deliveryFee: cartItem.deliveryFee,
        subtotal: cartItem.product.price * cartItem.quantity
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
// In backend/src/routes/cart.routes.ts

// Update cart item quantity
router.put('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user!.id;

    console.log('Updating cart item:', { itemId, quantity, userId });

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId }
      },
      include: { 
        product: true,
        cart: true 
      }
    });

    console.log('Found cart item:', cartItem);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${cartItem.product.stock} items available in stock` 
      });
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            sku: true,
            stock: true
          }
        }
      }
    });

    console.log('Updated cart item:', updatedItem);

    res.json({
      success: true,
      message: 'Cart updated',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: String(error),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update cart item delivery options
router.put('/item/:itemId/delivery', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { deliveryLocationId, deliveryMethodId, deliveryFee } = req.body;
    const userId = req.user!.id;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update delivery options
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        deliveryLocationId,
        deliveryMethodId,
        deliveryFee
      },
      include: {
        product: true,
        deliveryLocation: true,
        deliveryMethod: true
      }
    });

    res.json({
      success: true,
      message: 'Delivery options updated',
      item: {
        id: updatedItem.id,
        deliveryLocation: updatedItem.deliveryLocation,
        deliveryMethod: updatedItem.deliveryMethod,
        deliveryFee: updatedItem.deliveryFee
      }
    });
  } catch (error) {
    console.error('Update delivery options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.id;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear entire cart
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user!.id;

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (cart) {
      // Delete all items in cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart summary (count and total)
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart) {
      return res.json({
        itemCount: 0,
        subtotal: 0,
        total: 0
      });
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    const deliveryTotal = cart.items.reduce((sum, item) => 
      sum + (item.deliveryFee || 0), 0
    );

    res.json({
      itemCount,
      subtotal,
      deliveryTotal,
      total: subtotal + deliveryTotal
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Merge guest cart with user cart (after login)
router.post('/merge', async (req, res) => {
  try {
    const { guestCart } = req.body;
    const userId = req.user!.id;

    if (!guestCart || !Array.isArray(guestCart) || guestCart.length === 0) {
      return res.json({ message: 'No guest cart to merge' });
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Merge each guest cart item
    for (const guestItem of guestCart) {
      const { productId, quantity, deliveryLocationId, deliveryMethodId, deliveryFee } = guestItem;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) continue;

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId
          }
        }
      });

      if (existingItem) {
        // Update quantity (but don't exceed stock)
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );
        
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity }
        });
      } else {
        // Create new item
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity: Math.min(quantity, product.stock),
            deliveryLocationId,
            deliveryMethodId,
            deliveryFee
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Guest cart merged successfully'
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;