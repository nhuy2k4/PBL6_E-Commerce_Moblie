// Shared user service
import { fetchWithAuth } from './api';
import type { User, Order, UserProfile, UpdateProfileDTO, ChangePasswordDTO } from '../types';

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  return fetchWithAuth<User>('/user/me', {
    method: 'GET',
  });
}

/**
 * Get full user profile with timestamps
 * GET /api/profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  return fetchWithAuth<UserProfile>('user/profile', {
    method: 'GET',
  });
}

/**
 * Update user profile
 * PUT /api/profile
 */
export async function updateUserProfile(data: UpdateProfileDTO): Promise<UserProfile> {
  return fetchWithAuth<UserProfile>('user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Change password
 * PUT /api/user/change-password
 */
export async function changePassword(data: ChangePasswordDTO): Promise<void> {
  await fetchWithAuth<{ message: string }>('user/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Update avatar URL
 * PUT /api/user/avatar
 */
export async function updateAvatar(avatarUrl: string): Promise<UserProfile> {
  return fetchWithAuth<UserProfile>(`/user/avatar?avatarUrl=${encodeURIComponent(avatarUrl)}`, {
    method: 'PUT',
  });
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

/**
 * GHN Master Data APIs
 * Get list of provinces from GHN
 */
export async function getProvinces(): Promise<any[]> {
  try {
    const data = await fetchWithAuth<any>('ghn/master/provinces', {
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error loading provinces:', error);
    return [];
  }
}

/**
 * Get list of districts for a province from GHN
 * @param provinceId - Province ID from GHN
 */
export async function getDistricts(provinceId: number): Promise<any[]> {
  try {
    const data = await fetchWithAuth<any>(`ghn/master/districts?province_id=${provinceId}`, {
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error loading districts:', error);
    return [];
  }
}

/**
 * Get list of wards for a district from GHN
 * @param districtId - District ID from GHN
 */
export async function getWards(districtId: number): Promise<any[]> {
  try {
    const data = await fetchWithAuth<any>(`ghn/master/wards?district_id=${districtId}`, {
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error loading wards:', error);
    return [];
  }
}

/**
 * Resolve province/district/ward names to IDs
 * @param addressData - { province, district, ward }
 */
export async function resolveAddress(addressData: { province: string; district: string; ward: string }): Promise<any> {
  return fetchWithAuth<any>('ghn/master/resolve', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
}
