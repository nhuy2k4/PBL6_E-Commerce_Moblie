import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { CartItem } from '@/types';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
}

export default function CheckoutSummary({ items, total }: CheckoutSummaryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}>
      <Text style={[styles.title, { color: colors.text }]}>Tóm tắt đơn hàng</Text>
      
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
              {item.productName} x {item.quantity}
            </Text>
            <Text style={[styles.itemPrice, { color: colors.text }]}>
              {(item.price * item.quantity).toLocaleString('vi-VN')}đ
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.productId.toString()}
        scrollEnabled={false}
      />
      
      <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
      
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng cộng:</Text>
        <Text style={[styles.totalValue, { color: colors.tint }]}>
          {total.toLocaleString('vi-VN')}đ
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
