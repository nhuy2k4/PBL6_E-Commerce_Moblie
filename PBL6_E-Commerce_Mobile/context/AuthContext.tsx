import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin } from '../services/authService';
import { getCurrentUser } from '../services/userService';
import { clearCartOnLogout, refreshCartOnLogin } from '@/context/CartContext';
import type { User } from '../types';

// Đã migrate User type từ shared/types sang types/index.ts

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Try to get user info from API
          const userData = await getCurrentUser(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid token
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin({ username, password });
      await AsyncStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      setUser(response.user);
      await refreshCartOnLogin.refresh();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // These functions now just receive token and set user/token state
  const loginWithGoogle = async (idToken: string) => {
    // Gọi API xác thực Google ở component, truyền accessToken vào đây
    await AsyncStorage.setItem('token', idToken);
    setUser({ id: 0, username: '', email: '', role: 'BUYER' }); // TODO: Lấy user thực tế từ backend
    await refreshCartOnLogin.refresh();
  };

  const loginWithFacebook = async (accessToken: string) => {
    // Gọi API xác thực Facebook ở component, truyền accessToken vào đây
    await AsyncStorage.setItem('token', accessToken);
    setUser({ id: 0, username: '', email: '', role: 'BUYER' }); // TODO: Lấy user thực tế từ backend
    await refreshCartOnLogin.refresh();
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      setUser(null);
      // Clear cart data when user logs out
      clearCartOnLogout.clear();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithFacebook,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
