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
import { bestSellerProducts } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

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
