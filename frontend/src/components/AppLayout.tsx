// frontend/src/components/AppLayout.tsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { storeConfig } from '@/config/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  LogOut,
  Shield,
  Sun,
  Menu,
  X,
  Home,
  Store,
  Headphones,
  Truck,
  Heart,
  Clock,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  ChevronRight,
  Package,
  Shield as ShieldIcon,
  Cpu,
  Battery,
  Zap,
} from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);

  const cartCount = getCartCount?.() || 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Store },
    { label: 'Services', path: '/support', icon: Headphones },
    { label: 'Track Order', path: '/tracking', icon: Truck },
  ];

  const categories = [
    { name: 'Solar Panels', icon: Sun, path: '/shop?category=solar-panels', color: 'from-teal-500 to-orange-500' },
    { name: 'Batteries', icon: Battery, path: '/shop?category=batteries', color: 'from-blue-500 to-cyan-500' },
    { name: 'Inverters', icon: Zap, path: '/shop?category=inverters', color: 'from-yellow-500 to-teal-500' },
    { name: 'Mounting Systems', icon: ShieldIcon, path: '/shop?category=mounting-systems', color: 'from-gray-500 to-slate-500' },
    { name: 'Charge Controllers', icon: Cpu, path: '/shop?category=charge-controllers', color: 'from-green-500 to-emerald-500' },
    { name: 'Accessories', icon: Package, path: '/shop?category=accessories', color: 'from-purple-500 to-pink-500' },
  ];

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' },
      { label: 'Press', path: '/press' },
    ],
    shop: [
      { label: 'All Products', path: '/shop' },
      { label: 'Solar Panels', path: '/shop?category=solar-panels' },
      { label: 'Inverters', path: '/shop?category=inverters' },
      { label: 'Batteries', path: '/shop?category=batteries' },
      { label: 'Accessories', path: '/shop?category=accessories' },
    ],
    services: [
      { label: 'Installation', path: '/support' },
      { label: 'Maintenance', path: '/support' },
      { label: 'Repair', path: '/support' },
      { label: 'Consultation', path: '/support' },
      { label: 'Financing', path: '/support' },
    ],
    support: [
      { label: 'Contact Us', path: '/support' },
      { label: 'Order Tracking', path: '/tracking' },
      { label: 'FAQs', path: '/support' },
      { label: 'Shipping Info', path: '/support' },
      { label: 'Returns', path: '/support' },
    ],
    legal: [
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Disclaimer', path: '/disclaimer' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
    { icon: Twitter, href: '#', color: 'hover:bg-blue-400' },
    { icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
    { icon: Linkedin, href: '#', color: 'hover:bg-blue-700' },
    { icon: Youtube, href: '#', color: 'hover:bg-red-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-navy-50 via-white to-teal-50">
      {/* Top Bar */}
      <AnimatePresence>
        {showTopBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="hidden lg:block bg-gradient-to-r from-navy-950 to-navy-900 text-white text-sm py-2 w-full"
          >
            <div className="w-full px-4 md:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-teal-400" />
                    <span>08178363424</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-teal-400" />
                    <span>{storeConfig.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-400" />
                    <span>{storeConfig.address}</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-400" />
                    <span>Mon-Sat: 8am - 8pm</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                    <Globe className="h-4 w-4 text-teal-400" />
                    <select className="bg-transparent text-white border-none focus:ring-0 text-sm cursor-pointer hover:text-teal-400 transition-colors" title="Currency selector">
                      <option value="ng" className="text-slate-900">NGN</option>
                      <option value="us" className="text-slate-900">USD</option>
                      <option value="gh" className="text-slate-900">GHS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg' 
            : 'bg-gradient-to-r from-navy-950 to-navy-900'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className={`p-2 rounded-lg transition-all ${
                scrolled ? 'bg-boldvan-gradient' : 'bg-white/10'
              }`}>
                <Sun className={`h-6 w-6 ${
                  scrolled ? 'text-white' : 'text-teal-400'
                }`} />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl font-bold transition-colors ${
                  scrolled ? 'text-slate-900' : 'text-white'
                }`}>
                  BOLD<span className="text-teal-400">VAN</span>
                </h1>
                <p className={`text-xs hidden md:block ${
                  scrolled ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Bold Energy, Smart Living
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all group ${
                      isActive
                        ? scrolled
                          ? 'text-teal-600'
                          : 'text-teal-400'
                        : scrolled
                        ? 'text-slate-600 hover:text-teal-600'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          scrolled ? 'bg-teal-600' : 'bg-teal-400'
                        }`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}

              {/* Admin Link */}
              {isAdmin && (
                <motion.button
                  onClick={() => navigate('/admin')}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all group ${
                    location.pathname === '/admin'
                      ? scrolled
                        ? 'text-teal-600'
                        : 'text-teal-400'
                      : scrolled
                      ? 'text-slate-600 hover:text-teal-600'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </span>
                </motion.button>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/cart')}
                className={`relative p-2 rounded-lg transition-colors ${
                  scrolled 
                    ? 'hover:bg-slate-100 text-slate-700' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-boldvan-gradient text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-boldvan"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-1 rounded-full transition-colors ${
                        scrolled 
                          ? 'hover:bg-slate-100' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        scrolled ? 'bg-teal-100' : 'bg-white/10'
                      }`}>
                        <User className={`h-4 w-4 ${
                          scrolled ? 'text-teal-600' : 'text-teal-400'
                        }`} />
                      </div>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/wishlist')} className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate('/login')}
                    className={`${
                      scrolled
                        ? 'bg-boldvan-gradient text-white hover:shadow-boldvan'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    Sign In
                  </Button>
                </motion.div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  scrolled 
                    ? 'hover:bg-slate-100 text-slate-700' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="lg:hidden mt-4"
              >
                <div className={`rounded-xl p-2 ${
                  scrolled ? 'bg-white shadow-xl' : 'bg-white/10 backdrop-blur-lg border border-white/20'
                }`}>
                  {/* Main Navigation */}
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.button
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? scrolled
                              ? 'bg-teal-50 text-teal-600'
                              : 'bg-teal-500/20 text-teal-400'
                            : scrolled
                            ? 'text-slate-700 hover:bg-slate-100'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </motion.button>
                    );
                  })}

                  {/* Admin Link (Mobile) */}
                  {isAdmin && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => navigate('/admin')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/admin'
                          ? scrolled
                            ? 'bg-teal-50 text-teal-600'
                            : 'bg-teal-500/20 text-teal-400'
                          : scrolled
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                      <span className="flex-1 text-left font-medium">Admin</span>
                    </motion.button>
                  )}

                  {/* Categories */}
                  <div className={`border-t my-2 pt-2 ${
                    scrolled ? 'border-slate-200' : 'border-white/20'
                  }`}>
                    <p className={`px-4 py-2 text-sm font-medium ${
                      scrolled ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      Shop by Category
                    </p>
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + index * 0.05 }}
                          onClick={() => navigate(category.path)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            scrolled
                              ? 'text-slate-700 hover:bg-slate-100'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="flex-1 text-left">{category.name}</span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Mobile Contact Info */}
                  <div className={`border-t mt-2 pt-4 px-4 space-y-3 ${
                    scrolled ? 'border-slate-200' : 'border-white/20'
                  }`}>
                    <div className={`flex items-center gap-3 ${
                      scrolled ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      <Phone className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">08178363424</span>
                    </div>
                    <div className={`flex items-center gap-3 ${
                      scrolled ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      <Mail className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">{storeConfig.email}</span>
                    </div>
                    <div className={`flex items-center gap-3 ${
                      scrolled ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      <MapPin className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">Calabar, Nigeria</span>
                    </div>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-navy-950 to-navy-900 text-white w-full">
        {/* Newsletter Section */}
        <div className="border-b border-white/10 w-full">
          <div className="w-full px-4 md:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Stay Updated With BOLDVAN</h3>
                  <p className="text-slate-400">
                    Subscribe to our newsletter for exclusive offers and clean energy tips
                  </p>
                </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Button className="bg-boldvan-gradient text-white hover:shadow-boldvan px-6 whitespace-nowrap">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="w-full px-4 md:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-boldvan-gradient rounded-lg">
                    <Sun className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">BOLD<span className="text-teal-400">VAN</span></span>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Bold Energy, Smart Living. Your trusted partner for clean energy solutions.
                </p>
                <div className="flex gap-2">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors`}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Company</h4>
                <ul className="space-y-2">
                  {footerLinks.company.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-4">Shop</h4>
                <ul className="space-y-2">
                  {footerLinks.shop.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-4">Services</h4>
                <ul className="space-y-2">
                  {footerLinks.services.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-4">Support</h4>
                <ul className="space-y-2">
                  {footerLinks.support.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className="text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal Links */}
            <div className="border-t border-white/10 mt-8 pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {footerLinks.legal.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                <div className="text-center text-sm text-slate-400">
                  <p>&copy; {new Date().getFullYear()} BOLDVAN. All rights reserved.</p>
                </div>

                <div className="flex items-center gap-4 justify-center lg:justify-end">
                  <img src="/images/payments/visa.svg" alt="Visa" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                  <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                  <img src="/images/payments/paypal.svg" alt="PayPal" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                  <img src="/images/payments/verve.svg" alt="Verve" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-boldvan-gradient text-white rounded-full shadow-boldvan z-50"
      >
        <ChevronRight className="h-5 w-5 rotate-[-90deg]" />
      </motion.button>
    </div>
  );
};

export default AppLayout;