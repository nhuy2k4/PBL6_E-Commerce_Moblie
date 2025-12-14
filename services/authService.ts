/**
 * Authentication Service - Synced with Web
 * Handles all authentication-related API calls
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl } from '../utils/api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

// ==================== HELPERS ====================

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token && !options.headers?.['Authorization']) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, options.body ? {
    ...options,
    headers,
  } : {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// ==================== STORAGE ====================

const saveAuthData = async (data: { token: string; refreshToken?: string; user: User }) => {
  await AsyncStorage.setItem('access_token', data.token);
  if (data.refreshToken) {
    await AsyncStorage.setItem('refresh_token', data.refreshToken);
  }
  await AsyncStorage.setItem('user_info', JSON.stringify(data.user));
};

const clearAuthData = async () => {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_info']);
};

// ==================== LOGIN ====================

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });
    
    if (response.data) {
      const { token, refreshToken, user } = response.data;
      await saveAuthData({ token, refreshToken, user });
      
      return {
        accessToken: token,
        refreshToken,
        user,
        expiresIn: 3600,
        tokenType: 'Bearer',
      };
    }
    
    throw new Error(response.message || 'Đăng nhập thất bại');
  } catch (error) {
    throw error;
  }
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.AUTH.LOGIN_GOOGLE), {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    
    if (response.statusCode === 200 && response.data) {
      const { token, refreshToken } = response.data;
      await AsyncStorage.setItem('access_token', token);
      if (refreshToken) await AsyncStorage.setItem('refresh_token', refreshToken);
      
      const userResponse = await fetchApi(buildUrl(API_ENDPOINTS.PROFILE.ME));
      if (userResponse.statusCode === 200 && userResponse.data) {
        const user = userResponse.data;
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
        return { accessToken: token, refreshToken, user, expiresIn: 3600, tokenType: 'Bearer' };
      }
    }
    throw new Error(response.message || 'Đăng nhập Google thất bại');
  } catch (error) {
    throw error;
  }
}

export async function loginWithFacebook(accessToken: string): Promise<AuthResponse> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.AUTH.LOGIN_FACEBOOK), {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
    
    if (response.statusCode === 200 && response.data) {
      const { token, refreshToken } = response.data;
      await AsyncStorage.setItem('access_token', token);
      if (refreshToken) await AsyncStorage.setItem('refresh_token', refreshToken);
      
      const userResponse = await fetchApi(buildUrl(API_ENDPOINTS.PROFILE.ME));
      if (userResponse.statusCode === 200 && userResponse.data) {
        const user = userResponse.data;
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
        return { accessToken: token, refreshToken, user, expiresIn: 3600, tokenType: 'Bearer' };
      }
    }
    throw new Error(response.message || 'Đăng nhập Facebook thất bại');
  } catch (error) {
    throw error;
  }
}

// ==================== LOGOUT ====================

export async function logout(): Promise<void> {
  try {
    await fetchApi(buildUrl(API_ENDPOINTS.AUTH.LOGOUT), { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await clearAuthData();
  }
}

// ==================== REGISTER ====================

export async function checkContact(contact: string): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.REGISTER.CHECK_CONTACT), {
    method: 'POST',
    body: JSON.stringify({ contact }),
  });
}

export async function resendOTP(contact: string): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.REGISTER.CHECK_CONTACT), {
    method: 'POST',
    body: JSON.stringify({ contact }),
  });
}

export async function verifyOTP(contact: string, otp: string): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.REGISTER.VERIFY_OTP), {
    method: 'POST',
    body: JSON.stringify({ contact, otp }),
  });
}

export async function completeRegistration(data: RegisterData): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.REGISTER.REGISTER), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  await completeRegistration(data);
  return login({ username: data.username, password: data.password });
}

// ==================== FORGOT PASSWORD ====================

export async function sendForgotPasswordOTP(contact: string): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_OTP), {
    method: 'POST',
    body: JSON.stringify({ contact }),
  });
}

export async function verifyForgotPasswordOTP(contact: string, otp: string): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.VERIFY_OTP), {
    method: 'POST',
    body: JSON.stringify({ contact, otp }),
  });
}

export async function resetPassword(data: any): Promise<any> {
  return fetchApi(buildUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESET), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== USER INFO ====================

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetchApi(buildUrl(API_ENDPOINTS.PROFILE.ME));
    return response.statusCode === 200 && response.data ? response.data : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
