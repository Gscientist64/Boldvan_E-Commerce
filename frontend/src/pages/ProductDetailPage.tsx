// frontend/src/pages/ProductDetailPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '@/hooks/use-toast';
import StarRating from '../components/StarRating';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Truck,
  Shield,
  CheckCircle,
  MapPin,
  Package,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  ShoppingCart,
  ChevronLeft,
  AlertCircle,
  Sun,
  Battery,
  Zap,
  Cpu,
  Award,
  TrendingUp,
  Users,
  Star,
  Clock,
  ArrowRight,
  ChevronRight,
  Quote,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
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
  Headphones,
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
  Thermometer,
  Droplet,
  Wind,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token') || '';

  // ============ FETCH PRODUCT ============
  const { 
    data: product, 
    isLoading: productLoading,
    error: productError 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      return {
        ...data,
        inStock: data.stock > 0 // Add computed field for compatibility
      };
    },
  });

  // ============ FETCH DELIVERY LOCATIONS ============
  const { 
    data: deliveryLocations = [], 
    isLoading: locationsLoading 
  } = useQuery({
    queryKey: ['delivery-locations'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/delivery/locations`);
        if (!response.ok) return [];
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching delivery locations:', error);
        return [];
      }
    },
  });

  // ============ FETCH DELIVERY METHODS ============
  const { 
    data: deliveryMethods = [], 
    isLoading: methodsLoading 
  } = useQuery({
    queryKey: ['delivery-methods'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/delivery/methods`);
        if (!response.ok) return [];
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Error fetching delivery methods:', error);
        return [];
      }
    },
  });

  // ============ FETCH DELIVERY PRICE ============
  const { 
    data: deliveryPricing, 
    isLoading: pricingLoading 
  } = useQuery({
    queryKey: ['delivery-pricing', selectedLocationId, selectedMethodId],
    queryFn: async () => {
      if (!selectedLocationId || !selectedMethodId) return null;
      
      try {
        const response = await fetch(`${API_BASE_URL}/delivery/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locationId: selectedLocationId,
            methodId: selectedMethodId
          })
        });
        
        if (!response.ok) return null;
        return response.json();
      } catch (error) {
        console.error('Error calculating delivery:', error);
        return null;
      }
    },
    enabled: !!selectedLocationId && !!selectedMethodId,
  });

  // ============ FETCH SHOP SETTINGS ============
  const { 
    data: shopSettings,
    isLoading: settingsLoading 
  } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/shop`);
        if (!response.ok) {
          return {
            freeShippingThreshold: 50000,
            returnPolicy: '30-day return policy'
          };
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching shop settings:', error);
        return {
          freeShippingThreshold: 50000,
          returnPolicy: '30-day return policy'
        };
      }
    },
  });

  // ============ FETCH SELLER INFO ============
  const { 
    data: sellerInfo,
    isLoading: sellerLoading 
  } = useQuery({
    queryKey: ['seller-info'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/seller`);
        if (!response.ok) {
          return {
            name: 'BOLDVAN',
            phone: '08178363424',
            whatsapp: '08178363424',
            email: 'sales@BOLDVANresources.com',
            address: 'Lagos, Nigeria',
            rating: 4.9,
            totalSales: 1547,
            successRate: 100,
            memberSince: '2019',
            responseTime: '< 1 hour',
            badges: ['Verified Seller', 'Top Rated', 'Fast Shipper']
          };
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching seller info:', error);
        return {
          name: 'BOLDVAN',
          phone: '08178363424',
          whatsapp: '08178363424',
          email: 'sales@BOLDVANresources.com',
          address: 'Lagos, Nigeria',
          rating: 4.9,
          totalSales: 1547,
          successRate: 100,
          memberSince: '2019',
          responseTime: '< 1 hour',
          badges: ['Verified Seller', 'Top Rated', 'Fast Shipper']
        };
      }
    },
  });

  // ============ FETCH RELATED PRODUCTS ============
  const { 
    data: relatedProducts = [] 
  } = useQuery({
    queryKey: ['related-products', product?.categoryId, id],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      try {
        const response = await fetch(
          `${API_BASE_URL}/products?category=${product.category?.slug || ''}&limit=4&exclude=${id}`
        );
        const data = await response.json();
        return data.products || [];
      } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
      }
    },
    enabled: !!product?.categoryId,
  });

  // ============ FETCH PRODUCT REVIEWS ============
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/product/${id}?limit=20`);
        if (!response.ok) return { reviews: [] };
        const data = await response.json();
        return data.reviews || [];
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
    },
  });

  const reviews = reviewsData || [];

  // ============ ADD TO CART MUTATION ============
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      const cartItem = {
        productId: product.id,
        quantity,
        deliveryLocationId: selectedLocationId || null,
        deliveryMethodId: selectedMethodId || null,
        deliveryFee: deliveryPricing?.price || 0
      };

      if (!token) {
        // Guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = guestCart.findIndex((item: any) => item.productId === product.id);
        
        if (existingItem >= 0) {
          guestCart[existingItem].quantity += quantity;
        } else {
          guestCart.push({
            ...cartItem,
            name: product.name,
            price: product.price,
            image: product.image
          });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        return { success: true, isGuest: true };
      }

      // Authenticated cart
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cartItem),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Added to cart!',
        description: data.isGuest 
          ? `${product.name} has been added to your cart.` 
          : `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ============ ADD REVIEW MUTATION ============
  const addReviewMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Please login to write a review');
      }

      const response = await fetch(`${API_BASE_URL}/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
      setReviewForm({ rating: 5, comment: '' });
      setIsAddingReview(false);
      refetchReviews();
      // Also refetch product to update rating
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ============ ADD TO WISHLIST MUTATION ============
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Please login to add items to wishlist');
      }

      const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to wishlist');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsInWishlist(true);
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist.`,
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

  // ============ HANDLERS ============
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCartMutation.mutate(undefined, {
      onSettled: () => setIsAddingToCart(false)
    });
  };

  const handleContactSeller = (method: 'call' | 'whatsapp') => {
    const phone = sellerInfo?.phone || '08178363424';
    const message = encodeURIComponent(
      `Hello, I'm interested in purchasing ${product?.name} (SKU: ${product?.sku}) from your store.\n\n` +
      `Product: ${product?.name}\n` +
      `Price: ₦${product?.price.toLocaleString()}\n` +
      `Quantity: ${quantity}\n` +
      `Total: ₦${(product?.price * quantity).toLocaleString()}\n\n` +
      `${selectedLocationId ? `Delivery Location: ${deliveryLocations.find((l: any) => l.id === selectedLocationId)?.name}\n` : ''}` +
      `${selectedMethodId ? `Delivery Method: ${deliveryMethods.find((m: any) => m.id === selectedMethodId)?.name}\n` : ''}` +
      `${deliveryPricing ? `Delivery Fee: ₦${deliveryPricing.price.toLocaleString()}\n` : ''}\n` +
      `Please provide more information about this product.`
    );

    if (method === 'call') {
      window.location.href = `tel:+234${phone}`;
    } else {
      window.open(`https://wa.me/234${phone}?text=${message}`, '_blank');
    }
    setContactDialogOpen(false);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = `Check out ${product?.name} on BOLDVAN`;
    const text = `I found this great solar product: ${product?.name} for ₦${product?.price.toLocaleString()}`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} - ${url}`)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied',
          description: 'Product link has been copied to clipboard.',
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    setShareDialogOpen(false);
  };

  // ============ HELPER FUNCTIONS ============
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getTotalPrice = () => {
    let total = product.price * quantity;
    if (deliveryPricing?.price) {
      total += deliveryPricing.price;
    }
    return total;
  };

  const qualifiesForFreeShipping = () => {
    const threshold = shopSettings?.freeShippingThreshold || 50000;
    return (product.price * quantity) >= threshold;
  };

  const getEstimatedDeliveryDate = () => {
    if (!deliveryPricing?.estimatedDays) return null;
    
    const days = deliveryPricing.estimatedDays.split('-').map(Number);
    const minDays = days[0] || 1;
    
    const date = new Date();
    date.setDate(date.getDate() + minDays);
    
    return date.toLocaleDateString('en-NG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
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
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  // ============ LOADING STATES ============
  if (productLoading || settingsLoading || sellerLoading) {
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
            Loading product details...
          </motion.p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
              <p className="text-slate-600 mb-6">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button 
                onClick={() => navigate('/shop')}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = [product.image, ...(product.images || [])].filter(Boolean);
  const averageRating = product.rating || 4.5;
  const reviewCount = reviews.length;

  return (
    <div className="w-full">
      {/* Hero Section - Full Width with Gradient */}
      <section className="relative h-[300px] overflow-hidden w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden w-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-teal-400/40 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [null, -200],
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

        {/* Breadcrumb */}
        <div className="relative w-full h-full">
          <div className="w-full h-full px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto h-full flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white"
              >
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <button
                    onClick={() => navigate('/')}
                    className="hover:text-teal-400 transition-colors"
                  >
                    Home
                  </button>
                  <ChevronRight className="h-4 w-4" />
                  <button
                    onClick={() => navigate('/shop')}
                    className="hover:text-teal-400 transition-colors"
                  >
                    Shop
                  </button>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-teal-400">{product.name}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-200">
                  Product Details
                </h1>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Full Width with Centered Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/shop')}
            className="group flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </motion.button>

          {/* Product Header */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImageIndex] || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600'}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600';
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`border-2 rounded-xl overflow-hidden transition-all ${
                        selectedImageIndex === idx 
                          ? 'border-teal-500 shadow-lg shadow-teal-500/20' 
                          : 'border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full aspect-square object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">
                    {product.category?.name || 'Solar Product'}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  {product.name}
                </motion.h1>
                <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
                  <StarRating rating={averageRating} size="lg" />
                  <span className="text-slate-600">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm text-slate-500">SKU: {product.sku}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Product SKU</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
                <motion.p variants={itemVariants} className="text-4xl font-bold text-teal-600 mb-6">
                  {formatNaira(product.price)}
                </motion.p>
                <motion.p variants={itemVariants} className="text-slate-600 leading-relaxed">
                  {product.description}
                </motion.p>
              </div>

              <Separator className="bg-slate-200" />

              {/* Quantity & Actions */}
              <motion.div variants={itemVariants} className="space-y-4">
                {/* Stock Status - FIXED: Using product.stock instead of product.inStock */}
                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {product.stock > 10 
                          ? 'In Stock' 
                          : `Only ${product.stock} left in stock`}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-700 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors text-lg font-bold"
                    >
                      -
                    </motion.button>
                    <span className="w-16 text-center font-bold text-lg text-slate-800">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors text-lg font-bold"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                {/* Delivery Location Selection - DATABASE DRIVEN */}
                {!locationsLoading && deliveryLocations.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-location" className="font-semibold text-slate-700">
                      Delivery Location <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedLocationId}
                      onValueChange={setSelectedLocationId}
                    >
                      <SelectTrigger id="delivery-location" className="w-full border-2 border-slate-200 rounded-xl focus:border-teal-500">
                        <SelectValue placeholder="Select your delivery location" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {deliveryLocations.map((location: any) => (
                          <SelectItem key={location.id} value={location.id}>
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{location.name}</span>
                              <span className="text-slate-500 ml-4 text-sm">
                                {location.baseFee > 0 
                                  ? formatNaira(location.baseFee) 
                                  : 'Free delivery'}
                                {' • '}{location.estimatedDays} days
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Delivery Method Selection - DATABASE DRIVEN */}
                {!methodsLoading && deliveryMethods.length > 0 && selectedLocationId && (
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">
                      Delivery Method <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={selectedMethodId}
                      onValueChange={setSelectedMethodId}
                      className="space-y-3"
                    >
                      {deliveryMethods.map((method: any) => {
                        const matchingLocation = deliveryLocations.find(
                          (l: any) => l.id === selectedLocationId
                        );
                        
                        // Find custom pricing for this location-method combination
                        const customMapping = method.locations?.find(
                          (m: any) => m.locationId === selectedLocationId
                        );
                        
                        const totalFee = customMapping?.customFee ?? 
                          (matchingLocation?.baseFee || 0) + (method.baseFee || 0);
                        const totalDays = customMapping?.customDays ?? 
                          `${parseInt(matchingLocation?.estimatedDays?.split('-')[0] || '0') + parseInt(method.estimatedDays?.split('-')[0] || '0')}-${parseInt(matchingLocation?.estimatedDays?.split('-')[1] || '0') + parseInt(method.estimatedDays?.split('-')[1] || '0')}`;
                        
                        return (
                          <motion.div
                            key={method.id}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-start space-x-3 border-2 border-slate-200 rounded-xl p-4 bg-white hover:border-teal-300 transition-colors"
                          >
                            <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                            <Label htmlFor={`method-${method.id}`} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium text-slate-900">{method.name}</span>
                                  <p className="text-sm text-slate-500 mt-1">{method.description}</p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Estimated delivery: {totalDays} business days
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-teal-600">
                                    {totalFee > 0 ? formatNaira(totalFee) : 'Free'}
                                  </span>
                                  {customMapping?.customFee && (
                                    <p className="text-xs text-slate-500 mt-1">Special rate</p>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </motion.div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}

                {/* Delivery Summary - DATABASE DRIVEN */}
                {deliveryPricing && selectedLocationId && selectedMethodId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-teal-50 to-teal-100/50 border border-teal-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-teal-500 rounded-lg">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-teal-900">Delivery Estimate</h4>
                        <p className="text-sm text-teal-700 mt-1">
                          {deliveryLocations.find((l: any) => l.id === selectedLocationId)?.name} • 
                          {deliveryMethods.find((m: any) => m.id === selectedMethodId)?.name}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-teal-800 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Arrives by {getEstimatedDeliveryDate()}
                          </span>
                          <span className="font-bold text-teal-900">
                            {deliveryPricing.price > 0 ? formatNaira(deliveryPricing.price) : 'Free delivery'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Order Total */}
                <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Order Total:</span>
                    <span className="text-2xl font-bold text-teal-600">
                      {formatNaira(getTotalPrice())}
                    </span>
                  </div>
                  {qualifiesForFreeShipping() && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-green-600 mt-2 flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Your order qualifies for free shipping!
                    </motion.p>
                  )}
                </div>

                {/* Action Buttons - FIXED: Removed !product.inStock from disabled condition */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || isAddingToCart}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 py-6 text-lg"
                      size="lg"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 h-5 w-5" />
                      )}
                      Add to Cart
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => addToWishlistMutation.mutate()}
                      disabled={addToWishlistMutation.isPending}
                      className="w-full border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 py-6 text-lg"
                    >
                      <Heart
                        className={`mr-2 h-5 w-5 ${
                          isInWishlist ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                      {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                    </Button>
                  </motion.div>
                </div>

                {/* Quick Contact Buttons */}
                <div className="flex gap-2 pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-500"
                      onClick={() => setContactDialogOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Order
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-500"
                      onClick={() => handleContactSeller('call')}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call to Order
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-4 border-2 border-slate-200 hover:border-teal-500"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Policies */}
              <motion.div
                variants={itemVariants}
                className="border-2 border-slate-200 rounded-xl p-4 space-y-3 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-slate-700">
                    {qualifiesForFreeShipping() 
                      ? '✓ Your order qualifies for free shipping!' 
                      : `Free shipping on orders over ${formatNaira(shopSettings?.freeShippingThreshold || 50000)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-slate-700">{shopSettings?.returnPolicy || '30-day return policy'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lock className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Secure checkout with Paystack & Flutterwave</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <Tabs defaultValue="details" className="mb-16">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger 
                value="details"
                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg transition-all"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg transition-all"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg transition-all"
              >
                Reviews ({reviewCount})
              </TabsTrigger>
              <TabsTrigger 
                value="seller"
                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-md rounded-lg transition-all"
              >
                Seller Info
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-6">
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="pt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-teal-600" />
                        Description
                      </h3>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    
                    {product.features && Object.keys(product.features).length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-teal-600" />
                          Key Features
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(product.features).map(([key, value]) => (
                            <motion.li
                              key={key}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg"
                            >
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-medium text-slate-800">{key}:</span>
                                <span className="text-slate-600 ml-1">{value as string}</span>
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="mt-6">
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="pt-6">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {Object.entries(product.specifications).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          className="border-b border-slate-200 pb-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <span className="text-sm text-slate-500 uppercase tracking-wider">{key}:</span>
                          <p className="font-medium text-slate-800 text-lg mt-1">{value as string}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      No specifications available for this product.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">Customer Reviews</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <StarRating rating={averageRating} size="lg" />
                          <span className="text-2xl font-bold text-slate-800">{averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-500">
                          Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setIsAddingReview(!isAddingReview)}
                        className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                      >
                        Write a Review
                      </Button>
                    </motion.div>
                  </div>

                  {/* Add Review Form */}
                  <AnimatePresence>
                    {isAddingReview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-8"
                      >
                        <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <Label className="block mb-3 text-slate-700 font-semibold">Your Rating</Label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                      key={star}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      type="button"
                                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                      className="focus:outline-none"
                                    >
                                      <Star
                                        className={`h-8 w-8 transition-all ${
                                          star <= reviewForm.rating
                                            ? 'fill-teal-400 text-teal-400'
                                            : 'text-slate-300'
                                        }`}
                                      />
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="review-comment" className="text-slate-700 font-semibold mb-2 block">
                                  Your Review
                                </Label>
                                <textarea
                                  id="review-comment"
                                  rows={4}
                                  value={reviewForm.comment}
                                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                  placeholder="Share your experience with this product..."
                                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                                />
                              </div>
                              <div className="flex gap-3">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button
                                    onClick={() => addReviewMutation.mutate()}
                                    disabled={addReviewMutation.isPending || !reviewForm.comment.trim()}
                                    className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                                  >
                                    {addReviewMutation.isPending ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Submit Review
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsAddingReview(false);
                                      setReviewForm({ rating: 5, comment: '' });
                                    }}
                                    className="border-2 border-slate-200 hover:border-slate-300"
                                  >
                                    Cancel
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                  ) : reviews.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      {reviews.map((review: any, index: number) => (
                        <motion.div
                          key={review.id}
                          variants={itemVariants}
                          whileHover={{ scale: 1.01, x: 5 }}
                          className="border-b border-slate-200 pb-6 last:border-0 p-4 bg-slate-50 rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-teal-400">
                                <AvatarImage src={review.user?.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                                  {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-slate-800">
                                  {review.user?.firstName} {review.user?.lastName}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <StarRating rating={review.rating} size="sm" />
                                  <span className="text-xs text-slate-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-NG', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-700 ml-11">{review.comment}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 mb-4">
                        <Star className="h-8 w-8 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No reviews yet</h3>
                      <p className="text-slate-600 mb-6">
                        Be the first to share your experience with this product
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setIsAddingReview(true)}
                          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                        >
                          Write a Review
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seller Info Tab */}
            <TabsContent value="seller" className="mt-6">
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="pt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start gap-6 mb-8"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <Package className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{sellerInfo?.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sellerInfo?.badges?.map((badge: string) => (
                          <Badge key={badge} variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                            <Award className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                  >
                    {[
                      { icon: <TrendingUp className="h-5 w-5" />, value: `${sellerInfo?.successRate || 100}%`, label: "Success Rate" },
                      { icon: <Users className="h-5 w-5" />, value: `${(sellerInfo?.totalSales || 1500).toLocaleString()}+`, label: "Products Sold" },
                      { icon: <Star className="h-5 w-5" />, value: sellerInfo?.rating || 4.9, label: "Seller Rating" },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl text-center border-2 border-slate-200"
                      >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-3">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-teal-600">{stat.value}</div>
                        <div className="text-sm text-slate-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 bg-slate-50 p-6 rounded-xl border-2 border-slate-200"
                  >
                    {[
                      { icon: <MapPin className="h-5 w-5" />, text: sellerInfo?.address || 'Lagos, Nigeria' },
                      { icon: <Phone className="h-5 w-5" />, text: sellerInfo?.phone || '08178363424' },
                      { icon: <MessageCircle className="h-5 w-5" />, text: `WhatsApp: ${sellerInfo?.whatsapp || '08178363424'}` },
                      { icon: <Mail className="h-5 w-5" />, text: sellerInfo?.email || 'sales@BOLDVANresources.com' },
                      { icon: <Clock className="h-5 w-5" />, text: `Response time: ${sellerInfo?.responseTime || '< 1 hour'}` },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                          {item.icon}
                        </div>
                        <span className="text-slate-700">{item.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-500 py-6"
                        onClick={() => handleContactSeller('call')}
                      >
                        <Phone className="mr-2 h-5 w-5" />
                        Call Seller
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6"
                        onClick={() => handleContactSeller('whatsapp')}
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        WhatsApp
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Products - DATABASE DRIVEN */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-8"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
                      Related Products
                    </span>
                  </h2>
                  <p className="text-slate-600">You might also like these</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/shop')}
                    className="border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-500"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {relatedProducts.map((related: any, index: number) => (
                  <motion.div
                    key={related.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                    onClick={() => navigate(`/product/${related.id}`)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                      <img
                        src={related.image || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'}
                        alt={related.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      {related.discount && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          -{related.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                        {related.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-teal-600">
                          {formatNaira(related.price)}
                        </span>
                        <Badge 
                          variant={related.stock > 0 ? 'default' : 'destructive'}
                          className={related.stock > 0 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {related.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Share Product</DialogTitle>
            <DialogDescription className="text-slate-600">
              Share this product with your friends and family
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              { platform: 'facebook', icon: <Facebook className="h-6 w-6" />, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
              { platform: 'twitter', icon: <Twitter className="h-6 w-6" />, color: 'text-sky-500', bg: 'bg-sky-50 hover:bg-sky-100' },
              { platform: 'whatsapp', icon: <MessageCircle className="h-6 w-6" />, color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
              { platform: 'email', icon: <Mail className="h-6 w-6" />, color: 'text-gray-600', bg: 'bg-gray-50 hover:bg-gray-100' },
            ].map((item) => (
              <motion.div
                key={item.platform}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`w-full flex flex-col items-center py-6 h-auto border-2 ${item.bg} hover:border-${item.color.split('-')[1]}-500`}
                  onClick={() => handleShare(item.platform)}
                >
                  <div className={`${item.color} mb-2`}>{item.icon}</div>
                  <span className="capitalize">{item.platform}</span>
                </Button>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="col-span-2"
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-500"
                onClick={() => handleShare('copy')}
              >
                <svg className="h-5 w-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
                <span className="text-teal-700">Copy Link</span>
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Contact Seller</DialogTitle>
            <DialogDescription className="text-slate-600">
              Choose how you'd like to place your order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Order Summary</Label>
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Product:</span>
                  <span className="text-sm font-medium text-slate-800">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Quantity:</span>
                  <span className="text-sm font-medium text-slate-800">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Subtotal:</span>
                  <span className="text-sm font-medium text-teal-600">{formatNaira(product.price * quantity)}</span>
                </div>
                {deliveryPricing && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Delivery:</span>
                    <span className="text-sm font-medium text-teal-600">
                      {deliveryPricing.price > 0 ? formatNaira(deliveryPricing.price) : 'Free'}
                    </span>
                  </div>
                )}
                <Separator className="bg-slate-200" />
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-slate-800">Total:</span>
                  <span className="font-bold text-xl text-teal-600">{formatNaira(getTotalPrice())}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-500 py-6"
                  onClick={() => handleContactSeller('call')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6"
                  onClick={() => handleContactSeller('whatsapp')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-center text-slate-500 mt-4">
              By contacting the seller, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage;