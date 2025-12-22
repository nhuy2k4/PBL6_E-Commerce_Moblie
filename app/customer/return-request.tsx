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
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getOrderDetail } from '../../services/orderService';
import { createRefund } from '../../services/refundService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../../services/cloudinaryService';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  variantName: string | null;
  variantAttributes?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderDetail {
  id: number;
  status: string;
  items: OrderItem[];
}

const REFUND_REASONS = [
  'Sản phẩm bị lỗi/hư hỏng',
  'Sản phẩm không đúng mô tả',
  'Sản phẩm không đúng màu/size',
  'Nhận được sản phẩm khác',
  'Không còn nhu cầu sử dụng',
  'Khác'
];

const ReturnRequestPage = () => {
  const { orderId, itemId } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  
  // Form state
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId, itemId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(Number(orderId));
      const orderData = response.data || response;
      setOrder(orderData);
      
      // Find the specific item
      const item = orderData.items?.find((i: OrderItem) => i.id === Number(itemId));
      
      if (!item) {
        Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
        router.back();
        return;
      }
      
      setSelectedItem(item);
      setReturnQuantity(item.quantity);
    } catch (error) {
      console.error('❌ Error loading order:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
      }
    } catch (error) {
      console.error('❌ Error picking images:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedReason) {
      Alert.alert('Thông báo', 'Vui lòng chọn lý do trả hàng');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Thông báo', 'Vui lòng mô tả chi tiết');
      return;
    }

    if (returnQuantity < 1 || returnQuantity > (selectedItem?.quantity || 0)) {
      Alert.alert('Thông báo', `Số lượng phải từ 1 đến ${selectedItem?.quantity}`);
      return;
    }

    if (images.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng tải lên ít nhất 1 ảnh bằng chứng');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload images
      console.log('📤 Uploading', images.length, 'images...');
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        try {
          const imageUri = images[i];
          console.log(`📤 Uploading image ${i + 1}/${images.length}:`, imageUri);

          // Upload to Cloudinary via backend (folder=refund)
          const result = await uploadToCloudinary(imageUri, 'refund');
          
          if (result && result.secure_url) {
            uploadedUrls.push(result.secure_url);
            console.log(`✅ Uploaded image ${i + 1}/${images.length}:`, result.secure_url);
          } else {
            throw new Error('Upload response không có URL');
          }
        } catch (error: any) {
          console.error(`❌ Failed to upload image ${i + 1}:`, error);
          const errorMsg = error.message || 'Lỗi không xác định';
          throw new Error(`Không thể tải ảnh ${i + 1} lên: ${errorMsg}`);
        }
      }

      console.log('✅ All images uploaded successfully:', uploadedUrls.length);

      // Step 2: Create refund request
      // Backend expects imageUrl as JSON string, but we stringify the whole payload
      // So we send the array directly and let JSON.stringify handle it
      const requestData = {
        orderId: Number(orderId),
        amount: (selectedItem?.price || 0) * returnQuantity,
        description: `${selectedReason}\n\n${description}\n\nSản phẩm: ${selectedItem?.productName}\nSố lượng: ${returnQuantity}/${selectedItem?.quantity}`,
        imageUrl: JSON.stringify(uploadedUrls), // Convert array to JSON string for backend
      };

      console.log('📝 Creating refund request:', requestData);
      await createRefund(requestData);

      Alert.alert(
        'Thành công',
        'Đã gửi yêu cầu trả hàng thành công! Vui lòng chờ shop xét duyệt.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/customer/OrderListPage'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error submitting refund:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi yêu cầu trả hàng';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6F00" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!order || !selectedItem) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu trả hàng/hoàn tiền</Text>
      </View>

      {/* Product Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm</Text>
        <View style={styles.productCard}>
          <Image
            source={{ uri: selectedItem.productImage }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{selectedItem.productName}</Text>
            {selectedItem.variantName && (
              <Text style={styles.variantText}>Phân loại: {selectedItem.variantName}</Text>
            )}
            <Text style={styles.priceText}>{formatPrice(selectedItem.price)}</Text>
            <Text style={styles.quantityText}>Số lượng đã mua: {selectedItem.quantity}</Text>
          </View>
        </View>
      </View>

      {/* Return Quantity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Số lượng muốn trả</Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            onPress={() => setReturnQuantity(Math.max(1, returnQuantity - 1))}
            style={styles.quantityButton}
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{returnQuantity}</Text>
          <TouchableOpacity
            onPress={() => setReturnQuantity(Math.min(selectedItem.quantity, returnQuantity + 1))}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reason Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lý do trả hàng *</Text>
        {REFUND_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={[
              styles.reasonButton,
              selectedReason === reason && styles.reasonButtonSelected,
            ]}
            onPress={() => setSelectedReason(reason)}
          >
            <Text
              style={[
                styles.reasonText,
                selectedReason === reason && styles.reasonTextSelected,
              ]}
            >
              {reason}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả chi tiết *</Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={4}
          placeholder="Vui lòng mô tả chi tiết tình trạng sản phẩm, lý do muốn trả hàng..."
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </View>

      {/* Image Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ảnh bằng chứng * (Tối đa 5 ảnh)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF0000" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <Ionicons name="camera" size={32} color="#999" />
              <Text style={styles.addImageText}>Thêm ảnh</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Refund Amount */}
      <View style={styles.section}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Số tiền hoàn:</Text>
          <Text style={styles.amountValue}>
            {formatPrice((selectedItem.price || 0) * returnQuantity)}
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  reasonButtonSelected: {
    borderColor: '#FF6F00',
    backgroundColor: '#FFF4E6',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
  },
  reasonTextSelected: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  imageList: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#333',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  submitButton: {
    backgroundColor: '#FF6F00',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default ReturnRequestPage;
