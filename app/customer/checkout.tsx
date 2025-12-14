import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getAvailableServices, calculateShippingFee, confirmCheckout, createMoMoPayment } from '@/services/orderService';
import { getProvinces, getDistricts, getWards } from '@/services/addressService';
import { getSportyPayWallet, payWithSportyPay } from '@/services/sportyPayService';
import { ShippingAddressSection } from '../components/feature/checkout/ShippingAddressSection';
import { ShippingMethodSection } from '../components/feature/checkout/ShippingMethodSection';
import { OrderItemsSection } from '../components/feature/checkout/OrderItemsSection';
import { VoucherSection } from '../components/feature/checkout/VoucherSection';
import { PaymentMethodSection } from '../components/feature/checkout/PaymentMethodSection';
import { OrderNoteSection } from '../components/feature/checkout/OrderNoteSection';
import { CheckoutFooter } from '../components/feature/checkout/CheckoutFooter';
import { formatPrice, formatWeight, getTotalWeight } from '../components/feature/checkout/checkoutUtils';
import { Voucher, calculateVoucherDiscount } from '@/services/voucherService';

/**
 * Convert MoMo web payment URL to deep link for direct app opening
 */
const convertToMoMoDeepLink = (webUrl: string): string => {
  try {
    // If already a deep link, return as is
    if (webUrl.startsWith('momo://') || webUrl.startsWith('partnerapp://')) {
      return webUrl;
    }
    
    // MoMo web URL should handle universal links automatically
    // Just return original URL - MoMo will redirect to app if installed
    return webUrl;
  } catch (error) {
    console.error('Error converting to deep link:', error);
    return webUrl;
  }
};

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
  const params = useLocalSearchParams();
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
  // formatPrice, formatWeight, getTotalWeight are now imported from checkoutUtils
  
  const router = useRouter();
  const { items: cartItems = [], clearCart } = useCart();

  // Lấy selectedItems từ params nếu có, fallback về cartItems
  let checkoutItems: any[] = [];
  if (params.selectedItems) {
    try {
      checkoutItems = JSON.parse(params.selectedItems as string);
    } catch (e) {
      checkoutItems = cartItems;
    }
  } else {
    checkoutItems = cartItems;
  }

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    toName: '',
    toPhone: '',
    province: '',
    district: '',
    ward: '',
    toAddress: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO' | 'SPORTY_PAY'>('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sportyPayBalance, setSportyPayBalance] = useState<number>(0);
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
  const lastAlertedAddressRef = useRef<number | null>(null);
  
  // Voucher state
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  // Handle URL scheme when returning from MoMo payment
  useEffect(() => {
    const handleUrl = (event: any) => {
      const url = event.url;
      console.log('🔗 URL scheme received:', url);
      
      // Check if returning from MoMo payment
      if (url && url.includes('momo') && url.includes('resultCode')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const resultCode = urlParams.get('resultCode');
        const message = urlParams.get('message');
        const orderId = urlParams.get('orderId');
        const requestId = urlParams.get('requestId');
        
        console.log('📱 MoMo return - resultCode:', resultCode, 'orderId:', orderId);
        
        if (resultCode === '0') {
          // Payment successful
          Alert.alert(
            'Thanh toán thành công!',
            'Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.',
            [
              {
                text: 'Xem đơn hàng',
                onPress: () => {
                  clearCart();
                  router.push('/customer/OrderListPage');
                },
              },
            ]
          );
        } else {
          // Payment failed or cancelled
          console.log('❌ MoMo payment cancelled/failed - resultCode:', resultCode);
          
          // Notify backend about cancellation (optional - IPN should handle this)
          if (requestId) {
            try {
              // Call API to mark payment as cancelled/failed
              // This is backup in case IPN doesn't fire
              console.log('📞 Notifying backend about payment cancellation');
            } catch (error) {
              console.error('Failed to notify backend:', error);
            }
          }
          
          Alert.alert(
            'Thanh toán không thành công',
            message || `Thanh toán bị hủy hoặc xảy ra lỗi (Mã: ${resultCode}). Vui lòng thử lại.`,
            [
              { text: 'Thử lại MoMo', onPress: () => {} },
              {
                text: 'Chọn SportyPay',
                onPress: () => setPaymentMethod('SPORTY_PAY'),
              },
              {
                text: 'Chọn COD',
                onPress: () => setPaymentMethod('COD'),
              },
            ]
          );
        }
      }
    };

    const linkingListener = Linking.addEventListener('url', handleUrl);
    
    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      linkingListener?.remove();
    };
  }, []);

  // Filter items with quantity > 0
  console.log('DEBUG checkoutItems:', checkoutItems);
  checkoutItems = (checkoutItems || []).filter((item: any) => item.quantity > 0);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => {
      const price = Number(item.unitPrice ?? item.price ?? 0);
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [checkoutItems]);

  const shippingFee = calculatedShippingFee || 0;
  
  // Tính giảm giá từ voucher
  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;
    return calculateVoucherDiscount(selectedVoucher, subtotal + shippingFee);
  }, [selectedVoucher, subtotal, shippingFee]);
  
  const finalTotal = subtotal + shippingFee - voucherDiscount;

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const result = await getProvinces();
        setProvinces(result as any[]);
      } catch (error) {
        console.error('Error loading provinces:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load SportyPay balance on mount
  useEffect(() => {
    const loadSportyPayBalance = async () => {
      try {
        const wallet = await getSportyPayWallet();
        setSportyPayBalance(wallet.balance);
      } catch (error) {
        console.error('Error loading SportyPay balance:', error);
        setSportyPayBalance(0);
      }
    };
    
    if (userId) {
      loadSportyPayBalance();
    }
  }, [userId]);

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
        const result = await getDistricts(Number(shippingAddress.province));
        setDistricts(result as any[]);
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
        const result = await getWards(Number(shippingAddress.district));
        setWards(result as any[]);
      } catch (error) {
        console.error('Error loading wards:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã');
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [shippingAddress.district]);

  // Load GHN services when address is selected
  useEffect(() => {
    let isMounted = true;
    let timeoutId: any;
    
    const loadGhnServices = async () => {
      if (!selectedAddressId || checkoutItems.length === 0) {
        console.log('Skip loading GHN services - selectedAddressId:', selectedAddressId, 'checkoutItems.length:', checkoutItems.length);
        if (ghnServices.length !== 0) setGhnServices([]);
        if (selectedService !== null) setSelectedService(null);
        return;
      }

      console.log('Loading GHN services for addressId:', selectedAddressId, 'shopId:', checkoutItems[0]?.shopId);
      setLoadingServices(true);
      try {
        const shopId = checkoutItems[0]?.shopId || 1;
        const cartItemIds = checkoutItems.map((item) => item.id);
        const response = await getAvailableServices({
          shopId,
          addressId: Number(selectedAddressId),
          cartItemIds,
        });
        if (isMounted && response && response.data) {
          const servicesData = response.data[0]?.services || [];
          setGhnServices(servicesData);

          // Tính tổng trọng lượng
          const totalWeight = getTotalWeight(checkoutItems);
          let matchedService = null;
          if (totalWeight < 1000) {
            matchedService = servicesData.find((s: any) => s.short_name?.toLowerCase().includes('nhẹ'));
          } else {
            matchedService = servicesData.find((s: any) => s.short_name?.toLowerCase().includes('nặng'));
          }
          // Nếu không tìm thấy, lấy dịch vụ đầu tiên
          setSelectedService(matchedService || servicesData[0] || null);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading GHN services:', error);
          // Không alert để tránh spam user - chỉ log
        }
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    };
    
    // Debounce để tránh gọi API quá nhiều
    timeoutId = setTimeout(loadGhnServices, 300);
    
    return () => { 
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectedAddressId, checkoutItems.length]);

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
        const feeParams = {
          shopId,
          addressId: Number(selectedAddressId),
          serviceId: selectedService.service_id,
          serviceTypeId: selectedService.service_type_id,
          cartItemIds,
        };
        console.log('Calculating fee with params:', feeParams);
        const response = await calculateShippingFee(feeParams);
        if (isMounted && response && response.data) {
          // Response có cấu trúc: response.data.data.total
          const feeAmount = response.data.data?.total || response.data.data?.service_fee || 0;
          console.log('Calculated fee amount:', feeAmount);
          
          // Kiểm tra nếu tuyến đường không được hỗ trợ
          if (feeAmount === 0 && response.data.data?.package_type === "unavailable") {
            const addressId = Number(selectedAddressId);
            console.log('⚠️ Route not supported for address:', addressId, 'service:', selectedService?.service_id);
            
            // Chỉ hiển thị alert nếu chưa hiển thị cho địa chỉ này và không có service nào khác đang tính phí thành công
            if (lastAlertedAddressRef.current !== addressId) {
              // Delay để kiểm tra nếu có service khác tính được phí
              setTimeout(() => {
                if (calculatedShippingFee === 0) {
                  lastAlertedAddressRef.current = addressId;
                  Alert.alert(
                    'Thông báo', 
                    'Tuyến đường này chưa được hỗ trợ giao hàng. Vui lòng chọn địa chỉ khác hoặc liên hệ shop.',
                    [{ text: 'OK' }]
                  );
                }
              }, 1000); // Wait 1s to see if other services succeed
            }
          } else {
            // Nếu tính được phí thành công, clear alert flag
            const addressId = Number(selectedAddressId);
            if (lastAlertedAddressRef.current === addressId) {
              lastAlertedAddressRef.current = null;
            }
          }
          
          if (feeAmount !== calculatedShippingFee) {
            setCalculatedShippingFee(feeAmount);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error calculating shipping fee:', error);
          // Chỉ hiển thị alert cho lỗi thực sự, không phải những lỗi đã được xử lý
          Alert.alert('Lỗi', 'Không thể tính phí vận chuyển. Vui lòng thử lại.');
        }
      }
    };
    calcFee();
    return () => { isMounted = false; };
  }, [selectedService, checkoutItems, selectedAddressId]); // Remove calculatedShippingFee to prevent infinite loop

  const handlePlaceOrder = async () => {
    const addressObj = addresses.find(a => a.id === selectedAddressId);
    const errors: { [key: string]: string } = {};
    if (!addressObj?.contactName?.trim()) errors.toName = 'Vui lòng nhập tên người nhận';
    if (!addressObj?.contactPhone?.trim()) errors.toPhone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)[0-9]{9,10}$/.test(addressObj.contactPhone)) errors.toPhone = 'Số điện thoại không hợp lệ';
    if (!addressObj?.fullAddress?.trim()) errors.toAddress = 'Vui lòng nhập địa chỉ';
    if (!addressObj?.provinceId) errors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!addressObj?.districtId) errors.district = 'Vui lòng chọn Quận/Huyện';
    if (!addressObj?.wardCode) errors.ward = 'Vui lòng chọn Phường/Xã';
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
      const productIds = checkoutItems.map((item: any) => item.productId || item.id);

      // ÁP DỤNG VOUCHER NẾU CÓ (tăng usedCount)
      let voucherCode: string | undefined = undefined;
      if (selectedVoucher) {
        try {
          console.log('🎫 Applying voucher:', selectedVoucher.code);
          const { applyVoucher } = require('@/services/voucherService');
          await applyVoucher({
            voucherCode: selectedVoucher.code,
            productIds,
            cartTotal: subtotal + shippingFee,
          });
          voucherCode = selectedVoucher.code;
          console.log('✅ Voucher applied successfully');
        } catch (voucherError: any) {
          console.error('❌ Voucher apply error:', voucherError);
          Alert.alert('Lỗi áp dụng voucher', voucherError.message || 'Không thể áp dụng voucher. Vui lòng thử lại.');
          setIsProcessing(false);
          return;
        }
      }

      // GỌI API ĐẶT HÀNG
      const orderResponse = await confirmCheckout({
        shopId,
        addressId: addressObj.id,
        serviceId: selectedService.service_id,
        serviceTypeId: selectedService.service_type_id,
        cartItemIds,
        paymentMethod,
        note: orderNotes,
        voucherCode, // Truyền voucher code vào đơn hàng
      });

      // Handle payment
      if (paymentMethod === 'SPORTY_PAY') {
        // Check balance before payment
        if (sportyPayBalance < finalTotal) {
          Alert.alert(
            'Số dư không đủ',
            `Số dư SportyPay của bạn là ${sportyPayBalance.toLocaleString('vi-VN')} đ, không đủ để thanh toán đơn hàng ${finalTotal.toLocaleString('vi-VN')} đ.`,
            [
              { text: 'Nạp thêm tiền', onPress: () => router.push('/me/sporty-pay') },
              { text: 'Chọn phương thức khác', onPress: () => setPaymentMethod('COD') }
            ]
          );
          return;
        }

        try {
          console.log('💳 Processing SportyPay payment for order:', orderResponse.data.orderId);
          await payWithSportyPay(
            orderResponse.data.orderId,
            finalTotal,
            `Thanh toán đơn hàng #${orderResponse.data.orderId}`
          );
          
          Alert.alert(
            'Thanh toán thành công!',
            'Đơn hàng của bạn đã được thanh toán bằng SportyPay.',
            [
              {
                text: 'Xem đơn hàng',
                onPress: () => {
                  clearCart();
                  router.push('/customer/OrderListPage');
                },
              },
            ]
          );
        } catch (paymentError) {
          console.error('❌ SportyPay payment error:', paymentError);
          Alert.alert(
            'Lỗi thanh toán',
            'Không thể thanh toán bằng SportyPay. Vui lòng thử lại hoặc chọn phương thức khác.',
            [
              { text: 'Thử lại', style: 'default' },
              { text: 'Chọn COD', onPress: () => setPaymentMethod('COD') },
            ]
          );
        }
      } else if (paymentMethod === 'MOMO') {
        try {
          console.log('🏦 Creating MoMo payment for order:', orderResponse.data.orderId);
          const paymentResponse = await createMoMoPayment({
            orderId: orderResponse.data.orderId,
            amount: finalTotal,
            orderInfo: `Thanh toán đơn hàng #${orderResponse.data.orderId}`,
          });
          
          console.log('🏦 MoMo payment response:', paymentResponse);
          
          if (paymentResponse && paymentResponse.data?.payUrl) {
            const payUrl = paymentResponse.data.payUrl;
            console.log('🏦 Opening MoMo URL:', payUrl);
            
            try {
              // Convert to deep link if possible
              const paymentUrl = convertToMoMoDeepLink(payUrl);
              console.log('🔗 Converted URL:', paymentUrl);
              
              // Kiểm tra nếu MoMo app có sẵn
              const canOpenMoMo = await Linking.canOpenURL('momo://');
              
              if (canOpenMoMo) {
                // Có MoMo app - mở trực tiếp
                console.log('✅ MoMo app detected, opening directly');
                await Linking.openURL(paymentUrl);
                
                Alert.alert(
                  'Đã chuyển sang MoMo', 
                  'Vui lòng hoàn tất thanh toán trên app MoMo. Sau khi thanh toán xong, bạn sẽ quay lại app.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Không clear cart ngay, chờ user thanh toán xong
                      },
                    },
                  ]
                );
              } else {
                // Không có MoMo app - thông báo cài đặt
                console.log('⚠️ MoMo app not found');
                Alert.alert(
                  'Cần cài đặt MoMo',
                  'Bạn cần cài đặt app MoMo để thanh toán. Bạn có muốn mở trình duyệt?',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Mở trình duyệt',
                      onPress: () => Linking.openURL(payUrl),
                    },
                  ]
                );
              }
            } catch (linkError) {
              console.error('❌ Error opening MoMo:', linkError);
              // Fallback: mở browser với URL gốc
              const paymentUrl = convertToMoMoDeepLink(payUrl);
              await Linking.openURL(paymentUrl);
              
              Alert.alert(
                'Thanh toán MoMo',
                'Bạn đã được chuyển sang trình duyệt để thanh toán MoMo. Sau khi hoàn tất, vui lòng quay lại app.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      clearCart();
                      router.replace('/(tabs)');
                    },
                  },
                ]
              );
            }
          } else {
            throw new Error('Không nhận được URL thanh toán từ MoMo');
          }
        } catch (paymentError) {
          console.error('❌ MoMo payment error:', paymentError);
          Alert.alert(
            'Lỗi thanh toán',
            'Không thể tạo thanh toán MoMo. Vui lòng thử lại hoặc chọn thanh toán khi nhận hàng.',
            [
              { text: 'Thử lại', style: 'default' },
              {
                text: 'COD',
                onPress: () => {
                  setPaymentMethod('COD');
                },
              },
            ]
          );
        }
      } else if (paymentMethod === 'SPORTY_PAY') {
        try {
          console.log('🏦 Processing SportyPay payment for order:', orderResponse.data.orderId);
          
          // Check if user has sufficient balance
          if (sportyPayBalance < finalTotal) {
            Alert.alert(
              'Số dư không đủ',
              `Số dư hiện tại: ${sportyPayBalance.toLocaleString('vi-VN')} đ\nCần thanh toán: ${finalTotal.toLocaleString('vi-VN')} đ\n\nVui lòng nạp thêm tiền hoặc chọn phương thức khác.`,
              [
                {
                  text: 'Nạp tiền',
                  onPress: () => {
                    router.push('/me/sporty-pay');
                  },
                },
                {
                  text: 'Chọn COD',
                  onPress: () => {
                    setPaymentMethod('COD');
                  },
                },
              ]
            );
            return;
          }
          
          // Process SportyPay payment
          await payWithSportyPay(
            orderResponse.data.orderId,
            finalTotal,
            `Thanh toán đơn hàng #${orderResponse.data.orderId}`
          );
          
          Alert.alert('Thanh toán thành công!', 'Đơn hàng của bạn đã được thanh toán bằng SportyPay.', [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.replace('/customer/OrderListPage');
              },
            },
          ]);
          
        } catch (paymentError) {
          console.error('❌ SportyPay payment error:', paymentError);
          Alert.alert(
            'Lỗi thanh toán SportyPay',
            'Không thể thực hiện thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.',
            [
              { text: 'Thử lại', style: 'default' },
              {
                text: 'Chọn COD',
                onPress: () => {
                  setPaymentMethod('COD');
                },
              },
            ]
          );
        }
      } else {
        // COD
        Alert.alert('Đặt hàng thành công', 'Bạn sẽ nhận hàng và thanh toán khi nhận hàng.', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.replace('/customer/OrderListPage');
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
    // ...existing logic, unchanged...
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
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể thêm địa chỉ mới.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        <ShippingAddressSection
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          setSelectedAddressId={setSelectedAddressId}
          showNewAddressForm={showNewAddressForm}
          setShowNewAddressForm={setShowNewAddressForm}
          shippingAddress={shippingAddress}
          setShippingAddress={setShippingAddress}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
          handleAddAddress={handleAddAddress}
          provinces={provinces}
          districts={districts}
          wards={wards}
          loadingProvinces={loadingProvinces}
          loadingDistricts={loadingDistricts}
          loadingWards={loadingWards}
        />
        <ShippingMethodSection
          loadingServices={loadingServices}
          ghnServices={ghnServices}
          calculatedShippingFee={calculatedShippingFee}
          getTotalWeight={() => getTotalWeight(checkoutItems)}
          formatPrice={formatPrice}
          formatWeight={formatWeight}
        />
        <OrderItemsSection checkoutItems={checkoutItems} />
        <VoucherSection
          selectedVoucher={selectedVoucher}
          onSelectVoucher={setSelectedVoucher}
          orderTotal={subtotal + shippingFee}
          shopId={checkoutItems[0]?.shopId || 1}
          productIds={checkoutItems.map((item: any) => item.productId || item.id)}
        />
        <PaymentMethodSection 
          paymentMethod={paymentMethod} 
          setPaymentMethod={setPaymentMethod} 
          styles={styles} 
          sportyPayBalance={sportyPayBalance}
        />
        <OrderNoteSection orderNotes={orderNotes} setOrderNotes={setOrderNotes} styles={styles} />
        <View style={{ height: 200 }} />
      </ScrollView>
      <CheckoutFooter
        subtotal={subtotal}
        shippingFee={shippingFee}
        voucherDiscount={voucherDiscount}
        finalTotal={finalTotal}
        formatPrice={formatPrice}
        isProcessing={isProcessing}
        handlePlaceOrder={handlePlaceOrder}
        styles={styles}
      />
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
  // Shipping method styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  shippingMethodCard: {
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    backgroundColor: '#F8FBFF',
    padding: 16,
  },
  shippingMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
  },
  shippingMethodInfo: {
    flex: 1,
  },
  shippingMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  shippingMethodDesc: {
    fontSize: 13,
    color: '#666',
  },
  shippingFeeContainer: {
    alignItems: 'flex-end',
  },
  shippingFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  weightCategoryContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },
  weightCategoryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  weightCategoryValue: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  totalWeightText: {
    fontSize: 12,
    color: '#888',
  },
  noShippingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  noShippingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF6B6B',
    flex: 1,
    lineHeight: 20,
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
