import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { connectNotificationSocket, disconnectNotificationSocket } from '../services/socketService';
import { useAuth } from './AuthContext';
import { initNotificationSound, playNotificationSound, unloadNotificationSound } from '../services/notificationSoundService';

// Kiểu dữ liệu notification, có thể mở rộng theo backend
export interface Notification {
  id: string;
  type: string;
  message: string;
  orderId?: number;
  read: boolean;
  timestamp: number;
  receivedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    // Listen for FCM notifications and add to context
    useEffect(() => {
      const { onFCMNotification } = require('../services/fcmService');
      const unsubscribe = onFCMNotification((notif: any) => {
        setNotifications((prev) => [notif, ...prev]);
        playNotificationSound();
      });
      return () => unsubscribe();
    }, []);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications from backend
  async function fetchNotificationsFromBackend() {
    try {
      if (!user || !user.id) return;
      // Replace with your backend API URL
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('access_token');
      const res = await fetch(`${apiUrl}notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications((prev) => {
            // Merge backend notifications with local ones (avoid duplicates)
            const ids = new Set(prev.map(n => n.id));
            const merged = [...data.filter(n => !ids.has(n.id)), ...prev];
            return merged;
          });
        }
      }
    } catch (err) {
      console.error('❌ Error fetching notifications from backend:', err);
    }
  }

  // Khởi tạo âm thanh thông báo khi component mount
  useEffect(() => {
    initNotificationSound();
    return () => {
      unloadNotificationSound();
    };
  }, []);

  useEffect(() => {
    if (!user || !user.id || !user.role) {
      console.log('⚠️ [NotificationProvider] User not ready, skipping socket connection');
      return;
    }
    // Fetch notifications from backend on mount/user change
    fetchNotificationsFromBackend();
    console.log(`🔌 [NotificationProvider] Initializing socket for user: ${user.id}, role: ${user.role}`);
    connectNotificationSocket({
      userId: user.id,
      role: user.role,
      onNotification: (notif) => {
        try {
          console.log('🔔 [NotificationProvider] Raw notification received:', notif);
          const payload = (notif as any).payload || {};
          if (payload.recipientId && payload.recipientId !== user.id) {
            console.log('🔕 Notification recipientId does not match current user, ignoring');
            return;
          }
          if (payload.targetRole && payload.targetRole !== user.role) {
            console.log('🔕 Notification targetRole mismatch, ignoring');
            return;
          }
          if (payload.shopId && user.role === 'SELLER') {
            const userShopId = (user as any).shop?.id || (user as any).shopId;
            if (userShopId && payload.shopId !== userShopId) {
              console.log('🔕 Notification shopId does not match seller shop, ignoring');
              return;
            }
          }
          // Passed filters -> add and play sound
          console.log('✅ Notification accepted for current user/role');
          setNotifications((prev) => [notif, ...prev]);
          playNotificationSound();
        } catch (err) {
          console.error('❌ Error handling incoming notification:', err);
        }
      },
      onConnection: (connected) => {
        console.log(`🔌 [NotificationProvider] Connection status changed: ${connected}`);
        setIsConnected(connected);
      },
    });
    return () => {
      console.log('🔌 [NotificationProvider] Cleaning up socket connection');
      disconnectNotificationSocket();
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };
  const clearAll = () => setNotifications([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isConnected, markAsRead, markAllAsRead, deleteNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
