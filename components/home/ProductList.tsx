
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

type Props = {
  products: Product[];
  onProductPress?: (product: Product) => void;
};

export const ProductList: React.FC<Props> = ({ products, onProductPress }) => {
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
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
});

