// frontend/src/pages/HomePage.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import {
  Sun,
  Battery,
  Zap,
  Shield,
  TrendingUp,
  Leaf,
  CheckCircle,
  Truck,
  Headphones,
  Clock,
  Package,
  Settings,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Play,
  Pause,
  Quote,
  ThumbsUp,
  Heart,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Cpu,
  Wifi,
  Cloud,
  Database,
  Server,
  Network,
  HardDrive,
  Monitor,
  Printer,
  Scanner,
  Camera,
  Mic,
  Speaker,
  Headphones as HeadphonesIcon,
  Gamepad,
  Keyboard,
  Mouse,
  Watch,
  Tv,
  Radio,
  Drone,
  Robot,
  Car,
  Bike,
  Bus,
  Train,
  Plane,
  Ship,
  Rocket,
  Satellite,
  Telescope,
  Microscope,
  Flask,
  Beaker,
  Dna,
  Atom,
  Brain,
  Heart as HeartIcon,
  Activity,
  Thermometer as ThermometerIcon,
  Droplet as DropletIcon,
  Wind as WindIcon,
  Zap as ZapIcon,
  Battery as BatteryIcon,
  Cpu as CpuIcon,
  Sun as SunIcon,
  Leaf as LeafIcon,
  Award as AwardIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Wifi as WifiIcon,
  Bluetooth,
  Cloud as CloudIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Network as NetworkIcon,
  HardDrive as HardDriveIcon,
  Monitor as MonitorIcon,
  Printer as PrinterIcon,
  Scanner as ScannerIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Speaker as SpeakerIcon,
  Headphones as HeadphonesIcon2,
  Gamepad as GamepadIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Watch as WatchIcon,
  Tv as TvIcon,
  Radio as RadioIcon,
  Drone as DroneIcon,
  Robot as RobotIcon,
  Car as CarIcon,
  Bike as BikeIcon,
  Bus as BusIcon,
  Train as TrainIcon,
  Plane as PlaneIcon,
  Ship as ShipIcon,
  Rocket as RocketIcon,
  Satellite as SatelliteIcon,
  Telescope as TelescopeIcon,
  Microscope as MicroscopeIcon,
  Flask as FlaskIcon,
  Beaker as BeakerIcon,
  Dna as DnaIcon,
  Atom as AtomIcon,
  Brain as BrainIcon,
  Heart as HeartIcon2,
  Activity as ActivityIcon,
} from 'lucide-react';

interface HomePageProps {
  onViewProduct: (product: any) => void;
  onNavigate?: (page: string, category?: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onViewProduct, onNavigate }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Fetch featured products from database
  const { data: featuredProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => publicApi.getProducts({ featured: true, limit: 8 }),
  });

  // Fetch categories from database
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => publicApi.getCategories(),
  });

  // Ensure products is always an array
  const featuredProducts = Array.isArray(featuredProductsData?.products) 
    ? featuredProductsData.products 
    : [];
  
  // Ensure categories is always an array
  const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];

  // Solar-themed hero images
  const heroImages = [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ];

  const heroImage = heroImages[0];
  
  // Testimonials
  const testimonials = [
    {
      name: "Isaac Junior",
      role: "Calabar",
      content: "BOLDVAN transformed my home with solar power.",
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

  // Stats
  const stats = [
    { icon: <Users className="h-6 w-6" />, value: "10,000+", label: "Happy Customers" },
    { icon: <Sun className="h-6 w-6" />, value: "15 MW", label: "Solar Installed" },
    { icon: <Leaf className="h-6 w-6" />, value: "25,000 tons", label: "CO₂ Saved" },
    { icon: <Award className="h-6 w-6" />, value: "8+ Years", label: "Experience" },
  ];

  // Solar-specific categories with icons (fallback if database categories empty)
  const solarCategories = [
    { name: 'Solar Panels', icon: Sun, color: 'from-teal-500 to-orange-500', slug: 'solar-panels' },
    { name: 'Batteries', icon: Battery, color: 'from-blue-500 to-cyan-500', slug: 'batteries' },
    { name: 'Inverters', icon: Zap, color: 'from-yellow-500 to-teal-500', slug: 'inverters' },
    { name: 'Mounting Systems', icon: Shield, color: 'from-gray-500 to-slate-500', slug: 'mounting-systems' },
    { name: 'Charge Controllers', icon: Cpu, color: 'from-green-500 to-emerald-500', slug: 'charge-controllers' },
    { name: 'Accessories', icon: Settings, color: 'from-purple-500 to-pink-500', slug: 'accessories' },
  ];

  // Use database categories if available, otherwise use fallback solar categories
  const displayCategories = categoriesList.length > 0 
    ? categoriesList.map((cat: any, index: number) => ({
        ...cat,
        icon: solarCategories[index % solarCategories.length]?.icon || Package,
        color: solarCategories[index % solarCategories.length]?.color || 'from-gray-500 to-slate-500'
      }))
    : solarCategories;

  // Benefits of solar energy
  const benefits = [
    {
      icon: Leaf,
      title: 'Reduce Carbon Footprint',
      description: 'Clean, renewable energy for a sustainable future',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Save on Energy Bills',
      description: 'Lower your electricity costs by up to 90%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Energy Independence',
      description: 'Protect yourself from rising energy prices',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Government Incentives',
      description: 'Take advantage of tax credits and rebates',
      color: 'from-teal-500 to-orange-500'
    }
  ];

  // Why choose us features
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over ₦500,000',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Warranty Protected',
      description: '25-year performance warranty',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Solar specialists available 24/7',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Quick Installation',
      description: 'Professional setup within 48 hours',
      color: 'from-teal-500 to-orange-500'
    }
  ];

  // Navigation handlers - support both onNavigate prop and useNavigate
  const handleNavigateToShop = (categorySlug?: string) => {
    if (onNavigate) {
      onNavigate('shop', categorySlug);
    } else {
      if (categorySlug) {
        navigate(`/shop?category=${encodeURIComponent(categorySlug)}`);
      } else {
        navigate('/shop');
      }
    }
  };

  const handleNavigateToBooking = () => {
    if (onNavigate) {
      onNavigate('support');
    } else {
      navigate('/support');
    }
  };

  const handleNavigateToContact = () => {
    if (onNavigate) {
      onNavigate('support');
    } else {
      navigate('/support');
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast({
      title: "🛒 Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      variant: "success"
    });
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
            Powering up your solar experience...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Full Width */}
      <section className="relative min-h-[360px] sm:min-h-[420px] md:h-[600px] overflow-hidden w-full">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Solar Power Solutions" 
            className="absolute inset-0 w-full h-full object-cover object-center sm:object-center md:object-left"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        </div>

        {/* Animated Particles - Made More Visible */}
        <div className="absolute inset-0 overflow-hidden">
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
          {/* Additional larger particles for more visibility */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`large-${i}`}
              className="absolute w-3 h-3 bg-teal-300/70 rounded-full shadow-lg shadow-teal-400/60"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [null, -300],
                x: [null, (Math.random() - 0.5) * 150],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 7,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Hero Content - Centered with max-width */}
        <div className="relative w-full h-full">
          <div className="w-full h-full px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto h-full flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white max-w-3xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="p-2 bg-teal-500/20 backdrop-blur-sm rounded-full">
                    <Sun className="h-8 w-8 text-teal-400" />
                  </div>
                  <span className="text-lg font-semibold bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">
                    <Sparkles className="h-4 w-4 inline mr-2 text-teal-400" />
                    Powering a Brighter Future
                  </span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-teal-200 to-white text-2xl sm:text-3xl md:text-5xl block mb-2">
                    Always One Click Away:
                  </span>
                  <span className="text-xl sm:text-2xl md:text-4xl block leading-relaxed">
                    Smart Tech, Clean Power, Affordable Rates.
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm sm:text-base md:text-lg mb-6 text-slate-200 leading-relaxed max-w-2xl"
                >
                  Premium solar equipment, expert installation services, and complete energy solutions for homes and businesses across Nigeria.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <Button 
                    onClick={() => handleNavigateToShop()} 
                    className="w-full sm:w-auto group px-6 py-4 rounded-xl font-bold hover:scale-105 transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
                  >
                    <Sun className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Shop Solar Products
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={handleNavigateToBooking} 
                    variant="outline"
                    className="w-full sm:w-auto group px-6 py-4 rounded-xl font-bold hover:bg-white/10 transition-all border-2 border-white/30 text-white text-base backdrop-blur-sm"
                  >
                    Book Free Consultation
                  </Button>
                </motion.div>
                {/* Trust Badges */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center gap-6 mt-8"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 border-2 border-white/20 flex items-center justify-center text-xs font-bold text-slate-900">
                        {i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">
                    <span className="text-teal-400 font-bold">10,000+</span> happy customers nationwide
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden xl:block"
        >
          <div className="space-y-4">
            {[
              { icon: <Zap className="h-5 w-5" />, label: "Save up to 90%", color: "from-teal-500 to-teal-600" },
              { icon: <Leaf className="h-5 w-5" />, label: "Eco-Friendly", color: "from-green-500 to-green-600" },
              { icon: <Shield className="h-5 w-5" />, label: "25-Yr Warranty", color: "from-blue-500 to-blue-600" },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, x: -10 }}
                className={`bg-gradient-to-r ${item.color} p-4 rounded-xl shadow-xl backdrop-blur-sm`}
              >
                <div className="flex items-center gap-3 text-white">
                  {item.icon}
                  <span className="font-semibold">{item.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-teal-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Featured Products - Full Width with Centered Content */}
      <section className="pt-16 pb-24 md:pb-28 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
                    Featured Products
                  </span>
                </h2>
                <p className="text-slate-600 text-lg">Top-rated equipment trusted by professionals</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} className="mt-4 md:mt-0">
                <Button 
                  onClick={() => handleNavigateToShop()} 
                  className="group px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {featuredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-teal-100 to-teal-200 mb-6">
                  <Package className="h-12 w-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No featured products yet</h3>
                <p className="text-slate-600 mb-8">
                  Check back soon for our featured solar products!
                </p>
                <Button 
                  onClick={() => handleNavigateToShop()}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900"
                >
                  Browse All Products
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {featuredProducts.map((product: any, index: number) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard 
                        product={product}
                        onViewDetails={() => onViewProduct(product)}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mt-12"
                >
                  <Button 
                    onClick={() => handleNavigateToShop()}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 hover:from-teal-600 hover:to-teal-700"
                  >
                    Load More Products
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width with Centered Content */}
      <section className="relative -mt-12 md:-mt-16 z-10 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
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

      {/* Benefits Section - Full Width with Centered Content */}
      <section className="py-24 w-full">
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
                  Why Choose Solar Energy?
                </span>
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Join thousands of homeowners and businesses who have switched to clean, affordable solar power
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group relative bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className="p-6">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{benefit.title}</h3>
                      <p className="text-slate-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section - Full Width with Centered Content */}
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
                  Shop by Category
                </span>
              </h2>
              <p className="text-slate-600 text-lg">Everything you need for your solar installation</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {displayCategories.map((category: any, index: number) => {
                const Icon = category.icon || Package;
                return (
                  <motion.button
                    key={category.id || category.name}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => handleNavigateToShop(category.slug)}
                    className="group relative bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="p-6 text-center">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${category.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-slate-800 truncate text-sm">{category.name}</p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Full Width with Centered Content */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden w-full">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>

        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-200">
                  Why Choose BOLDVAN?
                </span>
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                We're more than just a store - we're your solar energy partner
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover="hover"
                    className="text-center group"
                  >
                    <div className="relative inline-block">
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                      <div className={`relative inline-flex p-4 rounded-full bg-gradient-to-r ${feature.color} shadow-xl mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Full Width with Centered Content */}
      <section className="py-24 bg-white w-full">
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
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl p-8 relative"
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

      {/* CTA Section - Full Width */}
      <section className="relative py-32 overflow-hidden w-full">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Solar Farm"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/80" />
        </div>

        <div className="relative w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 mb-8 shadow-2xl"
            >
              <Sun className="h-10 w-10" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Ready to Go Solar?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl mb-8 text-slate-300"
            >
              Get a free solar assessment and see how much you can save
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                onClick={handleNavigateToBooking} 
                className="group px-8 py-6 rounded-xl font-bold hover:scale-105 transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 text-lg shadow-lg shadow-teal-500/30"
              >
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={handleNavigateToContact} 
                variant="outline"
                className="group px-8 py-6 rounded-xl font-bold hover:bg-white/10 transition-all border-2 border-white/30 text-white text-lg backdrop-blur-sm"
              >
                Contact Our Experts
                <Phone className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-slate-400 flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              📞 Call us at 08178363424
            </motion.p>
          </div>
        </div>
      </section>

      {/* Partners Section - Full Width with Centered Content */}
      <section className="py-16 bg-white border-t border-slate-100 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-slate-500 mb-8"
            >
              Trusted by industry leaders
            </motion.p>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <div className="w-24 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;