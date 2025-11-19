// Order service - Synced with Web
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl } from '../utils/api';
import { getItem } from '../utils/storage';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = await getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
