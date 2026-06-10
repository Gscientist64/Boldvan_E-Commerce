// frontend/src/pages/admin/AdminManagement.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Shield,
  Users,
  UserPlus,
  UserCog,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Search,
  Plus,
  RefreshCcw,
  Lock,
  Clock,
  Phone,
  Ban,
  UserX,
  UserCheck,
  ArrowUpRight,
  Activity,
  Zap,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import api from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  userCount?: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  roles: Role[];
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  oldValues: any;
  newValues: any;
  status: string;
  createdAt: string;
  admin: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface AdminManagementProps {
  initialTab?: string;
}

const PERMISSION_CATEGORIES = [
  {
    name: 'Users',
    permissions: [
      { id: 'VIEW_USERS', name: 'View Users', description: 'Can view user list and details' },
      { id: 'CREATE_USER', name: 'Create Users', description: 'Can create new users' },
      { id: 'EDIT_USER', name: 'Edit Users', description: 'Can edit user information' },
      { id: 'DELETE_USER', name: 'Delete Users', description: 'Can delete users' },
      { id: 'MANAGE_USER_ROLES', name: 'Manage User Roles', description: 'Can assign/remove roles' },
    ]
  },
  {
    name: 'Products',
    permissions: [
      { id: 'VIEW_PRODUCTS', name: 'View Products', description: 'Can view product list and details' },
      { id: 'CREATE_PRODUCT', name: 'Create Products', description: 'Can create new products' },
      { id: 'EDIT_PRODUCT', name: 'Edit Products', description: 'Can edit products' },
      { id: 'DELETE_PRODUCT', name: 'Delete Products', description: 'Can delete products' },
      { id: 'MANAGE_PRODUCT_CATEGORIES', name: 'Manage Categories', description: 'Can manage product categories' },
    ]
  },
  {
    name: 'Orders',
    permissions: [
      { id: 'VIEW_ORDERS', name: 'View Orders', description: 'Can view orders' },
      { id: 'EDIT_ORDER_STATUS', name: 'Edit Order Status', description: 'Can update order status' },
      { id: 'CANCEL_ORDER', name: 'Cancel Orders', description: 'Can cancel orders' },
      { id: 'REFUND_ORDER', name: 'Refund Orders', description: 'Can process refunds' },
      { id: 'VIEW_ORDER_REPORTS', name: 'View Order Reports', description: 'Can view order reports' },
    ]
  },
  {
    name: 'Delivery',
    permissions: [
      { id: 'VIEW_DELIVERY_LOCATIONS', name: 'View Locations', description: 'Can view delivery locations' },
      { id: 'MANAGE_DELIVERY_LOCATIONS', name: 'Manage Locations', description: 'Can manage delivery locations' },
      { id: 'VIEW_DELIVERY_METHODS', name: 'View Methods', description: 'Can view delivery methods' },
      { id: 'MANAGE_DELIVERY_METHODS', name: 'Manage Methods', description: 'Can manage delivery methods' },
      { id: 'CONFIGURE_DELIVERY_PRICING', name: 'Configure Pricing', description: 'Can configure delivery pricing' },
    ]
  },
  {
    name: 'Services',
    permissions: [
      { id: 'VIEW_SERVICES', name: 'View Services', description: 'Can view services' },
      { id: 'MANAGE_SERVICES', name: 'Manage Services', description: 'Can create/edit/delete services' },
      { id: 'VIEW_BOOKINGS', name: 'View Bookings', description: 'Can view bookings' },
      { id: 'MANAGE_BOOKINGS', name: 'Manage Bookings', description: 'Can manage bookings' },
    ]
  },
  {
    name: 'Reviews',
    permissions: [
      { id: 'VIEW_REVIEWS', name: 'View Reviews', description: 'Can view reviews' },
      { id: 'MODERATE_REVIEWS', name: 'Moderate Reviews', description: 'Can moderate reviews' },
      { id: 'DELETE_REVIEWS', name: 'Delete Reviews', description: 'Can delete reviews' },
    ]
  },
  {
    name: 'Analytics',
    permissions: [
      { id: 'VIEW_DASHBOARD', name: 'View Dashboard', description: 'Can view the admin dashboard' },
      { id: 'VIEW_SALES_REPORTS', name: 'View Sales Reports', description: 'Can view sales reports' },
      { id: 'VIEW_USER_REPORTS', name: 'View User Reports', description: 'Can view user reports' },
      { id: 'EXPORT_REPORTS', name: 'Export Reports', description: 'Can export reports' },
    ]
  },
  {
    name: 'Settings',
    permissions: [
      { id: 'VIEW_SETTINGS', name: 'View Settings', description: 'Can view settings' },
      { id: 'EDIT_GENERAL_SETTINGS', name: 'Edit General Settings', description: 'Can edit general settings' },
      { id: 'EDIT_PAYMENT_SETTINGS', name: 'Edit Payment Settings', description: 'Can edit payment settings' },
      { id: 'EDIT_EMAIL_SETTINGS', name: 'Edit Email Settings', description: 'Can edit email settings' },
      { id: 'VIEW_ACTIVITY_LOGS', name: 'View Activity Logs', description: 'Can view admin activity logs' },
    ]
  },
  {
    name: 'Admin',
    permissions: [
      { id: 'MANAGE_ADMINS', name: 'Manage Admins', description: 'Can add/remove admin users' },
      { id: 'MANAGE_ROLES', name: 'Manage Roles', description: 'Can create/edit roles and permissions' },
      { id: 'VIEW_AUDIT_LOGS', name: 'View Audit Logs', description: 'Can view detailed audit logs' },
    ]
  }
];

const AdminManagement: React.FC<AdminManagementProps> = ({ initialTab = 'admins' }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'admin' | 'role'>('admin');
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<AdminUser | null>(null);
  const [suspendAdminTarget, setSuspendAdminTarget] = useState<AdminUser | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleIds: [] as string[],
  });
  const [expandedPermissions, setExpandedPermissions] = useState<string[]>([]);

  // Handle tab from URL or props
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['admins', 'roles', 'logs'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [searchParams, initialTab]);

  // Fetch admin users
  const {
    data: adminsData,
    isLoading: adminsLoading,
    refetch: refetchAdmins
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users', { params: { role: 'ADMIN' } });
      // Handle both direct array and wrapped {users: [...]} responses
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.users)) return data.users;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });

  const admins: AdminUser[] = adminsData || [];

  // Fetch roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    refetch: refetchRoles
  } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const response = await api.get('/admin/roles');
      // Handle both direct array and wrapped responses
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.roles)) return data.roles;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });

  const roles: Role[] = (rolesData as Role[]) || [];

  // Fetch activity logs
  const {
    data: activityLogsData,
    isLoading: logsLoading
  } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/logs');
      // Handle both direct and wrapped responses
      const data = response.data;
      if (Array.isArray(data)) return { logs: data, pagination: null };
      if (data && data.logs) return data;
      if (data && data.data && data.data.logs) return data.data;
      return { logs: [], pagination: null };
    },
  });

  const activityLogs: ActivityLog[] = (activityLogsData as any)?.logs || [];

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/roles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsRoleDialogOpen(false);
      resetRoleForm();
      toast({
        title: 'Role created',
        description: 'New role has been created successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to create role',
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/admin/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsRoleDialogOpen(false);
      setSelectedRole(null);
      resetRoleForm();
      toast({
        title: 'Role updated',
        description: 'Role has been updated successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to update role',
        variant: 'destructive',
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/roles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: 'Role deleted',
        description: 'Role has been deleted successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to delete role',
        variant: 'destructive',
      });
    },
  });

  // Create admin user mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string; phone: string; roleIds: string[] }) => {
      const { roleIds, ...userData } = data;
      const userRes = await api.post('/admin/users', { ...userData, role: 'ADMIN' });
      const newUser = userRes.data;
      if (roleIds.length > 0) {
        await api.put(`/admin/roles/users/${newUser.id}/roles`, { roleIds });
      }
      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAdminDialogOpen(false);
      setSelectedAdmin(null);
      setAdminForm({ email: '', password: '', firstName: '', lastName: '', phone: '', roleIds: [] });
      toast({ title: 'Success', description: 'Admin user created successfully' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to create admin user',
        variant: 'destructive'
      });
    }
  });

  // Assign roles to admin mutation (for existing admins)
  const assignRolesMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: string; roleIds: string[] }) => {
      const response = await api.put(`/admin/roles/users/${userId}/roles`, { roleIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAdminDialogOpen(false);
      setSelectedAdmin(null);
      setAdminForm({ email: '', password: '', firstName: '', lastName: '', phone: '', roleIds: [] });
      toast({
        title: 'Roles assigned',
        description: 'Admin roles have been updated successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to assign roles',
        variant: 'destructive',
      });
    },
  });

  // Suspend / toggle admin status mutation
  const toggleAdminStatusMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsSuspendDialogOpen(false);
      setSuspendAdminTarget(null);
      toast({
        title: 'Success',
        description: 'Admin status updated successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to update admin status',
        variant: 'destructive',
      });
    },
  });

  // Delete admin user mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDeleteDialogOpen(false);
      setDeleteAdminTarget(null);
      toast({
        title: 'Admin removed',
        description: 'The admin user has been removed successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to remove admin',
        variant: 'destructive',
      });
    },
  });

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
    });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setDeleteType('role');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    setDeleteAdminTarget(admin);
    setDeleteType('admin');
    setIsDeleteDialogOpen(true);
  };

  const handleSuspendAdmin = (admin: AdminUser) => {
    setSuspendAdminTarget(admin);
    setIsSuspendDialogOpen(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminForm({
      email: admin.email,
      password: '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      phone: admin.phone || '',
      roleIds: admin.roles?.map(r => r.id) || [],
    });
    setIsAdminDialogOpen(true);
  };

  const handleRoleFormSubmit = () => {
    if (!roleForm.name.trim()) {
      toast({ title: 'Validation Error', description: 'Role name is required.', variant: 'destructive' });
      return;
    }
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data: roleForm });
    } else {
      createRoleMutation.mutate(roleForm);
    }
  };

  const handleAdminFormSubmit = () => {
    if (!adminForm.email.trim()) {
      toast({ title: 'Validation Error', description: 'Email is required.', variant: 'destructive' });
      return;
    }
    if (!selectedAdmin && !adminForm.password.trim()) {
      toast({ title: 'Validation Error', description: 'Password is required for new admins.', variant: 'destructive' });
      return;
    }
    if (selectedAdmin) {
      assignRolesMutation.mutate({ userId: selectedAdmin.id, roleIds: adminForm.roleIds });
    } else {
      createAdminMutation.mutate(adminForm);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteType === 'role' && selectedRole) {
      deleteRoleMutation.mutate(selectedRole.id);
    } else if (deleteType === 'admin' && deleteAdminTarget) {
      deleteAdminMutation.mutate(deleteAdminTarget.id);
    }
  };

  const handleConfirmSuspend = () => {
    if (suspendAdminTarget) {
      const newRole = suspendAdminTarget.status === 'active' ? 'USER' : 'ADMIN';
      toggleAdminStatusMutation.mutate({ userId: suspendAdminTarget.id, newRole });
    }
  };

  // Filter functions
  const filteredAdmins = admins.filter((admin: AdminUser) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      admin.email?.toLowerCase().includes(search) ||
      admin.firstName?.toLowerCase().includes(search) ||
      admin.lastName?.toLowerCase().includes(search)
    );
  });

  const filteredRoles = roles.filter((role: Role) => {
    if (!searchTerm) return true;
    return role.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    return email ? email[0].toUpperCase() : '?';
  };

  const formatActionType = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'UPDATE':
      case 'UPDATE_ROLE':
      case 'UPDATE_ROLES':
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'DELETE':
        return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-navy-300 border-slate-200 dark:border-navy-700';
    }
  };

  const tabCounts = {
    admins: admins.length,
    roles: roles.length,
    logs: activityLogs.length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Admin <span className="text-boldvan-500">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-boldvan-400" />
            Manage administrators, roles, and activity logs
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'admins' && (
            <Button
              onClick={() => { setSelectedAdmin(null); setAdminForm({ email: '', password: '', firstName: '', lastName: '', phone: '', roleIds: [] }); setIsAdminDialogOpen(true); }}
              className="rounded-xl bg-boldvan-gradient text-white border-0 hover:shadow-boldvan gap-2"
            >
              <UserPlus className="h-4 w-4" /> Add Admin
            </Button>
          )}
          {activeTab === 'roles' && (
            <Button
              onClick={() => { setSelectedRole(null); resetRoleForm(); setIsRoleDialogOpen(true); }}
              className="rounded-xl bg-boldvan-gradient text-white border-0 hover:shadow-boldvan gap-2"
            >
              <Plus className="h-4 w-4" /> Add Role
            </Button>
          )}
        </div>
      </div>

      {/* Stats Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Administrators', value: tabCounts.admins, icon: Shield, colorClass: 'from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800' },
          { label: 'Roles', value: tabCounts.roles, icon: Lock, colorClass: 'from-violet-500/10 to-violet-600/5 border-violet-200 dark:border-violet-800' },
          { label: 'Activity Logs', value: tabCounts.logs, icon: Clock, colorClass: 'from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800' },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={`border bg-gradient-to-br shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer bg-white dark:bg-navy-900 ${stat.colorClass}`}
            onClick={() => setActiveTab(stat.label === 'Administrators' ? 'admins' : stat.label === 'Roles' ? 'roles' : 'logs')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 shadow-sm">
                <stat.icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-navy-400 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 dark:text-navy-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-navy-800 p-1 rounded-xl">
          <TabsTrigger
            value="admins"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700 data-[state=active]:shadow-sm gap-2"
          >
            <Shield className="h-4 w-4" /> Administrators
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tabCounts.admins}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700 data-[state=active]:shadow-sm gap-2"
          >
            <Lock className="h-4 w-4" /> Roles & Permissions
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tabCounts.roles}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700 data-[state=active]:shadow-sm gap-2"
          >
            <Clock className="h-4 w-4" /> Activity Logs
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{tabCounts.logs}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md bg-white dark:bg-navy-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Administrators</CardTitle>
                <CardDescription className="dark:text-navy-400">Manage users with admin access.</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-navy-500" />
                  <Input
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-500"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => refetchAdmins()} className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {adminsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-boldvan-500" />
                    <p className="text-sm text-slate-400 dark:text-navy-500">Loading admins...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-navy-800">
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Admin</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Roles</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Created</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400 w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center">
                              <Shield className="h-6 w-6 text-slate-400 dark:text-navy-500" />
                            </div>
                            <p className="text-slate-500 dark:text-navy-400">
                              {searchTerm ? 'No administrators match your search.' : 'No administrators found.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdmins.map((admin: AdminUser) => (
                        <TableRow
                          key={admin.id}
                          className="hover:bg-slate-50 dark:hover:bg-navy-800/50 border-slate-100 dark:border-navy-800"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-slate-100 dark:ring-navy-700">
                                <AvatarFallback className="bg-gradient-to-br from-boldvan-500 to-teal-600 text-white text-xs font-bold">
                                  {getInitials(admin.firstName, admin.lastName, admin.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                  {admin.firstName && admin.lastName
                                    ? `${admin.firstName} ${admin.lastName}`
                                    : admin.email}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-navy-400">{admin.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {admin.roles?.length > 0 ? (
                                admin.roles.map((role: Role) => (
                                  <Badge
                                    key={role.id}
                                    variant="secondary"
                                    className="text-xs bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-navy-300"
                                  >
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline" className="text-xs border-slate-200 dark:border-navy-700 text-slate-500 dark:text-navy-400">Admin</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                admin.status === 'active'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : admin.status === 'suspended'
                                  ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                  : 'bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                              }
                              variant="outline"
                            >
                              {admin.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 dark:text-navy-400">
                            {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800">
                                  <MoreVertical className="h-4 w-4 text-slate-500 dark:text-navy-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900">
                                <DropdownMenuLabel className="text-slate-500 dark:text-navy-400 text-xs">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-navy-800" />
                                <DropdownMenuItem onClick={() => handleEditAdmin(admin)} className="rounded-lg gap-2 cursor-pointer">
                                  <Edit className="h-4 w-4" /> Edit Roles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSuspendAdmin(admin)} className="rounded-lg gap-2 cursor-pointer">
                                  {admin.status === 'active' ? (
                                    <><Ban className="h-4 w-4" /> Suspend</>
                                  ) : (
                                    <><UserCheck className="h-4 w-4" /> Reactivate</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-navy-800" />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="rounded-lg gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <UserX className="h-4 w-4" /> Remove Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md bg-white dark:bg-navy-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Roles & Permissions</CardTitle>
                <CardDescription className="dark:text-navy-400">Define roles with specific permissions for admins.</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-navy-500" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-500"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => refetchRoles()} className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-boldvan-500" />
                    <p className="text-sm text-slate-400 dark:text-navy-500">Loading roles...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRoles.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center">
                          <Lock className="h-6 w-6 text-slate-400 dark:text-navy-500" />
                        </div>
                        <p className="text-slate-500 dark:text-navy-400">
                          {searchTerm ? 'No roles match your search.' : 'No roles found. Create your first role.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredRoles.map((role: Role) => (
                      <Card
                        key={role.id}
                        className="border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/50 hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20">
                                  <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-white">{role.name}</h3>
                                    {role.isSystem && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                      >
                                        System
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-500 dark:text-navy-400">
                                    {role.description || 'No description'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {role.permissions?.length > 0 ? (
                                  role.permissions.map((perm: string) => (
                                    <Badge
                                      key={perm}
                                      variant="outline"
                                      className="text-xs border-slate-200 dark:border-navy-700 text-slate-600 dark:text-navy-300 bg-slate-50 dark:bg-navy-800"
                                    >
                                      {perm}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400 dark:text-navy-500 italic">No permissions</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              {!role.isSystem && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditRole(role)}
                                    className="rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
                                  >
                                    <Edit className="h-4 w-4 text-slate-500 dark:text-navy-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                    onClick={() => handleDeleteRole(role)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {role.userCount !== undefined && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                              <Users className="h-4 w-4 text-slate-400 dark:text-navy-500" />
                              <span className="text-xs text-slate-500 dark:text-navy-400">
                                {role.userCount} user{role.userCount !== 1 ? 's' : ''} assigned
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md bg-white dark:bg-navy-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Activity Logs</CardTitle>
                <CardDescription className="dark:text-navy-400">Track all administrative actions.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-boldvan-500" />
                    <p className="text-sm text-slate-400 dark:text-navy-500">Loading logs...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-navy-800">
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Admin</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Action</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Entity</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 dark:text-navy-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center">
                              <Clock className="h-6 w-6 text-slate-400 dark:text-navy-500" />
                            </div>
                            <p className="text-slate-500 dark:text-navy-400">No activity logs found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs.map((log: ActivityLog) => (
                        <TableRow
                          key={log.id}
                          className="hover:bg-slate-50 dark:hover:bg-navy-800/50 border-slate-100 dark:border-navy-800"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm text-slate-800 dark:text-white">
                                {log.admin
                                  ? `${log.admin.firstName || ''} ${log.admin.lastName || ''}`.trim() || log.adminEmail
                                  : log.adminEmail}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-navy-400">{log.adminEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionBadgeClass(log.action)} variant="outline">
                              {formatActionType(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{log.entityType}</p>
                              {log.entityName && (
                                <p className="text-xs text-slate-500 dark:text-navy-400">{log.entityName}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.status === 'SUCCESS' ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs"
                              >
                                Success
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 text-xs"
                              >
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 dark:text-navy-400">
                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-0 bg-white dark:bg-navy-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
              {selectedRole ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
            <DialogDescription className="dark:text-navy-400">
              {selectedRole
                ? 'Update the role name and permissions.'
                : 'Create a new role with specific permissions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name" className="text-slate-700 dark:text-slate-300">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Content Manager"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description" className="text-slate-700 dark:text-slate-300">Description</Label>
              <Input
                id="role-description"
                placeholder="Brief description of this role"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <Separator className="bg-slate-200 dark:bg-navy-700" />
            <div>
              <Label className="mb-3 block text-slate-700 dark:text-slate-300">Permissions</Label>
              <div className="space-y-3">
                {PERMISSION_CATEGORIES.map((category) => (
                  <div key={category.name} className="border border-slate-200 dark:border-navy-700 rounded-xl p-3 bg-slate-50/50 dark:bg-navy-800/50">
                    <Button
                      variant="ghost"
                      className="w-full justify-between font-medium text-slate-700 dark:text-slate-300 hover:bg-transparent"
                      onClick={() => {
                        setExpandedPermissions(
                          expandedPermissions.includes(category.name)
                            ? expandedPermissions.filter(n => n !== category.name)
                            : [...expandedPermissions, category.name]
                        );
                      }}
                    >
                      {category.name}
                      <span className="text-sm text-slate-500 dark:text-navy-400">
                        {category.permissions.filter(p => roleForm.permissions.includes(p.id)).length}/{category.permissions.length}
                      </span>
                    </Button>
                    {expandedPermissions.includes(category.name) && (
                      <div className="mt-2 space-y-2 pl-2">
                        {category.permissions.map((perm) => (
                          <div key={perm.id} className="flex items-start gap-2">
                            <Checkbox
                              id={perm.id}
                              checked={roleForm.permissions.includes(perm.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setRoleForm({
                                    ...roleForm,
                                    permissions: [...roleForm.permissions, perm.id]
                                  });
                                } else {
                                  setRoleForm({
                                    ...roleForm,
                                    permissions: roleForm.permissions.filter(p => p !== perm.id)
                                  });
                                }
                              }}
                            />
                            <div>
                              <Label htmlFor={perm.id} className="text-sm font-medium text-slate-700 dark:text-slate-300">{perm.name}</Label>
                              <p className="text-xs text-slate-500 dark:text-navy-400">{perm.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setIsRoleDialogOpen(false); setSelectedRole(null); resetRoleForm(); }}
              className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleFormSubmit}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              className="rounded-xl bg-boldvan-gradient text-white border-0 hover:shadow-boldvan"
            >
              {(createRoleMutation.isPending || updateRoleMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin User Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="rounded-2xl border-0 bg-white dark:bg-navy-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
              {selectedAdmin ? 'Edit Admin Roles' : 'Add Admin User'}
            </DialogTitle>
            <DialogDescription className="dark:text-navy-400">
              {selectedAdmin
                ? `Manage role assignments for ${selectedAdmin.email}.`
                : 'Create a new admin user with specific role permissions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedAdmin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-firstname" className="text-slate-700 dark:text-slate-300">First Name</Label>
                    <Input
                      id="admin-firstname"
                      value={adminForm.firstName}
                      onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-lastname" className="text-slate-700 dark:text-slate-300">Last Name</Label>
                    <Input
                      id="admin-lastname"
                      value={adminForm.lastName}
                      onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-slate-700 dark:text-slate-300">Email *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-slate-700 dark:text-slate-300">Password *</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-phone" className="text-slate-700 dark:text-slate-300">Phone</Label>
                  <Input
                    id="admin-phone"
                    placeholder="+234..."
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Roles</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-navy-700 rounded-xl p-3 bg-slate-50/50 dark:bg-navy-800/50">
                {roles.length > 0 ? (
                  roles.map((role: Role) => (
                    <div key={role.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`admin-role-${role.id}`}
                        checked={adminForm.roleIds.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAdminForm({ ...adminForm, roleIds: [...adminForm.roleIds, role.id] });
                          } else {
                            setAdminForm({
                              ...adminForm,
                              roleIds: adminForm.roleIds.filter(id => id !== role.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`admin-role-${role.id}`} className="text-sm text-slate-700 dark:text-slate-300">
                        {role.name}
                        {role.isSystem && <span className="text-xs text-slate-400 dark:text-navy-500 ml-1">(System)</span>}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-navy-400">No roles available. Create roles first.</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdminDialogOpen(false);
                setSelectedAdmin(null);
                setAdminForm({ email: '', password: '', firstName: '', lastName: '', phone: '', roleIds: [] });
              }}
              className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdminFormSubmit}
              disabled={createAdminMutation.isPending || assignRolesMutation.isPending}
              className="rounded-xl bg-boldvan-gradient text-white border-0 hover:shadow-boldvan"
            >
              {(createAdminMutation.isPending || assignRolesMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedAdmin ? 'Update Roles' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-0 bg-white dark:bg-navy-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white">
              {deleteType === 'role' ? 'Delete Role' : 'Remove Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-navy-400">
              {deleteType === 'role'
                ? `Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`
                : `Are you sure you want to remove "${deleteAdminTarget?.email}" as an admin? They will lose all admin access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => { setIsDeleteDialogOpen(false); setSelectedRole(null); setDeleteAdminTarget(null); }}
              className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              disabled={deleteRoleMutation.isPending || deleteAdminMutation.isPending}
            >
              {(deleteRoleMutation.isPending || deleteAdminMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleteType === 'role' ? 'Delete Role' : 'Remove Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend / Reactivate Confirmation Dialog */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-0 bg-white dark:bg-navy-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white">
              {suspendAdminTarget?.status === 'active' ? 'Suspend Admin' : 'Reactivate Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-navy-400">
              {suspendAdminTarget?.status === 'active'
                ? `Are you sure you want to suspend "${suspendAdminTarget?.email}"? They will lose all admin access until reactivated.`
                : `Are you sure you want to reactivate "${suspendAdminTarget?.email}"? They will regain admin access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => { setIsSuspendDialogOpen(false); setSuspendAdminTarget(null); }}
              className="rounded-xl border-slate-200 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSuspend}
              className={`rounded-xl text-white ${
                suspendAdminTarget?.status === 'active'
                  ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
              }`}
              disabled={toggleAdminStatusMutation.isPending}
            >
              {toggleAdminStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {suspendAdminTarget?.status === 'active' ? 'Suspend' : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManagement;