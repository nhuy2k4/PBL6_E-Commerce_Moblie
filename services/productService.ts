/**
 * Product Service - Synced with Web
 * Service for product-related API calls
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
 * Get paginated products list (public)
 */
export async function getProducts(page: number = 0, size: number = 12): Promise<any> {
  if (page < 0) page = 0;
  if (size < 1 || size > 100) size = 12;

  try {
    const url = new URL(buildUrl(API_ENDPOINTS.PRODUCT.GET_ALL));
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());
    
    const response = await fetchApi(url.toString());
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.PRODUCT.GET_BY_ID, id));
    console.log('🔍 getProductById response:', response);
    return response;
  } catch (error) {
    if ((error as any).message?.includes('404')) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    throw error;
  }
}

/**
 * Search products with filters
 */
export async function searchProducts(filters: {
  keyword?: string;
  categoryId?: number;
  shopId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  size?: number;
} = {}): Promise<any> {
  try {
    const url = new URL(buildUrl(API_ENDPOINTS.PRODUCT.SEARCH));
    
    if (filters.keyword) url.searchParams.append('name', filters.keyword);
    if (filters.categoryId) url.searchParams.append('categoryId', filters.categoryId.toString());
    if (filters.shopId) url.searchParams.append('shopId', filters.shopId.toString());
    if (filters.minPrice) url.searchParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) url.searchParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) url.searchParams.append('minRating', filters.minRating.toString());
    url.searchParams.append('page', (filters.page || 0).toString());
    url.searchParams.append('size', (filters.size || 12).toString());
    
    const response = await fetchApi(url.toString());
    console.log('🔍 searchProducts response:', response);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get products by shop ID
 */
export async function getProductsByShopId(shopId: number, page: number = 0, size: number = 12): Promise<any> {
  try {
    const url = new URL(buildUrl(API_ENDPOINTS.PRODUCT.BY_SHOP(shopId)));
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());
    
    const response = await fetchApi(url.toString());
    console.log('🔍 getProductsByShopId response:', response);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: number, page: number = 0, size: number = 12): Promise<any> {
  try {
    const url = new URL(buildUrl(API_ENDPOINTS.PRODUCT.BY_CATEGORY, categoryId));
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());
    
    const response = await fetchApi(url.toString());
    console.log('🔍 getProductsByCategory response:', response);
    return response;
  } catch (error) {
    throw error;
  }
}

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
export async function getCategoryById(id: number): Promise<any> {
  const response = await fetchApi(buildUrl(API_ENDPOINTS.CATEGORY.GET_BY_ID, id));
  return response.data || response;
}


/**
 * Get product images including variant images
 */
export async function getProductImages(productId: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(`products/${productId}/images`));
    console.log('🖼️ getProductImages response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching product images:', error);
    throw error;
  }
}

/**
 * Get primary attribute for product variants
 */
export async function getPrimaryAttribute(productId: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(`products/${productId}/images/primary-attribute`));
    console.log('🎨 getPrimaryAttribute response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching primary attribute:', error);
    throw error;
  }
}

/**
 * Get variant attribute values
 */
export async function getVariantValues(productId: number): Promise<any> {
  try {
    const response = await fetchApi(buildUrl(`products/${productId}/images/variant/values`));
    console.log('🎯 getVariantValues response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching variant values:', error);
    throw error;
  }
}

// Legacy aliases
export const getAllProducts = getProducts;
export const fetchAllProducts = getProducts;

