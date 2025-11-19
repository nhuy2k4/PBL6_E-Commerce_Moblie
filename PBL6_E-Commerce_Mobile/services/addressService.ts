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

export async function getAddresses(userId: number): Promise<Address[]> {
  // TODO: Replace with real API call
  return [];
}

export async function addAddress(userId: number, address: Address): Promise<void> {
  // TODO: Replace with real API call
}

export async function updateAddress(userId: number, address: Address): Promise<void> {
  // TODO: Replace with real API call
}

export async function deleteAddress(userId: number, addressId: number): Promise<void> {
  // TODO: Replace with real API call
}
