// frontend/src/components/Header.tsx

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Heart,
  Clock,
  Package,
  Shield,
  TrendingUp,
  Sparkles,
  Leaf,
  Award,
  Zap,
  Battery,
  Cpu,
  Home,
  Store,
  Truck,
  Headphones,
  Moon,
  Sun as SunIcon,
  Bell,
  Gift,
  Percent,
  Star,
  Users,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Wallet,
  BookOpen,
  FileText,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon,
  Shield as ShieldIcon,
  Award as AwardIcon,
  Sparkles as SparklesIcon,
  Leaf as LeafIcon,
  Zap as ZapIcon,
  Battery as BatteryIcon,
  Cpu as CpuIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Truck as TruckIcon,
  Headphones as HeadphonesIcon,
  Bolt,
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
    if (searchQuery.trim()) {
      onNavigate('shop');
    }
  };

  const navItems = [
    { label: 'Home', page: 'home', icon: Home },
    { label: 'Shop', page: 'shop', icon: Store },
    { label: 'Track Order', page: 'tracking', icon: Truck },
    { label: 'Support', page: 'support', icon: Headphones },
  ];

  const categories = [
    { name: 'Solar Panels', icon: Sun, color: 'from-boldvan-500 to-teal-500' },
    { name: 'Batteries', icon: Battery, color: 'from-boldvan-600 to-teal-600' },
    { name: 'Inverters', icon: Zap, color: 'from-boldvan-400 to-teal-400' },
    { name: 'Mounting Systems', icon: Shield, color: 'from-navy-500 to-navy-700' },
    { name: 'Charge Controllers', icon: Cpu, color: 'from-teal-500 to-boldvan-500' },
    { name: 'Accessories', icon: Package, color: 'from-boldvan-700 to-navy-600' },
  ];

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    })
  };

  return (
    <>
      {/* Top Bar - Hidden on mobile */}
      <div className="hidden lg:block bg-gradient-to-r from-navy-900 to-navy-950 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-400" />
              <span>08178363424</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-400" />
              <span>support@boldvan.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-400" />
              <span>Calabar, Nigeria</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <span>Mon-Sat: 8am - 8pm</span>
            </div>
            <div className="flex items-center gap-2 border-l border-white/20 pl-4">
              <Globe className="h-4 w-4 text-teal-400" />
              <select className="bg-transparent text-white border-none focus:ring-0 text-sm">
                <option value="ng" className="text-navy-900">NGN</option>
                <option value="us" className="text-navy-900">USD</option>
                <option value="gh" className="text-navy-900">GHS</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-boldvan'
            : 'bg-gradient-to-r from-navy-900 via-boldvan-950 to-navy-950'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => onNavigate('home')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-2 rounded-lg transition-all group-hover:rotate-12 ${
                scrolled ? 'bg-boldvan-gradient' : 'bg-white/10'
              }`}>
                <Bolt className={`h-6 w-6 ${
                  scrolled ? 'text-white' : 'text-teal-300'
                }`} />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl font-bold transition-colors tracking-wide ${
                  scrolled ? 'text-navy-900' : 'text-white'
                }`}>
                  BOLD<span className={scrolled ? 'text-teal-600' : 'text-teal-400'}>VAN</span>
                </h1>
                <p className={`text-xs hidden md:block ${
                  scrolled ? 'text-navy-400' : 'text-navy-300'
                }`}>
                  Smart Tech, Clean Power
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <motion.button
                    key={item.page}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => onNavigate(item.page)}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all group ${
                      isActive
                        ? scrolled
                          ? 'text-boldvan-600'
                          : 'text-teal-300'
                        : scrolled
                        ? 'text-navy-500 hover:text-boldvan-600'
                        : 'text-navy-200 hover:text-white'
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
                          scrolled ? 'bg-boldvan-gradient' : 'bg-teal-400'
                        }`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
              {/* Search Button - Mobile */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  scrolled
                    ? 'hover:bg-navy-50 text-navy-700'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Search Bar - Desktop */}
              <motion.form
                onSubmit={handleSearch}
                className={`hidden lg:block relative ${scrolled ? 'text-navy-900' : 'text-white'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-full w-64 focus:w-80 transition-all focus:outline-none focus:ring-2 ${
                    scrolled
                      ? 'bg-navy-50 border border-navy-200 focus:ring-boldvan-500 placeholder-navy-400'
                      : 'bg-white/10 border border-white/20 focus:ring-teal-400 placeholder-navy-300'
                  }`}
                />
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  scrolled ? 'text-navy-400' : 'text-navy-300'
                }`} />
              </motion.form>

              {/* Categories Dropdown */}
              <div className="relative hidden lg:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setShowCategories(true)}
                  onMouseLeave={() => setShowCategories(false)}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    scrolled
                      ? 'hover:bg-navy-50 text-navy-700'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </motion.button>

                <AnimatePresence>
                  {showCategories && (
                    <motion.div
                      variants={menuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onMouseEnter={() => setShowCategories(true)}
                      onMouseLeave={() => setShowCategories(false)}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-boldvan-lg overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {categories.map((category, index) => {
                          const Icon = category.icon;
                          return (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => {
                                onNavigate('shop');
                                setShowCategories(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-boldvan-50 rounded-lg transition-colors group"
                            >
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white group-hover:scale-110 transition-transform`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-navy-700 font-medium flex-1 text-left">{category.name}</span>
                              <ChevronRight className="h-4 w-4 text-navy-400 group-hover:text-teal-500 transition-colors" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled
                      ? 'hover:bg-navy-50 text-navy-700'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <User className="h-5 w-5" />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      variants={menuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-boldvan-lg overflow-hidden z-50"
                    >
                      {isLoggedIn ? (
                        <>
                          <div className="p-4 border-b border-navy-100">
                            <p className="font-semibold text-navy-900">John Doe</p>
                            <p className="text-sm text-navy-500">john@example.com</p>
                          </div>
                          <div className="p-2">
                            {[
                              { icon: User, label: 'Profile', page: 'profile' },
                              { icon: Package, label: 'Orders', page: 'orders' },
                              { icon: Heart, label: 'Wishlist', page: 'wishlist' },
                              { icon: Settings, label: 'Settings', page: 'settings' },
                            ].map((item, index) => (
                              <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                  onNavigate(item.page);
                                  setShowUserMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-boldvan-50 rounded-lg transition-colors text-navy-700"
                              >
                                <item.icon className="h-4 w-4" />
                                <span className="flex-1 text-left">{item.label}</span>
                              </motion.button>
                            ))}
                            <div className="border-t border-navy-100 my-2" />
                            <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              onClick={() => {
                                setIsLoggedIn(false);
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            >
                              <LogOut className="h-4 w-4" />
                              <span className="flex-1 text-left">Logout</span>
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4">
                          <p className="text-sm text-navy-600 mb-3">Sign in to access your account</p>
                          <button
                            onClick={() => {
                              onNavigate('login');
                              setShowUserMenu(false);
                            }}
                            className="w-full bg-boldvan-gradient text-white font-medium py-2 px-4 rounded-lg hover:shadow-boldvan transition-all active:scale-95"
                          >
                            Sign In
                          </button>
                          <p className="text-xs text-center mt-3 text-navy-500">
                            New user?{' '}
                            <button
                              onClick={() => {
                                onNavigate('register');
                                setShowUserMenu(false);
                              }}
                              className="text-boldvan-600 hover:underline font-medium"
                            >
                              Create account
                            </button>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate('cart')}
                className={`relative p-2 rounded-lg transition-colors ${
                  scrolled
                    ? 'hover:bg-navy-50 text-navy-700'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-boldvan-gradient text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-boldvan"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  scrolled
                    ? 'hover:bg-navy-50 text-navy-700'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Search */}
          <AnimatePresence>
            {showSearch && (
              <motion.form
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSearch}
                className="lg:hidden mt-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-navy-300" />
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="lg:hidden mt-4"
              >
                <div className="bg-navy-900/95 backdrop-blur-lg rounded-xl p-2 border border-white/10">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;
                    return (
                      <motion.button
                        key={item.page}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          onNavigate(item.page);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-boldvan-gradient text-white'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </motion.button>
                    );
                  })}

                  {/* Mobile Categories */}
                  <div className="border-t border-white/20 my-2 pt-2">
                    <p className="px-4 py-2 text-sm text-navy-300 font-medium">Categories</p>
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          onClick={() => {
                            onNavigate('shop');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="flex-1 text-left">{category.name}</span>
                          <ChevronRight className="h-4 w-4 text-navy-300" />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Mobile Contact Info */}
                  <div className="border-t border-white/20 mt-2 pt-4 px-4 space-y-3">
                    <div className="flex items-center gap-3 text-navy-200">
                      <Phone className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">08178363424</span>
                    </div>
                    <div className="flex items-center gap-3 text-navy-200">
                      <Mail className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">support@boldvan.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-navy-200">
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
    </>
  );
};

export default Header;