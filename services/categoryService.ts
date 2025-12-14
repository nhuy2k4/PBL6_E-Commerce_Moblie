/**
 * Category Service - Synced with Web
 */
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl } from '../utils/api';
import type { Category } from '../types';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.CATEGORY.GET_ALL));
    console.log('📦 getAllCategories response:', response);
    
    const categories = response?.data || response || [];
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetchApi(buildUrl(API_ENDPOINTS.CATEGORY.GET_BY_ID, id));
  return response.data || response;
}

