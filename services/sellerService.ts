// Seller Service - API calls for seller management
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';

// Cấu hình axios instance với baseURL và ngrok headers
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Interceptor để thêm token vào mỗi request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== PRODUCTS ====================
export const getSellerProducts = async (page = 0, size = 10) => {
  try {
    console.log('Calling seller products API...');
    const res = await api.get(`products/my-shop/all?page=${page}&size=${size}`);
    console.log('API response:', res.data);
    // Backend trả về: { data: { content: [...], page: {...} }, status: 200, message: "..." }
    return {
      products: res.data.data?.content || res.data.content || res.data || [],
      page: res.data.data?.page || res.data.page || { totalElements: 0, totalPages: 0 }
    };
  } catch (error) {
    console.log('products/my-shop/all failed:', error);
    throw error;
  }
};

export const addSellerProduct = async (product: any) => {
  const res = await api.post('products', product);
  return res.data;
};

export const updateSellerProduct = async (id: number, product: any) => {
  const res = await api.put(`products/${id}`, product);
  return res.data;
};

export const deleteSellerProduct = async (id: number) => {
  const res = await api.delete(`products/${id}`);
  return res.data;
};

// ==================== ORDERS ====================
export const getSellerOrders = async (page = 0, size = 10) => {
  try {
    console.log('Calling seller orders API...');
    const res = await api.get(`seller/orders?page=${page}&size=${size}`);
    console.log('Seller orders response:', res.data);
    return {
      orders: res.data.data?.content || res.data.content || res.data || [],
      page: res.data.data?.page || res.data.page || { totalElements: 0, totalPages: 0 }
    };
  } catch (error) {
    console.log('seller/orders failed:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const res = await api.put(`seller/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error) {
    console.log('Update order status failed:', error);
    throw error;
  }
};

// ==================== VOUCHERS ====================
export const getSellerVouchers = async (page = 0, size = 10) => {
  try {
    console.log('Calling seller vouchers API...');
    const res = await api.get(`seller/vouchers?page=${page}&size=${size}`);
    console.log('Seller vouchers response:', res.data);
    // API trả về { data: [...], status: 200, message: "..." }
    // data là array trực tiếp, không có content/page
    return {
      vouchers: res.data.data || res.data || [],
      page: { totalElements: res.data.data?.length || 0, totalPages: 1 }
    };
  } catch (error) {
    console.log('seller/vouchers failed:', error);
    throw error;
  }
};

export const createVoucher = async (voucher: any) => {
  try {
    const res = await api.post('seller/vouchers', voucher);
    return res.data;
  } catch (error) {
    console.log('Create voucher failed:', error);
    throw error;
  }
};

export const updateVoucher = async (id: number, voucher: any) => {
  try {
    const res = await api.put(`seller/vouchers/${id}`, voucher);
    return res.data;
  } catch (error) {
    console.log('Update voucher failed:', error);
    throw error;
  }
};

export const deleteVoucher = async (id: number) => {
  try {
    const res = await api.delete(`seller/vouchers/${id}`);
    return res.data;
  } catch (error) {
    console.log('Delete voucher failed:', error);
    throw error;
  }
};

// ==================== TOP BUYERS ====================
export const getTopBuyers = async (limit = 10) => {
  try {
    console.log('Calling top buyers API...');
    const res = await api.get(`seller/top-buyers?limit=${limit}`);
    console.log('Top buyers response:', res.data);
    return res.data.data || res.data || [];
  } catch (error) {
    console.log('seller/top-buyers failed:', error);
    throw error;
  }
};

// ==================== ANALYTICS ====================
export const getShopAnalytics = async (year: number) => {
  try {
    console.log(`Calling shop analytics API for year ${year}...`);
    const res = await api.get(`seller/shop/analytics?year=${year}`);
    console.log('Shop analytics response:', res.data);
    return res.data.data || res.data || {};
  } catch (error) {
    console.log('seller/shop/analytics failed:', error);
    throw error;
  }
};
