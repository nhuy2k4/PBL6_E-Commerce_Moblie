import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Shared fetch utility for API requests
 */
export async function fetchPublic<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
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
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle empty response (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    const result = await response.json();
    
    // Backend returns: { status: 200, data: T, message: "..." }
    // Extract data field
    return result.data !== undefined ? result.data : result;
  } catch (error: any) {
    // Re-throw with better error message
    if (error.message) {
      throw error;
    }
    throw new Error('Network request failed. Please check your connection.');
  }
}

export async function fetchPrivate<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    // Get token from AsyncStorage
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
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle empty response (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    const result = await response.json();
    
    // Backend returns: { status: 200, data: T, message: "..." }
    // Extract data field
    return result.data !== undefined ? result.data : result;
  } catch (error: any) {
    // Re-throw with better error message
    if (error.message) {
      throw error;
    }
    throw new Error('Network request failed. Please check your connection.');
  }
}
