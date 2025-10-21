import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

// Mock data - replace with API call
const bestSellerProducts: Product[] = [
  {
    id: 5,
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone model',
    price: 29000000,
    imageUrl: 'https://via.placeholder.com/400x400/007AFF/FFFFFF?text=iPhone+15',
    category: 'Electronics',
    stock: 20,
    rating: 4.9,
    reviews: 512,
  },
  {
    id: 6,
    name: 'AirPods Pro',
    description: 'Wireless earbuds',
    price: 6000000,
    imageUrl: 'https://via.placeholder.com/400x400/34C759/FFFFFF?text=AirPods',
    category: 'Electronics',
    stock: 50,
    rating: 4.8,
    reviews: 423,
  },
  {
    id: 7,
    name: 'iPad Air',
    description: 'Powerful tablet',
    price: 15000000,
    imageUrl: 'https://via.placeholder.com/400x400/FF9500/FFFFFF?text=iPad+Air',
    category: 'Electronics',
    stock: 15,
    rating: 4.7,
    reviews: 298,
  },
  {
    id: 8,
    name: 'MacBook Air M2',
    description: 'Thin and light laptop',
    price: 28000000,
    imageUrl: 'https://via.placeholder.com/400x400/5856D6/FFFFFF?text=MacBook',
    category: 'Electronics',
    stock: 10,
    rating: 4.9,
    reviews: 367,
  },
];

export default function BestSellerSection() {
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
        <View style={styles.titleSection}>
          <View style={styles.titleContainer}>
            <View style={[styles.indicator, { backgroundColor: '#007AFF' }]} />
            <Text style={[styles.subtitle, { color: '#007AFF' }]}>This Month</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Best Selling Products
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.viewAllLink, { backgroundColor: '#007AFF' }]}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Text style={styles.viewAllLinkText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={bestSellerProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewAllLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewAllLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingRight: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
});
