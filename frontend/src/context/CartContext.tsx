// frontend/src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  deliveryLocationId?: string;
  deliveryMethodId?: string;
  deliveryFee?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  updateDeliveryOptions: (productId: string, locationId: string, methodId: string, fee: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  itemCount: number;
  subtotal: number;
  deliveryTotal: number;
  total: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getAuthToken = () => localStorage.getItem('token');

  // Load cart on mount and when auth changes
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setIsLoading(true);
    const token = getAuthToken();

    try {
      if (token) {
        // Load from backend
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        } else {
          // Fallback to localStorage
          loadGuestCart();
        }
      } else {
        // Load from localStorage for guest
        loadGuestCart();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      loadGuestCart();
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuestCart = () => {
    const guestCart = localStorage.getItem('guestCart');
    if (guestCart) {
      setItems(JSON.parse(guestCart));
    } else {
      setItems([]);
    }
  };

  const saveGuestCart = (cartItems: CartItem[]) => {
    localStorage.setItem('guestCart', JSON.stringify(cartItems));
    setItems(cartItems);
  };

  // In CartContext.tsx, update the addToCart function to handle both formats:

const addToCart = async (item: any) => {  // Use 'any' temporarily for flexibility
  const token = getAuthToken();
  
  // Handle both id and productId formats
  const productId = item.productId || item.id;
  
  console.log('Adding to cart - received item:', item);
  console.log('Extracted productId:', productId);

  // Validate productId
  if (!productId) {
    console.error('Product ID is missing!');
    toast({
      title: 'Error',
      description: 'Product ID is missing',
      variant: 'destructive',
    });
    return;
  }

  // Create a normalized cart item
  const normalizedItem: CartItem = {
    productId: productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
    image: item.image,
    sku: item.sku,
    deliveryLocationId: item.deliveryLocationId,
    deliveryMethodId: item.deliveryMethodId,
    deliveryFee: item.deliveryFee
  };

  console.log('Normalized item:', normalizedItem);

  if (token) {
    // Add to backend
    try {
      const requestBody = {
        productId: normalizedItem.productId,
        quantity: normalizedItem.quantity,
        deliveryLocationId: normalizedItem.deliveryLocationId || null,
        deliveryMethodId: normalizedItem.deliveryMethodId || null,
        deliveryFee: normalizedItem.deliveryFee || 0
      };
      
      console.log('Sending request to backend:', requestBody);

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to add to cart: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      // Refresh cart
      await loadCart();
      
      toast({
        title: 'Added to cart',
        description: `${normalizedItem.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  } else {
    // Add to guest cart
    const existingItem = items.find(i => i.productId === normalizedItem.productId);
    let newItems: CartItem[];

    if (existingItem) {
      newItems = items.map(i =>
        i.productId === normalizedItem.productId
          ? { ...i, quantity: i.quantity + normalizedItem.quantity }
          : i
      );
    } else {
      newItems = [...items, normalizedItem];
    }

    saveGuestCart(newItems);
    toast({
      title: 'Added to cart',
      description: `${normalizedItem.name} has been added to your cart.`,
    });
  }
};

const removeFromCart = async (productId: string) => {
  const token = getAuthToken();
  console.log('Removing from cart - productId:', productId);

  if (token) {
    try {
      // Find the cart item that contains this product
      const currentItem = items.find(item => item.productId === productId);
      
      if (!currentItem) {
        console.error('Cart item not found for product:', productId);
        throw new Error('Cart item not found');
      }

      if (!currentItem.id) {
        console.error('Cart item has no ID:', currentItem);
        throw new Error('Cart item has no ID');
      }

      console.log('Found cart item with ID:', currentItem.id);

      const response = await fetch(`${API_BASE_URL}/cart/item/${currentItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Remove item response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Remove item error response:', errorData);
        throw new Error('Failed to remove item');
      }

      // Refresh cart
      await loadCart();
      
      toast({
        title: 'Removed from cart',
        description: `${currentItem.name} has been removed from your cart.`,
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  } else {
    // Guest cart logic
    const newItems = items.filter(i => i.productId !== productId);
    saveGuestCart(newItems);
    toast({
      title: 'Removed from cart',
      description: 'Item has been removed from your cart.',
    });
  }
};

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
  
    const token = getAuthToken();
    console.log('Updating quantity - productId:', productId, 'quantity:', quantity);
  
    if (token) {
      try {
        // Find the cart item that contains this product
        const currentItem = items.find(item => item.productId === productId);
        
        if (!currentItem) {
          console.error('Cart item not found for product:', productId);
          throw new Error('Cart item not found');
        }
  
        if (!currentItem.id) {
          console.error('Cart item has no ID:', currentItem);
          throw new Error('Cart item has no ID');
        }
  
        console.log('Found cart item with ID:', currentItem.id);
  
        // Use the cart item ID in the URL, not the product ID
        const response = await fetch(`${API_BASE_URL}/cart/item/${currentItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
  
        console.log('Update quantity response status:', response.status);
  
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Update quantity error response:', errorData);
          throw new Error(`Failed to update quantity: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Update quantity success:', data);
        
        // Refresh cart to get updated data
        await loadCart();
        
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast({
          title: 'Error',
          description: 'Failed to update quantity',
          variant: 'destructive',
        });
      }
    } else {
      // Guest cart logic - update localStorage
      const newItems = items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveGuestCart(newItems);
    }
  };

  const updateDeliveryOptions = async (
    productId: string, 
    locationId: string, 
    methodId: string, 
    fee: number
  ) => {
    const token = getAuthToken();

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/item/${productId}/delivery`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            deliveryLocationId: locationId,
            deliveryMethodId: methodId,
            deliveryFee: fee
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update delivery options');
        }

        await loadCart();
      } catch (error) {
        console.error('Error updating delivery options:', error);
        toast({
          title: 'Error',
          description: 'Failed to update delivery options',
          variant: 'destructive',
        });
      }
    } else {
      const newItems = items.map(i =>
        i.productId === productId
          ? { 
              ...i, 
              deliveryLocationId: locationId, 
              deliveryMethodId: methodId, 
              deliveryFee: fee 
            }
          : i
      );
      saveGuestCart(newItems);
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to clear cart');
        }

        setItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear cart',
          variant: 'destructive',
        });
      }
    } else {
      localStorage.removeItem('guestCart');
      setItems([]);
    }
  };

  // Merge guest cart with user cart after login
  const mergeGuestCart = async () => {
    const token = getAuthToken();
    const guestCart = localStorage.getItem('guestCart');

    if (token && guestCart) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/merge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ guestCart: JSON.parse(guestCart) })
        });

        if (response.ok) {
          localStorage.removeItem('guestCart');
          await loadCart();
        }
      } catch (error) {
        console.error('Error merging cart:', error);
      }
    }
  };

  // Expose merge function to be called after login
  (window as any).mergeGuestCart = mergeGuestCart;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryTotal = items.reduce((sum, item) => sum + (item.deliveryFee || 0), 0);
  const total = subtotal + deliveryTotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Get cart count function
  const getCartCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateDeliveryOptions,
        clearCart,
        getCartCount,
        itemCount,
        subtotal,
        deliveryTotal,
        total,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};