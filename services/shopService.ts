/**
 * Shop Service - API calls for shop information
 */

import { fetchJsonWithAuth, fetchJsonPublic, buildUrl } from '@/utils/api';
import { API_ENDPOINTS } from '@/constants/config';

export interface Shop {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  address: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  rating: number | null;
  reviewCount: number | null;
  shopPhone: string | null;
  shopEmail: string | null;
}

/**
 * Get shop details by ID
 * @param shopId Shop ID
 */
export async function getShopById(shopId: number): Promise<Shop> {
  const url = buildUrl(`shops/${shopId}`);
  
  // Try with auth first, fallback to public if needed
  try {
    const response = await fetchJsonWithAuth<any>(url);
    return response.data || response;
  } catch (error: any) {
    // If auth fails, try public endpoint
    if (error.message?.includes('401')) {
      const response = await fetchJsonPublic<any>(url);
      return response.data || response;
    }
    throw error;
  }
}
