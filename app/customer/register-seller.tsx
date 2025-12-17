import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { submitSellerRegistration, canSubmitRegistration } from '@/services/sellerRegistrationService';
import { getProvinces, getDistricts, getWards } from '@/services/addressService';

type Step = 1 | 2 | 3;

const SellerRegister = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Thông tin shop
    shopName: '',
    description: '',
    shopPhone: '',
    shopEmail: '',
    logoUrl: '',
    bannerUrl: '',
    
    // Step 2: Địa chỉ
    fullAddress: '',
    provinceName: '',
    provinceId: 0,
    districtName: '',
    districtId: 0,
    wardName: '',
    wardId: 0,
    contactName: '',
    contactPhone: '',
    
    // Step 3: KYC
    idCardNumber: '',
    idCardName: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    selfieWithIdUrl: '',
  });

  // Address data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Check registration status and load provinces on mount
  useEffect(() => {
    checkRegistrationStatus();
    loadProvinces();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const result = await canSubmitRegistration();
      if (!result.canSubmit) {
        // User already has a pending or approved registration
        Alert.alert(
          'Thông báo',
          'Bạn đã có đơn đăng ký. Chuyển đến trang trạng thái đăng ký.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/seller/registration-status'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      // Continue to show registration form on error
    }
  };

  const loadProvinces = async () => {
    try {
      setLoadingAddress(true);
      const data = await getProvinces();
      setProvinces(data.data || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingAddress(true);
      const data = await getDistricts(provinceId);
      setDistricts(data.data || []);
      setWards([]);
    } catch (error) {
      console.error('Error loading districts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadWards = async (districtId: number) => {
    try {
      setLoadingAddress(true);
      const data = await getWards(districtId);
      setWards(data.data || []);
    } catch (error) {
      console.error('Error loading wards:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã');
    } finally {
      setLoadingAddress(false);
    }
  };

  const [uploading, setUploading] = useState({
    logo: false,
    banner: false,
    idCardFront: false,
    idCardBack: false,
    selfie: false,
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickImage = async (field: 'logoUrl' | 'bannerUrl' | 'idCardFrontUrl' | 'idCardBackUrl' | 'selfieWithIdUrl') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'bannerUrl' ? [4, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // In a real app, you would upload to Cloudinary here
        // For now, just store the local URI
        const uri = result.assets[0].uri;
        setFormData({ ...formData, [field]: uri });
        Alert.alert('Thành công', 'Đã chọn ảnh. Lưu ý: Cần upload lên server thật.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!formData.shopName.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập tên shop');
          return false;
        }
        if (!formData.shopPhone.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại shop');
          return false;
        }
        if (!formData.shopEmail.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập email shop');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.fullAddress.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ chi tiết');
          return false;
        }
        if (!formData.provinceName.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập tỉnh/thành phố');
          return false;
        }
        if (!formData.contactName.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập tên người liên hệ');
          return false;
        }
        if (!formData.contactPhone.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại liên hệ');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.idCardNumber.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập số CMND/CCCD');
          return false;
        }
        if (!formData.idCardName.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập họ tên trên CMND/CCCD');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((currentStep - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn gửi đơn đăng ký làm người bán?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setSubmitting(true);
            try {
              // Note: In real app, images should be uploaded to Cloudinary first
              await submitSellerRegistration(formData);
              Alert.alert(
                'Thành công',
                'Đơn đăng ký của bạn đã được gửi. Vui lòng chờ xét duyệt.',
                [{ text: 'OK', onPress: () => router.push('/seller/registration-status') }]
              );
            } catch (error: any) {
              console.error('Submit error:', error);
              Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể gửi đơn đăng ký');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepRow}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
        <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>
          Thông tin shop
        </Text>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>
          Địa chỉ
        </Text>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>
          Xác thực
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>Thông tin Shop</Text>

      <Text style={styles.label}>Tên Shop *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: SportZone Shop"
        value={formData.shopName}
        onChangeText={(text) => handleChange('shopName', text)}
      />

      <Text style={styles.label}>Mô tả Shop</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Giới thiệu về shop của bạn..."
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Số điện thoại Shop *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 0912345678"
        value={formData.shopPhone}
        onChangeText={(text) => handleChange('shopPhone', text)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email Shop *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: shop@example.com"
        value={formData.shopEmail}
        onChangeText={(text) => handleChange('shopEmail', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Logo Shop (Tùy chọn)</Text>
      <TouchableOpacity
        style={styles.imageUpload}
        onPress={() => pickImage('logoUrl')}
      >
        {formData.logoUrl ? (
          <Image source={{ uri: formData.logoUrl }} style={styles.uploadedImage} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Tải ảnh logo</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Banner Shop (Tùy chọn)</Text>
      <Text style={styles.hint}>Khuyến nghị: 1200x300px</Text>
      <TouchableOpacity
        style={[styles.imageUpload, styles.bannerUpload]}
        onPress={() => pickImage('bannerUrl')}
      >
        {formData.bannerUrl ? (
          <Image source={{ uri: formData.bannerUrl }} style={styles.bannerImage} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>🖼️</Text>
            <Text style={styles.uploadText}>Tải ảnh banner</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Địa chỉ lấy hàng</Text>

      <Text style={styles.label}>Tỉnh/Thành phố *</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowProvinceModal(true)}
        disabled={loadingAddress}
      >
        <Text style={[styles.pickerButtonText, !formData.provinceName && styles.placeholderText]}>
          {formData.provinceName || 'Chọn Tỉnh/TP'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Quận/Huyện</Text>
      <TouchableOpacity
        style={[styles.pickerButton, !formData.provinceId && styles.pickerDisabled]}
        onPress={() => setShowDistrictModal(true)}
        disabled={!formData.provinceId || loadingAddress}
      >
        <Text style={[styles.pickerButtonText, !formData.districtName && styles.placeholderText]}>
          {formData.districtName || 'Chọn Quận/Huyện'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Phường/Xã</Text>
      <TouchableOpacity
        style={[styles.pickerButton, !formData.districtId && styles.pickerDisabled]}
        onPress={() => setShowWardModal(true)}
        disabled={!formData.districtId || loadingAddress}
      >
        <Text style={[styles.pickerButtonText, !formData.wardName && styles.placeholderText]}>
          {formData.wardName || 'Chọn Phường/Xã'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Địa chỉ chi tiết *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Số nhà, tên đường..."
        value={formData.fullAddress}
        onChangeText={(text) => handleChange('fullAddress', text)}
        multiline
        numberOfLines={2}
      />

      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

      <Text style={styles.label}>Tên người liên hệ *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Nguyễn Văn A"
        value={formData.contactName}
        onChangeText={(text) => handleChange('contactName', text)}
      />

      <Text style={styles.label}>SĐT liên hệ *</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 0912345678"
        value={formData.contactPhone}
        onChangeText={(text) => handleChange('contactPhone', text)}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.sectionTitle}>Xác thực danh tính (KYC)</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Thông tin CMND/CCCD của bạn được bảo mật và chỉ dùng để xác thực danh tính.
        </Text>
      </View>

      <Text style={styles.label}>Số CMND/CCCD *</Text>
      <TextInput
        style={styles.input}
        placeholder="9 hoặc 12 số"
        value={formData.idCardNumber}
        onChangeText={(text) => handleChange('idCardNumber', text)}
        keyboardType="number-pad"
        maxLength={12}
      />

      <Text style={styles.label}>Họ tên (trên CMND/CCCD) *</Text>
      <TextInput
        style={styles.input}
        placeholder="NGUYEN VAN A"
        value={formData.idCardName}
        onChangeText={(text) => handleChange('idCardName', text)}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Ảnh mặt trước *</Text>
      <TouchableOpacity
        style={styles.imageUpload}
        onPress={() => pickImage('idCardFrontUrl')}
      >
        {formData.idCardFrontUrl ? (
          <Image source={{ uri: formData.idCardFrontUrl }} style={styles.uploadedImage} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>🪪</Text>
            <Text style={styles.uploadText}>Tải ảnh mặt trước</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Ảnh mặt sau *</Text>
      <TouchableOpacity
        style={styles.imageUpload}
        onPress={() => pickImage('idCardBackUrl')}
      >
        {formData.idCardBackUrl ? (
          <Image source={{ uri: formData.idCardBackUrl }} style={styles.uploadedImage} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>🪪</Text>
            <Text style={styles.uploadText}>Tải ảnh mặt sau</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Ảnh chân dung cầm CMND/CCCD (Tùy chọn - tăng độ tin cậy)</Text>
      <TouchableOpacity
        style={styles.imageUpload}
        onPress={() => pickImage('selfieWithIdUrl')}
      >
        {formData.selfieWithIdUrl ? (
          <Image source={{ uri: formData.selfieWithIdUrl }} style={styles.uploadedImage} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>🤳</Text>
            <Text style={styles.uploadText}>Tải ảnh chân dung</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        💡 Lưu ý: Hiện tại ảnh chỉ được lưu local. Cần tích hợp Cloudinary để upload thực tế.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Đăng ký bán hàng</Text>
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBack}
            >
              <Text style={styles.buttonSecondaryText}>← Quay lại</Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, currentStep === 1 && styles.buttonFull]}
              onPress={handleNext}
            >
              <Text style={styles.buttonPrimaryText}>Tiếp tục →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Gửi đơn đăng ký</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Province Modal */}
      <Modal visible={showProvinceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tỉnh/Thành phố</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingAddress ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={provinces}
                keyExtractor={(item) => item.ProvinceID?.toString() || item.ProvinceName}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        provinceName: item.ProvinceName,
                        provinceId: item.ProvinceID,
                        districtName: '',
                        districtId: 0,
                        wardName: '',
                        wardId: 0,
                      });
                      loadDistricts(item.ProvinceID);
                      setShowProvinceModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.ProvinceName}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* District Modal */}
      <Modal visible={showDistrictModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Quận/Huyện</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingAddress ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={districts}
                keyExtractor={(item) => item.DistrictID?.toString() || item.DistrictName}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        districtName: item.DistrictName,
                        districtId: item.DistrictID,
                        wardName: '',
                        wardId: 0,
                      });
                      loadWards(item.DistrictID);
                      setShowDistrictModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.DistrictName}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Ward Modal */}
      <Modal visible={showWardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Phường/Xã</Text>
              <TouchableOpacity onPress={() => setShowWardModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingAddress ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={wards}
                keyExtractor={(item) => item.WardCode || item.WardName}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        wardName: item.WardName,
                        wardId: parseInt(item.WardCode),
                      });
                      setShowWardModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.WardName}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  stepIndicator: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#007AFF',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  imageUpload: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  bannerUpload: {
    minHeight: 100,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
  },
  uploadedImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  bannerImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  pickerButtonText: {
    fontSize: 15,
    color: '#333',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SellerRegister;
