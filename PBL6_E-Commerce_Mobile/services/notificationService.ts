import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  orderId?: string;
  message?: string;
  type?: string;
  [key: string]: any;
}

/**
 * Request notification permissions and get FCM token
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  try {
    console.log('📱 Requesting FCM permission...');
    
    // Request FCM permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('⚠️ FCM permission not granted');
      return undefined;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    console.log('✅ FCM Token received:', fcmToken.substring(0, 20) + '...');

    // Save token to AsyncStorage
    await AsyncStorage.setItem('fcm_token', fcmToken);

    // Setup Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Thông báo chính',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6347',
        sound: 'default',
      });
    }

    // Request local notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('⚠️ Local notification permission not granted');
    }

    console.log('✅ All notification permissions granted');
    return fcmToken;
  } catch (error) {
    console.error('❌ Error registering for push notifications:', error);
    return undefined;
  }
}

/**
 * Show system notification
 */
export async function showLocalNotification(
  title: string,
  body: string,
  data?: NotificationData
): Promise<string> {
  try {
    if (isExpoGo) {
      // Fallback to Alert in Expo Go
      console.log('📱 [Expo Go] Showing alert instead of system notification');
      Alert.alert(title, body, [{ text: 'OK' }]);
      return 'expo-go-alert';
    }

    // Show system notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Show immediately
    });
    
    console.log('📱 System notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Error showing notification:', error);
    // Fallback to Alert on error
    Alert.alert(title, body, [{ text: 'OK' }]);
    return 'fallback-alert';
  }
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (isExpoGo) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  if (isExpoGo) return 0;
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (isExpoGo) return;
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Add listener for when a notification is received
 */
export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): any {
  if (isExpoGo) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener(listener);
}

/**
 * Add listener for when user taps on a notification
 */
export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
): any {
  if (isExpoGo) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(listener);
}

/**
 * Setup FCM message handlers
 * Call this in App.tsx before rendering app
 */
export function setupFCMHandlers() {
  // Handle background messages (when app is in background or quit)
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📬 Background message received:', remoteMessage);
    
    // FCM will automatically show notification in background
    // This handler is for additional processing if needed
    if (remoteMessage.data) {
      console.log('📦 Message data:', remoteMessage.data);
    }
  });

  // Handle foreground messages (when app is open)
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('📬 Foreground message received:', remoteMessage);
    
    // Show local notification when app is in foreground
    if (remoteMessage.notification) {
      await showLocalNotification(
        remoteMessage.notification.title || 'Thông báo mới',
        remoteMessage.notification.body || '',
        remoteMessage.data
      );
    }
  });

  // Handle notification opened when app is in background
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📱 Notification opened (from background):', remoteMessage);
    // Handle navigation based on notification data
    if (remoteMessage.data?.orderId) {
      console.log('📦 Navigate to order:', remoteMessage.data.orderId);
      // Add navigation logic here
    }
  });

  // Check if app was opened from a notification (when app was quit)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📱 App opened from notification (quit state):', remoteMessage);
        // Handle navigation based on notification data
        if (remoteMessage.data?.orderId) {
          console.log('📦 Navigate to order:', remoteMessage.data.orderId);
          // Add navigation logic here
        }
      }
    });

  return unsubscribeForeground;
}

/**
 * Get saved FCM token from AsyncStorage
 */
export async function getSavedFCMToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('fcm_token');
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
}
