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


export async function addAddress(address: Address): Promise<void> {
  // TODO: Implement POST /api/me/addresses
}


export async function updateAddress(address: Address): Promise<void> {
  // TODO: Implement PUT /api/me/addresses/{id}
}


export async function deleteAddress(addressId: number): Promise<void> {
  // TODO: Implement DELETE /api/me/addresses/{id}
}
