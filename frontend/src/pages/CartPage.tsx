// frontend/src/pages/CartPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  CreditCard,
  Percent,
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    items: cart, 
    removeFromCart, 
    updateQuantity, 
    subtotal,
    deliveryTotal,
    total,
    itemCount,
    clearCart,
    isLoading 
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const code = promoCode.toUpperCase();
    if (code === 'SAVE10') {
      setDiscount(0.1);
      toast({
        title: "🎉 Promo Applied!",
        description: "10% discount has been applied to your order.",
        variant: "success"
      });
    } else if (code === 'SAVE20') {
      setDiscount(0.2);
      toast({
        title: "🎉 Promo Applied!",
        description: "20% discount has been applied to your order.",
        variant: "success"
      });
    } else if (code === 'FREESHIP') {
      // Handle free shipping differently
      toast({
        title: "🚚 Free Shipping!",
        description: "Free shipping has been applied to your order.",
        variant: "promo"
      });
    } else {
      setPromoError('Invalid promo code');
      toast({
        title: "❌ Invalid Code",
        description: "The promo code you entered is not valid.",
        variant: "error"
      });
    }

    setIsApplyingPromo(false);
  };

  const removePromo = () => {
    setDiscount(0);
    setPromoCode('');
    setPromoError('');
    toast({
      title: "🔄 Promo Removed",
      description: "Promo code has been removed.",
      variant: "info"
    });
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = cart.find(i => i.productId === productId);
    if (item && newQuantity > (item.stock || 99)) {
      toast({
        title: "⚠️ Maximum Quantity Reached",
        description: `Only ${item.stock || 99} items available.`,
        variant: "warning"
      });
      return;
    }

    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    await removeFromCart(productId);
    toast({
      title: "🗑️ Item Removed",
      description: `${productName} has been removed from your cart.`,
      variant: "info"
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
      toast({
        title: "🧹 Cart Cleared",
        description: "All items have been removed from your cart.",
        variant: "warning"
      });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "🛒 Cart is Empty",
        description: "Add some items to your cart before checkout.",
        variant: "error"
      });
      return;
    }
    navigate('/checkout');
  };

  const discountAmount = subtotal * discount;
  const finalTotal = total - discountAmount;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative h-[200px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-teal-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="relative h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your <span className="text-teal-400">Shopping Cart</span>
            </h1>
            <p className="text-slate-300 text-lg">
              {cart.length === 0 
                ? 'Your cart is empty' 
                : `You have ${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-100 mb-6">
              <ShoppingCart className="h-12 w-12 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. 
              Browse our shop to find great solar products!
            </p>
            <Button
              onClick={() => navigate('/shop')}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 px-8 py-6 text-lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-4"
            >
              {/* Cart Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Cart Items ({itemCount})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>

              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    variants={itemVariants}
                    exit="exit"
                    layout
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-slate-200"
                  >
                    <div className="flex flex-col sm:flex-row p-4 gap-4">
                      {/* Product Image */}
                      <div className="sm:w-32 h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800 mb-1">
                              {item.name}
                            </h3>
                            {item.sku && (
                              <p className="text-sm text-slate-500 mb-2">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>
                          <p className="text-xl font-bold text-teal-600">
                            {formatNaira(item.price * item.quantity)}
                          </p>
                        </div>

                        {/* Delivery Info */}
                        {item.deliveryMethodId && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg">
                            <Truck className="h-4 w-4 text-teal-600" />
                            <span>Delivery: {formatNaira(item.deliveryFee || 0)}</span>
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= (item.stock || 99)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.productId, item.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>

                        {/* Stock Warning */}
                        {item.stock && item.stock < 10 && (
                          <Alert className="mt-2 bg-teal-50 border-teal-200">
                            <AlertCircle className="h-4 w-4 text-teal-600" />
                            <AlertDescription className="text-teal-700 text-sm">
                              Only {item.stock} left in stock!
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-24 border-2 border-slate-200 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-medium">{formatNaira(subtotal)}</span>
                    </div>

                    {/* Delivery Total */}
                    {deliveryTotal > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery</span>
                        <span className="font-medium">{formatNaira(deliveryTotal)}</span>
                      </div>
                    )}

                    {/* Discount */}
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount * 100}%)</span>
                        <span className="font-medium">-{formatNaira(discountAmount)}</span>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-teal-600">{formatNaira(finalTotal)}</span>
                    </div>

                    {/* Promo Code */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Promo Code
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value);
                              setPromoError('');
                            }}
                            placeholder="Enter code"
                            className={promoError ? 'border-red-500' : ''}
                            disabled={discount > 0}
                          />
                          {discount > 0 && (
                            <button
                              onClick={removePromo}
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                              <X className="h-4 w-4 text-slate-400 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                        {discount === 0 && (
                          <Button
                            onClick={applyPromo}
                            disabled={isApplyingPromo || !promoCode.trim()}
                            variant="outline"
                          >
                            {isApplyingPromo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Percent className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-600 mt-1">{promoError}</p>
                      )}
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 py-6 text-lg mt-4"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      variant="outline"
                      onClick={() => navigate('/shop')}
                      className="w-full border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 mt-2"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>

                    {/* Secure Checkout Notice */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure checkout powered by Paystack & Flutterwave</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;