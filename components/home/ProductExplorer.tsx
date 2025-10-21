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
import { explorerProducts } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

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
