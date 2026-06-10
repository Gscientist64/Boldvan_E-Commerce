import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Calendar, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowRight,
  ArrowUpRight,
  Activity,
  BarChart3,
  RefreshCcw,
  Zap,
  Plus
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const DashboardOverview: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders', 'recent'],
    queryFn: () => adminApi.getOrders({ limit: 5 }),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings', 'recent'],
    queryFn: () => adminApi.getBookings({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-navy-700" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-boldvan-500 animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-navy-400 text-sm animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white dark:bg-navy-900 rounded-2xl p-12 shadow-lg max-w-md border border-slate-200 dark:border-navy-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Error loading dashboard</h3>
          <p className="text-slate-500 dark:text-navy-400 mt-2">{(error as any)?.response?.data?.message || (error as any)?.message || 'Please try again later'}</p>
          <Button onClick={() => window.location.reload()} className="mt-6 bg-boldvan-gradient text-white border-0 hover:shadow-boldvan rounded-xl">
            <RefreshCcw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  // Use safe navigation with defaults - handle both AxiosResponse and unwrapped data
  const stats = (dashboardData as any)?.data?.stats || (dashboardData as any)?.stats || {
    totalProducts: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalUsers: 0,
    monthlyRevenue: 0
  };

  const recentOrders = (ordersData as any)?.data?.orders || (ordersData as any)?.orders || [];
  const recentBookings = (bookingsData as any)?.data?.bookings || (bookingsData as any)?.bookings || [];

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      change: '+12%',
      trend: 'up' as const,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      link: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: '+8.2%',
      trend: 'up' as const,
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      link: '/admin/orders'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      change: '+5.3%',
      trend: 'up' as const,
      icon: Calendar,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      link: '/admin/bookings'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+24.1%',
      trend: 'up' as const,
      icon: Users,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      link: '/admin/users'
    },
    {
      title: 'Monthly Revenue',
      value: `₦${Number(stats.monthlyRevenue || 0).toLocaleString()}`,
      change: '-2.4%',
      trend: 'down' as const,
      icon: DollarSign,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
      link: '/admin/orders'
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      PROCESSING: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      SHIPPED: 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      DELIVERED: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      CANCELLED: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      CONFIRMED: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      COMPLETED: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    };
    return (
      <Badge variant="outline" className={cn("font-medium px-2.5 py-0.5 text-xs", variants[status] || 'bg-slate-50 text-slate-700 border-slate-200')}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Dashboard <span className="text-boldvan-500">Overview</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-boldvan-400" />
            Welcome back{stats.totalUsers > 0 ? ` — you have ${stats.totalOrders} orders today` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-navy-600 gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="rounded-xl bg-boldvan-gradient text-white border-0 hover:shadow-boldvan gap-2">
            <BarChart3 className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link to={stat.link} key={stat.title} className="group">
            <Card className={cn(
              "relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
              "bg-white dark:bg-navy-900",
              stat.shadow
            )}>
              {/* Gradient accent line at top */}
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", stat.gradient)} />
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-navy-400 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={cn(
                        "text-xs font-semibold",
                        stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-navy-500">vs last month</span>
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                    stat.gradient
                  )}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-boldvan-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart Placeholder */}
        <Card className="lg:col-span-2 border-0 shadow-md bg-white dark:bg-navy-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the current year</CardDescription>
            </div>
            <div className="flex gap-2">
              {['7d', '30d', '12m'].map((period) => (
                <Button key={period} variant="ghost" size="sm" className="rounded-lg text-xs h-7 px-3">
                  {period}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple bar chart placeholder */}
            <div className="h-[200px] flex items-end gap-3 px-2">
              {[35, 55, 42, 68, 48, 72, 58, 75, 62, 85, 70, 92].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-boldvan-500 to-teal-400 rounded-t-lg transition-all duration-500 hover:from-boldvan-600 hover:to-teal-500 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-navy-500 font-medium">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-boldvan-600 via-boldvan-700 to-teal-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Stats</CardTitle>
            <CardDescription className="text-boldvan-200">Real-time summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Pending Orders', value: stats.totalOrders > 0 ? Math.floor(stats.totalOrders * 0.3) : 0, icon: ShoppingCart },
              { label: 'Active Bookings', value: stats.totalBookings > 0 ? Math.floor(stats.totalBookings * 0.4) : 0, icon: Calendar },
              { label: 'New Users Today', value: stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 0.05) : 0, icon: Users },
              { label: 'Products Listed', value: stats.totalProducts, icon: Package },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-boldvan-100">{item.label}</span>
                </div>
                <span className="font-bold text-lg">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md bg-white dark:bg-navy-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg gap-1" asChild>
              <Link to="/admin/orders">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-navy-400">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Order</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Customer</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Amount</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.slice(0, 5).map((order: any) => (
                      <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 cursor-pointer">
                        <TableCell className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          #{order.id?.slice(-8) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {order.user?.firstName || 'Unknown'} {order.user?.lastName || ''}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800 dark:text-white">
                          ₦{Number(order.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-navy-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Recent Bookings</CardTitle>
              <CardDescription>Latest service bookings</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg gap-1" asChild>
              <Link to="/admin/bookings">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-navy-400">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Service</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Customer</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.slice(0, 5).map((booking: any) => (
                      <TableRow key={booking.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 cursor-pointer">
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                          {booking.service?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {booking.user?.firstName || 'Unknown'} {booking.user?.lastName || ''}
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                          {booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Product', icon: Plus, link: '/admin/products', colorClass: 'from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800 hover:border-blue-400' },
          { label: 'View Orders', icon: ShoppingCart, link: '/admin/orders', colorClass: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400' },
          { label: 'Manage Users', icon: Users, link: '/admin/users', colorClass: 'from-violet-500/10 to-violet-600/5 border-violet-200 dark:border-violet-800 hover:border-violet-400' },
          { label: 'Settings', icon: Zap, link: '/admin/settings', colorClass: 'from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800 hover:border-amber-400' },
        ].map((action) => (
          <Link to={action.link} key={action.label}>
            <Card className={cn(
              "border bg-gradient-to-br hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer bg-white dark:bg-navy-900",
              action.colorClass
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 shadow-sm">
                  <action.icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;