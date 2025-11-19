import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { CartItemCard } from '@/components/feature/cart/CartItemCard';
import { createOrder, createMoMoPayment } from '@/services/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProvinces, getDistricts, getWards } from '@/services/addressService';
import { Picker } from '@react-native-picker/picker';

interface ShippingAddress {
  toName: string;
  toPhone: string;
  province: string;
  district: string;
  ward: string;
  toAddress: string;
  [key: string]: any;
}

export default function Checkout() {
  // Format price as VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { items: cartItems = [], clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    toName: '',
    toPhone: '',
    province: '',
    district: '',
    ward: '',
    toAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Filter items with quantity > 0
  const checkoutItems = (cartItems || []).filter((item: any) => item.quantity > 0);
  
  // Debug log
  useEffect(() => {
    console.log('📦 Checkout - cartItems:', cartItems);
    console.log('📦 Checkout - filtered items:', checkoutItems);
  }, [cartItems, checkoutItems]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [checkoutItems]);

  const shippingFee = 30000; // Fixed shipping fee
  const voucherDiscount = 0; // No voucher discount
  const finalTotal = subtotal + shippingFee - voucherDiscount;

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      const result = await getProvinces();
      setProvinces(result);
      setLoadingProvinces(false);
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!shippingAddress.province) {
        setDistricts([]);
        setShippingAddress(prev => ({ ...prev, district: '', ward: '' }));
        return;
      }

      setLoadingDistricts(true);
      const result = await getDistricts(shippingAddress.province);
      setDistricts(result);
      setLoadingDistricts(false);
    };

    fetchDistricts();
  }, [shippingAddress.province]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!shippingAddress.district) {
        setWards([]);
        setShippingAddress(prev => ({ ...prev, ward: '' }));
        return;
      }

      setLoadingWards(true);
      const result = await getWards(shippingAddress.district);
      setWards(result);
      setLoadingWards(false);
    };

    fetchWards();
  }, [shippingAddress.district]);

  const handlePlaceOrder = async () => {
    if (Object.values(shippingAddress).some(field => !field)) {
      return Alert.alert('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.');
    }

    setIsProcessing(true);

    try {
      // Create order
      const order = await createOrder({
        items: checkoutItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingFee,
        voucherDiscount,
        total: finalTotal,
        notes: orderNotes,
      });

      // Handle payment
      if (paymentMethod === 'MOMO') {
        const paymentUrl = await createMoMoPayment(order.id, finalTotal);
        // Open MoMo app or webview with paymentUrl
      } else {
        // COD - Cash on Delivery
        Alert.alert('Đặt hàng thành công', 'Bạn sẽ nhận hàng và thanh toán khi nhận hàng.');
        clearCart();
        router.push('/order-success');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Đã có lỗi xảy ra', 'Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        {/* Province Picker */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Tỉnh/Thành phố</Text>
          {loadingProvinces ? (
            <ActivityIndicator size="small" />
          ) : (
            <Picker
              selectedValue={shippingAddress.province}
              onValueChange={(value) => setShippingAddress(prev => ({ ...prev, province: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Chọn tỉnh/thành" value="" />
              {provinces.map((p) => (
                <Picker.Item key={p.code} label={p.name} value={p.code} />
              ))}
            </Picker>
          )}
        </View>

        {/* District Picker */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Quận/Huyện</Text>
          {loadingDistricts ? (
            <ActivityIndicator size="small" />
          ) : (
            <Picker
              selectedValue={shippingAddress.district}
              onValueChange={(value: string | number) => setShippingAddress(prev => ({ ...prev, district: value }))}
              style={styles.picker}
              enabled={!!shippingAddress.province}
            >
              <Picker.Item label="Chọn quận/huyện" value="" />
              {districts.map((d: any) => (
                <Picker.Item key={d.code} label={d.name} value={d.code} />
              ))}
            </Picker>
          )}
        </View>

        {/* Ward Picker */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Phường/Xã</Text>
          {loadingWards ? (
            <ActivityIndicator size="small" />
          ) : (
            <Picker
              selectedValue={shippingAddress.ward}
              onValueChange={(value: string | number) => setShippingAddress(prev => ({ ...prev, ward: value }))}
              style={styles.picker}
              enabled={!!shippingAddress.district}
            >
              <Picker.Item label="Chọn phường/xã" value="" />
              {wards.map((w: any) => (
                <Picker.Item key={w.code} label={w.name} value={w.code} />
              ))}
            </Picker>
          )}
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Số nhà, tên đường, tòa nhà..."
          multiline
          numberOfLines={3}
          value={shippingAddress.toAddress}
          onChangeText={(text) => setShippingAddress(prev => ({ ...prev, toAddress: text }))}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng ({checkoutItems.length})</Text>
          {checkoutItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              isSelected={true}
              onToggleSelect={() => {}}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons 
              name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={paymentMethod === 'COD' ? '#FF6B6B' : '#999'} 
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'MOMO' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('MOMO')}
          >
            <Ionicons 
              name={paymentMethod === 'MOMO' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={paymentMethod === 'MOMO' ? '#FF6B6B' : '#999'} 
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Ví MoMo</Text>
              <Text style={styles.paymentDesc}>Thanh toán qua ví điện tử MoMo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú đơn hàng (tùy chọn)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập ghi chú cho người bán..."
            multiline
            numberOfLines={4}
            value={orderNotes}
            onChangeText={setOrderNotes}
          />
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  pickerWrapper: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    height: 44,
    marginBottom: 0,
  },
  container: {
    flex: 1,
  },
  // header styles removed
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  paymentDesc: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  placeOrderButton: {
    backgroundColor: '#FF6B6B',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#CCC',
  },
  placeOrderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
