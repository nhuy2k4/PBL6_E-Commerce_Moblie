import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodSectionProps {
  paymentMethod: 'COD' | 'MOMO';
  setPaymentMethod: (method: 'COD' | 'MOMO') => void;
  styles: any;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({ paymentMethod, setPaymentMethod, styles }) => (
  <View>
    {/* ...existing code for payment method selection... */}
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
      onPress={() => setPaymentMethod('COD')}
    >
      <Ionicons name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'} size={24} color={paymentMethod === 'COD' ? '#FF6B6B' : '#999'} />
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
        <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === 'MOMO' && styles.paymentOptionActive]}
      onPress={() => setPaymentMethod('MOMO')}
    >
      <Ionicons name={paymentMethod === 'MOMO' ? 'radio-button-on' : 'radio-button-off'} size={24} color={paymentMethod === 'MOMO' ? '#FF6B6B' : '#999'} />
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>Ví MoMo</Text>
        <Text style={styles.paymentDesc}>Thanh toán qua ví điện tử MoMo</Text>
      </View>
    </TouchableOpacity>
  </View>
);
