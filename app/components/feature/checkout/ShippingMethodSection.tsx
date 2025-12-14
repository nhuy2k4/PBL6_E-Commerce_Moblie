import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface ShippingMethodSectionProps {
  loadingServices: boolean;
  ghnServices: any[];
  calculatedShippingFee: number;
  getTotalWeight: () => number;
  formatPrice: (price: number) => string;
  formatWeight: (weight: number) => string;
}

export const ShippingMethodSection: React.FC<ShippingMethodSectionProps> = ({
  loadingServices,
  ghnServices,
  calculatedShippingFee,
  getTotalWeight,
  formatPrice,
  formatWeight,
}) => {
  return (
    <View style={{ backgroundColor: '#FFF', marginBottom: 12, padding: 16, borderRadius: 8 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Phương thức vận chuyển</Text>
      {loadingServices ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <ActivityIndicator size="small" color="#1976D2" />
          <Text style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>Đang tải dịch vụ vận chuyển...</Text>
        </View>
      ) : ghnServices.length > 0 ? (
        <View style={{ borderWidth: 1, borderColor: '#1976D2', borderRadius: 8, backgroundColor: '#F8FBFF', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#1976D2', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1976D2' }} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 }}>Giao hàng tiêu chuẩn</Text>
              <Text style={{ fontSize: 13, color: '#666' }}>Dịch vụ giao hàng tiêu chuẩn</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976D2' }}>{formatPrice(calculatedShippingFee)}</Text>
            </View>
          </View>
          {calculatedShippingFee > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E3F2FD' }}>
              <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                Phân loại: <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>{getTotalWeight() < 1000 ? 'Hàng nhẹ (dưới 1kg)' : 'Hàng nặng (trên 1kg)'}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: '#888' }}>Tổng trọng lượng: {formatWeight(getTotalWeight())}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF5F5', borderRadius: 8, borderWidth: 1, borderColor: '#FFE5E5' }}>
          {/* You can use Ionicons here if available */}
          <Text style={{ fontSize: 20, color: '#FF6B6B', marginRight: 8 }}>!</Text>
          <Text style={{ fontSize: 14, color: '#FF6B6B', flex: 1, lineHeight: 20 }}>
            Không có phương thức vận chuyển khả dụng.{"\n"}
            Vui lòng kiểm tra lại địa chỉ giao hàng.
          </Text>
        </View>
      )}
    </View>
  );
};
