import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_CONFIG } from '../constants/config';
import { 
  showLocalNotification, 
  registerForPushNotificationsAsync,
  addNotificationResponseReceivedListener 
} from '../services/notificationService';
import { onFCMNotification } from '../services/fcmService';

// Polyfill for React Native
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Generate unique ID for each connection
const generateClientId = () => Math.random().toString(36).substring(2, 11);

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
 * Custom hook to manage notifications with WebSocket using SockJS
 */
export function useNotifications(userId?: number, role: 'BUYER' | 'SELLER' = 'BUYER'): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const clientIdRef = useRef(generateClientId());

  // Request notification permissions on mount
  useEffect(() => {
    registerForPushNotificationsAsync().catch(err => 
      console.error('❌ Failed to register for push notifications:', err)
    );

    // Listen for notification taps
    const subscription = addNotificationResponseReceivedListener(response => {
      console.log('📱 User tapped notification:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      if (data?.orderId) {
        console.log('📦 Navigate to order:', data.orderId);
        // Add navigation logic here if needed
      }
    });

    return () => subscription.remove();
  }, []);

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

  // Connect to WebSocket using SockJS
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping WebSocket connection');
      return;
    }

    const clientId = clientIdRef.current;
    console.log(`🔌 [${role}] [${clientId}] Connecting to WebSocket for user: ${userId}`);

    // Get JWT token for authentication
    let authToken: string | null = null;
    
    const initializeConnection = async () => {
      try {
        authToken = await AsyncStorage.getItem('access_token');
        
        if (!authToken) {
          console.error('❌ No auth token found, cannot connect to WebSocket');
          return;
        }

        console.log('🔑 Auth token retrieved for WebSocket connection');

        // Get base URL and construct SockJS endpoint with token
        const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
        const sockJsUrl = `${baseUrl}/ws?token=${authToken}`;
        
        console.log(`🔌 Base URL: ${API_CONFIG.BASE_URL}`);
        console.log(`🔌 SockJS URL: ${baseUrl}/ws?token=***`);

        // Create STOMP client with SockJS
        const client = new Client({
          webSocketFactory: () => new SockJS(sockJsUrl) as any,
          connectHeaders: {
            'Authorization': `Bearer ${authToken}`,
          },
          debug: (str) => {
            // Uncomment for debugging
            // console.log('🔍 STOMP:', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: (frame) => {
          console.log(`✅ [${role}] [${clientId}] WebSocket connected`);
          setIsConnected(true);

          // Subscribe to user's notification channel
          const channel = `/topic/orderws/${userId}`;
          console.log(`🔌 Will subscribe to: ${channel}`);

          client.subscribe(channel, async (message) => {
            try {
              console.log(`📬 [${clientId}] Received message`);
              
              const notification = JSON.parse(message.body);
              console.log(`📬 Parsed notification:`, notification);

              const newNotification: Notification = {
                id: notification.id || `${Date.now()}_${Math.random()}`,
                type: notification.type || 'INFO',
                message: notification.message || 'Thông báo mới',
                orderId: notification.orderId,
                read: false,
                timestamp: notification.timestamp || Date.now(),
                receivedAt: new Date().toISOString(),
              };

              console.log(`✅ [${clientId}] Adding new notification:`, newNotification);
              setNotifications((prev) => [newNotification, ...prev]);

              // Show local notification on device
              try {
                await showLocalNotification(
                  getNotificationTitle(newNotification.type),
                  newNotification.message,
                  {
                    orderId: newNotification.orderId?.toString(),
                    type: newNotification.type,
                    notificationId: newNotification.id,
                  }
                );
                console.log('📱 Local notification shown');
              } catch (err) {
                console.error('❌ Failed to show local notification:', err);
              }
            } catch (error) {
              console.error('❌ Error parsing notification:', error);
            }
          });

          console.log(`📡 [${clientId}] Subscribed to channel: ${channel}`);
        },
        onStompError: (frame) => {
          console.error(`❌ [${role}] [${clientId}] STOMP error:`, frame.headers['message']);
          setIsConnected(false);
        },
        onWebSocketClose: (event) => {
          console.log(`🔌 [${clientId}] WebSocket closed`);
          setIsConnected(false);
        },
        onWebSocketError: (event) => {
          console.error(`❌ [${clientId}] WebSocket error:`, event);
          setIsConnected(false);
        },
      });

        stompClientRef.current = client;

        // Activate the client
        client.activate();
      } catch (error) {
        console.error(`❌ [${role}] [${clientId}] Error creating WebSocket:`, error);
      }
    };

    // Initialize connection with token
    initializeConnection();

    // Cleanup on unmount
    return () => {
      console.log(`🔌 [${clientId}] Cleaning up WebSocket connection`);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      setIsConnected(false);
    };
  }, [userId, role]);

  // Helper function to get notification title based on type
  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'ORDER_PLACED':
        return '🛒 Đơn hàng mới';
      case 'ORDER_CONFIRMED':
        return '✅ Xác nhận đơn hàng';
      case 'ORDER_SHIPPING':
        return '🚚 Đang giao hàng';
      case 'ORDER_COMPLETED':
        return '🎉 Hoàn thành';
      case 'ORDER_CANCELLED':
        return '❌ Đã hủy';
      case 'PAYMENT_RECEIVED':
        return '💰 Thanh toán';
      case 'NEW_ORDER':
        return '🛍️ Đơn hàng mới';
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
