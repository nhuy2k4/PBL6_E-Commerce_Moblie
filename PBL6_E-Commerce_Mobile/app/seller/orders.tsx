import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
// import { useRouter } from 'expo-router';
import { getSellerOrders, updateOrderStatus } from '../../services/sellerOrderService';

const TABS = [
  { key: 'ALL', label: 'Tất cả', color: '#6c757d' },
  { key: 'PENDING', label: 'Chờ xác nhận', color: '#ffc107' },
  { key: 'PROCESSING', label: 'Chờ giao hàng', color: '#17a2b8' },
  { key: 'SHIPPING', label: 'Đang giao', color: '#007bff' },
  { key: 'COMPLETED', label: 'Hoàn thành', color: '#28a745' },
  { key: 'CANCELLED', label: 'Đã hủy', color: '#dc3545' },
];

type Order = {
  id: number;
  code?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: any[];
};

const SellerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading seller orders...');
      const data = await getSellerOrders();
      console.log('📦 Seller orders data received:', data);
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('❌ Load seller orders error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getSellerOrders();
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('❌ Refresh seller orders error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  };

  const handleOrderAction = (order: Order, action: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action.toLowerCase()} đơn hàng #${order.id}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => updateStatus(order.id, action) }
      ]
    );
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      Alert.alert('Thành công', 'Cập nhật trạng thái đơn hàng thành công');
      loadOrders(); // Reload data
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusColor = (status: string) => {
    const tab = TABS.find(t => t.key === status);
    return tab?.color || '#6c757d';
  };

  const getOrderActions = (order: Order) => {
    switch (order.status) {
      case 'PENDING':
        return [
          { label: 'Xác nhận đơn', action: 'PROCESSING', color: '#28a745' },
          { label: 'Hủy đơn', action: 'CANCELLED', color: '#dc3545' }
        ];
      case 'PROCESSING':
        return [
          { label: 'Giao hàng', action: 'SHIPPING', color: '#007bff' }
        ];
      case 'SHIPPING':
        return [
          { label: 'Hoàn thành', action: 'COMPLETED', color: '#28a745' }
        ];
      default:
        return [];
    }
  };

  const filteredOrders = filterOrders().sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const getStatusCounts = () => {
    return TABS.map(tab => ({
      ...tab,
      count: tab.key === 'ALL' ? orders.length : orders.filter(o => o.status === tab.key).length
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý đơn hàng</Text>
        <Text style={styles.subtitle}>{filteredOrders.length} đơn hàng</Text>
      </View>

      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {getStatusCounts().map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { backgroundColor: tab.color }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#fff' : tab.color }]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.badge, { backgroundColor: activeTab === tab.key ? '#fff' : tab.color }]}>
                <Text style={[styles.badgeText, { color: activeTab === tab.key ? tab.color : '#fff' }]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007bff']}
              tintColor="#007bff"
            />
          }
          renderItem={({ item }) => {
            const actions = getOrderActions(item);
            return (
              <TouchableOpacity 
                style={styles.orderCard}
                onPress={() => Alert.alert('Thông báo', 'Tính năng chi tiết đơn hàng đang phát triển')}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderCode}>Mã đơn: #{item.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>
                      {TABS.find(t => t.key === item.status)?.label || item.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.orderTotal}>
                  Tổng tiền: {(item.totalAmount || 0).toLocaleString('vi-VN')} đ
                </Text>
                
                <Text style={styles.orderDate}>
                  Ngày đặt: {new Date(item.createdAt || new Date()).toLocaleString('vi-VN')}
                </Text>

                {/* Action Buttons */}
                {actions.length > 0 && (
                  <View style={styles.actionsContainer}>
                    {actions.map((action, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.actionButton, { backgroundColor: action.color }]}
                        onPress={() => handleOrderAction(item, action.action)}
                      >
                        <Text style={styles.actionButtonText}>{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.detailButton}>
                      <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  detailButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007bff',
    marginBottom: 8,
  },
  detailButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  actionBtn: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
});

export default SellerOrders;
