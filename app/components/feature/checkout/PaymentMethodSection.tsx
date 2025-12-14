import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodSectionProps {
  paymentMethod: 'COD' | 'MOMO' | 'SPORTY_PAY';
  setPaymentMethod: (method: 'COD' | 'MOMO' | 'SPORTY_PAY') => void;
  styles: any;
  sportyPayBalance?: number;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({ 
  paymentMethod, 
  setPaymentMethod, 
  styles, 
  sportyPayBalance = 0 
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
      onPress={() => setPaymentMethod('COD')}
    >
      <Ionicons name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'} size={24} color={paymentMethod === 'COD' ? '#FF6B6B' : '#999'} />
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>💰 Thanh toán khi nhận hàng (COD)</Text>
        <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
      </View>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === 'SPORTY_PAY' && styles.paymentOptionActive]}
      onPress={() => setPaymentMethod('SPORTY_PAY')}
    >
      <Ionicons name={paymentMethod === 'SPORTY_PAY' ? 'radio-button-on' : 'radio-button-off'} size={24} color={paymentMethod === 'SPORTY_PAY' ? '#FF6B6B' : '#999'} />
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>🏦 SportyPay</Text>
        <Text style={styles.paymentDesc}>
          Thanh toán qua ví SportyPay • Số dư: {sportyPayBalance.toLocaleString('vi-VN')} đ
        </Text>
      </View>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === 'MOMO' && styles.paymentOptionActive]}
      onPress={() => setPaymentMethod('MOMO')}
    >
      <Ionicons name={paymentMethod === 'MOMO' ? 'radio-button-on' : 'radio-button-off'} size={24} color={paymentMethod === 'MOMO' ? '#FF6B6B' : '#999'} />
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentName}>💳 Ví MoMo</Text>
        <Text style={styles.paymentDesc}>Thanh toán qua ví điện tử MoMo (UAT)</Text>
      </View>
    </TouchableOpacity>
  </View>
);
