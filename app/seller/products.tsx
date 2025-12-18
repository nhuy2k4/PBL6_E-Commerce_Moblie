import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  StyleSheet,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { getSellerProducts, deleteSellerProduct } from '../../services/sellerService';

type SellerProduct = {
  id: number;
  name: string;
  description: string;
  mainImage: string;
  basePrice: number;
  isActive: boolean;
  productCondition: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  categoryName: string;
  variants?: any[];
};

const SellerProducts = () => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  const fetchProducts = async (pageNum = 0) => {
    try {
      if (!refreshing) setLoading(true);
      const response = await getSellerProducts(pageNum, 20);
      setProducts(response.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchProducts(0);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSellerProduct(id);
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
              fetchProducts(page);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderProduct = ({ item }: { item: SellerProduct }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.mainImage }} 
        style={styles.productImage}
        defaultSource={require('@/assets/images/icon.png')}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.basePrice)}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.metaText}>Kho: {item.stock}</Text>
          <Text style={styles.metaText}>Đã bán: {item.soldCount}</Text>
          <Text style={styles.metaText}>⭐ {item.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.productBadges}>
          <View style={[styles.badge, { backgroundColor: item.isActive ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.badgeText}>{item.isActive ? 'Đang bán' : 'Tạm ẩn'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.categoryName}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)} 
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  productBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default SellerProducts;
