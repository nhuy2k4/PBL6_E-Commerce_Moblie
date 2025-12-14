import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { addAddress, updateAddress, getAddresses } from '../../services/addressService';
import { getProvinces, getDistricts, getWards } from '../../services/addressService';
import type { Address } from '../../types';

export default function AddEditAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addressId = params.id ? Number(params.id) : null;
  const isEditing = !!addressId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullAddress, setFullAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [primaryAddress, setPrimaryAddress] = useState(false);

  // Location data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
  const [selectedWardCode, setSelectedWardCode] = useState<string>('');

  useEffect(() => {
    loadProvinces();
    if (isEditing) {
      loadAddress();
    }
  }, []);

  useEffect(() => {
    if (selectedProvinceId > 0) {
      loadDistricts(selectedProvinceId);
    }
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedDistrictId > 0) {
      loadWards(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  const loadProvinces = async () => {
    try {
      const data = await getProvinces();
      setProvinces(data || []);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      const data = await getDistricts(provinceId);
      setDistricts(data || []);
      setWards([]);
      setSelectedDistrictId(0);
      setSelectedWardCode('');
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const loadWards = async (districtId: number) => {
    try {
      const data = await getWards(districtId);
      setWards(data || []);
      setSelectedWardCode('');
    } catch (error) {
      console.error('Failed to load wards:', error);
    }
  };

  const loadAddress = async () => {
    try {
      setLoading(true);
      const addresses = await getAddresses();
      const address = addresses.find((a) => a.id === addressId);
      if (address) {
        setFullAddress(address.fullAddress);
        setContactName(address.contactName);
        setContactPhone(address.contactPhone);
        setPrimaryAddress(address.primaryAddress);
        setSelectedProvinceId(address.provinceId);
        setSelectedDistrictId(address.districtId);
        setSelectedWardCode(address.wardCode);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!fullAddress.trim()) {
      Alert.alert('Error', 'Full address is required');
      return false;
    }
    if (!contactName.trim()) {
      Alert.alert('Error', 'Contact name is required');
      return false;
    }
    if (!contactPhone.trim()) {
      Alert.alert('Error', 'Contact phone is required');
      return false;
    }
    if (selectedProvinceId === 0) {
      Alert.alert('Error', 'Please select a province');
      return false;
    }
    if (selectedDistrictId === 0) {
      Alert.alert('Error', 'Please select a district');
      return false;
    }
    if (!selectedWardCode) {
      Alert.alert('Error', 'Please select a ward');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const selectedProvince = provinces.find((p) => p.ProvinceID === selectedProvinceId);
    const selectedDistrict = districts.find((d) => d.DistrictID === selectedDistrictId);
    const selectedWard = wards.find((w) => w.WardCode === selectedWardCode);

    const addressData: Omit<Address, 'id' | 'createdAt'> = {
      fullAddress: fullAddress.trim(),
      provinceId: selectedProvinceId,
      districtId: selectedDistrictId,
      wardCode: selectedWardCode,
      provinceName: selectedProvince?.ProvinceName || '',
      districtName: selectedDistrict?.DistrictName || '',
      wardName: selectedWard?.WardName || '',
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      primaryAddress,
    };

    try {
      setSaving(true);
      if (isEditing) {
        await updateAddress(addressId, addressData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await addAddress(addressData);
        Alert.alert('Success', 'Address added successfully');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Name *</Text>
              <TextInput
                style={styles.input}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Enter contact name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Province/City *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedProvinceId}
                  onValueChange={(value) => setSelectedProvinceId(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Province/City" value={0} />
                  {provinces.map((province) => (
                    <Picker.Item
                      key={province.ProvinceID}
                      label={province.ProvinceName}
                      value={province.ProvinceID}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>District *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedDistrictId}
                  onValueChange={(value) => setSelectedDistrictId(value)}
                  style={styles.picker}
                  enabled={districts.length > 0}
                >
                  <Picker.Item label="Select District" value={0} />
                  {districts.map((district) => (
                    <Picker.Item
                      key={district.DistrictID}
                      label={district.DistrictName}
                      value={district.DistrictID}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ward *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedWardCode}
                  onValueChange={(value) => setSelectedWardCode(value)}
                  style={styles.picker}
                  enabled={wards.length > 0}
                >
                  <Picker.Item label="Select Ward" value="" />
                  {wards.map((ward) => (
                    <Picker.Item
                      key={ward.WardCode}
                      label={ward.WardName}
                      value={ward.WardCode}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={fullAddress}
                onChangeText={setFullAddress}
                placeholder="Enter house number, street name..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPrimaryAddress(!primaryAddress)}
            >
              <Ionicons
                name={primaryAddress ? 'checkbox' : 'square-outline'}
                size={24}
                color={primaryAddress ? '#FF6B35' : '#999'}
              />
              <Text style={styles.checkboxLabel}>Set as primary address</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Address' : 'Save Address'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
