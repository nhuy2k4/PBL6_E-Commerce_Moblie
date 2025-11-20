// API lấy tỉnh/huyện/xã từ https://provinces.open-api.vn/api/
const BASE_API = 'https://provinces.open-api.vn/api';

export async function getProvinces() {
  const res = await fetch(`${BASE_API}/p/`);
  if (!res.ok) throw new Error('Failed to fetch provinces');
  return await res.json();
}

export async function getDistricts(provinceCode) {
  if (!provinceCode) return [];
  const res = await fetch(`${BASE_API}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  const data = await res.json();
  return data.districts || [];
}

export async function getWards(districtCode) {
  if (!districtCode) return [];
  const res = await fetch(`${BASE_API}/d/${districtCode}?depth=2`);
  if (!res.ok) throw new Error('Failed to fetch wards');
  const data = await res.json();
  return data.wards || [];
}
// Shared address service
import type { Address } from '../types';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Đổi thành URL ngrok public (ví dụ: https://abc123.ngrok.io)
const BACKEND_API = 'https://nikolas-unstrenuous-augustus.ngrok-free.dev'; // TODO: Thay bằng domain ngrok thật của bạn

// Lấy danh sách địa chỉ từ API backend (chuẩn hóa giống web)
export async function getAddresses(): Promise<Address[]> {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${BACKEND_API}/api/me/addresses`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('getAddresses API error:', res.status, text);
      throw new Error(`Failed to fetch addresses: ${res.status} ${text}`);
    }
    return await res.json();
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
