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
const newArrivalProducts: Product[] = [
  {
    id: 9,
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-cancelling',
    price: 8000000,
    imageUrl: 'https://via.placeholder.com/400x400/FF2D55/FFFFFF?text=Sony+XM5',
    category: 'Electronics',
    stock: 18,
    rating: 4.8,
    reviews: 145,
  },
  {
    id: 10,
    name: 'Samsung Galaxy S24',
    description: 'Latest flagship phone',
    price: 22000000,
    imageUrl: 'https://via.placeholder.com/400x400/AF52DE/FFFFFF?text=Galaxy+S24',
    category: 'Electronics',
    stock: 25,
    rating: 4.7,
    reviews: 234,
  },
  {
    id: 11,
    name: 'DJI Mini 4 Pro',
    description: 'Compact drone',
    price: 18000000,
    imageUrl: 'https://via.placeholder.com/400x400/32ADE6/FFFFFF?text=DJI+Mini',
    category: 'Electronics',
    stock: 12,
    rating: 4.9,
    reviews: 87,
  },
  {
    id: 12,
    name: 'GoPro Hero 12',
    description: 'Action camera',
    price: 9500000,
    imageUrl: 'https://via.placeholder.com/400x400/00C7BE/FFFFFF?text=GoPro+12',
    category: 'Electronics',
    stock: 20,
    rating: 4.6,
    reviews: 156,
  },
];

export default function NewArrivalSection() {
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
          <View style={[styles.indicator, { backgroundColor: '#34C759' }]} />
          <Text style={[styles.subtitle, { color: '#34C759' }]}>Featured</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>New Arrival</Text>
      </View>

      {/* Products List */}
      <FlatList
        data={newArrivalProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* View All Button */}
      <TouchableOpacity
        style={[styles.viewAllButton, { backgroundColor: '#34C759' }]}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.viewAllText}>Explore All New Arrivals</Text>
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
  listContent: {
    paddingRight: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  viewAllButton: {
    marginTop: 20,
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
