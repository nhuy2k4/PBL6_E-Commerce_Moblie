import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import NotificationItem from '@/components/NotificationItem';

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
    deleteNotification,
    clearAll,
    unreadCount 
  } = useNotification();

  // Debug notifications state
  React.useEffect(() => {
    console.log('📱 Notifications count:', notifications.length);
    console.log('📱 Unread count:', unreadCount);
    console.log('📱 WebSocket connected:', isConnected);
    if (notifications.length > 0) {
      console.log('📱 Latest notification:', JSON.stringify(notifications[0], null, 2));
    }
  }, [notifications, unreadCount, isConnected]);

  const handleNotificationPress = (notif: any) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    // TODO: Navigate to order detail screen if needed
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
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

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onDelete={deleteNotification}
            onPress={handleNotificationPress}
            colors={colors}
          />
        )}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainerFlex : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              Chưa có thông báo nào
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 48,
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
  emptyContainerFlex: {
    flexGrow: 1,
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
});
