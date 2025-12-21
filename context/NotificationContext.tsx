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
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

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
    
    console.log(`🔌 [NotificationProvider] Initializing socket for user: ${user.id}, role: ${user.role}`);
    
    connectNotificationSocket({
      userId: user.id,
      role: user.role,
      onNotification: (notif) => {
        console.log('🔔 [NotificationProvider] New notification received:', notif);
        setNotifications((prev) => [notif, ...prev]);
        // Phát âm thanh thông báo
        playNotificationSound();
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
