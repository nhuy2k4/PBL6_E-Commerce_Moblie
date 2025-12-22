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
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getOrderDetail, cancelOrder } from '../../services/orderService';
import { addToCart, clearCart, getCart } from '../../services/cartService';
import { checkReviewEligibility } from '../../services/reviewService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../../services/uploadService';
import { createRefundRequest } from '../../services/refundService';

interface OrderItem {
  id: number;
  productId: number;
  variantId: number;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  status: string;
  productName: string;
  productImage: string;
}

interface OrderDetail {
  id: number;
  createdAt: string;
  method: string;
  status: string;
  totalAmount: number;
  updatedAt: string;
  shopId: number;
  userId: number;
  items: OrderItem[];
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
}

const OrderDetailPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewEligibility, setReviewEligibility] = useState<{[key: number]: {canReview: boolean, hasReviewed: boolean}}>({});
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundDetail, setRefundDetail] = useState('');
  const [refundAttachments, setRefundAttachments] = useState<string[]>([]);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [selectedRefundItemId, setSelectedRefundItemId] = useState<number | null>(null);
  const [selectedRefundQuantity, setSelectedRefundQuantity] = useState<number>(1);

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(Number(id));
      console.log('📦 Order detail response:', response);
      console.log('📦 Order items:', response.data?.items);
      setOrder(response.data);
      
      // Check review eligibility for all items if order is COMPLETED
      if (response.data.status === 'COMPLETED') {
        await checkAllReviewEligibility(response.data.items);
      }
    } catch (error) {
      console.error('❌ Error loading order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const checkAllReviewEligibility = async (items: OrderItem[]) => {
    try {
      console.log('🔍 Checking review eligibility for items:', items.length);
      const eligibilityMap: {[key: number]: {canReview: boolean, hasReviewed: boolean}} = {};
      
      await Promise.all(
        items.map(async (item) => {
          console.log('🔍 Checking item:', {
            id: item.id,
            productId: item.productId,
            productName: item.productName
          });
          
          if (!item.productId || isNaN(item.productId)) {
            console.warn('⚠️ Invalid productId for item:', item);
            return;
          }
          
          try {
            const result = await checkReviewEligibility(item.productId);
            console.log(`✅ Eligibility for product ${item.productId}:`, result);
            eligibilityMap[item.productId] = {
              canReview: result.canReview,
              hasReviewed: result.hasReviewed,
            };
          } catch (error) {
            console.error(`❌ Error checking eligibility for product ${item.productId}:`, error);
            eligibilityMap[item.productId] = {
              canReview: false,
              hasReviewed: false,
            };
          }
        })
      );
      
      setReviewEligibility(eligibilityMap);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      setCancelling(true);
      await cancelOrder(Number(id), cancelReason.trim() || undefined);
      Alert.alert('Thành công', 'Đơn hàng đã được hủy');
      setShowCancelModal(false);
      setCancelReason('');
      loadOrderDetail(); // Reload to get updated status
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    if (!order) return;
    Alert.alert('Xác nhận', 'Bạn muốn đặt lại đơn hàng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          setReordering(true);
          try {
            // Add each item from order to cart. Do NOT clear cart first to avoid empty cart if any add fails.
            const failed: Array<{ item: any; error: any }> = [];
            let addedCount = 0;
            for (const item of order.items) {
              const variantId = item.variantId || item.productId;
              if (!variantId || isNaN(variantId)) {
                console.warn('Invalid variantId for reorder item:', item);
                failed.push({ item, error: 'Invalid variant id' });
                continue;
              }
              try {
                await addToCart(variantId, item.quantity || 1);
                addedCount++;
              } catch (err) {
                console.error('Error adding item to cart during reorder:', item, err);
                failed.push({ item, error: err });
              }
            }

            if (addedCount > 0) {
              // fetch cart to confirm
              try {
                const cart = await getCart();
                console.log('DEBUG cart after reorder:', cart);
                const cartCount = cart?.items?.length || 0;
                const msg = failed.length > 0
                  ? `Thêm ${addedCount} sản phẩm vào giỏ hàng. ${failed.length} sản phẩm không thể thêm. Giỏ hàng hiện có ${cartCount} mục.`
                  : `Sản phẩm đã được thêm vào giỏ hàng. Giỏ hàng hiện có ${cartCount} mục.`;
                Alert.alert('Kết quả', msg);
                if (cartCount > 0) router.push('/customer/checkout');
              } catch (errCart) {
                console.error('Error fetching cart after reorder:', errCart);
                Alert.alert('Kết quả', `Đã thêm ${addedCount} sản phẩm. Không thể kiểm tra giỏ hàng.`);
                router.push('/customer/checkout');
              }
            } else {
              console.warn('No items added during reorder:', failed);
              Alert.alert('Lỗi', 'Không thể thêm sản phẩm nào vào giỏ hàng. Vui lòng kiểm tra lại.');
            }
          } catch (error) {
            console.error('❌ Error re-ordering:', error);
            Alert.alert('Lỗi', 'Không thể đặt lại đơn hàng. Vui lòng thử lại');
          } finally {
            setReordering(false);
          }
        },
      },
    ]);
  };

  const pickImageAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Quyền bị từ chối', 'Vui lòng cho phép truy cập ảnh để upload');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
      if (res.cancelled) return;
      const uri = res.uri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const formData = new FormData();
      // @ts-ignore - React Native FormData file object
      formData.append('file', {
        uri,
        name: filename,
        type: 'image/jpeg',
      } as any);
      const uploadRes = await uploadFile(formData);
      // uploadRes expected to contain uploaded file URL(s)
      if (uploadRes && uploadRes.url) {
        setRefundAttachments((s) => [...s, uploadRes.url]);
      } else if (Array.isArray(uploadRes)) {
        // backend may return array
        setRefundAttachments((s) => [...s, ...(uploadRes.map((x: any) => x.url || x))]);
      } else {
        console.warn('Upload returned unexpected:', uploadRes);
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
      Alert.alert('Lỗi', 'Không thể upload ảnh');
    }
  };
  useEffect(() => {
    if (showRefundModal && order && order.items && order.items.length > 0) {
      // default to first item
      setSelectedRefundItemId(order.items[0].id);
      setSelectedRefundQuantity(1);
    }
  }, [showRefundModal]);

  const submitRefundRequest = async () => {
    if (!order) return;
    if (!refundReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do hoàn tiền');
      return;
    }
    if (!selectedRefundItemId) {
      Alert.alert('Lỗi', 'Vui lòng chọn sản phẩm cần hoàn tiền');
      return;
    }
    const item = order.items.find((it) => it.id === selectedRefundItemId);
    if (!item) {
      Alert.alert('Lỗi', 'Sản phẩm không hợp lệ');
      return;
    }
    if (selectedRefundQuantity <= 0 || selectedRefundQuantity > item.quantity) {
      Alert.alert('Lỗi', `Số lượng hợp lệ: 1 - ${item.quantity}`);
      return;
    }

    setIsSubmittingRefund(true);
    try {
      const payload = {
        orderItemId: item.id,
        reason: refundReason,
        description: refundDetail,
        quantity: selectedRefundQuantity,
        imageUrls: refundAttachments,
        requestedAmount: item.price * selectedRefundQuantity,
      };
      const res = await createRefundRequest(payload as any);
      console.log('Refund created:', res);
      Alert.alert('Gửi thành công', 'Yêu cầu hoàn tiền đã được gửi');
      setShowRefundModal(false);
      await loadOrderDetail();
    } catch (error) {
      console.error('Error creating refund:', error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu hoàn tiền');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const handleReviewProduct = (productId: number) => {
    console.log('🔍 handleReviewProduct called with productId:', productId, 'type:', typeof productId);
    
    // Validate productId
    if (!productId || isNaN(productId)) {
      console.error('❌ Invalid productId:', productId);
      Alert.alert('Lỗi', 'ID sản phẩm không hợp lệ');
      return;
    }
    
    const eligibility = reviewEligibility[productId];
    console.log('🔍 Review eligibility:', eligibility);
    
    if (eligibility?.hasReviewed) {
      // Already reviewed - go to product detail to see review
      console.log('✅ Navigating to view review for product:', productId);
      router.push(`/customer/product-detail?id=${productId}`);
    } else if (eligibility?.canReview) {
      // Can review - navigate to write review page
      console.log('✅ Navigating to write review for product:', productId);
      router.push(`/customer/write-review?productId=${productId}`);
    } else {
      Alert.alert('Thông báo', 'Bạn không thể đánh giá sản phẩm này lúc này');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF9800';
      case 'PROCESSING':
        return '#2196F3';
      case 'SHIPPING':
        return '#9C27B0';
      case 'COMPLETED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'MOMO':
        return 'Ví MoMo';
      case 'VNPAY':
        return 'VNPay';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng #{order.id}</Text>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={
              order.status === 'COMPLETED'
                ? 'checkmark-circle'
                : order.status === 'CANCELLED'
                ? 'close-circle'
                : 'time'
            }
            size={32}
            color={getStatusColor(order.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
        <Text style={styles.dateText}>
          Đặt hàng: {new Date(order.createdAt).toLocaleString('vi-VN')}
        </Text>
        <Text style={styles.dateText}>
          Cập nhật: {new Date(order.updatedAt).toLocaleString('vi-VN')}
        </Text>
      </View>

      {/* Receiver Information */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={20} color="#1976D2" />
          <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={18} color="#666" />
          <Text style={styles.infoText}>{order.receiverName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={18} color="#666" />
          <Text style={styles.infoText}>{order.receiverPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-sharp" size={18} color="#666" />
          <Text style={styles.infoText}>{order.receiverAddress}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bag-handle" size={20} color="#1976D2" />
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
        </View>
        {order.items.map((item) => {
          console.log('🔍 Rendering item:', item.id, 'productId:', item.productId, 'productName:', item.productName);
          return (
          <View key={item.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemCard}
              activeOpacity={0.7}
              onPress={() => {
                console.log('🔍 Product clicked, productId:', item.productId, 'variantId:', item.variantId);
                if (item.productId && !isNaN(item.productId)) {
                  // Truyền cả variantId để auto-select variant đã mua
                  const url = `/customer/product-detail?productId=${item.productId}${item.variantId ? `&variantId=${item.variantId}` : ''}`;
                  router.push(url);
                } else {
                  console.error('❌ Invalid productId on click:', item.productId);
                  Alert.alert('Lỗi', 'ID sản phẩm không hợp lệ');
                }
              }}
            >
              <Image
                source={{ uri: item.productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
                {item.variantName && (
                  <Text style={styles.variantText}>Phân loại: {item.variantName}</Text>
                )}
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString('vi-VN')}đ
                  </Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  Thành tiền: {item.subtotal.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Action Buttons for COMPLETED orders */}
            {order.status === 'COMPLETED' && item.productId && !isNaN(item.productId) && (
              <View style={styles.itemActionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.reviewButton,
                    reviewEligibility[item.productId]?.hasReviewed && styles.reviewButtonViewed
                  ]}
                  onPress={() => handleReviewProduct(item.productId)}
                >
                  <Ionicons 
                    name={reviewEligibility[item.productId]?.hasReviewed ? "checkmark-circle" : "star"} 
                    size={16} 
                    color={reviewEligibility[item.productId]?.hasReviewed ? "#4CAF50" : "#FF9800"} 
                  />
                  <Text style={[
                    styles.reviewButtonText,
                    reviewEligibility[item.productId]?.hasReviewed && styles.reviewButtonTextViewed
                  ]}>
                    {reviewEligibility[item.productId]?.hasReviewed ? 'Xem đánh giá' : 'Đánh giá'}
                  </Text>
                </TouchableOpacity>
                
                {/* Return/Refund Button */}
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => router.push(`/customer/return-request?orderId=${order.id}&itemId=${item.id}`)}
                >
                  <Ionicons name="return-up-back" size={16} color="#FF6F00" />
                  <Text style={styles.returnButtonText}>Trả hàng</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          );
        })}
      </View>

      {/* Payment Information */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card" size={20} color="#1976D2" />
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Phương thức:</Text>
          <Text style={styles.paymentValue}>{getPaymentMethodLabel(order.method)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.paymentRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {order.status === 'PENDING' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, cancelling && styles.disabledButton]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Hủy đơn hàng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reorderButton, reordering && styles.disabledButton]}
            onPress={handleReorder}
            disabled={reordering}
          >
            {reordering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Đặt lại đơn hàng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 20 }} />

      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hủy đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Lý do hủy đơn (không bắt buộc)</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Nhập lý do hủy đơn hàng..."
              value={cancelReason}
              onChangeText={setCancelReason}
              maxLength={200}
            />
            <Text style={styles.charCount}>{cancelReason.length}/200</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, cancelling && styles.disabledButton]}
                onPress={confirmCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Xác nhận hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Refund Modal */}
      <Modal visible={showRefundModal} transparent animationType="slide" onRequestClose={() => setShowRefundModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yêu cầu hoàn tiền</Text>
              <TouchableOpacity onPress={() => setShowRefundModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Lý do</Text>
            <TextInput style={styles.modalInput} placeholder="Lý do hoàn tiền" value={refundReason} onChangeText={setRefundReason} />

            <Text style={[styles.modalLabel, { marginTop: 8 }]}>Mô tả chi tiết</Text>
            <TextInput style={styles.modalInput} placeholder="Mô tả thêm (tùy chọn)" value={refundDetail} onChangeText={setRefundDetail} multiline />

            <TouchableOpacity style={[styles.modalButton, { marginTop: 8 }]} onPress={pickImageAndUpload}>
              <Text style={{ color: '#1976D2', fontWeight: '700' }}>Thêm ảnh/chứng cứ</Text>
            </TouchableOpacity>

            <View style={styles.attachmentRow}>
              {refundAttachments.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.attachmentThumb} />
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowRefundModal(false)}>
                <Text style={styles.modalButtonTextCancel}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={submitRefundRequest} disabled={isSubmittingRefund}>
                {isSubmittingRefund ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonTextConfirm}>Gửi yêu cầu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemSubtotal: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  itemActionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  reviewButtonViewed: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 6,
  },
  reviewButtonTextViewed: {
    color: '#4CAF50',
  },
  returnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6F00',
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
    marginLeft: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F44336',
  },
  actionContainer: {
    paddingHorizontal: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  reorderButton: {
    backgroundColor: '#1976D2',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtonConfirm: {
    backgroundColor: '#F44336',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refundButton: {
    backgroundColor: '#9C27B0',
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  attachmentThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});

export default OrderDetailPage;
