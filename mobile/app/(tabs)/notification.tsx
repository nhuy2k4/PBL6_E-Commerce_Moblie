import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Notification {
  id: number;
  type: 'order' | 'promotion' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'order',
    title: 'Đơn hàng đã được giao',
    message: 'Đơn hàng #12345 đã được giao thành công',
    time: '2 giờ trước',
    isRead: false,
  },
  {
    id: 2,
    type: 'promotion',
    title: 'Flash Sale hôm nay',
    message: 'Giảm giá đến 50% cho nhiều sản phẩm hot',
    time: '5 giờ trước',
    isRead: false,
  },
  {
    id: 3,
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Ứng dụng đã được cập nhật lên phiên bản mới',
    time: '1 ngày trước',
    isRead: true,
  },
];

export default function NotificationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'cube-outline';
      case 'promotion':
        return 'pricetag-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      <ScrollView>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              { 
                backgroundColor: notification.isRead 
                  ? colors.background 
                  : colors.tint + '10' 
              }
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
              <Ionicons 
                name={getIcon(notification.type) as any} 
                size={24} 
                color={colors.tint} 
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {notification.title}
              </Text>
              <Text style={[styles.message, { color: colors.icon }]}>
                {notification.message}
              </Text>
              <Text style={[styles.time, { color: colors.icon }]}>
                {notification.time}
              </Text>
            </View>
            {!notification.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
            )}
          </TouchableOpacity>
        ))}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
