// frontend/src/pages/OrdersPage.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  shipping?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      // Handle both array response and paginated response
      return data.orders || data || [];
    },
  });

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; icon: any }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      processing: { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
      confirmed: { className: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle },
      shipped: { className: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
      delivered: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      cancelled: { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    };
    return statusMap[status.toLowerCase()] || statusMap.pending;
  };

  const handleTrackOrder = (trackingNumber: string) => {
    navigate(`/tracking?tracking=${trackingNumber}`);
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast({
      title: 'Copied!',
      description: 'Tracking number copied to clipboard',
    });
  };

  // Ensure orders is always an array
  const orders = Array.isArray(ordersData) ? ordersData : [];

  const filteredOrders = orders.filter((order: Order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'processing'].includes(order.status.toLowerCase());
    if (activeTab === 'shipped') return order.status.toLowerCase() === 'shipped';
    if (activeTab === 'delivered') return order.status.toLowerCase() === 'delivered';
    return true;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-4">{(error as Error).message}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-blue-100">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-6">
                    {activeTab === 'all' 
                      ? "You haven't placed any orders yet" 
                      : `No ${activeTab} orders found`}
                  </p>
                  <Button onClick={() => navigate('/shop')}>
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: Order) => {
                  const StatusIcon = getStatusBadge(order.status).icon;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="font-bold text-lg">{order.orderNumber}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusBadge(order.status).className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {order.status}
                            </Badge>
                            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        {/* Tracking Number (if available) */}
                        {order.trackingNumber && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-700">Tracking:</span>
                              <span className="font-mono text-sm">{order.trackingNumber}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8"
                                onClick={() => copyTrackingNumber(order.trackingNumber!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8"
                                onClick={() => handleTrackOrder(order.trackingNumber!)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Order Items Preview */}
                        <div className="space-y-3 mb-4">
                          {order.items?.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-full h-full p-2 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium">{formatNaira(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          {order.items && order.items.length > 2 && (
                            <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                          )}
                        </div>

                        {/* Order Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              {formatNaira(order.totalAmount)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge className={getStatusBadge(selectedOrder.status).className}>
                  Status: {selectedOrder.status}
                </Badge>
                <Badge variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  Payment: {selectedOrder.paymentStatus}
                </Badge>
              </div>

              {/* Tracking Information */}
              {selectedOrder.trackingNumber && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700">Tracking Number:</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => copyTrackingNumber(selectedOrder.trackingNumber!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => handleTrackOrder(selectedOrder.trackingNumber!)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-mono text-sm">{selectedOrder.trackingNumber}</p>
                  {selectedOrder.estimatedDelivery && (
                    <p className="text-sm text-blue-600">
                      Estimated delivery: {format(new Date(selectedOrder.estimatedDelivery), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-2 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatNaira(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              {selectedOrder.shipping && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedOrder.shipping.firstName} {selectedOrder.shipping.lastName}</p>
                    <p>{selectedOrder.shipping.address}</p>
                    <p>{selectedOrder.shipping.city}, {selectedOrder.shipping.state}</p>
                    <p className="text-sm text-gray-500 mt-2">Phone: {selectedOrder.shipping.phone}</p>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold mb-2">Payment Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-teal-600">{formatNaira(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment Method:</span>
                    <span className="capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;