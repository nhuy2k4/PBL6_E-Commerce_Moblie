import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getMyOrders } from '../../services/orderService';
import { getMyRefundRequests } from '../../services/refundService';
import { Ionicons } from '@expo/vector-icons';

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
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const router = useRouter();

  // Helper functions for status display
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xác nhận',
      'PROCESSING': 'Đang xử lý',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeStyle = (status: string) => {
    const styleMap: { [key: string]: any } = {
      'PENDING': { backgroundColor: '#FFF4E6', borderColor: '#FF9800' },
      'PROCESSING': { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
      'SHIPPING': { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
      'COMPLETED': { backgroundColor: '#F3E5F5', borderColor: '#9C27B0' },
      'CANCELLED': { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
    };
    return styleMap[status] || { backgroundColor: '#F5F5F5', borderColor: '#999' };
  };

  const getRefundStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'COMPLETED': 'Hoàn tất',
    };
    return statusMap[status] || status;
  };

  const getRefundStatusStyle = (status: string) => {
    const styleMap: { [key: string]: any } = {
      'REQUESTED': { color: '#FF9800' },
      'APPROVED': { color: '#4CAF50' },
      'REJECTED': { color: '#F44336' },
      'COMPLETED': { color: '#9C27B0' },
    };
    return styleMap[status] || { color: '#666' };
  };

  useEffect(() => {
    loadOrders();
    loadRefundRequests();
  }, []);

  const defaultProductImage = require('../../assets/images/icon.png');

const BASE_IMAGE_URL = process.env.EXPO_PUBLIC_BASE_IMAGE_URL;
  function getImageUrl(img?: string) {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return BASE_IMAGE_URL + img;
  }

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

  const loadRefundRequests = async () => {
    try {
      console.log('🔄 Loading refund requests...');
      const data = await getMyRefundRequests();
      console.log('📦 Refund requests received:', data);
      setRefundRequests(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.error('❌ Load refund requests error:', e);
      setRefundRequests([]);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'ALL') return orders;
    if (activeTab === 'RETURN') return refundRequests;
    return orders.filter((o) => o.status === activeTab);
  };

  const filteredOrders = filterOrders().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
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
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            // Check if this is a refund request or order
            const isRefund = activeTab === 'RETURN';
            
            if (isRefund) {
              // Refund Request Item - Show detailed info
              return (
                <TouchableOpacity
                  style={styles.refundCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/customer/refund-detail?id=${item.id}`)}
                >
                  {/* Header */}
                  <View style={styles.refundHeader}>
                    <View style={styles.refundBadge}>
                      <Ionicons name="return-up-back" size={14} color="#FF6F00" />
                      <Text style={styles.refundBadgeText}>Yêu cầu trả hàng</Text>
                    </View>
                    <Text style={[styles.refundStatus, getRefundStatusStyle(item.status)]}>
                      {getRefundStatusText(item.status)}
                    </Text>
                  </View>

                  {/* Refund Info */}
                  <View style={styles.refundContent}>
                    <Text style={styles.refundId}>Mã yêu cầu: #{item.id}</Text>
                    <Text style={styles.refundReason} numberOfLines={2}>
                      Lý do: {item.reason || 'Không đúng mô tả'}
                    </Text>
                    <View style={styles.refundFooter}>
                      <Text style={styles.refundAmount}>
                        Số tiền hoàn: <Text style={styles.refundAmountValue}>{(item.amount || 0).toLocaleString('vi-VN')}đ</Text>
                      </Text>
                      <Text style={styles.refundDate}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
            
            // Regular Order Item - Show first product
            const firstItem = item.items && item.items.length > 0 ? item.items[0] : null;
            const totalItems = item.items?.length || 0;
            
            return (
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/customer/order_detail?id=${item.id}`)}
              >
                {/* Shop Name & Status */}
                <View style={styles.orderHeader}>
                  <View style={styles.shopInfo}>
                    <Ionicons name="storefront" size={16} color="#666" />
                    <Text style={styles.shopName}>{item.shopName ? item.shopName : (item.shopId ? `Shop #${item.shopId}` : 'Shop N/A')}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
                  </View>
                </View>

                {/* Product Info */}
                {firstItem && (
                  <View style={styles.productRow}>
                    {(() => {
                      // Fallback order similar to web: mainImage, productMainImage, image, productImage
                      const rawImg = (firstItem as any).mainImage || (firstItem as any).productMainImage || (firstItem as any).image || firstItem.productImage;
                      const imageUri = getImageUrl(rawImg);
                      return (
                        <Image
                          source={imageUri ? { uri: imageUri } : defaultProductImage}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      );
                    })()}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {firstItem.productName}
                      </Text>
                      {firstItem.variantName && (
                        <Text style={styles.variantText} numberOfLines={1}>
                          Phân loại: {firstItem.variantName}
                        </Text>
                      )}
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>
                          {(firstItem.price || 0).toLocaleString('vi-VN')}đ
                        </Text>
                        <Text style={styles.productQuantity}>x{firstItem.quantity}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* More items indicator */}
                {totalItems > 1 && (
                  <View style={styles.moreItemsContainer}>
                    <Text style={styles.moreItemsText}>
                      +{totalItems - 1} sản phẩm khác
                    </Text>
                  </View>
                )}

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.orderTotalLabel}>Tổng số tiền:</Text>
                    <Text style={styles.orderTotalValue}>
                      {(item.totalAmount || 0).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  {(item.status === 'PENDING' || item.status === 'PROCESSING') && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'COMPLETED' && (
                    <TouchableOpacity style={styles.actionButtonSecondary}>
                      <Text style={styles.actionButtonSecondaryText}>Mua lại</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <View style={styles.centered}>
          <Text style={{ color: '#888', fontSize: 16, marginTop: 32 }}>Không có đơn hàng nào</Text>
        </View>
      )}
    </SafeAreaView>
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
  // Order Card Styles
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  productRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  productQuantity: {
    fontSize: 13,
    color: '#666',
  },
  moreItemsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  moreItemsText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  actionButtonSecondaryText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
  },
  // Refund Card Styles
  refundCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  refundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  refundBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6F00',
  },
  refundStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  refundContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  refundId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  refundReason: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  refundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refundAmount: {
    fontSize: 13,
    color: '#666',
  },
  refundAmountValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  refundDate: {
    fontSize: 12,
    color: '#999',
  },
  // Legacy styles (kept for compatibility)
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
