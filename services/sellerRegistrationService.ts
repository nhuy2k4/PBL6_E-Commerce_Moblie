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
 * Submit seller registration application
 */
export const submitSellerRegistration = async (data: any) => {
  try {
    console.log('📝 Submitting seller registration...');
    const res = await api.post('seller/register', data);
    console.log('✅ Registration submitted:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error submitting registration:', error);
    throw error;
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
  } catch (error) {
    console.error('❌ Error getting status:', error);
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
