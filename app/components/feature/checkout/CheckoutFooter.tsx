import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface CheckoutFooterProps {
  subtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  finalTotal: number;
  formatPrice: (price: number) => string;
  isProcessing: boolean;
  handlePlaceOrder: () => void;
  styles: any;
}

export const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
  subtotal,
  shippingFee,
  voucherDiscount,
  finalTotal,
  formatPrice,
  isProcessing,
  handlePlaceOrder,
  styles,
}) => (
  <View style={styles.footer}>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tạm tính:</Text>
      <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
    </View>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
      <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
    </View>
    {voucherDiscount > 0 && (
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: '#34C759' }]}>Giảm giá:</Text>
        <Text style={[styles.summaryValue, { color: '#34C759' }]}>-{formatPrice(voucherDiscount)}</Text>
      </View>
    )}
    <View style={[styles.summaryRow, styles.totalRow]}>
      <Text style={styles.totalLabel}>Tổng cộng:</Text>
      <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
    </View>
    <TouchableOpacity
      style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
      onPress={handlePlaceOrder}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={styles.placeOrderText}>ĐẶT HÀNG</Text>
      )}
    </TouchableOpacity>
  </View>
);
