import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createReview, uploadReviewImages } from '../../services/reviewService';
import { getProductById } from '../../services/productService';

const WriteReviewPage = () => {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const MIN_COMMENT_LENGTH = 10;
  const MAX_COMMENT_LENGTH = 1000;
  const MAX_IMAGES = 5;

  useEffect(() => {
    loadProduct();
    requestPermissions();
  }, [productId]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh để tải lên hình ảnh');
      }
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(Number(productId));
      console.log('📦 Product loaded:', response.data);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingPress = (value: number) => {
    setRating(value);
  };

  const pickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Thông báo', `Chỉ được tải lên tối đa ${MAX_IMAGES} hình ảnh`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const validateForm = () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return false;
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      Alert.alert('Thông báo', `Nhận xét phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự`);
      return false;
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
      Alert.alert('Thông báo', `Nhận xét không được vượt quá ${MAX_COMMENT_LENGTH} ký tự`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      let imageUrls: string[] = [];

      // Upload images first if any
      if (images.length > 0) {
        console.log('📤 Uploading images...');
        setUploadingImages(true);
        
        try {
          // Convert URIs to File objects for upload
          const formData = new FormData();
          
          for (let i = 0; i < images.length; i++) {
            const uri = images[i];
            const filename = uri.split('/').pop() || `image_${i}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('files', {
              uri,
              name: filename,
              type,
            } as any);
          }

          const uploadResponse = await uploadReviewImages(formData);
          console.log('✅ Images uploaded:', uploadResponse);
          
          // Extract URLs from response
          imageUrls = uploadResponse.data.map((img: any) => img.url);
        } catch (uploadError) {
          console.error('❌ Error uploading images:', uploadError);
          Alert.alert('Lỗi', 'Không thể tải lên hình ảnh. Vui lòng thử lại.');
          setUploadingImages(false);
          setSubmitting(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      // Create review with uploaded image URLs
      console.log('📝 Creating review...');
      const reviewData = {
        rating,
        comment: comment.trim(),
        images: imageUrls,
      };

      await createReview(Number(productId), reviewData);
      
      Alert.alert(
        'Thành công',
        'Cảm ơn bạn đã đánh giá sản phẩm!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to product detail
              router.replace(`/customer/product-detail?id=${productId}`);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error submitting review:', error);
      const errorMessage = error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
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

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Product Info */}
        <View style={styles.productCard}>
          <Image
            source={{ uri: product.mainImage || product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Chất lượng sản phẩm <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingPress(star)}
                style={styles.starButton}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#FFB800' : '#E0E0E0'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Tuyệt vời'}
            </Text>
          )}
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Nhận xét của bạn <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={6}
            placeholder={`Hãy chia sẻ cảm nhận của bạn về sản phẩm (tối thiểu ${MIN_COMMENT_LENGTH} ký tự)`}
            value={comment}
            onChangeText={setComment}
            maxLength={MAX_COMMENT_LENGTH}
            textAlignVertical="top"
          />
          <Text
            style={[
              styles.charCount,
              comment.length >= MAX_COMMENT_LENGTH - 50 && styles.charCountWarning,
            ]}
          >
            {comment.length}/{MAX_COMMENT_LENGTH}
          </Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Thêm hình ảnh (tùy chọn)</Text>
          <Text style={styles.sectionHint}>Tối đa {MAX_IMAGES} hình ảnh</Text>
          
          <View style={styles.imagesGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  delayPressIn={0}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < MAX_IMAGES && (
              <TouchableOpacity 
                style={styles.addImageButton} 
                onPress={pickImages}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Ionicons name="camera" size={32} color="#999" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (submitting || uploadingImages) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || uploadingImages}
          activeOpacity={0.8}
          delayPressIn={0}
        >
          {submitting || uploadingImages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>
                {uploadingImages ? 'Đang tải ảnh...' : 'Đang gửi...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Bằng việc gửi đánh giá, bạn đồng ý với điều khoản sử dụng
        </Text>
      </View>
    </View>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  sectionHint: {
    fontSize: 13,
    color: '#666',
    marginTop: -8,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFB800',
    marginTop: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  charCountWarning: {
    color: '#FF9800',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  addImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default WriteReviewPage;
