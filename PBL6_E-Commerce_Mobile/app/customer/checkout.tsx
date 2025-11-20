import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { CartItemCard } from '@/components/feature/cart/CartItemCard';
import { 
  getAvailableServices,
  calculateShippingFee,
  confirmCheckout,
  createMoMoPayment
} from '@/services/orderService';
import { getProvinces, getDistricts, getWards } from '@/services/addressService';
import { Picker } from '@react-native-picker/picker';

interface ShippingAddress {
  toName: string;
  toPhone: string;
  province: string;
  district: string;
  ward: string;
  toAddress: string;
}

interface GhnService {
  service_id: number;
  short_name: string;
  service_type_id: number;
}

export default function Checkout() {
      const { user, isLoading: authLoading } = useAuth();
      console.log('DEBUG AuthContext user:', user);
    // Địa chỉ người dùng
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    // Lấy userId từ context
    const userId = user?.id;

    // Lấy danh sách địa chỉ khi vào màn
    useEffect(() => {
      async function fetchAddresses() {
        console.log('DEBUG fetchAddresses: userId =', userId, 'showNewAddressForm =', showNewAddressForm, 'authLoading =', authLoading);
        if (authLoading) return;
        if (!userId) {
          console.warn('Không có userId, không thể lấy địa chỉ!');
          return;
        }
        try {
          const res = await require('@/services/addressService').getAddresses();
          console.log('Địa chỉ lấy được từ API:', res);
          // Nếu API trả về object có field data, lấy mảng địa chỉ từ res.data
          const addressListRaw = Array.isArray(res) ? res : (res?.data || []);
          // Map field cho UI
          const addressList = addressListRaw.map((a: any) => ({
            ...a,
            toName: a.contactName,
            toPhone: a.contactPhone,
            toAddress: a.fullAddress,
            // giữ nguyên các trường province, district, ward nếu backend trả về đúng tên, nếu không cần map tiếp
          }));
          setAddresses(addressList);
          if (addressList.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addressList[0].id);
            setShippingAddress({
              toName: addressList[0].toName,
              toPhone: addressList[0].toPhone,
              province: addressList[0].province,
              district: addressList[0].district,
              ward: addressList[0].ward,
              toAddress: addressList[0].toAddress,
            });
          }
        } catch (e) {
          console.error('Lỗi lấy địa chỉ:', e);
        }
      }
      fetchAddresses();
    }, [userId, showNewAddressForm, authLoading]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  
  const router = useRouter();
  const { items: cartItems = [], clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    toName: '',
    toPhone: '',
    province: '',
    district: '',
    ward: '',
    toAddress: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // GHN shipping states
  const [ghnServices, setGhnServices] = useState<GhnService[]>([]);
  const [selectedService, setSelectedService] = useState<GhnService | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [calculatedShippingFee, setCalculatedShippingFee] = useState<number>(0);

  // Filter items with quantity > 0
  console.log('DEBUG cartItems:', cartItems);
  const checkoutItems = (cartItems || []).filter((item: any) => item.quantity > 0);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => {
      const price = Number(item.unitPrice ?? item.price ?? 0);
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [checkoutItems]);

  const shippingFee = calculatedShippingFee || 0;
  const voucherDiscount = 0;
  const finalTotal = subtotal + shippingFee - voucherDiscount;

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const result = await getProvinces();
        setProvinces(result);
      } catch (error) {
        console.error('Error loading provinces:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!shippingAddress.province) {
        setDistricts([]);
        setShippingAddress(prev => ({ ...prev, district: '', ward: '' }));
        return;
      }

      setLoadingDistricts(true);
      try {
        const result = await getDistricts(shippingAddress.province);
        setDistricts(result);
      } catch (error) {
        console.error('Error loading districts:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [shippingAddress.province]);

  // Load wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!shippingAddress.district) {
        setWards([]);
        setShippingAddress(prev => ({ ...prev, ward: '' }));
        return;
      }

      setLoadingWards(true);
      try {
        const result = await getWards(shippingAddress.district);
        setWards(result);
      } catch (error) {
        console.error('Error loading wards:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã');
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [shippingAddress.district]);

  // Load GHN services when ward is selected
  useEffect(() => {
    let isMounted = true;
    const loadGhnServices = async () => {
      if (!shippingAddress.ward || checkoutItems.length === 0) {
        if (ghnServices.length !== 0) setGhnServices([]);
        if (selectedService !== null) setSelectedService(null);
        return;
      }

      setLoadingServices(true);
      try {
        const shopId = checkoutItems[0]?.shopId || 1;
        const cartItemIds = checkoutItems.map((item) => item.id);
        const response = await getAvailableServices({
          shopId,
          addressId: 0,
          cartItemIds,
        });
        if (isMounted && response && response.data) {
          // Chỉ set lại nếu dữ liệu khác
          if (JSON.stringify(response.data) !== JSON.stringify(ghnServices)) {
            setGhnServices(response.data);
            // Auto-select first service nếu khác
            if (response.data.length > 0 && (!selectedService || selectedService.service_id !== response.data[0].service_id)) {
              setSelectedService(response.data[0]);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading GHN services:', error);
          Alert.alert('Lỗi', 'Không thể tải dịch vụ vận chuyển');
        }
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    };
    loadGhnServices();
    return () => { isMounted = false; };
  }, [shippingAddress.ward, checkoutItems, ghnServices, selectedService]);

  // Calculate shipping fee when service is selected
  useEffect(() => {
    let isMounted = true;
    const calcFee = async () => {
      if (!selectedService || checkoutItems.length === 0) {
        if (calculatedShippingFee !== 0) setCalculatedShippingFee(0);
        return;
      }
      try {
        const shopId = checkoutItems[0]?.shopId || 1;
        const cartItemIds = checkoutItems.map((item) => item.id);
        const response = await calculateShippingFee({
          shopId,
          addressId: 0,
          serviceId: selectedService.service_id,
          serviceTypeId: selectedService.service_type_id,
          cartItemIds,
        });
        if (isMounted && response && response.data) {
          if (response.data.total !== calculatedShippingFee) {
            setCalculatedShippingFee(response.data.total || 0);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error calculating shipping fee:', error);
          Alert.alert('Lỗi', 'Không thể tính phí vận chuyển');
        }
      }
    };
    calcFee();
    return () => { isMounted = false; };
  }, [selectedService, checkoutItems, calculatedShippingFee]);

  const handlePlaceOrder = async () => {
    // Validation
    // Validate fields giống web
    const errors: { [key: string]: string } = {};
    if (!shippingAddress.toName.trim()) {
      errors.toName = 'Vui lòng nhập tên người nhận';
    }
    if (!shippingAddress.toPhone.trim()) {
      errors.toPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(shippingAddress.toPhone)) {
      errors.toPhone = 'Số điện thoại không hợp lệ';
    }
    if (!shippingAddress.toAddress.trim()) {
      errors.toAddress = 'Vui lòng nhập địa chỉ';
    }
    if (!shippingAddress.province) {
      errors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    }
    if (!shippingAddress.district) {
      errors.district = 'Vui lòng chọn Quận/Huyện';
    }
    if (!shippingAddress.ward) {
      errors.ward = 'Vui lòng chọn Phường/Xã';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!selectedService) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn dịch vụ vận chuyển');
      return;
    }
    setIsProcessing(true);

    try {
      const shopId = checkoutItems[0]?.shopId || 1;
      const cartItemIds = checkoutItems.map((item: any) => item.id);

      // Confirm checkout
      const orderResponse = await confirmCheckout({
        shopId,
        addressId: 0,
        serviceId: selectedService.service_id,
        serviceTypeId: selectedService.service_type_id,
        cartItemIds,
        paymentMethod,
        note: orderNotes,
      });

      // Handle payment
      if (paymentMethod === 'MOMO') {
        const paymentResponse = await createMoMoPayment({
          orderId: orderResponse.data.orderId,
          amount: finalTotal,
          orderInfo: `Thanh toán đơn hàng #${orderResponse.data.orderId}`,
        });
        
        if (paymentResponse && paymentResponse.data?.payUrl) {
          // TODO: Open MoMo payment URL (use WebView or deep link)
          Alert.alert('Chuyển sang MoMo', 'Bạn sẽ được chuyển sang app MoMo để thanh toán');
          // Linking.openURL(paymentResponse.data.payUrl);
        }
      } else {
        // COD
        Alert.alert('Đặt hàng thành công', 'Bạn sẽ nhận hàng và thanh toán khi nhận hàng.', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.replace('/(tabs)');
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert('Đã có lỗi xảy ra', error.message || 'Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Thêm địa chỉ mới
  const handleAddAddress = async () => {
    // Validate giống như khi đặt hàng
    const errors: { [key: string]: string } = {};
    if (!shippingAddress.toName.trim()) {
      errors.toName = 'Vui lòng nhập tên người nhận';
    }
    if (!shippingAddress.toPhone.trim()) {
      errors.toPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(shippingAddress.toPhone)) {
      errors.toPhone = 'Số điện thoại không hợp lệ';
    }
    if (!shippingAddress.toAddress.trim()) {
      errors.toAddress = 'Vui lòng nhập địa chỉ';
    }
    if (!shippingAddress.province) {
      errors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    }
    if (!shippingAddress.district) {
      errors.district = 'Vui lòng chọn Quận/Huyện';
    }
    if (!shippingAddress.ward) {
      errors.ward = 'Vui lòng chọn Phường/Xã';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      // Gọi API thêm địa chỉ
      const { addAddress } = require('@/services/addressService');
      await addAddress({
        contactName: shippingAddress.toName,
        contactPhone: shippingAddress.toPhone,
        provinceId: shippingAddress.province,
        districtId: shippingAddress.district,
        wardCode: shippingAddress.ward,
        fullAddress: shippingAddress.toAddress,
      });
      setShowNewAddressForm(false);
      // Sau khi thêm, reload lại danh sách địa chỉ
      // (fetchAddresses sẽ tự chạy lại do showNewAddressForm thay đổi)
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể thêm địa chỉ mới.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        {/* Danh sách địa chỉ đã có */}
        {addresses.length > 0 && (
          <View style={[styles.section, { padding: 8, backgroundColor: '#fafcff', borderWidth: 0 }]}> 
            <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Địa chỉ giao hàng</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5eaf2', padding: 10, marginBottom: 12 }}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0, paddingVertical: 2 }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedAddressId(address.id);
                    setShippingAddress({
                      toName: address.toName,
                      toPhone: address.toPhone,
                      province: address.province,
                      district: address.district,
                      ward: address.ward,
                      toAddress: address.toAddress,
                    });
                  }}
                >
                  {/* Radio */}
                  <View style={{ marginTop: 2, marginRight: 10 }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: selectedAddressId === address.id ? '#1976D2' : '#AAA', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedAddressId === address.id ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1976D2' }} /> : null}
                    </View>
                  </View>
                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{address.toName}</Text>
                      {address.primaryAddress && (
                        <Text style={{ marginLeft: 8, backgroundColor: '#E3F2FD', color: '#1976D2', fontSize: 13, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontWeight: 'bold' }}>Mặc định</Text>
                      )}
                    </View>
                    <Text style={{ color: '#444', fontSize: 15, marginTop: 2 }}>{address.toAddress}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Text style={{ color: '#FF6B6B', fontSize: 16, marginRight: 4 }}>📞</Text>
                      <Text style={{ color: '#FF6B6B', fontSize: 15 }}>{address.toPhone}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {/* Nút thêm địa chỉ mới */}
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: '#1976D2', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 0, backgroundColor: '#fff' }}
              onPress={() => {
                setShowNewAddressForm(true);
                setShippingAddress({
                  toName: '',
                  toPhone: '',
                  province: '',
                  district: '',
                  ward: '',
                  toAddress: '',
                });
              }}
            >
              <Text style={{ color: '#1976D2', fontWeight: 'bold', fontSize: 16 }}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Form nhập địa chỉ mới */}
        {showNewAddressForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nhập địa chỉ mới</Text>
            <TextInput
              style={[styles.input, fieldErrors.toName && { borderColor: '#FF6B6B' }]}
              placeholder="Tên người nhận *"
              value={shippingAddress.toName}
              onChangeText={(text) => {
                setShippingAddress(prev => ({ ...prev, toName: text }));
                if (fieldErrors.toName) setFieldErrors(prev => ({ ...prev, toName: '' }));
              }}
            />
            {fieldErrors.toName ? <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 4 }}>{fieldErrors.toName}</Text> : null}
            <TextInput
              style={[styles.input, fieldErrors.toPhone && { borderColor: '#FF6B6B' }]}
              placeholder="Số điện thoại *"
              keyboardType="phone-pad"
              value={shippingAddress.toPhone}
              onChangeText={(text) => {
                setShippingAddress(prev => ({ ...prev, toPhone: text }));
                if (fieldErrors.toPhone) setFieldErrors(prev => ({ ...prev, toPhone: '' }));
              }}
            />
            {fieldErrors.toPhone ? <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 4 }}>{fieldErrors.toPhone}</Text> : null}

            {/* Province Dropdown */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Tỉnh/Thành phố *</Text>
              {loadingProvinces ? (
                <ActivityIndicator size="small" />
              ) : (
                <Picker
                  selectedValue={shippingAddress.province}
                  onValueChange={(value) => setShippingAddress(prev => ({ ...prev, province: String(value), district: '', ward: '' }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn tỉnh/thành" value="" />
                  {provinces.map((p) => (
                    <Picker.Item key={p.code} label={p.name} value={String(p.code)} />
                  ))}
                </Picker>
              )}
              {fieldErrors.province ? <Text style={{ color: '#FF6B6B', fontSize: 12 }}>{fieldErrors.province}</Text> : null}
            </View>

            {/* District Dropdown */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Quận/Huyện *</Text>
              {loadingDistricts ? (
                <ActivityIndicator size="small" />
              ) : (
                <Picker
                  selectedValue={shippingAddress.district}
                  onValueChange={(value) => setShippingAddress(prev => ({ ...prev, district: String(value), ward: '' }))}
                  style={styles.picker}
                  enabled={!!shippingAddress.province}
                >
                  <Picker.Item label="Chọn quận/huyện" value="" />
                  {districts.map((d: any) => (
                    <Picker.Item key={d.code} label={d.name} value={String(d.code)} />
                  ))}
                </Picker>
              )}
              {fieldErrors.district ? <Text style={{ color: '#FF6B6B', fontSize: 12 }}>{fieldErrors.district}</Text> : null}
            </View>

            {/* Ward Dropdown */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Phường/Xã *</Text>
              {loadingWards ? (
                <ActivityIndicator size="small" />
              ) : (
                <Picker
                  selectedValue={shippingAddress.ward}
                  onValueChange={(value) => setShippingAddress(prev => ({ ...prev, ward: String(value) }))}
                  style={styles.picker}
                  enabled={!!shippingAddress.district}
                >
                  <Picker.Item label="Chọn phường/xã" value="" />
                  {wards.map((w: any) => (
                    <Picker.Item key={w.code} label={w.name} value={String(w.code)} />
                  ))}
                </Picker>
              )}
              {fieldErrors.ward ? <Text style={{ color: '#FF6B6B', fontSize: 12 }}>{fieldErrors.ward}</Text> : null}
            </View>

            <TextInput
              style={[styles.input, styles.textArea, fieldErrors.toAddress && { borderColor: '#FF6B6B' }]}
              placeholder="Địa chỉ cụ thể *"
              multiline
              numberOfLines={3}
              value={shippingAddress.toAddress}
              onChangeText={(text) => {
                setShippingAddress(prev => ({ ...prev, toAddress: text }));
                if (fieldErrors.toAddress) setFieldErrors(prev => ({ ...prev, toAddress: '' }));
              }}
            />
            {fieldErrors.toAddress ? <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 4 }}>{fieldErrors.toAddress}</Text> : null}

            {/* Nút thêm địa chỉ mới và hủy */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#1976D2', borderRadius: 8, padding: 12, alignItems: 'center', marginRight: 8 }}
                onPress={handleAddAddress}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Thêm địa chỉ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, borderWidth: 1, borderColor: '#AAA', borderRadius: 8, padding: 12, alignItems: 'center', backgroundColor: '#fff' }}
                onPress={() => setShowNewAddressForm(false)}
              >
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}



        {/* GHN Service Selector */}
        {ghnServices.length > 0 && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Dịch vụ vận chuyển</Text>
            {loadingServices ? (
              <ActivityIndicator size="small" />
            ) : (
              <Picker
                selectedValue={selectedService?.service_id || ''}
                onValueChange={(value) => {
                  const service = ghnServices.find(s => s.service_id === Number(value));
                  if (service) setSelectedService(service);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Chọn dịch vụ vận chuyển" value="" />
                {ghnServices.map((s) => (
                  <Picker.Item 
                    key={s.service_id} 
                    label={`${s.short_name} - ${formatPrice(calculatedShippingFee)}`} 
                    value={s.service_id} 
                  />
                ))}
              </Picker>
            )}
          </View>
        )}

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
    width: '100%',
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
    height: 54,
    marginBottom: 0,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
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
