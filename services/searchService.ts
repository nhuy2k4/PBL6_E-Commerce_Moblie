/**
 * Search Service - API calls for product and shop search
 */

import { fetchJsonWithAuth, fetchJsonPublic, buildUrl } from '@/utils/api';
import { API_ENDPOINTS } from '@/constants/config';

// ========== TYPES ==========

export interface QuerySuggestionItem {
  text: string;
  highlightedText: string;
  estimatedCount: number;
}

export interface ProductSuggestionItem {
  id: number;
  name: string;
  highlightedName: string;
  image: string;
  price: number;
  rating: number;
  soldCount: number;
  shopName: string;
}

export interface CategorySuggestionItem {
  id: number;
  name: string;
  highlightedName: string;
  productCount: number;
}

export interface TrendingSuggestionItem {
  query: string;
  rank: number;
  searchCount: number;
}

export interface ShopSuggestionItem {
  id: number;
  name: string;
  highlightedName: string;
  logoUrl: string;
  productCount: number;
  status: string;
}

export interface SearchSuggestionDTO {
  queries: QuerySuggestionItem[];
  products: ProductSuggestionItem[];
  categories: CategorySuggestionItem[];
  trending: TrendingSuggestionItem[];
  shops: ShopSuggestionItem[];
  didYouMean?: string;
}

export interface TrendingSearchDTO {
  trending: {
    query: string;
    rank: number;
    searchCount: number;
    trendScore: number;
  }[];
}

export interface FacetedSearchDTO {
  totalCount: number;
  categories: CategoryFacet[];
  priceRanges: PriceRangeFacet[];
  ratings: RatingFacet[];
  brands: BrandFacet[];
}

export interface CategoryFacet {
  id: number;
  name: string;
  productCount: number;
  selected: boolean;
}

export interface PriceRangeFacet {
  label: string;
  minPrice: number;
  maxPrice: number;
  productCount: number;
  selected: boolean;
}

export interface RatingFacet {
  minRating: number;
  label: string;
  productCount: number;
  selected: boolean;
}

export interface BrandFacet {
  shopId: number;
  shopName: string;
  productCount: number;
  selected: boolean;
}

// ========== API FUNCTIONS ==========

/**
 * Get search suggestions for autocomplete
 * @param q Search query (can be partial)
 * @param limit Max number of suggestions per type
 */
export async function getSearchSuggestions(
  q: string = '',
  limit: number = 5
): Promise<SearchSuggestionDTO> {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  params.append('limit', limit.toString());

  const url = buildUrl(`${API_ENDPOINTS.SEARCH.SUGGESTIONS}?${params.toString()}`);
  const response = await fetchJsonPublic<any>(url);
  return response.data;
}

/**
 * Get trending/popular searches
 * @param limit Max number of trending searches
 */
export async function getTrendingSearches(limit: number = 10): Promise<TrendingSearchDTO> {
  const url = buildUrl(`${API_ENDPOINTS.SEARCH.TRENDING}?limit=${limit}`);
  const response = await fetchJsonPublic<any>(url);
  return response.data;
}

/**
 * Track a search query (for analytics)
 * @param q Search query
 * @param resultCount Number of results returned
 */
export async function trackSearch(q: string, resultCount: number = 0): Promise<void> {
  try {
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('resultCount', resultCount.toString());

    const url = buildUrl(`${API_ENDPOINTS.SEARCH.TRACK}?${params.toString()}`);
    await fetchJsonWithAuth(url, { method: 'POST' });
  } catch (error) {
    // Don't throw on tracking errors
    console.warn('Failed to track search:', error);
  }
}

/**
 * Track product click from search results
 * @param q Search query
 * @param productId Product ID that was clicked
 */
export async function trackSearchClick(q: string, productId: number): Promise<void> {
  try {
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('productId', productId.toString());

    const url = buildUrl(`${API_ENDPOINTS.SEARCH.TRACK_CLICK}?${params.toString()}`);
    await fetchJsonWithAuth(url, { method: 'POST' });
  } catch (error) {
    console.warn('Failed to track click:', error);
  }
}

/**
 * Get faceted search filters with product counts
 * @param keyword Search keyword
 * @param categoryId Selected category
 * @param minPrice Min price
 * @param maxPrice Max price
 * @param minRating Min rating
 */
export async function getFacetedFilters(
  keyword?: string,
  categoryId?: number,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number
): Promise<FacetedSearchDTO> {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (categoryId) params.append('categoryId', categoryId.toString());
  if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
  if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
  if (minRating !== undefined) params.append('minRating', minRating.toString());

  const url = buildUrl(`${API_ENDPOINTS.SEARCH.FACETS}?${params.toString()}`);
  const response = await fetchJsonPublic<any>(url);
  return response.data;
}

/**
 * Get user's search history
 * @param limit Max number of history items
 */
export async function getSearchHistory(limit: number = 10): Promise<string[]> {
  try {
    const url = buildUrl(`${API_ENDPOINTS.SEARCH.HISTORY}?limit=${limit}`);
    const response = await fetchJsonWithAuth(url);
    return response.data || [];
  } catch (error) {
    console.warn('Failed to get search history:', error);
    return [];
  }
}

/**
 * Clear user's search history
 */
export async function clearSearchHistory(): Promise<void> {
  const url = buildUrl(API_ENDPOINTS.SEARCH.HISTORY);
  await fetchJsonWithAuth(url, { method: 'DELETE' });
}

/**
 * Delete specific search from history
 * @param query Query to delete
 */
export async function deleteFromHistory(query: string): Promise<void> {
  const url = buildUrl(`${API_ENDPOINTS.SEARCH.HISTORY}/${encodeURIComponent(query)}`);
  await fetchJsonWithAuth(url, { method: 'DELETE' });
}

/**
 * Search for shops by name
 * @param keyword Search keyword
 * @param limit Max number of shops
 */
export async function searchShops(
  keyword: string = '',
  limit: number = 10
): Promise<ShopSuggestionItem[]> {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  params.append('limit', limit.toString());

  const url = buildUrl(`${API_ENDPOINTS.SEARCH.SHOPS}?${params.toString()}`);
  const response = await fetchJsonPublic<any>(url);
  return response.data || [];
}

// ========== LOCAL STORAGE HELPERS (AsyncStorage for React Native) ==========

import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Get recent searches from AsyncStorage
 */
export async function getRecentSearches(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search to recent searches
 */
export async function saveRecentSearch(query: string): Promise<void> {
  if (!query || query.trim().length === 0) return;
  
  try {
    const searches = await getRecentSearches();
    const normalizedQuery = query.trim();
    
    // Remove if already exists
    const filtered = searches.filter(s => s.toLowerCase() !== normalizedQuery.toLowerCase());
    
    // Add to beginning
    filtered.unshift(normalizedQuery);
    
    // Keep only last N searches
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Error saving recent search:', error);
  }
}

/**
 * Remove a search from recent searches
 */
export async function removeRecentSearch(query: string): Promise<void> {
  try {
    const searches = await getRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Error removing recent search:', error);
  }
}

/**
 * Clear all recent searches
 */
export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.warn('Error clearing recent searches:', error);
  }
}
