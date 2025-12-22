import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRefundById } from '../../services/refundService';
import { Ionicons } from '@expo/vector-icons';

interface RefundDetail {
  id: number;
  orderId: number;
  userId: number;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  imageUrls?: string[];
  orderItem?: {
    id: number;
    productName: string;
    productImage: string;
    variantName?: string;
    quantity: number;
    price: number;
  };
}

const RefundDetailPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refund, setRefund] = useState<RefundDetail | null>(null);

  useEffect(() => {
    if (id) {
      loadRefundDetail();
    }
  }, [id]);

  const loadRefundDetail = async () => {
    try {
      setLoading(true);
      const response = await getRefundById(Number(id));
      console.log('📦 Refund detail:', response);
      setRefund(response.data || response);
    } catch (error) {
      console.error('❌ Error loading refund:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin yêu cầu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PENDING: '#FF9800',
      APPROVED: '#4CAF50',
      REJECTED: '#F44336',
      COMPLETED: '#2196F3',
      CANCELLED: '#9E9E9E',
    };
    return colorMap[status] || '#757575';
  };

  const parseImageUrls = (imageUrls: any): string[] => {
    if (!imageUrls) return [];
    if (Array.isArray(imageUrls)) return imageUrls;
    if (typeof imageUrls === 'string') {
      try {
        const parsed = JSON.parse(imageUrls);
        return Array.isArray(parsed) ? parsed : [imageUrls];
      } catch {
        return [imageUrls];
      }
    }
    return [];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#EE4D2D" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!refund) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Không tìm thấy thông tin</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = parseImageUrls(refund.imageUrls);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết trả hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order & Status Section */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <Text style={styles.sectionTitle}>Đơn hàng</Text>
            <TouchableOpacity onPress={() => router.push(`/customer/order_detail?id=${refund.orderId}`)}>
              <Text style={styles.orderLink}>#{refund.orderId}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày yêu cầu</Text>
            <Text style={styles.infoValue}>
              lúc {new Date(refund.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
              {new Date(refund.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Product Section */}
        {refund.orderItem && (
          <View style={styles.section}>
            <View style={styles.productCard}>
              <Image
                source={{ uri: refund.orderItem.productImage || 'https://via.placeholder.com/80' }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {refund.orderItem.productName}
                </Text>
                {refund.orderItem.variantName && (
                  <Text style={styles.variantText}>Phân loại: {refund.orderItem.variantName}</Text>
                )}
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>
                    Đơn giá: {refund.orderItem.price.toLocaleString('vi-VN')}đ
                  </Text>
                  <Text style={styles.productQuantity}>Số lượng: {refund.orderItem.quantity}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Refund Amount Section */}
        <View style={styles.section}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Số tiền hoàn:</Text>
            <Text style={styles.amountValue}>{refund.amount.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức:</Text>
            <Text style={styles.infoValue}>N/A</Text>
          </View>
        </View>

        {/* Reason Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lý do:</Text>
          <Text style={styles.reasonText}>{refund.reason}</Text>
        </View>

        {/* Attached Images Section */}
        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hình ảnh đính kèm:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refund.status) }]}>
            <Text style={styles.statusText}>{getStatusText(refund.status)}</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => router.push(`/customer/order_detail?id=${refund.orderId}`)}
          >
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EE4D2D',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EE4D2D',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
  },
  variantText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 13,
    color: '#666',
  },
  productQuantity: {
    fontSize: 13,
    color: '#666',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EE4D2D',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  imageGallery: {
    marginTop: 8,
  },
  attachedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  detailButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EE4D2D',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EE4D2D',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EE4D2D',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default RefundDetailPage;
