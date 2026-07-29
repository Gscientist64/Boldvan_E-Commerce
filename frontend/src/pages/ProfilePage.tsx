// frontend/src/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Package,
  ShoppingBag,
  Star,
  Heart,
  TrendingUp,
  Clock,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTheme } from '@/components/theme-provider';
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

interface NotificationPrefs {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  reviewCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  notificationPrefs: NotificationPrefs;
}

// Sidebar nav items
const SIDEBAR_ITEMS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'orders', icon: Package, label: 'Orders' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'preferences', icon: Settings, label: 'Preferences' },
] as const;

type TabId = typeof SIDEBAR_ITEMS[number]['id'];

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Profile form
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  // Sync user data when it loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/profile/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          if (data.notificationPrefs) {
            setNotifPrefs(data.notificationPrefs);
          }
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Update form field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate profile form
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (formData.phone && !/^[0-9+\-\s]{7,15}$/.test(formData.phone))
      e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
      });
      toast({ title: 'Profile Updated! 🎉', description: 'Your info has been saved.' });
      setIsEditing(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/profile/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed');
      }
      toast({ title: 'Password Changed! 🔐', description: 'Updated successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Save notification prefs
  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/profile/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notifPrefs),
      });
      toast({ title: 'Preferences Saved', description: 'Notification settings updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save preferences.', variant: 'destructive' });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Toggle a single notification pref
  const toggleNotif = (key: keyof NotificationPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helpers
  const getInitials = () => {
    if (formData.firstName && formData.lastName) return `${formData.firstName[0]}${formData.lastName[0]}`;
    return user?.email?.[0]?.toUpperCase() || 'U';
  };
  const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
  const profilePercent = Math.round(
    ((formData.firstName ? 25 : 0) + (formData.lastName ? 25 : 0) +
      (formData.phone ? 25 : 0) + (formData.address ? 25 : 0))
  );
  const getStatusColor = (s: string) => {
    const c: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
    };
    return c[s.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ──── TOP BANNER ──── */}
      <div className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 pb-8">
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white flex items-center gap-1 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-[3px] border-white/20 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xl sm:text-2xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h1 className="text-xl sm:text-2xl font-bold">
                {formData.firstName || formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`
                  : 'Welcome!'}
              </h1>
              <p className="text-white/60 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" /> {formData.email}
              </p>
              <p className="text-white/40 text-xs mt-1">
                Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── MAIN LAYOUT ──── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── SIDEBAR ── */}
          <aside className="lg:w-56 shrink-0">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 mb-4">
              {[
                { icon: Package, label: 'Orders', value: stats?.totalOrders ?? '—', color: 'bg-teal-500' },
                { icon: TrendingUp, label: 'Spent', value: stats ? formatNaira(stats.totalSpent) : '—', color: 'bg-emerald-500' },
                { icon: Heart, label: 'Wishlist', value: stats?.wishlistCount ?? '—', color: 'bg-teal-500' },
                { icon: Star, label: 'Reviews', value: stats?.reviewCount ?? '—', color: 'bg-emerald-500' },
              ].map((s, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`${s.color} p-2 rounded-lg text-white`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="font-bold text-sm text-slate-800">{isLoadingStats ? '—' : s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Nav */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-1.5">
                <nav className="space-y-0.5">
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Profile completion */}
            <Card className="border-0 shadow-sm mt-4">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Profile Complete</p>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={profilePercent} className="h-2 flex-1" />
                  <span className="text-sm font-bold text-slate-700">{profilePercent}%</span>
                </div>
                {profilePercent < 100 && (
                  <button
                    onClick={() => { setActiveTab('profile'); setIsEditing(true); }}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    Complete your profile →
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Logout */}
            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(true)}
              className="w-full mt-3 text-red-500 hover:text-red-600 hover:bg-red-50 text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </aside>

          {/* ── CONTENT ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* ─── PROFILE TAB ─── */}
                {activeTab === 'profile' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setErrors({}); }}>
                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveProfile} disabled={isLoading}
                            className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                            Save
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-slate-500">First Name</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input name="firstName" value={formData.firstName} onChange={handleChange}
                              disabled={!isEditing} placeholder="Your first name"
                              className={`pl-9 ${errors.firstName ? 'border-red-400' : ''}`} />
                          </div>
                          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Last Name</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input name="lastName" value={formData.lastName} onChange={handleChange}
                              disabled={!isEditing} placeholder="Your last name"
                              className={`pl-9 ${errors.lastName ? 'border-red-400' : ''}`} />
                          </div>
                          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Email</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input value={formData.email} disabled className="pl-9 bg-slate-50 text-slate-500" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <p className="text-[10px] text-slate-400">Email cannot be changed</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <CheckCircle className="h-2.5 w-2.5" /> Verified
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Phone</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input name="phone" value={formData.phone} onChange={handleChange}
                              disabled={!isEditing} placeholder="+234..."
                              className={`pl-9 ${errors.phone ? 'border-red-400' : ''}`} />
                          </div>
                          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-slate-500">Address</Label>
                          <div className="relative mt-1">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Textarea name="address" value={formData.address} onChange={handleChange}
                              disabled={!isEditing} placeholder="Your delivery address"
                              className="pl-9 min-h-[70px]" />
                          </div>
                        </div>
                      </div>

                      {/* Quick stats row */}
                      <Separator className="my-5" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        {[
                          { icon: Calendar, label: 'Member Since', val: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : '—' },
                          { icon: Shield, label: 'Role', val: (user?.role || 'user').toLowerCase() },
                          { icon: Package, label: 'Orders', val: stats?.totalOrders ?? '—' },
                          { icon: Star, label: 'Reviews', val: stats?.reviewCount ?? '—' },
                        ].map((s, i) => (
                          <div key={i} className="bg-slate-50 rounded-lg p-3">
                          <s.icon className="h-4 w-4 mx-auto text-teal-500 mb-1" />
                            <p className="text-[10px] text-slate-500">{s.label}</p>
                            <p className="text-sm font-semibold text-slate-800 capitalize">{s.val}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ─── ORDERS TAB ─── */}
                {activeTab === 'orders' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">My Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingStats ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                      ) : !stats?.recentOrders?.length ? (
                        <div className="text-center py-10">
                          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 mb-3">No orders yet</p>
                          <Button size="sm" onClick={() => navigate('/shop')} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                            Start Shopping
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {stats.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              onClick={() => navigate(`/tracking?order=${order.orderNumber}`)}>
                              <div>
                                <p className="font-semibold text-sm text-slate-800">{order.orderNumber}</p>
                                <p className="text-xs text-slate-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-teal-600">{formatNaira(order.totalAmount)}</p>
                                <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>{order.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ─── SECURITY TAB ─── */}
                {activeTab === 'security' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Change Password */}
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                          <Lock className="h-4 w-4 text-slate-500" /> Change Password
                        </h4>
                        {!isChangingPassword ? (
                          <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                            Change Password
                          </Button>
                        ) : (
                          <div className="space-y-3 bg-slate-50 rounded-lg p-4 border">
                            {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
                              <div key={field}>
                                <Label className="text-xs text-slate-600">
                                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                                </Label>
                                <div className="relative mt-1">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                  <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData[field as keyof typeof passwordData]}
                                    onChange={(e) => setPasswordData((prev) => ({ ...prev, [field]: e.target.value }))}
                                    className="pl-9 pr-9 text-sm" placeholder="••••••••"
                                  />
                                  {i === 2 && (
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={handleChangePassword} disabled={isLoading}
                                className="bg-boldvan-gradient text-white">
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                Update Password
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              }}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Active Sessions */}
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-slate-500" /> Active Session
                        </h4>
                        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <div>
                              <p className="text-sm font-medium">Current Device</p>
                              <p className="text-xs text-slate-500">Windows • Active now</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ─── PREFERENCES TAB ─── */}
                {activeTab === 'preferences' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Preferences</CardTitle>
                      <Button size="sm" onClick={handleSavePrefs} disabled={isSavingPrefs}
                        className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                        {isSavingPrefs ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                        Save
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Theme */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-amber-500" />}
                          <div>
                            <p className="font-medium text-sm">Theme</p>
                            <p className="text-xs text-slate-500">Switch between light and dark mode</p>
                          </div>
                        </div>
                        <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
                      </div>

                      <Separator />

                      {/* Language */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="font-medium text-sm">Language</p>
                            <p className="text-xs text-slate-500">Choose your preferred language</p>
                          </div>
                        </div>
                        <select className="border rounded-md px-3 py-1.5 text-sm bg-white">
                          <option>English</option>
                          <option>Hausa</option>
                          <option>Igbo</option>
                          <option>Yoruba</option>
                        </select>
                      </div>

                      <Separator />

                      {/* Email Notifications */}
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                          <Bell className="h-4 w-4 text-slate-500" /> Email Notifications
                        </h4>
                        <div className="space-y-3">
                          {[
                            { key: 'orderUpdates' as const, title: 'Order Updates', desc: 'Status changes and delivery updates' },
                            { key: 'promotions' as const, title: 'Promotions', desc: 'Deals, discounts, and special offers' },
                            { key: 'newsletter' as const, title: 'Newsletter', desc: 'Weekly tips and solar energy insights' },
                          ].map((n) => (
                            <div key={n.key} className="flex items-center justify-between py-1">
                              <div>
                                <p className="text-sm font-medium">{n.title}</p>
                                <p className="text-xs text-slate-500">{n.desc}</p>
                              </div>
                              <Switch checked={notifPrefs[n.key]} onCheckedChange={() => toggleNotif(n.key)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>You'll be redirected to the login page.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { logout(); navigate('/login'); }}
              className="bg-red-500 hover:bg-red-600">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;