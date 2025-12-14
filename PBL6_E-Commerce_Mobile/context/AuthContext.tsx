import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin } from '../services/authService';
import { getCurrentUser } from '../services/userService';
import { clearCartOnLogout, refreshCartOnLogin } from '@/context/CartContext';
import { getSavedFCMToken, saveFCMTokenToBackend } from '@/services/fcmService';
import { registerForPushNotificationsAsync } from '@/services/notificationService';
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
    // Check if user is already logged in with retry logic
    const checkAuth = async () => {
      const maxRetries = 3;
      let retryCount = 0;
      
      try {
        console.log('🔐 Checking auth on app start...');
        const token = await AsyncStorage.getItem('token');
        console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'null');
        
        if (token) {
          console.log('✅ Token found, fetching user data...');
          
          // Retry logic for network issues
          while (retryCount < maxRetries) {
            try {
              // Try to get user info from API (no need to pass token, it's from AsyncStorage)
              const userData = await getCurrentUser();
              console.log('👤 User data received:', userData);
              
              // Only set user if userData is valid (has id)
              if (userData && userData.id) {
                console.log('✅ Valid user data, setting user:', userData.username);
                setUser(userData);
                break; // Success, exit retry loop
              } else {
                console.warn('⚠️ Invalid user data');
                // Invalid data from backend - this is not a network error
                // Clear token only if we got a response but it's invalid
                setUser(null);
                await AsyncStorage.removeItem('token');
                break;
              }
            } catch (error: any) {
              retryCount++;
              console.warn(`⚠️ Attempt ${retryCount}/${maxRetries} failed:`, error.message);
              
              if (retryCount < maxRetries) {
                // Wait before retry (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              } else {
                // Max retries reached - keep token but set user to null
                // User can manually retry by pulling to refresh
                console.error('❌ Max retries reached, keeping token for later retry');
                setUser(null);
              }
            }
          }
        } else {
          console.log('❌ No token found, user not logged in');
          setUser(null);
        }
      } catch (error) {
        console.error('💥 Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 Auth check complete');
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 Logging in user:', username);
      const response = await apiLogin({ username, password });
      
      console.log('✅ Login successful, saving tokens...');
      await AsyncStorage.setItem('token', response.accessToken);
      console.log('💾 Access token saved');
      
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
        console.log('💾 Refresh token saved');
      }
      
      console.log('👤 Setting user:', response.user);
      setUser(response.user);
      
      await refreshCartOnLogin.refresh();
      console.log('🛒 Cart refreshed');
      
      // Get or register FCM token and save to backend after successful login
      try {
        console.log('📱 Getting FCM token...');
        let fcmToken = await getSavedFCMToken();
        
        // If no saved token, register for push notifications
        if (!fcmToken) {
          console.log('📱 No saved FCM token, registering...');
          fcmToken = await registerForPushNotificationsAsync();
        }
        
        if (fcmToken && response.user?.id) {
          console.log('📱 Saving FCM token to backend...');
          const saved = await saveFCMTokenToBackend(fcmToken, response.user.id);
          if (saved) {
            console.log('✅ FCM token saved to backend');
          } else {
            console.warn('⚠️ Failed to save FCM token to backend');
          }
        } else {
          console.warn('⚠️ No FCM token or user ID available');
        }
      } catch (fcmError) {
        console.warn('⚠️ Failed to save FCM token after login:', fcmError);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      throw error;
    }
  };

  // These functions now just receive token and set user/token state
  const loginWithGoogle = async (idToken: string) => {
    // Gọi API xác thực Google ở component, truyền accessToken vào đây
    await AsyncStorage.setItem('token', idToken);
    // TODO: Lấy user thực tế từ backend bằng idToken, không hardcode user
    setUser(null);
    await refreshCartOnLogin.refresh();
  };

  const loginWithFacebook = async (accessToken: string) => {
    // Gọi API xác thực Facebook ở component, truyền accessToken vào đây
    await AsyncStorage.setItem('token', accessToken);
    // TODO: Lấy user thực tế từ backend bằng accessToken, không hardcode user
    setUser(null);
    await refreshCartOnLogin.refresh();
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      console.log('🗑️ Tokens removed from storage');
      setUser(null);
      // Clear cart data when user logs out
      clearCartOnLogout.clear();
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('💥 Logout error:', error);
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
