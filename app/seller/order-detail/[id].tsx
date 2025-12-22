import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// import { useRouter } from 'expo-router';
import { getSellerOrderDetail, updateOrderStatus } from '../../../services/sellerOrderService';

const BASE_IMAGE_URL = process.env.EXPO_PUBLIC_BASE_IMAGE_URL;
const defaultProductImage = require('../../../assets/images/icon.png');

type OrderDetailType = {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  items: {
    id: number;
    quantity: number;
    price: number;
    productId: number;
    productName?: string;
    variantName?: string;
    totalPrice?: number;
  }[];
  shippingAddress?: {
    recipientName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  payment?: {
    method: string;
    status: string;
  };
};

const STATUS_MAP = {
  'PENDING': { label: 'Chờ xác nhận', color: '#ffc107' },
  'PROCESSING': { label: 'Chờ giao hàng', color: '#17a2b8' },
  'SHIPPING': { label: 'Đang giao', color: '#007bff' },
  'COMPLETED': { label: 'Hoàn thành', color: '#28a745' },
  'CANCELLED': { label: 'Đã hủy', color: '#dc3545' },
};

const SellerOrderDetail = () => {
  const { id } = useLocalSearchParams();
  // const router = useRouter();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id, loadOrderDetail]);

  const loadOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSellerOrderDetail(Number(id));
      setOrder(data);
    } catch (error) {
      console.error('❌ Load order detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
      // router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateStatus = (newStatus: string) => {
    const statusName = STATUS_MAP[newStatus as keyof typeof STATUS_MAP]?.label;
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn chuyển đơn hàng sang trạng thái "${statusName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => updateStatus(newStatus) }
      ]
    );
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await updateOrderStatus(Number(id), newStatus);
      Alert.alert('Thành công', 'Cập nhật trạng thái đơn hàng thành công');
      loadOrderDetail(); // Reload order details
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getAvailableActions = () => {
    if (!order) return [];
    
    switch (order.status) {
      case 'PENDING':
        return [
          { key: 'PROCESSING', label: 'Xác nhận đơn', color: '#28a745' },
          { key: 'CANCELLED', label: 'Hủy đơn', color: '#dc3545' }
        ];
      case 'PROCESSING':
        return [
          { key: 'SHIPPING', label: 'Bắt đầu giao hàng', color: '#007bff' }
        ];
      case 'SHIPPING':
        return [
          { key: 'COMPLETED', label: 'Hoàn thành đơn hàng', color: '#28a745' }
        ];
      default:
        return [];
    }
  };

  function getImageUrl(img?: string) {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return BASE_IMAGE_URL + img;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const currentStatus = STATUS_MAP[order.status as keyof typeof STATUS_MAP];
  const actions = getAvailableActions();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chi tiết đơn hàng #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: currentStatus.color }]}>
          <Text style={styles.statusText}>{currentStatus.label}</Text>
        </View>
      </View>

      {/* Order Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>#{order.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={[styles.value, styles.totalAmount]}>
            {order.totalAmount.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phương thức TT:</Text>
          <Text style={styles.value}>{order.payment?.method || 'N/A'}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Họ tên:</Text>
          <Text style={styles.value}>{order.user?.fullName || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{order.user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.value}>{order.user?.phone || 'N/A'}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Người nhận:</Text>
            <Text style={styles.value}>{order.shippingAddress.recipientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{order.shippingAddress.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>
              {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
            </Text>
          </View>
        </View>
      )}

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
        {order.items.map((item, index) => {
          const rawImg = (item as any).mainImage || (item as any).productMainImage || (item as any).image || (item as any).productImage;
          const imageUri = getImageUrl(rawImg);
          return (
            <View key={index} style={styles.itemCard}>
              <Image 
                source={imageUri ? { uri: imageUri } : defaultProductImage}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.productName || `Sản phẩm #${item.productId}`}
                </Text>
                {item.variantName && (
                  <Text style={styles.itemVariant}>{item.variantName}</Text>
                )}
                <Text style={styles.itemDetails}>
                  Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')} đ
                </Text>
                <Text style={styles.itemTotal}>
                  {(item.totalPrice || item.quantity * item.price).toLocaleString('vi-VN')} đ
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hành động</Text>
          <View style={styles.actionsContainer}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={() => handleUpdateStatus(action.key)}
              >
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#212529',
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#28a745',
    fontSize: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#6c757d',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  actionsSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});

export default SellerOrderDetail;