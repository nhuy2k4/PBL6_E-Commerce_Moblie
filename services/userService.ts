// Shared user service
import { fetchWithAuth } from './api';
import type { User, Order } from '../types';

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  return fetchWithAuth<User>('/user/me', {
    method: 'GET',
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: Partial<User>): Promise<User> {
  // Backend chưa có endpoint update profile, nếu cần hãy tạo ở backend
  // return fetchWithAuth<User>('/user/profile', {
  //   method: 'PUT',
  //   body: JSON.stringify(data),
  // });
  throw new Error('Update profile endpoint not implemented on backend');
}

/**
 * Get user's order history
 */
export async function getUserOrders(): Promise<Order[]> {
  return fetchWithAuth<Order[]>('/user/orders', {
    method: 'GET',
  });
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: number): Promise<Order> {
  return fetchWithAuth<Order>(`/user/orders/${orderId}`, {
    method: 'GET',
  });
}
