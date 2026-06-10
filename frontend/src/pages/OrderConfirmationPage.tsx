// frontend/src/pages/OrderConfirmationPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storeConfig } from '@/config/store';
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  Printer,
  Download,
  Share2,
  Home,
  ShoppingBag,
  ChevronRight,
  Calendar,
  CreditCard,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Receipt from '@/components/Receipt';

// Declare the global confetti function
declare global {
  interface Window {
    confetti: (options?: any) => void;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    method: string;
  };
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const OrderConfirmationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showReceipt, setShowReceipt] = useState(false);
  
    const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId');
  
    useEffect(() => {
      const triggerConfetti = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
          });
        } catch (error) {
          console.warn('Confetti animation not available:', error);
        }
      };
  
      triggerConfetti();
  
      const fetchOrderDetails = async () => {
        if (!orderId) {
          setIsLoading(false);
          return;
        }
  
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (response.ok) {
            const data = await response.json();
            setOrder(data);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchOrderDetails();
    }, [orderId]);
  
    const formatNaira = (amount: number) => {
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    const handlePrint = () => {
      setShowReceipt(true);
      // Small delay to ensure receipt modal is rendered
      setTimeout(() => {
        window.print();
      }, 100);
    };
  
    const handleDownloadReceipt = () => {
      setShowReceipt(true);
    };
  
    const handleShare = () => {
      if (navigator.share) {
        navigator.share({
          title: `Order Confirmation - ${order?.orderNumber}`,
          text: `My order #${order?.orderNumber} for ₦${order?.totalAmount.toLocaleString()} has been confirmed!`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied',
          description: 'Order link copied to clipboard',
        });
      }
    };
  
    const handleTrackOrder = () => {
      if (order?.trackingNumber) {
        navigate(`/tracking?orderId=${order.id}`);
      } else {
        toast({
          title: 'Tracking not available',
          description: 'Your order will be trackable once it ships.',
        });
      }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order && orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
            <p className="text-slate-600 mb-6">We couldn't find your order. Please check your order ID and try again.</p>
            <Button onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock order data for demonstration
  const mockOrder: OrderDetails = {
    id: orderId || 'ORD-123456',
    orderNumber: orderId || 'ORD-123456',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    totalAmount: 235000,
    subtotal: 230000,
    shippingFee: 5000,
    paymentMethod: 'Paystack',
    paymentStatus: 'paid',
    items: [
      {
        id: '1',
        name: '48V LiFE Battery',
        quantity: 1,
        price: 230000,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'
      }
    ],
    shipping: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '08123456789',
      address: '123 Main Street',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      method: 'Standard Delivery'
    },
    estimatedDelivery: 'March 10, 2026',
    trackingNumber: 'SM-123456789'
  };

  const displayOrder = order || mockOrder;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Order Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-green-100"
          >
            Thank you for your purchase. Your order has been received.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Order Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <p className="font-bold text-lg">{displayOrder.orderNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Order Date</p>
                  <p className="font-medium">{formatDate(displayOrder.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment</p>
                  <p className="font-medium capitalize">{displayOrder.paymentMethod}</p>
                  <Badge variant="success" className="mt-1">Paid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-full">
                  <Truck className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Est. Delivery</p>
                  <p className="font-medium">{displayOrder.estimatedDelivery ? formatDate(displayOrder.estimatedDelivery) : 'Processing'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Order Items</h2>
                <div className="space-y-4">
                  {displayOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 border-b pb-4 last:border-0">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">{formatNaira(item.price)}</p>
                        <p className="text-sm text-slate-500">Total: {formatNaira(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  Shipping Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-slate-700 mb-2">Shipping Address</h3>
                    <p className="text-slate-600">
                      {displayOrder.shipping.firstName} {displayOrder.shipping.lastName}<br />
                      {displayOrder.shipping.address}<br />
                      {displayOrder.shipping.city}, {displayOrder.shipping.state} {displayOrder.shipping.zipCode}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-700 mb-2">Contact Information</h3>
                    <p className="text-slate-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {displayOrder.shipping.email}
                    </p>
                    <p className="text-slate-600 flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {displayOrder.shipping.phone}
                    </p>
                    <p className="text-slate-600 flex items-center gap-2 mt-1">
                      <Truck className="h-4 w-4" />
                      Shipping Method: {displayOrder.shipping.method}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Actions - Updated with Receipt button */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">{formatNaira(displayOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">
                      {displayOrder.shippingFee === 0 ? 'FREE' : formatNaira(displayOrder.shippingFee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-teal-600">{formatNaira(displayOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {displayOrder.trackingNumber && (
                    <Button
                      onClick={handleTrackOrder}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Track Order
                    </Button>
                  )}

                  {/* New Receipt Button */}
                  <Button
                    onClick={() => setShowReceipt(true)}
                    variant="outline"
                    className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Receipt
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="w-full border-2 border-slate-200 hover:border-teal-500"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadReceipt}
                    className="w-full border-2 border-slate-200 hover:border-teal-500"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="w-full border-2 border-slate-200 hover:border-teal-500"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Order
                  </Button>

                  <Separator />

                  <Button
                    onClick={() => navigate('/shop')}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </div>

                {/* Estimated Delivery Timeline */}
                {displayOrder.estimatedDelivery && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-teal-600" />
                      <span>Estimated delivery by</span>
                      <span className="font-bold text-teal-600">{displayOrder.estimatedDelivery}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      You'll receive a tracking link once your order ships.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-teal-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-medium mb-2">Order Confirmed</h3>
                <p className="text-sm text-slate-500">Your order has been placed and confirmed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-teal-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-medium mb-2">Processing</h3>
                <p className="text-sm text-slate-500">We're preparing your order for shipping</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-teal-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-medium mb-2">Shipped</h3>
                <p className="text-sm text-slate-500">Your order is on its way to you</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-teal-600 font-bold text-xl">4</span>
                </div>
                <h3 className="font-medium mb-2">Delivered</h3>
                <p className="text-sm text-slate-500">Your order has been delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receipt Modal */}
      {showReceipt && order && (
        <Receipt
          order={order}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default OrderConfirmationPage;