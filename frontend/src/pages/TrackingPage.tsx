// frontend/src/pages/TrackingPage.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Search,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Calendar,
  CreditCard,
  User,
  Home,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

  // Fetch order if orderId or tracking is in URL
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    } else if (trackingNumber) {
      fetchOrderByTracking(trackingNumber);
    }
  }, [orderId, trackingNumber]);

  const fetchOrderById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
      
      // Generate mock tracking events based on order status
      generateTrackingEvents(data);
      
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Failed to load order details');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderByTracking = async (tracking: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to find order by tracking number
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/tracking/${tracking}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No order found with this tracking number');
        }
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
      
      // Generate mock tracking events based on order status
      generateTrackingEvents(data);
      
    } catch (error) {
      console.error('Error fetching order by tracking:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tracking information');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrackingEvents = (orderData: OrderDetails) => {
    const events: TrackingEvent[] = [];
    const orderDate = new Date(orderData.createdAt);
    
    // Order placed event
    events.push({
      id: '1',
      status: 'order_placed',
      location: 'Online',
      description: 'Order has been placed',
      timestamp: orderDate.toISOString(),
      completed: true
    });

    // Payment confirmed (if paid)
    if (orderData.paymentStatus === 'paid') {
      events.push({
        id: '2',
        status: 'payment_confirmed',
        location: 'Online',
        description: 'Payment confirmed',
        timestamp: new Date(orderDate.getTime() + 30 * 60000).toISOString(), // 30 mins later
        completed: true
      });
    }

    // Processing
    if (['processing', 'confirmed', 'shipped', 'delivered'].includes(orderData.status)) {
      events.push({
        id: '3',
        status: 'processing',
        location: 'Warehouse',
        description: 'Order is being processed',
        timestamp: new Date(orderDate.getTime() + 2 * 3600000).toISOString(), // 2 hours later
        completed: true
      });
    }

    // Shipped
    if (['shipped', 'delivered'].includes(orderData.status)) {
      events.push({
        id: '4',
        status: 'shipped',
        location: 'Sorting Center',
        description: 'Order has been shipped',
        timestamp: new Date(orderDate.getTime() + 24 * 3600000).toISOString(), // 1 day later
        completed: true
      });
    }

    // Out for delivery
    if (orderData.status === 'delivered') {
      events.push({
        id: '5',
        status: 'out_for_delivery',
        location: 'Local Facility',
        description: 'Out for delivery',
        timestamp: new Date(orderDate.getTime() + 48 * 3600000).toISOString(), // 2 days later
        completed: true
      });

      // Delivered
      events.push({
        id: '6',
        status: 'delivered',
        location: orderData.shipping.address,
        description: 'Package delivered',
        timestamp: new Date(orderDate.getTime() + 72 * 3600000).toISOString(), // 3 days later
        completed: true
      });
    }

    setTrackingEvents(events);
  };

  const handleTrack = async () => {
    if (!trackingNumber.trim() && !orderId.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter an order ID or tracking number',
        variant: 'destructive',
      });
      return;
    }

    if (trackingNumber.trim()) {
      // Search by tracking number
      navigate(`/tracking?tracking=${trackingNumber}`);
      await fetchOrderByTracking(trackingNumber);
    } else if (orderId.trim()) {
      // Search by order ID
      navigate(`/tracking?orderId=${orderId}`);
      await fetchOrderById(orderId);
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      order_placed: 'bg-blue-100 text-blue-800',
      payment_confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_placed':
        return <ShoppingBag className="h-5 w-5" />;
      case 'payment_confirmed':
        return <CheckCircle className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; icon: any }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { className: 'bg-blue-100 text-blue-800', icon: Package },
      confirmed: { className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      shipped: { className: 'bg-indigo-100 text-indigo-800', icon: Truck },
      delivered: { className: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { className: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return statusMap[status.toLowerCase()] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Order</h1>
          <p className="text-xl text-blue-100">
            Enter your order ID or tracking number to see real-time updates
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="e.g., ORD-12345678-001"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    placeholder="e.g., TRK12345678"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleTrack}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading tracking information...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Order Not Found</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => {
                  setOrderId('');
                  setTrackingNumber('');
                  setError(null);
                }}>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/shop')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order Summary Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Order #{order.orderNumber}</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <Badge className={getOrderStatusBadge(order.status).className}>
                    {order.status}
                  </Badge>
                </div>

                {/* Tracking Number if available */}
                {order.trackingNumber && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Tracking Number:</span>
                      <span className="font-mono">{order.trackingNumber}</span>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Items Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Items</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">{formatNaira(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Shipping Address */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h3>
                    <p className="text-sm text-slate-600">
                      {order.shipping.firstName} {order.shipping.lastName}<br />
                      {order.shipping.address}<br />
                      {order.shipping.city}, {order.shipping.state}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Contact Info
                    </h3>
                    <p className="text-sm text-slate-600">
                      {order.shipping.phone}<br />
                      {order.shipping.email}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Payment Summary */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Payment Method</p>
                    <p className="font-medium capitalize">{order.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-xl font-bold text-teal-600">{formatNaira(order.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            {trackingEvents.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Tracking History</h3>
                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <div key={event.id} className="relative">
                        {index < trackingEvents.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
                        )}
                        <div className="flex gap-4">
                          <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              event.completed 
                                ? 'bg-teal-100 text-teal-600' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {getStatusIcon(event.status)}
                            </div>
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                              <h4 className="font-semibold text-slate-800">
                                {event.description}
                              </h4>
                              <span className="text-sm text-slate-500">
                                {formatDateTime(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                            <Badge className={`mt-2 ${getStatusColor(event.status)}`}>
                              {event.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500 rounded-full">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-teal-700">Estimated Delivery</p>
                      <p className="text-xl font-bold text-teal-800">
                        {format(new Date(order.estimatedDelivery), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Need Help? */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                  <p className="text-slate-600 mb-4">
                    If you have any questions about your order, please contact our support team.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => window.location.href = 'tel:08178363424'}>
                      <Phone className="h-4 w-4" />
                      08178363424
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => window.location.href = 'mailto:support@BOLDVANresources.com'}>
                      <Mail className="h-4 w-4" />
                      support@BOLDVANresources.com
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/support')}>
                      <Home className="h-4 w-4" />
                      Visit Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* No Results State */}
        {!order && !isLoading && !error && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No tracking information yet</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Enter your order ID or tracking number above to see real-time updates on your order status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;