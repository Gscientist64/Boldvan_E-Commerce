// frontend/src/layouts/AdminLayout.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  Truck,
  Tags,
  Home,
  BarChart3,
  Bell,
  Search,
  Sun,
  Moon,
  Grid,
  FileText,
  TrendingUp,
  MapPin,
  CreditCard,
  Percent,
  Globe,
  UserCog,
  Shield,
  Mail,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user from localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Derive page title from route
  const pageTitle = useMemo(() => {
    const path = location.pathname.replace('/admin/', '').replace('/admin', '');
    if (!path || path === 'dashboard') return 'Dashboard';
    return path.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' / ');
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href.includes('?')) {
      // For routes with query params, check the base path
      const basePath = href.split('?')[0];
      return location.pathname === basePath && location.search === href.split('?')[1];
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // ✅ UPDATED: Enhanced navItems with all delivery and settings submenus
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: <Tags className="h-5 w-5" />,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      badge: '12', // This should come from API
    },
    {
      title: 'Admin Management',
      href: '/admin/admin-management',
      icon: <Shield className="h-5 w-5" />,
      children: [
        {
          title: 'Admins',
          href: '/admin/admin-management?tab=admins',
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: 'Roles',
          href: '/admin/admin-management?tab=roles',
          icon: <UserCog className="h-4 w-4" />,
        },
        {
          title: 'Activity Logs',
          href: '/admin/admin-management?tab=logs',
          icon: <Clock className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Delivery',
      href: '/admin/delivery',
      icon: <Truck className="h-5 w-5" />,
      children: [
        {
          title: 'Locations',
          href: '/admin/delivery/locations',
          icon: <MapPin className="h-4 w-4" />, // ✅ Changed from Grid to MapPin
        },
        {
          title: 'Methods',
          href: '/admin/delivery/methods',
          icon: <Truck className="h-4 w-4" />,
        },
        {
          title: 'Settings',
          href: '/admin/delivery/settings',
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Services',
      href: '/admin/services',
      icon: <FileText className="h-5 w-5" />,
      children: [
        {
          title: 'Installation',
          href: '/admin/services/installation',
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Maintenance',
          href: '/admin/services/maintenance',
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      children: [
        {
          title: 'All Users',
          href: '/admin/users',
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: 'Admins',
          href: '/admin/users?role=ADMIN',
          icon: <Shield className="h-4 w-4" />,
        },
        {
          title: 'Roles',
          href: '/admin/roles',
          icon: <UserCog className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          title: 'General',
          href: '/admin/settings?tab=general',
          icon: <Globe className="h-4 w-4" />,
        },
        {
          title: 'Currency',
          href: '/admin/settings?tab=currency',
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: 'Tax',
          href: '/admin/settings?tab=tax',
          icon: <Percent className="h-4 w-4" />,
        },
        {
          title: 'Payment',
          href: '/admin/settings?tab=payment',
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: 'Email',
          href: '/admin/settings?tab=email',
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Animated background dots */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08)_0%,transparent_50%)] z-0" />

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950",
          "border-r border-navy-700/50",
          "shadow-2xl shadow-navy-950/50",
          sidebarOpen ? "w-64" : "w-20",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-navy-700/50 bg-gradient-to-r from-boldvan-700/20 to-teal-700/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-boldvan-gradient rounded-xl flex items-center justify-center shadow-boldvan animate-glow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
            </div>
            {sidebarOpen && (
              <span className="font-extrabold text-white text-lg tracking-tight">
                Solar<span className="text-boldvan-400">Mart</span>
                <span className="text-[10px] text-teal-400 ml-1 font-medium tracking-widest align-super">ADMIN</span>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:flex hidden text-navy-300 hover:text-white hover:bg-navy-800/50"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
          </Button>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-navy-300 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-12rem)] custom-scrollbar">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                // Menu with children
                <div className="space-y-0.5">
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-200",
                      "text-navy-200 hover:text-white hover:bg-navy-800/60",
                      "group",
                      isActive(item.href) && "bg-gradient-to-r from-boldvan-600/20 to-teal-600/10 text-white border-l-2 border-boldvan-400 shadow-lg shadow-boldvan-900/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "transition-colors duration-200",
                        isActive(item.href) ? "text-boldvan-400" : "text-navy-400 group-hover:text-boldvan-300"
                      )}>
                        {item.icon}
                      </span>
                      {sidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
                    </div>
                    {sidebarOpen && item.children && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-navy-400 transition-transform duration-200",
                          expandedMenus.includes(item.title) && "rotate-180"
                        )}
                      />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {sidebarOpen && expandedMenus.includes(item.title) && (
                    <div className="ml-6 pl-4 space-y-0.5 border-l border-navy-700/50 mt-1 animate-in slide-in-from-top-2 duration-200">
                      {item.children.map((child) => (
                        <button
                          key={child.href}
                          onClick={() => {
                            navigate(child.href);
                            if (isMobile) setSidebarOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            "text-navy-300 hover:text-white hover:bg-navy-800/40",
                            isActive(child.href) && "text-teal-400 bg-teal-950/30 font-medium"
                          )}
                        >
                          {child.icon}
                          <span>{child.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Single menu item
                <button
                  onClick={() => {
                    navigate(item.href);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200",
                    "text-navy-200 hover:text-white hover:bg-navy-800/60",
                    "group",
                    isActive(item.href) && "bg-gradient-to-r from-boldvan-600/20 to-teal-600/10 text-white border-l-2 border-boldvan-400 shadow-lg shadow-boldvan-900/20"
                  )}
                >
                  <span className={cn(
                    "transition-colors duration-200",
                    isActive(item.href) ? "text-boldvan-400" : "text-navy-400 group-hover:text-boldvan-300"
                  )}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge className="bg-red-500/20 text-red-400 border-0 text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-navy-700/50 bg-navy-950/80 backdrop-blur-sm">
          <div className={cn(
            "flex items-center gap-3",
            !sidebarOpen && "justify-center"
          )}>
            <Avatar className="h-9 w-9 ring-2 ring-boldvan-500/30">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-boldvan-gradient text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-navy-400 truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "relative z-10 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20",
          isMobile ? "ml-0" : ""
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-navy-700/30 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 dark:text-navy-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-boldvan-500 transition-colors h-4 w-4" />
                <Input
                  placeholder="Search anything..."
                  className="pl-11 pr-4 w-full bg-slate-100 dark:bg-navy-800 border-transparent focus:bg-white dark:focus:bg-navy-800 focus:border-boldvan-500 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 dark:text-navy-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-navy-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-navy-900 animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-xl border-slate-200 dark:border-navy-700 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-navy-700">
                    <DropdownMenuLabel className="p-0 text-base">Notifications</DropdownMenuLabel>
                    <Badge variant="outline" className="text-[10px]">3 new</Badge>
                  </div>
                  <div className="py-6 px-4 text-sm text-slate-400 dark:text-navy-400 text-center">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No new notifications
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl">
                    <Avatar className="h-9 w-9 ring-2 ring-offset-1 ring-boldvan-500/20 ring-offset-white dark:ring-offset-navy-900">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-boldvan-gradient text-white text-xs font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-700 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-navy-400">Administrator</p>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 dark:border-navy-700 shadow-xl">
                  <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider">My Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')} className="rounded-lg">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/help')} className="rounded-lg">
                    <Home className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative">
          {/* Page Title Bar */}
          <div className="px-6 py-4 border-b border-slate-200/60 dark:border-navy-700/30 bg-white/50 dark:bg-navy-900/50 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{pageTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-navy-400 mt-0.5">
              /admin{location.pathname.replace('/admin', '')}
            </p>
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;