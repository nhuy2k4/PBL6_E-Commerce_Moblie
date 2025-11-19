// Shared user service
import { fetchWithAuth } from './api';
import type { User, Order } from '../types';

/**
 * Get current user profile
 */
export async function getCurrentUser(token: string): Promise<User> {
  return fetchWithAuth<User>('/user/me', token, {
    method: 'GET',
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(token: string, data: Partial<User>): Promise<User> {
  // Backend chưa có endpoint update profile, nếu cần hãy tạo ở backend
  // return fetchWithAuth<User>('/user/profile', token, {
  //   method: 'PUT',
  //   body: JSON.stringify(data),
  // });
  throw new Error('Update profile endpoint not implemented on backend');
}

/**
 * Get user's order history
 */
export async function getUserOrders(token: string): Promise<Order[]> {
  return fetchWithAuth<Order[]>('/user/orders', token, {
    method: 'GET',
  });
}

/**
 * Get order by ID
 */
export async function getOrderById(token: string, orderId: number): Promise<Order> {
  return fetchWithAuth<Order>(`/user/orders/${orderId}`, token, {
    method: 'GET',
  });
}
