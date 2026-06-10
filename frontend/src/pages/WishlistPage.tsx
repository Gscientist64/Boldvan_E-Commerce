// frontend/src/pages/WishlistPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  Package,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  inStock: boolean;
  addedAt: string;
}

const WishlistPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itemToRemove, setItemToRemove] = useState<WishlistItem | null>(null);

  // Fetch wishlist items
  const { data: wishlist, isLoading, error, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // If endpoint doesn't exist yet, return empty array
          return [];
        }
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      return data.items || data || [];
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      return productId;
    },
    onSuccess: (productId) => {
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] | undefined) => 
        old?.filter(item => item.productId !== productId) || []
      );
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
      });
      setItemToRemove(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Clear wishlist mutation
  const clearWishlist = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }

      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(['wishlist'], []);
      toast({
        title: 'Wishlist cleared',
        description: 'All items have been removed from your wishlist.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    });
    
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleRemoveClick = (item: WishlistItem) => {
    setItemToRemove(item);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromWishlist.mutate(itemToRemove.productId);
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Wishlist</h2>
            <p className="text-gray-600 mb-4">{(error as Error).message}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wishlistItems = wishlist || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Heart className="h-8 w-8 fill-white" />
                My Wishlist
              </h1>
              <p className="text-pink-100">Items you've saved for later</p>
            </div>
            {wishlistItems.length > 0 && (
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => clearWishlist.mutate()}
                disabled={clearWishlist.isPending}
              >
                {clearWishlist.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Save items you love to your wishlist by clicking the heart icon on any product.
              </p>
              <Button onClick={() => navigate('/shop')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item: WishlistItem) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <div 
                  className="relative h-48 bg-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveClick(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                <div className="p-4">
                  <h3 
                    className="font-semibold text-lg mb-2 cursor-pointer hover:text-pink-600 line-clamp-2"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.name}
                  </h3>
                  <p className="text-2xl font-bold text-pink-600 mb-3">
                    {formatNaira(item.price)}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                      disabled={!item.inStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {!item.inStock && (
                    <Badge variant="destructive" className="mt-2 w-full justify-center">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToRemove?.name}" from your wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeFromWishlist.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WishlistPage;