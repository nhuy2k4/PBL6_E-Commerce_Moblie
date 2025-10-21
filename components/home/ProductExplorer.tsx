import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

// Mock data - replace with API call
const explorerProducts: Product[] = [
  {
    id: 13,
    name: 'Logitech MX Master 3',
    description: 'Wireless mouse',
    price: 2500000,
    imageUrl: 'https://via.placeholder.com/400x400/FF9500/FFFFFF?text=MX+Master',
    category: 'Accessories',
    stock: 35,
    rating: 4.8,
    reviews: 412,
  },
  {
    id: 14,
    name: 'Dell UltraSharp 27"',
    description: '4K Monitor',
    price: 12000000,
    imageUrl: 'https://via.placeholder.com/400x400/5856D6/FFFFFF?text=Monitor',
    category: 'Electronics',
    stock: 15,
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 15,
    name: 'Razer BlackWidow V3',
    description: 'Mechanical keyboard',
    price: 3500000,
    imageUrl: 'https://via.placeholder.com/400x400/30D158/FFFFFF?text=Keyboard',
    category: 'Accessories',
    stock: 28,
    rating: 4.6,
    reviews: 267,
  },
  {
    id: 16,
    name: 'Webcam 4K Pro',
    description: 'Professional webcam',
    price: 4000000,
    imageUrl: 'https://via.placeholder.com/400x400/FF375F/FFFFFF?text=Webcam',
    category: 'Electronics',
    stock: 22,
    rating: 4.5,
    reviews: 134,
  },
];

export default function ProductExplorer() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleProductPress = (product: Product) => {
    console.log('Product pressed:', product.id);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.indicator, { backgroundColor: '#FF9500' }]} />
          <Text style={[styles.subtitle, { color: '#FF9500' }]}>Our Products</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Explore Our Products
        </Text>
      </View>

      {/* Products Grid - 2 columns */}
      <FlatList
        data={explorerProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
      />

      {/* View All Button */}
      <TouchableOpacity
        style={[styles.viewAllButton, { backgroundColor: '#FF9500' }]}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.viewAllText}>View All Products</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
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
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
