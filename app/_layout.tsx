import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { configureGoogleSignIn } from '@/services/nativeGoogleAuth';
import { initializeFCM, setupBackgroundHandler, isFCMActive, getFCMStatus, refreshFCMToken } from '@/services/fcmService';
import AsyncStorage from '@react-native-async-storage/async-storage';



// Setup FCM background handler (safe - checks internally if FCM is enabled)
setupBackgroundHandler();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  console.log('🎬 RootLayout mounted');
  console.log('📱 FCM Active:', isFCMActive());

  // Configure Google Sign-In on app start
  useEffect(() => {
    console.log('🔧 Configuring Google Sign-In...');
    configureGoogleSignIn();
  }, []);

  // Initialize FCM for push notifications
  useEffect(() => {
    const initFCM = async () => {
      try {
        // Get API URL from environment
        const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '').replace(/\/$/, '') || 'http://localhost:8081';
        
        // Log FCM status for debugging
        const status = await getFCMStatus();
        console.log('🔍 FCM Status:', status);
        
        console.log('🔥 Starting FCM initialization...');
        
        // Initialize FCM (safe - won't crash even if running in Expo Go or FCM disabled)
        const success = await initializeFCM(apiUrl, router);
        
        if (success) {
          console.log('✅ FCM initialized successfully - ready to receive notifications');
        } else {
          console.log('⚠️ FCM not initialized (this is OK if disabled or in Expo Go)');
          
          // If FCM init failed due to no auth token, check if user is already logged in
          // and retry registration
          const authToken = await AsyncStorage.getItem('access_token');
          if (authToken) {
            console.log('🔄 User already logged in, retrying FCM token registration...');
            await refreshFCMToken(apiUrl);
          }
        }
      } catch (error) {
        // This should never happen due to internal error handling
        console.error('❌ Unexpected error in FCM initialization:', error);
      }
    };
    
    initFCM();
  }, [router]);

  // Handle deep links for payment results
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('🔗 Deep link received in RootLayout:', url);

      if (url.includes('payment-result')) {
        // Parse query params
        const urlObj = new URL(url);
        const resultCode = urlObj.searchParams.get('resultCode');
        const message = urlObj.searchParams.get('message');

        console.log('💳 Payment result:', { resultCode, message });

        // Navigate based on where payment came from
        // For now, just go to home and let screens handle with useFocusEffect
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="seller" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
