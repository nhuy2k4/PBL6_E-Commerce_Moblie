import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';

interface CartTotalProps {
  subtotal: number;
  shipping?: number;
  total: number;
}

export default function CartTotal({ subtotal, shipping = 0, total }: CartTotalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Tạm tính:</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {subtotal.toLocaleString('vi-VN')}đ
        </Text>
      </View>
      
      {shipping > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Phí vận chuyển:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {shipping.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      )}
      
      <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
      
      <View style={styles.row}>
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
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
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
