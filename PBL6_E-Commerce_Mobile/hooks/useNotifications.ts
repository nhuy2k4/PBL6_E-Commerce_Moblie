import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerForPushNotificationsAsync,
  addNotificationResponseReceivedListener,
  getSavedFCMToken
} from '../services/notificationService';
import { saveFCMTokenToBackend } from '../services/fcmService';

// Type definitions
interface Notification {
  id: string;
  type: string;
  message: string;
  orderId?: number;
  read: boolean;
  timestamp: number;
  receivedAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isConnected: boolean;
  connected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (notificationId: string) => void;
  unreadCount: number;
}

/**
 * Custom hook to manage notifications with FCM
 */
export function useNotifications(userId?: number, role: 'BUYER' | 'SELLER' = 'BUYER'): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(true); // Always connected with FCM

  // Request notification permissions and save token to backend
  useEffect(() => {
    if (!userId) return;

    const setupNotifications = async () => {
      try {
        // Register for push notifications and get FCM token
        const fcmToken = await registerForPushNotificationsAsync();
        
        if (fcmToken) {
          // Save FCM token to backend (ignore errors if user not logged in yet)
          const saved = await saveFCMTokenToBackend(fcmToken, userId);
          if (saved) {
            console.log('✅ FCM token saved to backend');
            setIsConnected(true);
          } else {
            console.warn('⚠️ Failed to save FCM token to backend (will retry after login)');
            // Still set connected to true since FCM token was obtained
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error('❌ Failed to setup notifications:', err);
        // Don't set isConnected to false if only backend save failed
        setIsConnected(true);
      }
    };

    setupNotifications();

    // Listen for notification taps
    const subscription = addNotificationResponseReceivedListener(response => {
      console.log('📱 User tapped notification:', response);
      const data = response.notification.request.content.data;
      if (data?.orderId) {
        console.log('📦 Navigate to order:', data.orderId);
        // Add navigation logic here if needed
      }
    });

    return () => subscription.remove();
  }, [userId]);

  // Load notifications from AsyncStorage
  useEffect(() => {
    loadNotifications();
  }, [userId, role]);

  const loadNotifications = async () => {
    try {
      const key = `notifications_${role}_${userId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        console.log(`📱 Loaded ${parsed.length} notifications from storage`);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };

  // Save notifications to AsyncStorage
  useEffect(() => {
    if (notifications.length > 0) {
      saveNotifications();
    }
  }, [notifications]);

  const saveNotifications = async () => {
    try {
      const key = `notifications_${role}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(notifications));
    } catch (error) {
      console.error('❌ Error saving notifications:', error);
    }
  };

  // Helper function to get notification title based on type
  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'ORDER_CONFIRMED':
        return '✅ Đơn hàng đã xác nhận';
      case 'ORDER_SHIPPING':
        return '🚚 Đơn hàng đang giao';
      case 'ORDER_DELIVERED':
        return '📦 Đơn hàng đã giao';
      case 'ORDER_CANCELLED':
        return '❌ Đơn hàng đã hủy';
      case 'PAYMENT_SUCCESS':
        return '💰 Thanh toán thành công';
      case 'PAYMENT_FAILED':
        return '⚠️ Thanh toán thất bại';
      default:
        return '🔔 Thông báo mới';
    }
  };

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      const key = `notifications_${role}_${userId}`;
      await AsyncStorage.removeItem(key);
      console.log('🗑️ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }, [userId, role]);

  // Delete single notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    isConnected,
    connected: isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    unreadCount,
  };
}

export default useNotifications;
