// Seller Registration Service - API for buyer to register as seller
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add token interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== BUYER APIs ====================

/**
 * Submit seller registration application (JSON with Cloudinary URLs)
 * Backend expects JSON, not FormData. Images must be uploaded to Cloudinary first.
 */
export const submitSellerRegistration = async (data: any) => {
  try {
    console.log('📝 Submitting seller registration...');
    
    // Backend expects JSON with Cloudinary URLs already uploaded (like web)
    const payload = {
      shopName: data.shopName,
      description: data.description || '',
      shopPhone: data.shopPhone,
      shopEmail: data.shopEmail,
      fullAddress: data.fullAddress,
      provinceName: data.provinceName,
      provinceId: data.provinceId,
      districtName: data.districtName,
      districtId: data.districtId,
      wardName: data.wardName,
      wardCode: data.wardCode || '',
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      idCardNumber: data.idCardNumber,
      idCardName: data.idCardName,
      // Image URLs (must be Cloudinary URLs, not file:// URIs)
      logoUrl: data.logoUrl || '',
      bannerUrl: data.bannerUrl || '',
      idCardFrontUrl: data.idCardFrontUrl || '',
      idCardBackUrl: data.idCardBackUrl || '',
      selfieWithIdUrl: data.selfieWithIdUrl || '',
    };
    
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    const res = await api.post('seller/register', payload);
    console.log('✅ Registration submitted:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error submitting registration:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
    
    // Re-throw with more context
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
  }
};

/**
 * Get current registration status
 */
export const getRegistrationStatus = async () => {
  try {
    console.log('🔍 Fetching registration status...');
    const res = await api.get('seller/registration/status');
    console.log('✅ Registration status:', res.data);
    return res.data;
  } catch (error: any) {
    // 404 is expected when no registration exists
    if (error?.response?.status === 404) {
      console.log('📦 No registration found (404)');
    } else {
      console.error('❌ Error getting status:', error);
    }
    throw error;
  }
};

/**
 * Cancel rejected application (to allow resubmission)
 */
export const cancelRejectedApplication = async () => {
  try {
    console.log('🗑️ Canceling rejected application...');
    const res = await api.delete('seller/registration');
    console.log('✅ Application canceled:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error canceling application:', error);
    throw error;
  }
};

/**
 * Check if user can submit new registration
 */
export const canSubmitRegistration = async () => {
  try {
    console.log('🔍 Checking registration eligibility...');
    const res = await api.get('seller/registration/can-submit');
    console.log('✅ Can submit:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error checking eligibility:', error);
    throw error;
  }
};

/**
 * Update rejected registration (re-submit after fixing issues)
 */
export const updateRejectedApplication = async (data: any) => {
  try {
    console.log('📝 Updating rejected registration...');
    
    const payload = {
      shopName: data.shopName,
      description: data.description || '',
      shopPhone: data.shopPhone,
      shopEmail: data.shopEmail,
      fullAddress: data.fullAddress,
      provinceName: data.provinceName,
      provinceId: data.provinceId,
      districtName: data.districtName,
      districtId: data.districtId,
      wardName: data.wardName,
      wardCode: data.wardCode || '',
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      idCardNumber: data.idCardNumber,
      idCardName: data.idCardName,
      logoUrl: data.logoUrl || '',
      bannerUrl: data.bannerUrl || '',
      idCardFrontUrl: data.idCardFrontUrl || '',
      idCardBackUrl: data.idCardBackUrl || '',
      selfieWithIdUrl: data.selfieWithIdUrl || '',
    };
    
    console.log('📦 Update payload:', JSON.stringify(payload, null, 2));
    const res = await api({
      method: 'PUT',
      url: 'seller/registration',
      data: payload,
    });
    console.log('✅ Registration updated:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error updating registration:', error);
    console.error('❌ Error response:', error.response?.data);
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Không thể cập nhật đơn đăng ký');
    }
  }
};
