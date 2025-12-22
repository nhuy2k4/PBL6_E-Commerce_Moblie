// API lấy tỉnh/huyện/xã từ GHN Master API (backend)
import type { Address } from '../types';
import { fetchPrivate, fetchPublic } from '../utils/fetch';

export async function getProvinces() {
  return await fetchPublic('/ghn/master/provinces');
}

export async function getDistricts(provinceId: number) {
  if (!provinceId) return [];
  return await fetchPublic(`/ghn/master/districts?province_id=${provinceId}`);
}

export async function getWards(districtId: number) {
  if (!districtId) return [];
  return await fetchPublic(`/ghn/master/wards?district_id=${districtId}`);
}

// Resolve address names to GHN codes
export async function resolveAddress(province: string, district: string, ward: string) {
  return await fetchPublic('/ghn/master/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ province, district, ward })
  });
}

// Shared address service
// Lấy danh sách địa chỉ từ API backend (chuẩn hóa giống web)
export async function getAddresses(): Promise<Address[]> {
  try {
    console.log('📍 Fetching addresses from /me/addresses');
    const result = await fetchPrivate('/me/addresses') as Address[];
    console.log('📍 Addresses fetched:', result);
    return result;
  } catch (err) {
    console.error('getAddresses exception:', err);
    throw err;
  }
}

/**
 * Add new address
 * POST /api/me/addresses
 */
export async function addAddress(address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> {
  try {
    console.log('📍 Adding address:', address);
    const result = await fetchPrivate('/me/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    });
    console.log('📍 Address added successfully:', result);
    return result;
  } catch (error) {
    console.error('📍 Add address error:', error);
    throw error;
  }
}

/**
 * Update existing address
 * PUT /api/me/addresses/{id}
 */
export async function updateAddress(addressId: number, address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> {
  try {
    console.log('📍 Updating address:', addressId, address);
    const result = await fetchPrivate(`/me/addresses/${addressId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    });
    console.log('📍 Address updated successfully:', result);
    return result;
  } catch (error) {
    console.error('📍 Update address error:', error);
    throw error;
  }
}

/**
 * Set address as primary
 * POST /api/me/addresses/{id}/primary
 */
export async function setPrimaryAddress(addressId: number): Promise<Address> {
  return await fetchPrivate(`/me/addresses/${addressId}/primary`, {
    method: 'POST'
  });
}

/**
 * Delete address
 * DELETE /api/me/addresses/{id}
 */
export async function deleteAddress(addressId: number): Promise<void> {
  await fetchPrivate(`/me/addresses/${addressId}`, {
    method: 'DELETE'
  });
}
