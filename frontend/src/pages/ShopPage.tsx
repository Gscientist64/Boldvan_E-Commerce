// frontend/src/pages/ShopPage.tsx

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Sun,
  Battery,
  Zap,
  Cpu,
  Shield,
  Star,
  Truck,
  Clock,
  Award,
  TrendingUp,
  Package,
  Eye,
  ShoppingCart,
  CheckCircle,
  XCircle,
  ChevronDown,
  Grid,
  List,
  Heart,
  Share2,
  Sparkles,
  Leaf,
  Home,
  Building2,
  Factory,
  RefreshCw,
  DollarSign,
  BarChart3,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Globe,
  Moon,
  Sun as SunIcon,
  Bell,
  ShoppingBag,
  CreditCard,
  Gift,
  Percent,
  Flame,
  ZapOff,
  Droplets,
  ThermometerSun,
  Gauge,
  HeartPulse,
  Leaf as LeafIcon,
  Recycle,
  Trees,
  Cloud,
  CloudRain,
  CloudSun,
  Wind as WindIcon,
  Factory as FactoryIcon,
  Home as HomeIcon,
  Building,
  Warehouse,
  School,
  Hospital,
  Store,
  Car,
  Bus,
  Bike,
  Plane,
  Ship,
  Train,
  TrendingDown,
  Quote,
  Users,
} from 'lucide-react';

// Use environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'solar-panels': <Sun className="h-5 w-5" />,
  'batteries': <Battery className="h-5 w-5" />,
  'inverters': <Zap className="h-5 w-5" />,
  'charge-controllers': <Cpu className="h-5 w-5" />,
  'mounting-systems': <Package className="h-5 w-5" />,
  'cables': <ZapOff className="h-5 w-5" />,
  'accessories': <Package className="h-5 w-5" />,
  'residential': <Home className="h-5 w-5" />,
  'commercial': <Building2 className="h-5 w-5" />,
  'industrial': <Factory className="h-5 w-5" />,
};

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [0, 1000000],
    inStock: false,
    onSale: false,
    featured: false,
  });
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Test API connection
  const { data: apiTest, isLoading: apiTestLoading } = useQuery({
    queryKey: ['api-test'],
    queryFn: async () => {
      try {
        console.log('Testing API connection to:', `${API_BASE_URL}/products`);
        const response = await fetch(`${API_BASE_URL}/products`);
        const text = await response.text();
        console.log('API response status:', response.status);
        console.log('API response first 200 chars:', text.substring(0, 200));
        
        return {
          ok: response.ok,
          status: response.status,
          isJson: text.startsWith('{') || text.startsWith('[')
        };
      } catch (error) {
        console.error('API test error:', error);
        return { ok: false, status: 0, isJson: false, error };
      }
    },
    retry: 1,
  });

  // Fetch products from database - ONLY ACTIVE PRODUCTS
  const { 
    data: productsData, 
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['public-products', selectedCategory, debouncedSearchTerm, sortBy, sortOrder, selectedFilters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        // Only add filters if they're not default values
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        
        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }
        
        if (sortBy) {
          params.append('sortBy', sortBy);
        }
        
        if (sortOrder) {
          params.append('sortOrder', sortOrder);
        }
        
        if (selectedFilters.priceRange[0] > 0) {
          params.append('minPrice', selectedFilters.priceRange[0].toString());
        }
        
        if (selectedFilters.priceRange[1] < 1000000) {
          params.append('maxPrice', selectedFilters.priceRange[1].toString());
        }
        
        if (selectedFilters.inStock) {
          params.append('inStock', 'true');
        }
        
        if (selectedFilters.onSale) {
          params.append('onSale', 'true');
        }
        
        if (selectedFilters.featured) {
          params.append('featured', 'true');
        }
        
        params.append('page', '1');
        params.append('limit', '100');
        
        const url = `${API_BASE_URL}/products?${params.toString()}`;
        console.log('Fetching products from:', url);
        
        const response = await fetch(url);
        const responseText = await response.text();
        
        console.log('Response status:', response.status);
        console.log('Response type:', response.headers.get('content-type'));
        console.log('Response first 500 chars:', responseText.substring(0, 500));
        
        if (!response.ok) {
          // Check if it's HTML
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            throw new Error(`Server returned HTML instead of JSON. This usually means: 
              1. The /api/products endpoint doesn't exist (404)
              2. There's a server error (500)
              3. Wrong API URL (current: ${API_BASE_URL}/products)
              Check your backend routes and make sure /api/products is defined.`);
          }
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        // Try to parse as JSON
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Response:', responseText);
          throw new Error(`Invalid JSON response from server. Response: ${responseText.substring(0, 200)}...`);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    retry: 1,
    enabled: apiTest?.ok || true, // Only fetch if API test passed
  });

  // Fetch categories from database
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
          console.warn('Failed to fetch categories, returning empty array');
          return [];
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
  });

  // Debug logging
  useEffect(() => {
    if (apiTest) {
      console.log('API Test result:', apiTest);
    }
  }, [apiTest]);

  // Ensure products is always an array
  const products = React.useMemo(() => {
    if (!productsData) return [];
    
    // Handle different response formats
    if (Array.isArray(productsData)) {
      return productsData;
    } else if (productsData.products && Array.isArray(productsData.products)) {
      return productsData.products;
    } else if (productsData.data && Array.isArray(productsData.data)) {
      return productsData.data;
    }
    
    return [];
  }, [productsData]);
  
  // Ensure categories is always an array
  const categoriesList = React.useMemo(() => {
    if (!categoriesData) return [];
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, [categoriesData]);

  // Testimonials
  const testimonials = [
    {
      name: "Chief Obinna Okonkwo",
      role: "Homeowner, Lagos",
      content: "BOLDVAN transformed our home with solar power. We've cut our electricity bills by 80%!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Amara Nwachukwu",
      role: "Business Owner, Abuja",
      content: "The installation was seamless and the team was incredibly professional. Highly recommended!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Dr. Adebayo Ola",
      role: "Clinic Owner, Ibadan",
      content: "Reliable power for our medical equipment. The battery backup system is a lifesaver.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/46.jpg"
    }
  ];

  const handleViewProduct = (product: any) => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (cartItem: any) => {
    console.log('Received cartItem:', cartItem);
    addToCart(cartItem);
  };
    const handleShareProduct = (product: any) => {
    // Implement share functionality
    navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
    toast({
      title: 'Link copied!',
      description: 'Product link has been copied to clipboard.',
    });
  };

  const handleLikeProduct = (productId: string) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSelectedFilters({
      priceRange: [0, 1000000],
      inStock: false,
      onSale: false,
      featured: false,
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setSelectedFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  if (apiTestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full blur-xl opacity-50"></div>
            <Sun className="h-16 w-16 text-teal-400 relative z-10" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mt-4 text-lg"
          >
            Testing API connection...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!apiTest?.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl w-full">
          <Alert variant="destructive" className="mb-6 border-2 border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">API Connection Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              <p className="mb-4">Cannot connect to backend API at {API_BASE_URL}</p>
              <div className="text-sm space-y-2">
                <p className="font-medium">Possible issues:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Backend server is not running on port 7000</li>
                  <li>API route <code className="bg-red-100 text-red-800 px-1 rounded">/api/products</code> doesn't exist</li>
                  <li>CORS is not configured in backend</li>
                  <li>Wrong API URL in environment variables</li>
                </ul>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('http://localhost:7000/api/products', '_blank')}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Test API in New Tab
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  Current API URL: <code className="bg-gray-100 px-1 rounded">{API_BASE_URL}/products</code>
                </p>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Troubleshooting Steps:
            </h3>
            <ol className="space-y-4">
              {[
                {
                  icon: <Zap className="h-5 w-5" />,
                  title: "Check if backend is running",
                  description: "Open terminal in backend folder and run:",
                  code: "npm run dev",
                  color: "blue"
                },
                {
                  icon: <Globe className="h-5 w-5" />,
                  title: "Verify the API endpoint exists",
                  description: "Open in your browser:",
                  link: "http://localhost:7000/api/products",
                  color: "purple"
                },
                {
                  icon: <Cpu className="h-5 w-5" />,
                  title: "Check backend routes",
                  description: "Make sure /api/products route is defined in your backend",
                  color: "green"
                },
                {
                  icon: <Settings className="h-5 w-5" />,
                  title: "Check frontend environment",
                  description: "Verify .env.local has:",
                  code: "VITE_API_URL=http://localhost:7000/api",
                  color: "orange"
                }
              ].map((step, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 transition-all hover:shadow-md hover:scale-[1.02]"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${step.color}-100 flex items-center justify-center text-${step.color}-600`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    {step.code && (
                      <code className="mt-2 inline-block bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-mono">
                        {step.code}
                      </code>
                    )}
                    {step.link && (
                      <a 
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-blue-600 hover:text-blue-800 underline"
                      >
                        {step.link}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full blur-xl opacity-50"></div>
            <Sun className="h-16 w-16 text-teal-400 relative z-10" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mt-4 text-lg"
          >
            Loading products...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Full Width */}
      <section className="relative h-[500px] overflow-hidden w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden w-full">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-teal-400/60 rounded-full shadow-lg shadow-teal-500/50"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [null, -200],
                x: [null, (Math.random() - 0.5) * 100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative w-full h-full">
          <div className="w-full h-full px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto h-full flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-white max-w-3xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg mb-8 border border-white/20"
                >
                  <Sun className="h-10 w-10 text-teal-400" />
                </motion.div>
                
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-teal-300 to-white">
                    Solar Products Shop
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
                  Discover our premium selection of solar panels, inverters, batteries, and accessories
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 hover:from-teal-600 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-teal-500/30 px-8 py-6 text-lg font-semibold"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Shop Now
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                  >
                    <Award className="mr-2 h-5 w-5" />
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-teal-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Full Width with Centered Content */}
      <section className="relative -mt-16 z-10 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: <Package className="h-6 w-6" />, label: "Products", value: products.length },
                { icon: <Truck className="h-6 w-6" />, label: "Free Shipping", value: "On orders > ₦100k" },
                { icon: <Shield className="h-6 w-6" />, label: "Warranty", value: "2 Years" },
                { icon: <Star className="h-6 w-6" />, label: "Rating", value: "4.8/5" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center border border-white/20"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section - Full Width with Sticky Header */}
      <div className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-teal-500 transition-colors" />
                  <Input
                    placeholder="Search products by name, description, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 py-6 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-teal-600' : 'text-slate-600 hover:bg-white/50'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-teal-600' : 'text-slate-600 hover:bg-white/50'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`relative rounded-xl border-2 transition-all hover:scale-105 ${isFilterOpen ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {(selectedCategory !== 'all' || selectedFilters.inStock || selectedFilters.onSale || selectedFilters.featured) && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {(selectedCategory !== 'all' ? 1 : 0) + 
                     (selectedFilters.inStock ? 1 : 0) + 
                     (selectedFilters.onSale ? 1 : 0) + 
                     (selectedFilters.featured ? 1 : 0)}
                  </span>
                )}
              </Button>

              {/* Category Filter */}
              <div className="w-full lg:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="py-6 rounded-xl border-2 border-slate-200 focus:border-teal-500 transition-all">
                    <div className="flex items-center">
                      {selectedCategory !== 'all' && categoryIcons[selectedCategory]}
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>All Categories</span>
                      </div>
                    </SelectItem>
                    {categoriesList.map((category: any) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.slug || category.id}
                      >
                        <div className="flex items-center">
                          {categoryIcons[category.slug || category.id] || <Package className="mr-2 h-4 w-4" />}
                          <span>{String(category.name)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="w-full lg:w-64">
                <Select 
                  value={sortBy === 'price' && sortOrder === 'desc' ? 'price-desc' : sortBy}
                  onValueChange={(value) => {
                    if (value === 'price-desc') {
                      setSortBy('price');
                      setSortOrder('desc');
                    } else if (value === 'price') {
                      setSortBy('price');
                      setSortOrder('asc');
                    } else {
                      setSortBy(value);
                      setSortOrder('desc');
                    }
                  }}
                >
                  <SelectTrigger className="py-6 rounded-xl border-2 border-slate-200 focus:border-teal-500 transition-all">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="createdAt">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Newest First</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price">
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Price: Low to High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price-desc">
                      <div className="flex items-center">
                        <TrendingDown className="mr-2 h-4 w-4" />
                        <span>Price: High to Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="name">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Name: A to Z</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory !== 'all' || sortBy !== 'createdAt' || selectedFilters.inStock || selectedFilters.onSale || selectedFilters.featured) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={handleClearFilters}
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all hover:scale-105"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Expanded Filters Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Price Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Price Range
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={selectedFilters.priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(Number(e.target.value), selectedFilters.priceRange[1])}
                          className="rounded-lg border-2 border-slate-200 transition-all focus:border-teal-500"
                        />
                        <span className="text-slate-400">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={selectedFilters.priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(selectedFilters.priceRange[0], Number(e.target.value))}
                          className="rounded-lg border-2 border-slate-200 transition-all focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        Stock Status
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.inStock}
                            onChange={(e) => setSelectedFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                            className="rounded border-slate-300 text-teal-500 focus:ring-teal-500 transition-all"
                          />
                          <span className="text-sm text-slate-600">In Stock</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.onSale}
                            onChange={(e) => setSelectedFilters(prev => ({ ...prev, onSale: e.target.checked }))}
                            className="rounded border-slate-300 text-teal-500 focus:ring-teal-500 transition-all"
                          />
                          <span className="text-sm text-slate-600">On Sale</span>
                        </label>
                      </div>
                    </div>

                    {/* Featured */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Featured
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.featured}
                            onChange={(e) => setSelectedFilters(prev => ({ ...prev, featured: e.target.checked }))}
                            className="rounded border-slate-300 text-teal-500 focus:ring-teal-500 transition-all"
                          />
                          <span className="text-sm text-slate-600">Featured Products</span>
                        </label>
                      </div>
                    </div>

                    {/* Apply Filters Button */}
                    <div className="flex items-end">
                      <Button 
                        onClick={() => refetchProducts()}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all hover:scale-105"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Products Section - Full Width with Centered Content */}
      <section className="py-12 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
                    {selectedCategory !== 'all' 
                      ? `${categoriesList.find((c: any) => (c.slug || c.id) === selectedCategory)?.name || 'Category'} Products`
                      : 'All Products'
                    }
                  </span>
                </h2>
                <p className="text-slate-600">
                  {products.length} {products.length === 1 ? 'product' : 'products'} available
                </p>
              </div>
              
              {/* Active Filters Tags */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                {selectedFilters.inStock && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    In Stock
                  </span>
                )}
                {selectedFilters.onSale && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center">
                    <Percent className="h-3 w-3 mr-1" />
                    On Sale
                  </span>
                )}
                {selectedFilters.featured && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>
            </div>

            {productsError && (
              <Alert variant="destructive" className="mb-6 border-2 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error Loading Products</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{String(productsError.message)}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => refetchProducts()} variant="destructive">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-teal-100 to-teal-200 mb-6">
                  <Package className="h-12 w-12 text-teal-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-3">No products found</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  {searchTerm || selectedCategory !== 'all' || selectedFilters.inStock || selectedFilters.onSale || selectedFilters.featured
                    ? 'No products match your search criteria. Try different keywords or categories.'
                    : 'No active products available at the moment. Check back soon!'}
                </p>
                {(searchTerm || selectedCategory !== 'all' || selectedFilters.inStock || selectedFilters.onSale || selectedFilters.featured) && (
                  <Button 
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl transition-all hover:scale-105"
                  >
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }
              >
                {products.map((product: any) => (
                  viewMode === 'grid' ? (
                    <motion.div
                      key={product.id}
                      variants={cardVariants}
                      whileHover="hover"
                      onHoverStart={() => setHoveredProduct(product.id)}
                      onHoverEnd={() => setHoveredProduct(null)}
                      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Product Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.stock > 0 && product.stock <= 10 && (
                          <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full flex items-center animate-pulse">
                            <Clock className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center">
                            <XCircle className="h-3 w-3 mr-1" />
                            Out of Stock
                          </span>
                        )}
                        {product.discount && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center">
                            <Percent className="h-3 w-3 mr-1" />
                            {product.discount}% OFF
                          </span>
                        )}
                        {product.featured && (
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Like Button */}
                      <button
                        onClick={() => handleLikeProduct(product.id)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={`h-4 w-4 transition-all ${likedProducts.has(product.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-600'}`}
                        />
                      </button>

                      {/* Product Image */}
                      <div className="relative h-64 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={String(product.name)}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full blur-xl opacity-20"></div>
                              <Sun className="h-20 w-20 text-slate-400 relative z-10" />
                            </div>
                          </div>
                        )}
                        
                        {/* Quick Actions Overlay */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredProduct === product.id ? 1 : 0 }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
                        >
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white hover:bg-slate-100 transition-all hover:scale-105"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Quick View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white hover:bg-slate-100 transition-all hover:scale-105"
                            onClick={() => handleShareProduct(product)}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </motion.div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {product.category && categoryIcons[product.category]}
                          <span className="text-xs text-slate-500 uppercase tracking-wider">
                            {String(product.category || 'General')}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {String(product.name)}
                        </h3>
                        
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                          {String(product.description || '')}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 transition-all ${star <= (product.rating || 4) ? 'fill-teal-400 text-teal-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 ml-2">
                            ({product.reviews || 0} reviews)
                          </span>
                        </div>
                        
                        {/* Price and Stock */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            {product.oldPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-teal-600">
                                  ₦{Number(product.price).toLocaleString()}
                                </span>
                                <span className="text-sm text-slate-400 line-through">
                                  ₦{Number(product.oldPrice).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-teal-600">
                                ₦{Number(product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0
                              ? 'bg-teal-100 text-teal-800 animate-pulse'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all hover:scale-105"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button 
                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white transition-all hover:scale-105"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // List View
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-[1.01]"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="md:w-48 h-48 bg-gradient-to-br from-slate-50 to-slate-100">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={String(product.name)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sun className="h-12 w-12 text-slate-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{String(product.name)}</h3>
                              <p className="text-slate-600">{String(product.description || '')}</p>
                            </div>
                            <button
                              onClick={() => handleLikeProduct(product.id)}
                              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <Heart 
                                className={`h-4 w-4 transition-all ${likedProducts.has(product.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-600'}`}
                              />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.stock > 0
                                ? 'bg-teal-100 text-teal-800 animate-pulse'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                            <span className="text-sm text-slate-500">SKU: {String(product.sku || 'N/A')}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-teal-600">
                              ₦{Number(product.price).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => handleViewProduct(product)}
                                className="transition-all hover:scale-105"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button 
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white transition-all hover:scale-105"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Full Width */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-white w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
                  What Our Customers Say
                </span>
              </h2>
              <p className="text-slate-600 text-lg">Trusted by thousands of satisfied customers</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-xl p-8 relative"
                >
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-teal-200" />
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-teal-400 text-teal-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.content}"</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;