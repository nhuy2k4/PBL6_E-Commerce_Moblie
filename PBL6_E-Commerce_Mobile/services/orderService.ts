// Order service - Synced with Web
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl, fetchJsonWithAuth } from '../utils/api';
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
 * Create a new order
 */
export async function createOrder(orderData: any): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.ORDER.CREATE), {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    console.log('✅ createOrder response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

/**
 * Get all orders for current user
 */
export async function getMyOrders(): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.ORDER.GET_LIST));
    console.log('✅ getMyOrders response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get order detail by ID
 */
export async function getOrderDetail(orderId: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.ORDER.GET_BY_ID, orderId));
    console.log('✅ getOrderDetail response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching order detail:', error);
    throw error;
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.ORDER.CANCEL, orderId), {
      method: 'PUT',
    });
    console.log('✅ cancelOrder response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    throw error;
  }
}

/**
 * Create MoMo payment
 */
export async function createMoMoPayment(paymentData: {
  orderId: number;
  amount: number;
  orderInfo: string;
}): Promise<any> {
  try {
    const response = await fetchApi(buildUrl('/payment/momo/create'), {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    console.log('✅ createMoMoPayment response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating MoMo payment:', error);
    throw error;
  }
}

/**
 * Get available GHN shipping services
 */
export async function getAvailableServices(data: {
  shopId: number;
  addressId: number;
  cartItemIds: number[];
}): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.CHECKOUT.AVAILABLE_SERVICES), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ getAvailableServices response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching available services:', error);
    throw error;
  }
}

/**
 * Calculate GHN shipping fee
 */
export async function calculateShippingFee(data: {
  shopId: number;
  addressId: number;
  serviceId: number;
  serviceTypeId: number;
  cartItemIds: number[];
}): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.CHECKOUT.CALCULATE_FEE), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ calculateShippingFee response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error calculating shipping fee:', error);
    throw error;
  }
}

/**
 * Confirm checkout and create order(s)
 */
export async function confirmCheckout(data: {
  shopId: number;
  addressId: number;
  serviceId: number;
  serviceTypeId: number;
  cartItemIds: number[];
  paymentMethod: string;
  note?: string;
}): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.CHECKOUT.CONFIRM), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ confirmCheckout response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error confirming checkout:', error);
    throw error;
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: string): Promise<any> {
  try {
    const url = new URL(buildUrl(API_ENDPOINTS.ORDER.GET_LIST));
    url.searchParams.append('status', status);
    
    const response = await fetchApi(url.toString());
    console.log('✅ getOrdersByStatus response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching orders by status:', error);
    throw error;
  }
}
