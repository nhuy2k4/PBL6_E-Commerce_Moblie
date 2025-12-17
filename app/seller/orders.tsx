import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, RefreshControl, Modal, Image } from 'react-native';
// import { useRouter } from 'expo-router';
import { getSellerOrders, updateOrderStatus, getSellerOrderDetail } from '../../services/sellerOrderService';

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
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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

  const loadOrderDetail = async (orderId: number) => {
    setOrderDetailLoading(true);
    try {
      console.log('🔍 Loading order detail for ID:', orderId);
      const response = await getSellerOrderDetail(orderId);
      console.log('📦 Order detail response:', response);
      const orderData = response?.data || response;
      setSelectedOrder(orderData);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('❌ Load order detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      Alert.alert('Thành công', 'Cập nhật trạng thái đơn hàng thành công');
      setDetailModalVisible(false);
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
                onPress={() => loadOrderDetail(item.id)}
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
                    <TouchableOpacity 
                      style={styles.detailButton}
                      onPress={() => loadOrderDetail(item.id)}
                    >
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

      {/* Order Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {orderDetailLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : selectedOrder ? (
            <ScrollView style={styles.modalContent}>
              {/* Order Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã đơn:</Text>
                  <Text style={styles.infoValue}>#{selectedOrder.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạng thái:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>
                      {TABS.find(t => t.key === selectedOrder.status)?.label || selectedOrder.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thanh toán:</Text>
                  <Text style={styles.infoValue}>{selectedOrder.method || 'COD'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngày đặt:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </View>

              {/* Receiver Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Họ tên:</Text>
                  <Text style={styles.infoValue}>{selectedOrder.receiverName || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={styles.infoValue}>{selectedOrder.receiverPhone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Địa chỉ:</Text>
                  <Text style={[styles.infoValue, { flex: 1 }]}>
                    {selectedOrder.receiverAddress || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Products */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Sản phẩm ({selectedOrder.items?.length || 0})</Text>
                {(selectedOrder.items || []).map((item: any, index: number) => (
                  <View key={index} style={styles.productItem}>
                    {item.productImage && (
                      <Image 
                        source={{ uri: item.productImage }} 
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.productName}</Text>
                      {item.variantName && (
                        <Text style={styles.variantName}>Phân loại: {item.variantName}</Text>
                      )}
                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>
                          {(item.price || 0).toLocaleString('vi-VN')} đ
                        </Text>
                        <Text style={styles.productQuantity}>x{item.quantity}</Text>
                      </View>
                      <Text style={styles.productSubtotal}>
                        Tổng: {(item.subtotal || 0).toLocaleString('vi-VN')} đ
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Total */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalValue}>
                    {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              {getOrderActions({ status: selectedOrder.status } as Order).length > 0 && (
                <View style={styles.modalActions}>
                  {getOrderActions({ status: selectedOrder.status } as Order).map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.modalActionButton, { backgroundColor: action.color }]}
                      onPress={() => {
                        Alert.alert(
                          'Xác nhận',
                          `Bạn có chắc muốn ${action.label.toLowerCase()}?`,
                          [
                            { text: 'Hủy', style: 'cancel' },
                            { 
                              text: 'Xác nhận', 
                              onPress: () => updateStatus(selectedOrder.id, action.action) 
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.modalActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          ) : null}
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    fontSize: 28,
    color: '#6c757d',
    fontWeight: '300',
  },
  modalContent: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  productItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e9ecef',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  variantName: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
    marginRight: 8,
  },
  productQuantity: {
    fontSize: 14,
    color: '#6c757d',
  },
  productSubtotal: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  totalSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SellerOrders;
