// Tận dụng lại logic từ web, ví dụ:
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

export const getSellerProducts = async () => {
  try {
    console.log('Calling seller products API...');
    // Endpoint đúng từ web: /api/products/my-products
    const res = await api.get('products/my-products');
    console.log('API response:', res.data);
    // Backend trả về: { data: { content: [...], page: {...} }, status: 200, message: "..." }
    return res.data.data?.content || res.data.content || res.data; 
  } catch (error) {
    console.log('products/my-products failed, using mock data');
    return [
      { id: 1, name: 'Sản phẩm 1', price: 100000 },
      { id: 2, name: 'Sản phẩm 2', price: 200000 },
      { id: 3, name: 'Sản phẩm 3', price: 150000 },
    ];
  }
};

export const addSellerProduct = async (product: { name: string; price: number }) => {
  const res = await api.post('products', product);
  return res.data;
};

export const updateSellerProduct = async (id: number, product: { name: string; price: number }) => {
  const res = await api.put(`products/${id}`, product);
  return res.data;
};

export const deleteSellerProduct = async (id: number) => {
  const res = await api.delete(`products/${id}`);
  return res.data;
};
