/**
 * API Utility with Token Refresh Mechanism
 * Synced with Web's axios interceptor pattern
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../constants/config';

// Queue to store failed requests while refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Clear all auth data and redirect to login
 */
const clearAuthAndRedirect = async () => {
  await AsyncStorage.multiRemove(['access_token', 'token', 'refresh_token', 'refreshToken', 'user_info', 'user']);
  // TODO: Navigate to login screen
  // This should be handled by your navigation setup
  console.warn('Session expired, please login again');
};

/**
 * Refresh access token
 * (React Native: implement fetch timeout with Promise.race)
 */
const fetchWithTimeout = (resource: RequestInfo, options: RequestInit = {}, timeout = 10000): Promise<Response> => {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    ),
  ]) as Promise<Response>;
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = (await AsyncStorage.getItem('refresh_token')) || (await AsyncStorage.getItem('refreshToken'));
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await fetchWithTimeout(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      },
      API_CONFIG.TIMEOUT
    );
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    const data = await response.json();
    // Backend returns: { status: 200, data: { token, refreshToken } }
    if (data.data) {
      const { token: newAccessToken, refreshToken: newRefreshToken } = data.data;
      // Save new tokens under both common keys for compatibility
      await AsyncStorage.setItem('access_token', newAccessToken);
      await AsyncStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
      }
      return newAccessToken;
    }
    throw new Error('Invalid refresh token response');
  } catch (error) {
    console.error('Token refresh error:', error);
    await clearAuthAndRedirect();
    throw error;
  }
};

/**
 * Enhanced fetch with automatic token refresh
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = (await AsyncStorage.getItem('access_token')) || (await AsyncStorage.getItem('token'));
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let response = await fetchWithTimeout(url, {
    ...options,
    headers,
  }, API_CONFIG.TIMEOUT);
  // If 401 Unauthorized, try to refresh token
  if (response.status === HTTP_STATUS.UNAUTHORIZED && !url.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(async (newToken) => {
          // Retry with new token
          const retryHeaders: HeadersInit = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          return fetchWithTimeout(url, {
            ...options,
            headers: retryHeaders,
          }, API_CONFIG.TIMEOUT);
        })
        .catch((err) => {
          throw err;
        });
    }
    isRefreshing = true;
    try {
      // Try to refresh token
      const newToken = await refreshAccessToken();
      if (!newToken) {
        throw new Error('Token refresh failed');
      }
      // Process queued requests
      processQueue(null, newToken);
      // Retry original request with new token
      const retryHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetchWithTimeout(url, {
        ...options,
        headers: retryHeaders,
      }, API_CONFIG.TIMEOUT);
    } catch (refreshError) {
      processQueue(refreshError, null);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
  return response;
};

/**
 * Fetch JSON with auth and automatic token refresh
 */
export const fetchJsonWithAuth = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `HTTP ${response.status}` 
    }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

/**
 * Build full URL from endpoint
 */
export const buildUrl = (endpoint: string | ((param: any) => string), param?: any): string => {
  const path = typeof endpoint === 'function' ? endpoint(param) : endpoint;
  return `${API_CONFIG.BASE_URL}${path}`;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = (await AsyncStorage.getItem('access_token')) || (await AsyncStorage.getItem('token'));
  return !!token;
};

/**
 * Get current access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return (await AsyncStorage.getItem('access_token')) || (await AsyncStorage.getItem('token'));
};

/**
 * Get current refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return (await AsyncStorage.getItem('refresh_token')) || (await AsyncStorage.getItem('refreshToken'));
};

/**
 * Fetch for public endpoints (no auth required)
 */
export const fetchPublic = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetchWithTimeout(url, {
    ...options,
    headers,
  }, API_CONFIG.TIMEOUT);

  return response;
};

/**
 * Fetch JSON for public endpoints
 */
export const fetchJsonPublic = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchPublic(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `HTTP ${response.status}` 
    }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

/**
 * Handle API errors
 */
export const handleApiError = (error: any): string => {
  if (!error) return 'Đã xảy ra lỗi';
  
  if (error.message) return error.message;
  
  if (typeof error === 'string') return error;
  
  return 'Đã xảy ra lỗi không xác định';
};
