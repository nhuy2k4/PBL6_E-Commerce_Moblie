import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export default function ProductList({ products, onProductPress }: ProductListProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => onProductPress?.(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
});
