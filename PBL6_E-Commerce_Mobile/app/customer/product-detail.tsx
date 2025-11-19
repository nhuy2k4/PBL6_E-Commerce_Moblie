import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { getProductById } from '../../services/productService';
import { useNavigation } from '@react-navigation/native';

export const options = { headerShown: false };

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addToCart } = useCart();
  const navigation = useNavigation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductById(Number(productId));
      console.log('Product detail raw data:', data);
      // Nếu data có trường data (giống API list), lấy data.data
      const productObj = data && data.data ? data.data : data;
      console.log('Product detail object for setProduct:', productObj);
      setProduct(productObj);
      // Set default variant (first variant or variant matching default size)
      if (productObj.variants && productObj.variants.length > 0) {
        // Try to find variant with size L (default)
        const defaultVariant = productObj.variants.find(v => 
          v.variantValues?.some(vv => vv.value === 'L')
        ) || productObj.variants[0];
        setSelectedVariantId(defaultVariant.id);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Product not found</Text>
      </View>
    );
  }


  const sizes = ['S', 'M', 'L', 'XL'];

  // Lấy đúng mảng ảnh như web, chỉ lấy string hợp lệ
  const productImages: string[] = [];
  if (typeof product.mainImage === 'string' && product.mainImage) productImages.push(product.mainImage);
  if (Array.isArray(product.images)) productImages.push(...product.images.filter(img => typeof img === 'string' && img));
  if (typeof product.imageUrl === 'string' && product.imageUrl) productImages.push(product.imageUrl);

  // Lấy giá rẻ nhất như web
  const cheapestVariant = product.variants?.reduce((min, v) =>
    v.price < min.price ? v : min
  , product.variants?.[0]);
  const displayPrice = (cheapestVariant && typeof cheapestVariant.price === 'number' ? cheapestVariant.price : undefined)
    || product.basePrice || product.price || 0;

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Find variant matching the selected size
    if (product?.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find((v: any) => 
        v.variantValues?.some((vv: any) => vv.value === size)
      );
      
      if (matchingVariant) {
        setSelectedVariantId(matchingVariant.id);
      } else {
        // If no matching variant for this size, use first variant
        setSelectedVariantId(product.variants[0].id);
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      // Use selectedVariantId if available, otherwise use first variant or fallback to product.id
      const variantId = selectedVariantId || 
                       (product?.variants && product.variants.length > 0 ? product.variants[0].id : product?.id);
      
      if (!variantId) {
        Alert.alert('Error', 'No variant available');
        return;
      }
      
      await addToCart(variantId, quantity);
      Alert.alert('Success', `${product?.name} added to cart!`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      // Use selectedVariantId if available, otherwise use first variant or fallback to product.id
      const variantId = selectedVariantId || 
                       (product?.variants && product.variants.length > 0 ? product.variants[0].id : product?.id);
      
      if (!variantId) {
        Alert.alert('Error', 'No variant available');
        return;
      }
      
      await addToCart(variantId, quantity);
      router.push('/customer/checkout');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Details</Text>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.headerButton}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF6B35" : colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          {/* Đảm bảo truyền đúng string uri cho Image */}
          {(() => {
            const imageUri = productImages[selectedImage];
            const isValidUri = typeof imageUri === 'string' && !!imageUri;
            return (
              <Image
                source={
                  isValidUri
                    ? { uri: imageUri }
                    : require('../../assets/images/icon.png')
                }
                style={styles.mainImage}
                resizeMode="cover"
              />
            );
          })()}
          
          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
              contentContainerStyle={styles.thumbnailContent}
            >
              {productImages.map((img: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailSelected,
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleSection}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>
                {product.category && typeof product.category === 'object' 
                  ? product.category.name 
                  : product.category || 'Category'}
              </Text>
            </View>
            <Text style={styles.price}>
              {displayPrice.toLocaleString('vi-VN')}₫
            </Text>
          </View>

          {/* Size Selector */}
          <View style={styles.sizeSection}>
            <Text style={styles.sectionLabel}>Select Size</Text>
            <View style={styles.sizeButtons}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => handleSizeSelect(size)}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      selectedSize === size && styles.sizeButtonTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description} numberOfLines={4}>
              {product.description || 'No description available for this product.'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.learnMore}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="add" size={24} color="#1A1A1A" />
          <Text style={styles.addToCartText}>Add To Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Ionicons name="bag-handle" size={20} color="#FFF" />
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageSection: {
    backgroundColor: '#FFF',
    paddingTop: 20,
  },
  mainImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnailContent: {
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  thumbnailSelected: {
    borderColor: '#FF6B35',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sizeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  sizeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  sizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  sizeButtonTextActive: {
    color: '#FFF',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    minWidth: 40,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
  },
  learnMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    backgroundColor: '#FFF',
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    gap: 8,
  },
  buyNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
