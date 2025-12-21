import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as cartService from '../services/cartService';
import { Cart } from '@/types';

interface CartContextType {
  cart: Cart | null;
  items: any[];
  isLoading: boolean;
  getTotalPrice: () => number;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Register clear and refresh functions for auth integration
  useEffect(() => {
    clearCartOnLogout.set(() => {
      console.log('🧹 Clearing cart on logout');
      setCart({ items: [], totalAmount: 0, totalItems: 0 } as any);
    });

    refreshCartOnLogin.set(async () => {
      console.log('🔄 Refreshing cart on login');
      await refreshCart();
    });
  }, []);

  const getStoredToken = async (): Promise<string | null> => {
    return (await AsyncStorage.getItem('access_token')) || (await AsyncStorage.getItem('token'));
  };

  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const token = await getStoredToken();
      if (token) {
        const cartData = await cartService.getCart();
        setCart(cartData);
      } else {
        setCart({ items: [], totalAmount: 0, totalItems: 0 } as any);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], totalAmount: 0, totalItems: 0 } as any);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initCart = async () => {
      try {
        setIsLoading(true);
        const token = await getStoredToken();
        if (token) {
          console.log('User logged in, fetching cart from database...');
          const cartData = await cartService.getCart();
          console.log('Cart data from database:', cartData);
          setCart(cartData);
        } else {
          console.log('User not logged in, using empty cart');
          setCart({ items: [], totalAmount: 0, totalItems: 0 } as any);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCart({ items: [], totalAmount: 0, totalItems: 0 } as any);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, []);

  const addToCart = async (productVariantId: number, quantity: number = 1) => {
    try {
      const token = await getStoredToken();
      if (!token) throw new Error('User not logged in');
      await cartService.addToCart(productVariantId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const token = await getStoredToken();
      if (!token) throw new Error('User not logged in');
      await cartService.updateCartItem(cartItemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const token = await getStoredToken();
      if (!token) throw new Error('User not logged in');
      await cartService.removeFromCart(cartItemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const token = await getStoredToken();
      if (!token) throw new Error('User not logged in');
      await cartService.clearCart();
      setCart({ items: [], totalAmount: 0, totalItems: 0 } as any);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        isLoading,
        getTotalPrice: () => cart?.totalAmount || 0,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Export functions for auth integration
export const clearCartOnLogout = (() => {
  let clearFn: (() => void) | null = null;
  return {
    set: (fn: () => void) => { clearFn = fn; },
    clear: () => { if (clearFn) clearFn(); }
  };
})();

export const refreshCartOnLogin = (() => {
  let refreshFn: (() => Promise<void>) | null = null;
  return {
    set: (fn: () => Promise<void>) => { refreshFn = fn; },
    refresh: async () => { if (refreshFn) await refreshFn(); }
  };
})();

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
