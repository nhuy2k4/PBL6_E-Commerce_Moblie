import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { configureGoogleSignIn } from '@/services/nativeGoogleAuth';
import { registerForPushNotificationsAsync, setupFCMHandlers } from '@/services/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Configure Google Sign-In on app start
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Setup FCM handlers on app start
  useEffect(() => {
    console.log('🔔 Setting up FCM handlers...');
    const unsubscribe = setupFCMHandlers();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Show FCM token in Alert on app start
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        Alert.alert('FCM Token', token);
      }
    });
  }, []);

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
    <AuthProvider>
      <CartProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="seller" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
