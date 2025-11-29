// Seller order service
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

/**
 * Get seller orders
 */
export async function getSellerOrders(): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.SELLER.ORDERS));
    console.log('✅ getSellerOrders response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    throw error;
  }
}

/**
 * Update order status (confirm, shipping, complete, cancel)
 */
export async function updateOrderStatus(orderId: number, status: string): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.SELLER.UPDATE_ORDER_STATUS(orderId)), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    console.log('✅ updateOrderStatus response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
}

/**
 * Get seller order detail
 */
export async function getSellerOrderDetail(orderId: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.SELLER.ORDER_DETAIL(orderId)));
    console.log('✅ getSellerOrderDetail response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching seller order detail:', error);
    throw error;
  }
}