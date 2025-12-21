import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    message: string;
    orderId?: number;
    read: boolean;
    timestamp: number;
  };
  onDelete: (id: string) => void;
  onPress: (notification: any) => void;
  colors: {
    text: string;
    icon: string;
    tint: string;
    background: string;
  };
}

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

export default function NotificationItem({ notification, onDelete, onPress, colors }: NotificationItemProps) {
  const renderRightActions = () => (
    <View style={styles.deleteContainer}>
      <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.deleteText}>Xóa</Text>
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => onDelete(notification.id)}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: notification.read
              ? colors.background
              : colors.tint + '10',
          },
        ]}
        onPress={() => onPress(notification)}
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteContainer: {
    backgroundColor: '#e53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  type: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
