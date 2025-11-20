import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
// import { useOrder } from '../../context/OrderContext'; // Nếu có context riêng cho order
// import orderService from '../../services/orderService';
// import ReturnItemCard from '../../components/order/ReturnItemCard';
// import OrderCard from '../../components/order/OrderCard';

// Dummy data/hàm fetchOrders cho demo, thay bằng API thực tế
const fetchOrders = async () => {
  // TODO: Gọi API thực tế
  return [
    { id: 1, status: 'PENDING', createdAt: '2025-11-20T10:00:00', total: 200000, code: 'DH001' },
    { id: 2, status: 'SHIPPING', createdAt: '2025-11-19T09:00:00', total: 350000, code: 'DH002' },
    { id: 3, status: 'COMPLETED', createdAt: '2025-11-18T08:00:00', total: 150000, code: 'DH003' },
  ];
};

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'PROCESSING', label: 'Đang xử lý' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'RETURN', label: 'Trả hàng' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const OrderListPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  };

  const filteredOrders = filterOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}><ActivityIndicator size="large" color="#1976D2" /></View>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/customer/order-detail/${item.id}`)}
            >
              <Text style={styles.orderCode}>Mã đơn: {item.code}</Text>
              <Text style={styles.orderStatus}>Trạng thái: {TABS.find(t => t.key === item.status)?.label || item.status}</Text>
              <Text style={styles.orderTotal}>Tổng tiền: {item.total.toLocaleString('vi-VN')} đ</Text>
              <Text style={styles.orderDate}>Ngày đặt: {new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <View style={styles.centered}>
          <Text style={{ color: '#888', fontSize: 16, marginTop: 32 }}>Không có đơn hàng nào</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: '#fff',
    height: 44,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  tab: {
    minWidth: 90,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 18,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#1976D2',
  },
  tabText: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#1976D2',
  },
  orderStatus: {
    fontSize: 15,
    marginBottom: 4,
    color: '#444',
  },
  orderTotal: {
    fontSize: 15,
    marginBottom: 4,
    color: '#FF6B6B',
  },
  orderDate: {
    fontSize: 13,
    color: '#888',
  },
});

export default OrderListPage;
