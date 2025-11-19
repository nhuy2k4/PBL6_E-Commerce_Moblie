import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';

interface BillingDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface BillingDetailsFormProps {
  value: BillingDetails;
  onChange: (value: BillingDetails) => void;
}

export default function BillingDetailsForm({ value, onChange }: BillingDetailsFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleChange = (field: keyof BillingDetails, text: string) => {
    onChange({ ...value, [field]: text });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Họ và tên *</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.icon + '40' }]}
          placeholder="Nhập họ và tên"
          placeholderTextColor={colors.icon}
          value={value.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Số điện thoại *</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.icon + '40' }]}
          placeholder="Nhập số điện thoại"
          placeholderTextColor={colors.icon}
          value={value.phone}
          onChangeText={(text) => handleChange('phone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Địa chỉ *</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.icon + '40' }]}
          placeholder="Nhập địa chỉ"
          placeholderTextColor={colors.icon}
          value={value.address}
          onChangeText={(text) => handleChange('address', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: colors.text }]}>Tỉnh/Thành phố</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon + '40' }]}
            placeholder="Chọn tỉnh/thành"
            placeholderTextColor={colors.icon}
            value={value.city}
            onChangeText={(text) => handleChange('city', text)}
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: colors.text }]}>Quận/Huyện</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon + '40' }]}
            placeholder="Chọn quận/huyện"
            placeholderTextColor={colors.icon}
            value={value.district}
            onChangeText={(text) => handleChange('district', text)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Phường/Xã</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.icon + '40' }]}
          placeholder="Chọn phường/xã"
          placeholderTextColor={colors.icon}
          value={value.ward}
          onChangeText={(text) => handleChange('ward', text)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});
