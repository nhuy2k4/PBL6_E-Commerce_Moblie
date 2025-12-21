import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getShopById } from '@/services/shopService';
import { getProductsByShopId } from '@/services/productService';
import { ProductCard } from '@/components/common/ProductCard';

export const options = { headerShown: false };

const DEFAULT_LOGO = 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764911991/xwz5cpybxo1g1_sppbqi.png';
const DEFAULT_BANNER = 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764912579/images_qs3s47.jpg';

interface Shop {
  id: number;
  name: string;
  description: string;
  status: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  address: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  rating: number | null;
  reviewCount: number | null;
  shopPhone: string | null;
  shopEmail: string | null;
}

export default function ShopDetailScreen() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    loadShop();
  }, [shopId]);

  useEffect(() => {
    if (shopId) {
      loadProducts();
    }
  }, [shopId, currentPage]);

  const loadShop = async () => {
    if (!shopId) return;
    
    setLoading(true);
    try {
      const data = await getShopById(Number(shopId));
      setShop(data);
    } catch (error) {
      console.error('Failed to load shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!shopId) return;

    setProductsLoading(true);
    try {
      const response = await getProductsByShopId(Number(shopId), currentPage, pageSize);
      
      // Backend response structure: { status, message, data: { content, page } }
      const data = response.data || response;
      setProducts(data.content || []);
      
      if (data.page) {
        setTotalPages(data.page.totalPages || 1);
        setTotalProducts(data.page.totalElements || 0);
      }
    } catch (error) {
      console.error('Failed to load shop products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const getFullAddress = () => {
    if (!shop) return '';
    const parts = [];
    if (shop.address) parts.push(shop.address);
    if (shop.wardName) parts.push(shop.wardName);
    if (shop.districtName) parts.push(shop.districtName);
    if (shop.provinceName) parts.push(shop.provinceName);
    return parts.join(', ');
  };

  const formatRating = (rating: number | null) => {
    if (!rating || rating === 0) return 'Chưa có đánh giá';
    return rating.toFixed(1);
  };

  const handleCall = () => {
    if (shop?.shopPhone) {
      Linking.openURL(`tel:${shop.shopPhone}`);
    }
  };

  const handleEmail = () => {
    if (shop?.shopEmail) {
      Linking.openURL(`mailto:${shop.shopEmail}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shop</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải thông tin shop...</Text>
        </View>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shop</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyTitle}>Shop không tồn tại</Text>
          <Text style={styles.emptyText}>Shop bạn tìm kiếm không tồn tại hoặc đã bị xóa.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin Shop</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner */}
        <Image
          source={{ uri: shop.bannerUrl || DEFAULT_BANNER }}
          style={styles.banner}
        />

        {/* Shop Info Card */}
        <View style={styles.shopCard}>
          {/* Logo */}
          <Image
            source={{ uri: shop.logoUrl || DEFAULT_LOGO }}
            style={styles.logo}
          />

          {/* Shop Name & Status */}
          <View style={styles.shopHeader}>
            <Text style={styles.shopName}>{shop.name}</Text>
            {shop.status === 'ACTIVE' && (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.activeBadgeText}>Đang hoạt động</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {shop.description && (
            <Text style={styles.description}>{shop.description}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#FFA500" />
              <Text style={styles.statText}>{formatRating(shop.rating)}</Text>
              {shop.reviewCount !== null && shop.reviewCount > 0 && (
                <Text style={styles.statSubText}>({shop.reviewCount})</Text>
              )}
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={18} color="#FF6B35" />
              <Text style={styles.statText}>{totalProducts}+ sản phẩm</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            {getFullAddress() && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.contactText} numberOfLines={2}>
                  {getFullAddress()}
                </Text>
              </View>
            )}

            {shop.shopPhone && (
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{shop.shopPhone}</Text>
              </TouchableOpacity>
            )}

            {shop.shopEmail && (
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{shop.shopEmail}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Sản phẩm của shop</Text>

          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Chưa có sản phẩm</Text>
              <Text style={styles.emptyText}>Shop này chưa có sản phẩm nào.</Text>
            </View>
          ) : (
            <>
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <View key={product.id} style={styles.productWrapper}>
                    <ProductCard 
                      product={product}
                      onPress={() => router.push({
                        pathname: '/customer/product-detail',
                        params: { 
                          productId: product.id.toString()
                        }
                      })}
                    />
                  </View>
                ))}
              </View>

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
                  >
                    <Text style={styles.paginationButtonText}>Trước</Text>
                  </TouchableOpacity>
                  <Text style={styles.paginationText}>
                    Trang {currentPage + 1} / {totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    style={[styles.paginationButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
                  >
                    <Text style={styles.paginationButtonText}>Sau</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  shopCard: {
    backgroundColor: '#FFF',
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFF',
    alignSelf: 'center',
    marginTop: -50,
    backgroundColor: '#F5F5F5',
  },
  shopHeader: {
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statSubText: {
    fontSize: 12,
    color: '#999',
  },
  contactSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  productsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productWrapper: {
    width: '48%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyProducts: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
