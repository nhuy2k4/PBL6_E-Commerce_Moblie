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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  submitSellerRegistration, 
  canSubmitRegistration, 
  getRegistrationStatus,
  updateRejectedApplication,
  cancelRejectedApplication
} from '@/services/sellerRegistrationService';
import { getProvinces, getDistricts, getWards } from '@/services/addressService';
import { uploadToCloudinary } from '@/services/cloudinaryService';

type Step = 1 | 2 | 3;

const SellerRegister = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
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

  // Check registration status, load provinces, and pre-fill data if editing
  useEffect(() => {
    checkRegistrationStatus();
    loadProvinces();
    
    // Pre-fill form if editing rejected registration
    if (params.editData) {
      try {
        const editData = JSON.parse(params.editData as string);
        console.log('📝 Pre-filling form with existing data:', editData);
        
        // Pre-fill form data
        setFormData({
          shopName: editData.shopName || '',
          description: editData.description || '',
          shopPhone: editData.shopPhone || '',
          shopEmail: editData.shopEmail || '',
          logoUrl: editData.logoUrl || '',
          bannerUrl: editData.bannerUrl || '',
          fullAddress: editData.fullAddress || '',
          provinceName: editData.provinceName || '',
          provinceId: editData.provinceId || 0,
          districtName: editData.districtName || '',
          districtId: editData.districtId || 0,
          wardName: editData.wardName || '',
          wardId: editData.wardId || 0,
          contactName: editData.contactName || '',
          contactPhone: editData.contactPhone || '',
          idCardNumber: editData.idCardNumber || '',
          idCardName: editData.idCardName || '',
          idCardFrontUrl: editData.idCardFrontUrl || '',
          idCardBackUrl: editData.idCardBackUrl || '',
          selfieWithIdUrl: editData.selfieWithIdUrl || '',
        });
        
        // Load districts and wards if province/district are selected
        if (editData.provinceId) {
          loadDistricts(editData.provinceId);
        }
        if (editData.districtId) {
          loadWards(editData.districtId);
        }
      } catch (error) {
        console.error('Error parsing editData:', error);
      }
    }
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      // Check if can submit
      const result = await canSubmitRegistration();
      const canSubmit = result?.data?.canSubmit ?? result?.canSubmit ?? true;
      
      if (!canSubmit) {
        // User has existing registration, check its status
        try {
          const statusData = await getRegistrationStatus();
          const status = statusData?.data?.status || statusData?.status;
          
          if (status === 'PENDING') {
            // Pending registration - redirect to status page
            Alert.alert(
              '⏳ Đơn đăng ký đang chờ duyệt',
              'Đơn đăng ký của bạn đang được xem xét. Vui lòng kiểm tra trạng thái.',
              [
                {
                  text: 'Xem trạng thái',
                  onPress: () => router.replace('/seller/registration-status'),
                },
              ]
            );
          } else if (status === 'APPROVED') {
            // Approved - user is now a seller, redirect to seller page
            Alert.alert(
              '✅ Đăng ký thành công!',
              'Tài khoản của bạn đã được kích hoạt quyền bán hàng.',
              [
                {
                  text: 'Vào trang Seller',
                  onPress: () => router.replace('/seller'),
                },
              ]
            );
          } else if (status === 'REJECTED') {
            // Rejected - allow edit and resubmit (don't block, continue to form)
            console.log('📝 Registration was rejected, user can edit and resubmit');
            // Form will be pre-filled via params.editData
          }
        } catch (statusError) {
          console.error('❌ Error getting status:', statusError);
          // If can't get status, redirect to status page anyway
          router.replace('/seller/registration-status');
        }
      }
      // If canSubmit = true -> allow registration form
    } catch (error: any) {
      // 404 means no registration exists -> allow registration
      if (error?.response?.status === 404) {
        console.log('📦 No registration found, user can register');
        return;
      }
      console.error('❌ Error checking registration status:', error);
      // Continue to show registration form on other errors
    }
  };

  const loadProvinces = async () => {
    try {
      setLoadingAddress(true);
      console.log('🔍 Loading provinces...');
      const response = await getProvinces();
      console.log('📦 Full response:', JSON.stringify(response).substring(0, 200));
      
      // Handle different response formats
      let provincesList = [];
      if (Array.isArray(response)) {
        provincesList = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          provincesList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          provincesList = response.data.data;
        }
      }
      
      console.log('📦 Provinces count:', provincesList.length);
      setProvinces(provincesList);
      
      if (provincesList.length === 0) {
        Alert.alert('Cảnh báo', 'Không có dữ liệu tỉnh/thành phố. Vui lòng kiểm tra kết nối API.');
      }
    } catch (error) {
      console.error('❌ Error loading provinces:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingAddress(true);
      const response = await getDistricts(provinceId);
      
      // Handle different response formats
      let districtsList = [];
      if (Array.isArray(response)) {
        districtsList = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          districtsList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          districtsList = response.data.data;
        }
      }
      
      console.log('📦 Districts count:', districtsList.length);
      setDistricts(districtsList);
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
      const response = await getWards(districtId);
      
      // Handle different response formats
      let wardsList = [];
      if (Array.isArray(response)) {
        wardsList = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          wardsList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          wardsList = response.data.data;
        }
      }
      
      console.log('📦 Wards count:', wardsList.length);
      setWards(wardsList);
    } catch (error) {
      console.error('Error loading wards:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã');
    } finally {
      setLoadingAddress(false);
    }
  };

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
        const uri = result.assets[0].uri;
        console.log(`📷 Selected ${field}:`, uri);
        
        try {
          // Upload to Cloudinary via backend immediately
          console.log('⏳ Uploading to backend...');
          const uploadResult = await uploadToCloudinary(uri, 'seller-registration');
          
          // Store Cloudinary URL
          setFormData({ ...formData, [field]: uploadResult.secure_url });
          console.log(`✅ Uploaded ${field}:`, uploadResult.secure_url);
          Alert.alert('✅ Thành công', 'Đã tải ảnh lên thành công');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('❌ Lỗi tải ảnh', 'Không thể tải ảnh lên. Vui lòng thử lại.\n' + (uploadError as Error).message);
          // Store local URI as fallback
          setFormData({ ...formData, [field]: uri });
        }
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

    // Check if editing existing registration
    const isEditing = !!params.editData;
    const confirmMessage = isEditing
      ? 'Bạn có chắc muốn cập nhật và gửi lại đơn đăng ký?'
      : 'Bạn có chắc muốn gửi đơn đăng ký làm người bán?';

    Alert.alert(
      'Xác nhận',
      confirmMessage,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setSubmitting(true);
            try {
              console.log('📋 Form data before submit:', formData);
              
              // Clean data: Remove local file URIs, set default IDs for manual address input
              const cleanedData = {
                ...formData,
                // Remove local file URIs
                logoUrl: formData.logoUrl?.startsWith('file://') ? '' : formData.logoUrl || '',
                bannerUrl: formData.bannerUrl?.startsWith('file://') ? '' : formData.bannerUrl || '',
                idCardFrontUrl: formData.idCardFrontUrl?.startsWith('file://') ? '' : formData.idCardFrontUrl || '',
                idCardBackUrl: formData.idCardBackUrl?.startsWith('file://') ? '' : formData.idCardBackUrl || '',
                selfieWithIdUrl: formData.selfieWithIdUrl?.startsWith('file://') ? '' : formData.selfieWithIdUrl || '',
                // If manual input (no IDs from API), use default values
                provinceId: formData.provinceId || 0,
                districtId: formData.districtId || 0,
                wardCode: formData.wardCode || '',
              };
              
              console.log('📦 Cleaned data:', cleanedData);
              
              // Call appropriate API based on mode
              let result;
              if (isEditing) {
                console.log('📝 Updating rejected registration...');
                result = await updateRejectedApplication(cleanedData);
                console.log('✅ Update result:', result);
                
                Alert.alert(
                  'Thành công',
                  'Đơn đăng ký đã được cập nhật và gửi lại. Vui lòng chờ xét duyệt.',
                  [{ text: 'OK', onPress: () => router.replace('/seller/registration-status') }]
                );
              } else {
                console.log('📝 Submitting new registration...');
                result = await submitSellerRegistration(cleanedData);
                console.log('✅ Submit result:', result);
                
                Alert.alert(
                  'Thành công',
                  'Đơn đăng ký của bạn đã được gửi. Vui lòng chờ xét duyệt.',
                  [{ text: 'OK', onPress: () => router.replace('/seller/registration-status') }]
                );
              }
            } catch (error: any) {
              console.error('Submit error:', error);
              const errorMsg = error.message || error?.response?.data?.message || 'Không thể gửi đơn đăng ký';
              Alert.alert('Lỗi', errorMsg);
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
      {/* Rejection Alert - Show when editing */}
      {params.editData && params.rejectionReason && (
        <View style={styles.rejectionAlert}>
          <View style={styles.rejectionHeader}>
            <Text style={styles.rejectionIcon}>⚠️</Text>
            <Text style={styles.rejectionTitle}>Đơn đăng ký bị từ chối</Text>
          </View>
          <View style={styles.rejectionReasonBox}>
            <Text style={styles.rejectionReasonLabel}>Lý do từ Admin:</Text>
            <Text style={styles.rejectionReasonText}>{params.rejectionReason}</Text>
          </View>
          <View style={styles.rejectionGuide}>
            <Text style={styles.rejectionGuideIcon}>📝</Text>
            <Text style={styles.rejectionGuideText}>
              Vui lòng chỉnh sửa thông tin theo yêu cầu trên và gửi lại đơn đăng ký.
            </Text>
          </View>
        </View>
      )}

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
      {provinces.length > 0 ? (
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
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Nhập Tỉnh/Thành phố"
          value={formData.provinceName}
          onChangeText={(text) => handleChange('provinceName', text)}
        />
      )}

      <Text style={styles.label}>Quận/Huyện *</Text>
      {districts.length > 0 ? (
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
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Nhập Quận/Huyện"
          value={formData.districtName}
          onChangeText={(text) => handleChange('districtName', text)}
        />
      )}

      <Text style={styles.label}>Phường/Xã *</Text>
      {wards.length > 0 ? (
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
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Nhập Phường/Xã"
          value={formData.wardName}
          onChangeText={(text) => handleChange('wardName', text)}
        />
      )}

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
              <Text style={styles.modalTitle}>Chọn Tỉnh/Thành phố ({provinces.length})</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingAddress ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
            ) : provinces.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#999' }}>Không có dữ liệu tỉnh/thành phố</Text>
                <TouchableOpacity 
                  onPress={loadProvinces}
                  style={{ marginTop: 10, padding: 10, backgroundColor: '#007AFF', borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff' }}>Tải lại</Text>
                </TouchableOpacity>
              </View>
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
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  pickerArrow: {
    fontSize: 12,
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
  // Rejection Alert Styles
  rejectionAlert: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rejectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  rejectionReasonBox: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 15,
    color: '#D32F2F',
    lineHeight: 22,
    fontWeight: '500',
  },
  rejectionGuide: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  rejectionGuideIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  rejectionGuideText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
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
