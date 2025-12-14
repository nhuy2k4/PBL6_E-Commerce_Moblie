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
import { getProductById, getProductImages } from '../../services/productService';
import { useNavigation } from '@react-navigation/native';
import ReviewSection from '../../components/feature/ReviewSection';


export const options = { headerShown: false };

interface VariantImage {
  id: number;
  attributeValue: string;
  imageUrl: string;
  publicId: string;
}

interface ProductImagesData {
  mainImage: string;
  galleryImages: Array<{
    id: number;
    url: string;
    publicId: string;
    displayOrder: number;
    variantAttributeValue: string | null;
  }>;
  primaryAttribute: {
    id: number;
    name: string;
    values: string[];
  } | null;
  variantImages: { [key: string]: VariantImage };
}

export default function ProductDetailScreen() {
  const { productId, variantId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addToCart } = useCart();
  const navigation = useNavigation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [productImagesData, setProductImagesData] = useState<ProductImagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const sizes = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    
    const sizeSet = new Set<string>();
    product.variants.forEach((variant: any) => {
      if (variant.variantValues) {
        variant.variantValues.forEach((vv: any) => {
          // Check by productAttributeId = 1 (Size) hoặc attributeName
          if (vv.productAttributeId === 1 || 
              vv.attributeName?.toLowerCase().includes('size') ||
              vv.productAttribute?.name?.toLowerCase().includes('size')) {
            sizeSet.add(vv.value);
          }
        });
      }
    });
    
    return Array.from(sizeSet).sort((a, b) => {
      // Sort numerically if possible
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
  }, [product?.variants]);

  const productColors = React.useMemo(() => {
    // Ưu tiên lấy từ primaryAttribute của productImagesData
    if (productImagesData?.primaryAttribute?.values && productImagesData.primaryAttribute.values.length > 0) {
      console.log('🎨 Colors from primaryAttribute:', productImagesData.primaryAttribute.values);
      return productImagesData.primaryAttribute.values;
    }
    
    // Fallback: lấy từ product variants
    console.log('🔍 Product variants:', product?.variants);
    if (!product?.variants || product.variants.length === 0) return [];
    
    const colorSet = new Set<string>();
    
    product.variants.forEach((variant: any) => {
      if (variant.variantValues) {
        variant.variantValues.forEach((vv: any) => {
          // Check by productAttributeId = 2 (Color) hoặc attributeName
          if (vv.productAttributeId === 2 || 
              vv.attributeName?.toLowerCase().includes('color') || 
              vv.productAttribute?.name?.toLowerCase().includes('color')) {
            colorSet.add(vv.value);
          }
        });
      }
    });
    
    console.log('🔍 Final colors set:', Array.from(colorSet));
    return Array.from(colorSet);
  }, [product?.variants, productImagesData?.primaryAttribute]);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load product data first
      const productData = await getProductById(Number(productId));
      console.log('Product detail raw data:', productData);
      
      const productObj = productData && productData.data ? productData.data : productData;
      console.log('Product detail object for setProduct:', productObj);
      setProduct(productObj);
      
      // Try to load images (optional - product can work without it)
      let imagesObj: any = null;
      try {
        const imagesData = await getProductImages(Number(productId));
        console.log('🖼️ Product images data:', imagesData);
        imagesObj = imagesData && imagesData.data ? imagesData.data : imagesData;
        setProductImagesData(imagesObj);
      } catch (imageError) {
        console.warn('⚠️ Failed to load variant images, using fallback:', imageError);
      }
      
      // Initialize image gallery
      const initialImages: string[] = [];
      if (imagesObj?.mainImage) {
        initialImages.push(imagesObj.mainImage);
      } else if (productObj.mainImage) {
        initialImages.push(productObj.mainImage);
      }
      
      if (imagesObj?.galleryImages) {
        imagesObj.galleryImages.forEach((img: any) => {
          if (img.url && !img.variantAttributeValue) {
            initialImages.push(img.url);
          }
        });
      } else if (productObj.images && Array.isArray(productObj.images)) {
        initialImages.push(...productObj.images);
      }
      
      setCurrentImages(initialImages);
      
      if (productObj.variants && productObj.variants.length > 0) {
        let selectedVariant;
        
        // Nếu có variantId từ URL (từ order detail), tìm variant đó
        if (variantId) {
          selectedVariant = productObj.variants.find((v: any) => v.id === Number(variantId));
          console.log('🎯 Found variant from order:', selectedVariant);
        }
        
        // Nếu không tìm thấy, dùng default variant
        if (!selectedVariant) {
          selectedVariant = productObj.variants.find((v: any) => 
            v.variantValues?.some((vv: any) => vv.value === 'L')
          ) || productObj.variants[0];
        }
        
        setSelectedVariantId(selectedVariant.id);
        
        // Auto-select size và color từ variant
        let autoSelectedColor: string | null = null;
        if (selectedVariant.variantValues) {
          selectedVariant.variantValues.forEach((vv: any) => {
            // Check for Size (productAttributeId = 1)
            if (vv.productAttributeId === 1 ||
                vv.attributeName?.toLowerCase().includes('size') ||
                vv.productAttribute?.name?.toLowerCase().includes('size')) {
              setSelectedSize(vv.value);
              console.log('🎯 Auto-selected size:', vv.value);
            }
            // Check for Color (productAttributeId = 2)
            if (vv.productAttributeId === 2 ||
                vv.attributeName?.toLowerCase().includes('color') ||
                vv.productAttribute?.name?.toLowerCase().includes('color')) {
              autoSelectedColor = vv.value;
              setSelectedColor(vv.value);
              console.log('🎯 Auto-selected color:', vv.value);
            }
          });
        }
        
        // Update images for auto-selected color (if variant images available)
        if (autoSelectedColor && imagesObj?.variantImages && imagesObj.variantImages[autoSelectedColor]) {
          const variantImage = imagesObj.variantImages[autoSelectedColor].imageUrl;
          const updatedImages = [variantImage, ...initialImages];
          setCurrentImages(updatedImages);
          setSelectedImage(0);
        }
      }
    } catch (error) {
      console.error('❌ Error loading product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [productId, variantId]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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

  const cheapestVariant = product.variants?.reduce((min, v) =>
    v.price < min.price ? v : min
  , product.variants?.[0]);
  const displayPrice = (cheapestVariant && typeof cheapestVariant.price === 'number' ? cheapestVariant.price : undefined)
    || product.basePrice || product.price || 0;

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Find variant matching both selected size and color
    if (product?.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find((v: any) => {
        const hasSize = v.variantValues?.some((vv: any) => 
          (vv.productAttributeId === 1 || 
           vv.attributeName?.toLowerCase().includes('size') ||
           vv.productAttribute?.name?.toLowerCase().includes('size')) && 
          vv.value === size
        );
        
        // Nếu có chọn color, phải khớp cả size và color
        if (selectedColor) {
          const hasColor = v.variantValues?.some((vv: any) => 
            (vv.productAttributeId === 2 ||
             vv.attributeName?.toLowerCase().includes('color') ||
             vv.productAttribute?.name?.toLowerCase().includes('color')) &&
            vv.value === selectedColor
          );
          return hasSize && hasColor;
        }
        
        // Nếu chưa chọn color, chỉ cần khớp size
        return hasSize;
      });
      
      if (matchingVariant) {
        setSelectedVariantId(matchingVariant.id);
        console.log('🎯 Selected variant:', matchingVariant.id, 'size:', size, 'color:', selectedColor);
        
        // Auto-update color nếu chưa chọn
        if (!selectedColor && matchingVariant.variantValues) {
          const colorValue = matchingVariant.variantValues.find((vv: any) => 
            vv.productAttributeId === 2 ||
            vv.attributeName?.toLowerCase().includes('color') ||
            vv.productAttribute?.name?.toLowerCase().includes('color')
          );
          if (colorValue) {
            setSelectedColor(colorValue.value);
          }
        }
      } else {
        // If no matching variant for this combination, use first variant with this size
        const sizeVariant = product.variants.find((v: any) => 
          v.variantValues?.some((vv: any) => vv.value === size)
        );
        if (sizeVariant) {
          setSelectedVariantId(sizeVariant.id);
        }
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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          {/* Main Image - use currentImages */}
          {(() => {
            const imageUri = currentImages.length > 0 ? currentImages[selectedImage] : product.mainImage;
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
          
          {/* Thumbnail Images - use currentImages */}
          {currentImages.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
              contentContainerStyle={styles.thumbnailContent}
            >
              {currentImages.map((img: string, index: number) => (
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
              {(() => {
                // Hiển thị giá của variant đã chọn nếu có
                if (selectedVariantId && product.variants) {
                  const currentVariant = product.variants.find((v: any) => v.id === selectedVariantId);
                  if (currentVariant && currentVariant.price) {
                    return currentVariant.price.toLocaleString('vi-VN') + '₫';
                  }
                }
                // Fallback về displayPrice
                return displayPrice.toLocaleString('vi-VN') + '₫';
              })()}
            </Text>
          </View>

          {/* Size Selector - chỉ hiển thị khi có sizes */}
          {sizes.length > 0 && (
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
          )}

          {/* Nếu có màu sắc, hiển thị thêm color selector */}
          {productColors.length > 0 && (
            <View style={styles.sizeSection}>
              <Text style={styles.sectionLabel}>Select Color</Text>
              <View style={styles.sizeButtons}>
                {productColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      console.log('🎨 Color selected:', color);
                      setSelectedColor(color);
                      
                      // Update images for selected color (if available)
                      if (productImagesData?.variantImages && productImagesData.variantImages[color]) {
                        const variantImage = productImagesData.variantImages[color].imageUrl;
                        const baseImages: string[] = [];
                        
                        // Get base images (mainImage + gallery images)
                        if (productImagesData.mainImage) baseImages.push(productImagesData.mainImage);
                        if (productImagesData.galleryImages) {
                          productImagesData.galleryImages.forEach((img: any) => {
                            if (img.url && !img.variantAttributeValue) {
                              baseImages.push(img.url);
                            }
                          });
                        }
                        
                        // Put variant image first
                        const updatedImages = [variantImage, ...baseImages];
                        setCurrentImages(updatedImages);
                        setSelectedImage(0);
                        console.log('🖼️ Updated images for color:', color);
                      } else {
                        console.log('⚠️ No variant image for color:', color, '- using default images');
                      }
                      
                      // Tìm variant khớp cả color và size đã chọn
                      const matchingVariant = product?.variants?.find((v: any) => {
                        const hasColor = v.variantValues?.some((vv: any) => 
                          (vv.productAttributeId === 2 ||
                           vv.attributeName?.toLowerCase().includes('color') ||
                           vv.productAttribute?.name?.toLowerCase().includes('color')) &&
                          vv.value === color
                        );
                        
                        // Nếu có chọn size, phải khớp cả color và size
                        if (selectedSize) {
                          const hasSize = v.variantValues?.some((vv: any) => 
                            (vv.productAttributeId === 1 ||
                             vv.attributeName?.toLowerCase().includes('size') ||
                             vv.productAttribute?.name?.toLowerCase().includes('size')) &&
                            vv.value === selectedSize
                          );
                          return hasColor && hasSize;
                        }
                        
                        // Nếu chưa chọn size, chỉ cần khớp color
                        return hasColor;
                      });
                      
                      if (matchingVariant) {
                        setSelectedVariantId(matchingVariant.id);
                        console.log('🎯 Selected variant:', matchingVariant.id, 'color:', color, 'size:', selectedSize);
                        
                        // Auto-update size nếu chưa chọn
                        if (!selectedSize && matchingVariant.variantValues) {
                          const sizeValue = matchingVariant.variantValues.find((vv: any) => 
                            vv.productAttributeId === 1 ||
                            vv.attributeName?.toLowerCase().includes('size') ||
                            vv.productAttribute?.name?.toLowerCase().includes('size')
                          );
                          if (sizeValue) {
                            setSelectedSize(sizeValue.value);
                          }
                        }
                      }
                    }}
                    style={[
                      styles.sizeButton,
                      styles.colorButton,
                      selectedColor === color && styles.sizeButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.sizeButtonText,
                      selectedColor === color && styles.sizeButtonTextActive,
                    ]}>{color}</Text>

                    {/* Indicator nếu có ảnh variant */}
                    {productImagesData?.variantImages?.[color] && (
                      <View style={styles.imageIndicator}>
                        <Ionicons name="image" size={12} color={selectedColor === color ? "#FFF" : "#1976D2"} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Variant Info - SKU & Stock */}
          {selectedVariantId && product.variants && (() => {
                const currentVariant = product.variants.find((v: any) => v.id === selectedVariantId);
                if (!currentVariant) return null;
                
                return (
                  <View style={styles.variantInfoContainer}>
                    <View style={styles.variantInfoRow}>
                      <Ionicons name="barcode-outline" size={16} color="#666" />
                      <Text style={styles.variantInfoLabel}>Mã sản phẩm: </Text>
                      <Text style={styles.variantInfoValue}>{currentVariant.sku || 'N/A'}</Text>
                    </View>
                    <View style={styles.variantInfoRow}>
                      <Ionicons name="cube-outline" size={16} color="#666" />
                      <Text style={styles.variantInfoLabel}>Tồn kho: </Text>
                      <Text style={[
                        styles.variantInfoValue,
                        currentVariant.stock > 0 ? styles.inStock : styles.outOfStock
                      ]}>
                        {currentVariant.stock} sản phẩm
                      </Text>
                    </View>
                    {currentVariant.price && (
                      <View style={styles.variantInfoRow}>
                        <Ionicons name="pricetag-outline" size={16} color="#666" />
                        <Text style={styles.variantInfoLabel}>Giá: </Text>
                        <Text style={styles.variantPriceValue}>
                          {currentVariant.price.toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })()}

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


        {/* Reviews Section */}
        {product && (<ReviewSection productId={product.id} />)}

      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyNowButton}
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
  scrollContent: {
    paddingBottom: 120,
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
    paddingBottom: 24,
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

  imageIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 2,
  },
  variantInfoSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  variantInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderColor: '#E0E0E0',
  },
  variantInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  variantInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  variantInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  inStock: {
    color: '#4CAF50',
  },
  outOfStock: {
    color: '#F44336',
  },
  variantPriceValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
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
  colorButton: {
    width: 'auto',
    paddingHorizontal: 16,
    minWidth: 50,
  },
});
