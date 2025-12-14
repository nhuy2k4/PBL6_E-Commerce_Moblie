import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import CartItem from '../../CartItem';
import { CartItem as CartItemType } from '@/types';

interface ProductsInCartProps {
  items: CartItemType[];
}

export default function ProductsInCart({ items }: ProductsInCartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          Giỏ hàng trống
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <CartItem item={item} />}
      keyExtractor={(item) => item.productId.toString()}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
  },
});
