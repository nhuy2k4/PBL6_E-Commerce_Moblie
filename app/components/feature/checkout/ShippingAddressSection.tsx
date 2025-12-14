import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface ShippingAddressSectionProps {
  addresses: any[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
  showNewAddressForm: boolean;
  setShowNewAddressForm: (show: boolean) => void;
  shippingAddress: any;
  setShippingAddress: (addr: any) => void;
  fieldErrors: { [key: string]: string };
  setFieldErrors: (errors: { [key: string]: string }) => void;
  handleAddAddress: () => void;
  provinces: any[];
  districts: any[];
  wards: any[];
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
}

export const ShippingAddressSection: React.FC<ShippingAddressSectionProps> = ({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  showNewAddressForm,
  setShowNewAddressForm,
  shippingAddress,
  setShippingAddress,
  fieldErrors,
  setFieldErrors,
  handleAddAddress,
  provinces,
  districts,
  wards,
  loadingProvinces,
  loadingDistricts,
  loadingWards,
}) => {
  return (
    <>
      {addresses.length > 0 && !showNewAddressForm && (
        <View style={{ padding: 8, backgroundColor: '#fafcff', borderWidth: 0, marginBottom: 12, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Địa chỉ giao hàng</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5eaf2', padding: 10, marginBottom: 12 }}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0, paddingVertical: 2 }}
                activeOpacity={0.8}
                onPress={() => setSelectedAddressId(address.id)}
              >
                <View style={{ marginTop: 2, marginRight: 10 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: selectedAddressId === address.id ? '#1976D2' : '#AAA', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedAddressId === address.id ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#1976D2' }} /> : null}
                  </View>
                </View>
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
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: '#1976D2', borderRadius: 8, padding: 12, alignItems: 'center', backgroundColor: '#fff' }}
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
      {showNewAddressForm && (
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Nhập địa chỉ mới</Text>
          <TextInput
            style={[{ borderWidth: 1, borderColor: fieldErrors.toName ? '#FF6B6B' : '#E5E5E5', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12, backgroundColor: '#FFF' }]}
            placeholder="Tên người nhận *"
            value={shippingAddress.toName}
            onChangeText={(text) => {
              setShippingAddress((prev: any) => ({ ...prev, toName: text }));
              if (fieldErrors.toName) setFieldErrors({ ...fieldErrors, toName: '' });
            }}
          />
          {fieldErrors.toName ? <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 4 }}>{fieldErrors.toName}</Text> : null}
          <TextInput
            style={[{ borderWidth: 1, borderColor: fieldErrors.toPhone ? '#FF6B6B' : '#E5E5E5', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12, backgroundColor: '#FFF' }]}
            placeholder="Số điện thoại *"
            keyboardType="phone-pad"
            value={shippingAddress.toPhone}
            onChangeText={(text) => {
              setShippingAddress((prev: any) => ({ ...prev, toPhone: text }));
              if (fieldErrors.toPhone) setFieldErrors({ ...fieldErrors, toPhone: '' });
            }}
          />
          {fieldErrors.toPhone ? <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 4 }}>{fieldErrors.toPhone}</Text> : null}
          {/* Province Dropdown */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Tỉnh/Thành phố *</Text>
            {loadingProvinces ? (
              <ActivityIndicator size="small" />
            ) : (
              <Picker
                selectedValue={shippingAddress.province}
                onValueChange={(value) => setShippingAddress((prev: any) => ({ ...prev, province: String(value), district: '', ward: '' }))}
                style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, height: 54, width: '100%' }}
              >
                <Picker.Item label="Chọn tỉnh/thành" value="" />
                {provinces.map((p: any) => (
                  <Picker.Item key={p.code} label={p.name} value={String(p.code)} />
                ))}
              </Picker>
            )}
            {fieldErrors.province ? <Text style={{ color: '#FF6B6B', fontSize: 12 }}>{fieldErrors.province}</Text> : null}
          </View>
          {/* District Dropdown */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Quận/Huyện *</Text>
            {loadingDistricts ? (
              <ActivityIndicator size="small" />
            ) : (
              <Picker
                selectedValue={shippingAddress.district}
                onValueChange={(value) => setShippingAddress((prev: any) => ({ ...prev, district: String(value), ward: '' }))}
                style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, height: 54, width: '100%' }}
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
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Phường/Xã *</Text>
            {loadingWards ? (
              <ActivityIndicator size="small" />
            ) : (
              <Picker
                selectedValue={shippingAddress.ward}
                onValueChange={(value) => setShippingAddress((prev: any) => ({ ...prev, ward: String(value) }))}
                style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, height: 54, width: '100%' }}
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
            style={[{ borderWidth: 1, borderColor: fieldErrors.toAddress ? '#FF6B6B' : '#E5E5E5', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12, backgroundColor: '#FFF', height: 80, textAlignVertical: 'top' }]}
            placeholder="Địa chỉ cụ thể *"
            multiline
            numberOfLines={3}
            value={shippingAddress.toAddress}
            onChangeText={(text) => {
              setShippingAddress((prev: any) => ({ ...prev, toAddress: text }));
              if (fieldErrors.toAddress) setFieldErrors({ ...fieldErrors, toAddress: '' });
            }}
          />
          {fieldErrors.toAddress ? <Text style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 4 }}>{fieldErrors.toAddress}</Text> : null}
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
    </>
  );
};
