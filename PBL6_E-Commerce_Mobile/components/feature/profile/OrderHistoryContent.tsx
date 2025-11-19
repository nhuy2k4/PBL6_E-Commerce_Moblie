import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

export default function OrderHistoryContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      setOrders([
        {
          id: 1,
          orderNumber: '#DH001',
          date: '2025-10-20',
          status: 'Đã giao',
          total: 1500000,
          items: 3,
        },
        {
          id: 2,
          orderNumber: '#DH002',
          date: '2025-10-18',
          status: 'Đang giao',
          total: 850000,
          items: 2,
        },
      ]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao':
        return '#4CAF50';
      case 'Đang giao':
        return '#2196F3';
      case 'Đã hủy':
        return '#F44336';
      default:
        return colors.icon;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="receipt-outline" size={64} color={colors.icon} />
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          Chưa có đơn hàng nào
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.orderCard, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}
        >
          <View style={styles.orderHeader}>
            <Text style={[styles.orderNumber, { color: colors.text }]}>
              {item.orderNumber}
            </Text>
            <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          
          <Text style={[styles.orderDate, { color: colors.icon }]}>
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Text>
          
          <View style={styles.orderFooter}>
            <Text style={[styles.orderItems, { color: colors.icon }]}>
              {item.items} sản phẩm
            </Text>
            <Text style={[styles.orderTotal, { color: colors.tint }]}>
              {item.total.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
