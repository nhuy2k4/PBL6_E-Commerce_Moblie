/**
 * ============================================
 * SAFE FCM SERVICE WITH ENVIRONMENT TOGGLE
 * ============================================
 * 
 * This service implements a production-ready pattern for conditionally
 * enabling Firebase Cloud Messaging in Expo apps.
 * 
 * KEY FEATURES:
 * 1. ✅ Safe for Expo Go (won't crash)
 * 2. ✅ Controlled by environment variable
 * 3. ✅ Lazy imports native modules only when needed
 * 4. ✅ Graceful fallback if FCM unavailable
 * 5. ✅ Full TypeScript support
 * 
 * WHY THIS PATTERN?
 * -----------------
 * @react-native-firebase/messaging requires native code.
 * If you import it at the top level, the app will crash in:
 * - Expo Go (doesn't have native modules)
 * - Any environment where Firebase isn't configured
 * 
 * SOLUTION:
 * ---------
 * 1. Use lazy imports: import('@react-native-firebase/messaging')
 * 2. Wrap in try/catch to handle missing modules
 * 3. Check environment variable before attempting import
 * 4. Detect Expo Go and automatically disable FCM
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Simple event emitter for FCM notifications (React Native compatible)
type NotificationCallback = (notification: any) => void;
const fcmListeners: NotificationCallback[] = [];

const fcmEventEmitter = {
  emit: (event: string, data: any) => {
    if (event === 'notification') {
      fcmListeners.forEach(callback => callback(data));
    }
  },
  on: (event: string, callback: NotificationCallback) => {
    if (event === 'notification') {
      fcmListeners.push(callback);
    }
  },
  off: (event: string, callback: NotificationCallback) => {
    if (event === 'notification') {
      const index = fcmListeners.indexOf(callback);
      if (index > -1) {
        fcmListeners.splice(index, 1);
      }
    }
  },
};

// Type definitions for Firebase Messaging (avoid top-level import)
type FirebaseMessagingTypes = typeof import('@react-native-firebase/messaging').default;
type RemoteMessage = import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage;

/**
 * Subscribe to FCM foreground notifications
 * This allows components to react to notifications received while app is active
 */
export function onFCMNotification(callback: (notification: any) => void): () => void {
  fcmEventEmitter.on('notification', callback);
  return () => fcmEventEmitter.off('notification', callback);
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Check if FCM is enabled via environment variable
 */
const isFCMEnabled = (): boolean => {
  const envValue = process.env.EXPO_PUBLIC_ENABLE_FCM;
  return envValue === 'true' || envValue === '1';
};

/**
 * Detect if running in Expo Go
 * Expo Go doesn't support native modules like Firebase
 */
const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

/**
 * Check if FCM should be active
 */
const shouldEnableFCM = (): boolean => {
  if (isExpoGo()) {
    console.log('⚠️ Running in Expo Go - FCM disabled');
    return false;
  }
  
  if (!isFCMEnabled()) {
    console.log('⚠️ FCM disabled by environment variable');
    return false;
  }
  
  return true;
};

// ============================================
// LAZY MODULE LOADING
// ============================================

/**
 * Lazy load Firebase Messaging module
 * This prevents crashes when native module is not available
 */
let messagingModule: FirebaseMessagingTypes | null = null;

async function getMessagingModule(): Promise<FirebaseMessagingTypes | null> {
  if (messagingModule) {
    return messagingModule;
  }

  if (!shouldEnableFCM()) {
    return null;
  }

  try {
    // Lazy import - only loads when actually needed
    const { default: messaging } = await import('@react-native-firebase/messaging');
    messagingModule = messaging;
    console.log('✅ Firebase Messaging module loaded');
    return messaging;
  } catch (error) {
    console.warn('⚠️ Firebase Messaging module not available:', error);
    return null;
  }
}

/**
 * Lazy load Expo Device module
 */
async function getDeviceModule() {
  try {
    return await import('expo-device');
  } catch (error) {
    console.warn('⚠️ expo-device not available:', error);
    return null;
  }
}

// ============================================
// DEVICE INFO
// ============================================

async function getDeviceInfo() {
  try {
    const DeviceModule = await getDeviceModule();
    
    let deviceId = 'unknown';
    
    if (DeviceModule) {
      // expo-device exports as named export, not default
      const Device = DeviceModule.default || DeviceModule;
      deviceId = 
        Device.deviceName ||
        Device.osInternalBuildId ||
        Constants.sessionId ||
        `${Platform.OS}_${Date.now()}`;
    } else {
      // Fallback if expo-device not available
      deviceId = Constants.sessionId || `${Platform.OS}_${Date.now()}`;
    }
    
    const deviceType = Platform.OS; // 'ios' or 'android'
    
    console.log('📱 Device info:', { deviceId, deviceType });
    return { deviceId, deviceType };
  } catch (error) {
    console.warn('⚠️ Error getting device info:', error);
    // Fallback
    return {
      deviceId: Constants.sessionId || `${Platform.OS}_${Date.now()}`,
      deviceType: Platform.OS,
    };
  }
}

// ============================================
// FCM PERMISSION
// ============================================

/**
 * Request FCM notification permission
 * Required on iOS, automatically granted on Android
 */
export async function requestFCMPermission(): Promise<boolean> {
  const messaging = await getMessagingModule();
  if (!messaging) {
    console.log('⚠️ FCM not available - skipping permission request');
    return false;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === 1 || // AuthorizationStatus.AUTHORIZED
      authStatus === 2;   // AuthorizationStatus.PROVISIONAL

    if (enabled) {
      console.log('✅ FCM permission granted');
      return true;
    }
    
    console.log('❌ FCM permission denied');
    return false;
  } catch (error) {
    console.error('❌ Error requesting FCM permission:', error);
    return false;
  }
}

// ============================================
// TOKEN REGISTRATION
// ============================================

/**
 * Register FCM token with backend
 */
export async function registerFCMToken(apiUrl: string): Promise<boolean> {
  const messaging = await getMessagingModule();
  if (!messaging) {
    console.log('⚠️ FCM not available - skipping token registration');
    return false;
  }

  try {
    console.log('📱 Registering FCM token...');
    
    // Get FCM token from Firebase
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      console.error('❌ Failed to get FCM token from Firebase');
      return false;
    }
    
    console.log('📱 FCM Token obtained:', fcmToken.substring(0, 20) + '...');

    // Get device info
    const { deviceId, deviceType } = await getDeviceInfo();
    console.log('📱 Device ID:', deviceId);
    console.log('📱 Device Type:', deviceType);

    // Get auth token (must match key used in authService.ts)
    const authToken = await AsyncStorage.getItem('access_token');
    console.log('🔑 Auth token check:', authToken ? 'Found' : 'Not found');
    if (!authToken) {
      console.log('⚠️ No auth token found, skipping backend registration');
      return false;
    }

    // Register with backend API
    const response = await fetch(`${apiUrl}/api/fcm/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fcmToken,
        deviceId,
        deviceType,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ FCM token registered with backend:', data);
      
      // Save token locally
      await AsyncStorage.setItem('fcmToken', fcmToken);
      await AsyncStorage.setItem('fcmDeviceId', deviceId);
      
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to register FCM token with backend:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    return false;
  }
}

/**
 * Unregister FCM token from backend
 */
export async function unregisterFCMToken(apiUrl: string): Promise<boolean> {
  if (!shouldEnableFCM()) {
    console.log('⚠️ FCM not enabled - skipping unregistration');
    return false;
  }

  try {
    console.log('🔓 Unregistering FCM token...');
    
    const authToken = await AsyncStorage.getItem('access_token');
    const deviceId = await AsyncStorage.getItem('fcmDeviceId');

    if (!authToken || !deviceId) {
      console.log('⚠️ No auth token or device ID found');
      return false;
    }

    const response = await fetch(`${apiUrl}/api/fcm/token/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      console.log('✅ FCM token unregistered from backend');
      
      // Clear local storage
      await AsyncStorage.removeItem('fcmToken');
      await AsyncStorage.removeItem('fcmDeviceId');
      
      return true;
    } else {
      console.error('❌ Failed to unregister FCM token:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error unregistering FCM token:', error);
    return false;
  }
}

// ============================================
// MESSAGE HANDLERS
// ============================================

/**
 * Handle notification tap navigation
 */
function handleNotificationTap(data: any, router?: any) {
  console.log('👆 Handling notification tap with data:', data);
  
  if (!data || !router) return;

  const { orderId, type } = data;

  if (orderId) {
    console.log('📍 Navigating to order:', orderId);
    // Implement your navigation logic here
    // Example: router.push(`/order/${orderId}`);
  }
}

/**
 * Setup FCM message handlers
 * Only sets up if FCM is available
 */
export async function setupFCMHandlers(router?: any): Promise<(() => void) | null> {
  const messaging = await getMessagingModule();
  if (!messaging) {
    console.log('⚠️ FCM not available - skipping handler setup');
    return null;
  }

  try {
    console.log('📬 Setting up FCM handlers...');

    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage: RemoteMessage) => {
      console.log('📩 Foreground FCM message:', JSON.stringify(remoteMessage, null, 2));
      
      const { notification, data } = remoteMessage;
      
      if (notification) {
        // Emit event instead of showing Alert
        // This allows the notification tab to catch and display it
        console.log('🔔 Emitting FCM notification to app:', notification.title);
        fcmEventEmitter.emit('notification', {
          title: notification.title || 'Thông báo',
          body: notification.body || '',
          data: data || {},
          timestamp: Date.now(),
        });
      }
    });

    // Handle notification tap (app in background)
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage: RemoteMessage) => {
      console.log('📬 Notification opened app (background):', JSON.stringify(remoteMessage, null, 2));
      handleNotificationTap(remoteMessage.data, router);
    });

    // Check if app was opened from notification (when app was quit)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📬 App opened from notification (quit state):', JSON.stringify(remoteMessage, null, 2));
          handleNotificationTap(remoteMessage.data, router);
        }
      });

    console.log('✅ FCM handlers set up successfully');

    // Return cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpened();
    };
  } catch (error) {
    console.error('❌ Error setting up FCM handlers:', error);
    return null;
  }
}

/**
 * Setup background message handler
 * MUST be called at top level, outside of components
 */
export async function setupBackgroundHandler(): Promise<void> {
  const messaging = await getMessagingModule();
  if (!messaging) {
    console.log('⚠️ FCM not available - skipping background handler');
    return;
  }

  try {
    messaging().setBackgroundMessageHandler(async (remoteMessage: RemoteMessage) => {
      console.log('📦 Background FCM message:', JSON.stringify(remoteMessage, null, 2));
      // Handle background message processing here
    });
    console.log('✅ Background handler set up');
  } catch (error) {
    console.error('❌ Error setting up background handler:', error);
  }
}

// ============================================
// MAIN INITIALIZATION
// ============================================

/**
 * Initialize FCM
 * Safe to call in any environment - will gracefully skip if not available
 * 
 * @param apiUrl - Backend API URL
 * @param router - Optional router for navigation
 * @returns Promise<boolean> - true if FCM initialized successfully
 */
export async function initializeFCM(apiUrl: string, router?: any): Promise<boolean> {
  console.log('🚀 initializeFCM called');
  console.log('   Environment: Expo Go?', isExpoGo());
  console.log('   FCM Enabled?', isFCMEnabled());
  
  if (!shouldEnableFCM()) {
    console.log('⚠️ FCM initialization skipped (disabled or not available)');
    return false;
  }

  try {
    console.log('🔥 Starting FCM initialization...');
    
    // Request permission
    const hasPermission = await requestFCMPermission();
    if (!hasPermission) {
      console.log('⚠️ FCM permission not granted - initialization aborted');
      return false;
    }

    // Setup message handlers
    await setupFCMHandlers(router);
    
    // Register token with backend
    const registered = await registerFCMToken(apiUrl);
    
    if (registered) {
      console.log('✅ FCM initialized successfully!');
    } else {
      console.log('⚠️ FCM initialized but token registration failed');
    }
    
    return registered;
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
    return false;
  }
}

/**
 * Refresh FCM token (call after login)
 */
export async function refreshFCMToken(apiUrl: string): Promise<void> {
  if (!shouldEnableFCM()) {
    console.log('⚠️ FCM not enabled - skipping token refresh');
    return;
  }

  try {
    console.log('🔄 Refreshing FCM token...');
    await registerFCMToken(apiUrl);
  } catch (error) {
    console.error('❌ Error refreshing FCM token:', error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if FCM is currently active
 */
export function isFCMActive(): boolean {
  return shouldEnableFCM();
}

/**
 * Get FCM status for debugging
 */
export async function getFCMStatus(): Promise<{
  enabled: boolean;
  expoGo: boolean;
  moduleAvailable: boolean;
  hasToken: boolean;
}> {
  const messaging = await getMessagingModule();
  const fcmToken = await AsyncStorage.getItem('fcmToken');
  
  return {
    enabled: isFCMEnabled(),
    expoGo: isExpoGo(),
    moduleAvailable: messaging !== null,
    hasToken: !!fcmToken,
  };
}
