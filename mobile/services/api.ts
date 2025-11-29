// Mobile API wrapper - Automatically handles token from AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPublic as utilsFetchPublic, fetchPrivate } from '../utils/fetch';

/**
 * Fetch with authentication token from AsyncStorage
 */
export async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return fetchPrivate<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Public fetch (no authentication)
 */
export const fetchPublic = utilsFetchPublic;
