import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Shared fetch utility for API requests
 */
export async function fetchPublic<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Normalize endpoint - remove leading slash if BASE_URL has trailing slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();
  
  // Backend returns: { status: 200, data: T, message: "..." }
  // Extract data field
  return result.data || result;
}

export async function fetchPrivate<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Get token from AsyncStorage
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const token = await AsyncStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  // Normalize endpoint - remove leading slash if BASE_URL has trailing slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();
  
  // Backend returns: { status: 200, data: T, message: "..." }
  // Extract data field
  return result.data || result;
}
