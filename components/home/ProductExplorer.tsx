import type { Product } from '../../types';
import { Colors } from '../../styles/theme';
import { ProductCard } from '../common/ProductCard';
import { getAllProducts } from '../../services/productService';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

export default function ProductExplorer() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'] as typeof Colors.light;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts(0, 12);
      
      // Handle ResponseDTO structure from backend
      if (response && response.status === 200 && response.data) {
        const productsArray = Array.isArray(response.data.content) 
          ? response.data.content 
          : [];
        setProducts(productsArray.slice(0, 10));
      } else {
        console.warn('Unexpected response format:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading explorer products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/customer/product-detail?productId=${product.id}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header with See All */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <View style={[styles.indicator, { backgroundColor: '#FF9500' }]} />
            <Text style={[styles.subtitle, { color: '#FF9500' }]}>Our Products</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Explore Our Products
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/customer/product-list', params: { title: 'Explore Our Products' } } as any)}>
          <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid - 2 columns */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item: Product) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridContent: {
    paddingBottom: 8,
  },
  productCard: {
    width: CARD_WIDTH,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
