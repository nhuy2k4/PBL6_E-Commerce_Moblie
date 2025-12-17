/**
 * FCM Service for React Native Firebase
 * Handles FCM token registration and push notifications
 */

import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { API_URL } from '../constants/config';

/**
 * Request FCM permission (iOS requires this)
 */
export async function requestFCMPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ FCM Authorization status:', authStatus);
      return true;
    }
    
    console.log('❌ FCM permission denied');
    return false;
  } catch (error) {
    console.error('❌ Error requesting FCM permission:', error);
    return false;
  }
}

/**
 * Get device information
 */
function getDeviceInfo() {
  const deviceId = 
    Device.deviceName ||
    Device.osInternalBuildId ||
    Constants.sessionId ||
    'unknown';
    
  const deviceType = Platform.OS; // 'ios' or 'android'
  
  return { deviceId, deviceType };
}

/**
 * Register FCM token with backend
 */
export async function registerFCMToken(): Promise<boolean> {
  try {
    console.log('📱 Registering FCM token...');
    
    // Get FCM token
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      console.error('❌ Failed to get FCM token');
      return false;
    }
    
    console.log('📱 FCM Token obtained:', fcmToken.substring(0, 20) + '...');

    // Get device info
    const { deviceId, deviceType } = getDeviceInfo();
    console.log('📱 Device ID:', deviceId);
    console.log('📱 Device Type:', deviceType);

    // Get auth token
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      console.log('⚠️ No auth token found, skipping FCM registration');
      return false;
    }

    // Register with backend
    const response = await fetch(`${API_URL}/api/fcm/token`, {
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
      console.error('❌ Failed to register FCM token:', response.status, errorText);
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
export async function unregisterFCMToken(): Promise<boolean> {
  try {
    console.log('🔓 Unregistering FCM token...');
    
    const authToken = await AsyncStorage.getItem('authToken');
    const deviceId = await AsyncStorage.getItem('fcmDeviceId');

    if (!authToken || !deviceId) {
      console.log('⚠️ No auth token or device ID found');
      return false;
    }

    const response = await fetch(`${API_URL}/api/fcm/token/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      console.log('✅ FCM token unregistered');
      
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

/**
 * Setup FCM message handlers
 */
export function setupFCMHandlers(navigation?: any) {
  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('📩 Foreground FCM message:', JSON.stringify(remoteMessage, null, 2));
    
    const { notification, data } = remoteMessage;
    
    if (notification) {
      // Show alert when app is in foreground
      Alert.alert(
        notification.title || 'Thông báo',
        notification.body || '',
        [
          {
            text: 'Đóng',
            style: 'cancel',
          },
          {
            text: 'Xem',
            onPress: () => handleNotificationTap(data, navigation),
          },
        ]
      );
    }
  });

  // Handle notification tap (app in background/quit state)
  const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📬 Notification opened app (background):', JSON.stringify(remoteMessage, null, 2));
    handleNotificationTap(remoteMessage.data, navigation);
  });

  // Check if app was opened from a notification (when app was closed)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('📬 App opened from notification (quit state):', JSON.stringify(remoteMessage, null, 2));
        handleNotificationTap(remoteMessage.data, navigation);
      }
    });

  // Return cleanup function
  return () => {
    unsubscribeForeground();
    unsubscribeNotificationOpened();
  };
}

/**
 * Handle notification tap navigation
 */
function handleNotificationTap(data: any, navigation?: any) {
  console.log('👆 Handling notification tap with data:', data);
  
  if (!data || !navigation) return;

  const { orderId, type } = data;

  if (orderId) {
    // Navigate to order detail
    console.log('📍 Navigating to order detail:', orderId);
    
    // Adjust navigation path based on your app structure
    // Example for Expo Router:
    // router.push(`/order/${orderId}`);
    
    // Example for React Navigation:
    // navigation.navigate('OrderDetail', { orderId });
    
    // For now, just log
    console.log('⚠️ Navigation not implemented - add your navigation logic here');
  }
}

/**
 * Handle background messages (data-only messages)
 */
export function setupBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📦 Background FCM message:', JSON.stringify(remoteMessage, null, 2));
    // Handle data-only message processing here
  });
}

/**
 * Initialize FCM
 * Call this on app start
 */
export async function initializeFCM(navigation?: any): Promise<boolean> {
  try {
    console.log('🚀 Initializing FCM...');
    
    // Request permission
    const hasPermission = await requestFCMPermission();
    if (!hasPermission) {
      console.log('⚠️ FCM permission not granted');
      return false;
    }

    // Setup handlers
    setupFCMHandlers(navigation);
    
    // Register token
    const registered = await registerFCMToken();
    
    if (registered) {
      console.log('✅ FCM initialized successfully');
    } else {
      console.log('⚠️ FCM token registration failed');
    }
    
    return registered;
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
    return false;
  }
}

/**
 * Refresh FCM token (call on login)
 */
export async function refreshFCMToken(): Promise<void> {
  try {
    console.log('🔄 Refreshing FCM token...');
    await registerFCMToken();
  } catch (error) {
    console.error('❌ Error refreshing FCM token:', error);
  }
}
