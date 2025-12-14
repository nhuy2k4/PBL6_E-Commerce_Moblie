import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  // Debug logging
  React.useEffect(() => {
    console.log('📱 NotificationScreen - User:', user?.id, 'Role:', user?.role);
  }, [user]);
  
  const { 
    notifications, 
    isConnected, 
    markAsRead, 
    markAllAsRead,
    clearAll,
    deleteNotification,
    unreadCount 
  } = useNotifications(user?.id, user?.role || 'BUYER');

  // Debug notifications state
  React.useEffect(() => {
    console.log('📱 Notifications count:', notifications.length);
    console.log('📱 Unread count:', unreadCount);
    console.log('📱 WebSocket connected:', isConnected);
    if (notifications.length > 0) {
      console.log('📱 Latest notification:', JSON.stringify(notifications[0], null, 2));
    }
  }, [notifications, unreadCount, isConnected]);

  // Helper function to format timestamp
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
      case 'ORDER_SHIPPING':
      case 'ORDER_DELIVERED':
      case 'ORDER_CANCELLED':
        return 'cube-outline';
      case 'promotion':
        return 'pricetag-outline';
      default:
        return 'notifications-outline';
    }
  };

  const handleNotificationPress = async (notif: any) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    // TODO: Navigate to order detail screen if needed
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerButton}>
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="wifi-outline" size={16} color="#666" />
          <Text style={styles.connectionText}>Đang kết nối lại...</Text>
        </View>
      )}

      <ScrollView>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              Chưa có thông báo nào
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                { 
                  backgroundColor: notification.read 
                    ? colors.background 
                    : colors.tint + '10' 
                }
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons 
                  name={getIcon(notification.type) as any} 
                  size={24} 
                  color={colors.tint} 
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={[styles.message, { color: colors.text, fontWeight: '600' }]}>
                  {notification.message}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={[styles.time, { color: colors.icon }]}>
                    {formatTime(notification.timestamp)}
                  </Text>
                  {notification.type && (
                    <Text style={[styles.type, { color: colors.icon }]}>
                      {' • '}{notification.type}
                    </Text>
                  )}
                </View>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  badge: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#fff3cd',
    gap: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
