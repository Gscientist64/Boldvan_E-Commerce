// frontend/src/pages/admin/OrderManagement.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  userId: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    method: string;
  };
}

const OrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  const getAuthToken = () => localStorage.getItem('token') || '';

  // Fetch orders
  const {
    data: ordersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-orders', currentPage, searchTerm, statusFilter, paymentFilter],
    queryFn: async () => {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { paymentStatus: paymentFilter })
      });

      const response = await fetch(`${API_BASE_URL}/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return response.json();
    },
  });

  // Update order payment status
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, status, reference }: { orderId: string; status: string; reference?: string }) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentStatus: status,
          paymentReference: reference,
          note: paymentNote
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setIsPaymentDialogOpen(false);
      setSelectedOrder(null);
      setPaymentNote('');
      toast({
        title: 'Payment status updated',
        description: 'Order payment status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: { orderId: string; status: string; trackingNumber?: string }) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, trackingNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      toast({
        title: 'Order status updated',
        description: 'Order status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      processing: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      confirmed: { variant: 'default', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      shipped: { variant: 'default', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      delivered: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
      cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    return variants[status.toLowerCase()] || variants.pending;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      paid: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      failed: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
      refunded: { variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    return variants[status.toLowerCase()] || variants.pending;
  };

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || { total: 0, pages: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage customer orders, update payment status, and track shipments
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payment</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.filter(o => o.paymentStatus === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Orders</p>
                <p className="text-3xl font-bold text-green-600">
                  {orders.filter(o => o.paymentStatus === 'paid').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">To Ship</p>
                <p className="text-3xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'confirmed' && o.paymentStatus === 'paid').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
              <p className="text-gray-500 mb-4">{(error as Error).message}</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                          <p className="text-gray-500">
                            {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'No orders have been placed yet'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order: Order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.shipping?.firstName || 'N/A'} {order.shipping?.lastName || ''}
                              </p>
                              <p className="text-sm text-gray-500">{order.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatNaira(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentBadge(order.paymentStatus).className}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(order.status).className}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setIsViewDialogOpen(true);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                
                                {order.paymentStatus !== 'paid' && (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedOrder(order);
                                    setIsPaymentDialogOpen(true);
                                  }}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setIsStatusDialogOpen(true);
                                }}>
                                  <Truck className="mr-2 h-4 w-4" />
                                  Update Status
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {orders.length} of {pagination.total} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
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
                <Badge className={getPaymentBadge(selectedOrder.paymentStatus).className}>
                  Payment: {selectedOrder.paymentStatus}
                </Badge>
                <Badge className={getStatusBadge(selectedOrder.status).className}>
                  Status: {selectedOrder.status}
                </Badge>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="text-gray-600">Name:</span> {selectedOrder.shipping?.firstName || 'N/A'} {selectedOrder.shipping?.lastName || ''}</p>
                  <p><span className="text-gray-600">Email:</span> {selectedOrder.shipping?.email || 'N/A'}</p>
                  <p><span className="text-gray-600">Phone:</span> {selectedOrder.shipping?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedOrder.shipping?.address || 'N/A'}</p>
                  <p>{selectedOrder.shipping?.city || ''}{selectedOrder.shipping?.state ? `, ${selectedOrder.shipping.state}` : ''} {selectedOrder.shipping?.zipCode || ''}</p>
                  <p className="text-sm text-gray-500 mt-2">Method: {selectedOrder.shipping?.method || 'Standard'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatNaira(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold mb-2">Payment Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatNaira(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatNaira(selectedOrder.shippingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatNaira(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment Method:</span>
                    <span className="capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                  {selectedOrder.paymentReference && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Reference:</span>
                      <span className="font-mono">{selectedOrder.paymentReference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Info */}
              {selectedOrder.trackingNumber && (
                <div>
                  <h3 className="font-semibold mb-2">Tracking Information</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p><span className="text-gray-600">Tracking #:</span> {selectedOrder.trackingNumber}</p>
                    {selectedOrder.estimatedDelivery && (
                      <p><span className="text-gray-600">Est. Delivery:</span> {format(new Date(selectedOrder.estimatedDelivery), 'MMMM d, yyyy')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Paid</DialogTitle>
            <DialogDescription>
              Confirm that payment has been received for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
              <Input
                id="paymentReference"
                placeholder="Enter payment reference or transaction ID"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNote">Note (Optional)</Label>
              <Input
                id="paymentNote"
                placeholder="Add a note about this payment"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && updatePaymentMutation.mutate({
                orderId: selectedOrder.id,
                status: 'paid',
                reference: paymentNote
              })}
              disabled={updatePaymentMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updatePaymentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the order status and add tracking information.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={(value) => setSelectedOrder({ ...selectedOrder, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
                <Input
                  id="trackingNumber"
                  placeholder="Enter tracking number"
                  value={selectedOrder.trackingNumber || ''}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, trackingNumber: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && updateStatusMutation.mutate({
                orderId: selectedOrder.id,
                status: selectedOrder.status,
                trackingNumber: selectedOrder.trackingNumber
              })}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;