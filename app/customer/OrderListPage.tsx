import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getMyOrders } from '../../services/orderService';

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
      console.log('🔄 Loading orders...');
      const data = await getMyOrders();
      console.log('📦 Orders data received:', data);
      // Nếu API trả về { data: [...] } thì lấy data.data, nếu trả về mảng thì lấy luôn
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.error('❌ Load orders error:', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  };

  const filteredOrders = filterOrders().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

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
              <Text style={styles.orderCode}>Mã đơn: #{item.id}</Text>
              <Text style={styles.orderStatus}>Trạng thái: {TABS.find(t => t.key === item.status)?.label || item.status}</Text>
              <Text style={styles.orderTotal}>Tổng tiền: {(item.totalAmount || 0).toLocaleString('vi-VN')} đ</Text>
              <Text style={styles.orderDate}>Ngày đặt: {new Date(item.createdAt || new Date()).toLocaleString('vi-VN')}</Text>
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
