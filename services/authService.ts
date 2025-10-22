import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/config';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  contact: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials) => {
    try {
      console.log('=== LOGIN DEBUG ===');
      console.log('Login attempt:', { username: credentials.username });
      console.log('API URL:', `${API_CONFIG.BASE_URL}/authenticate`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);
      
      const rawText = await response.text();
      console.log('Raw response text:', rawText);
      
      let data;
      try {
        data = JSON.parse(rawText);
        console.log('Parsed response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid JSON: ' + rawText.substring(0, 100));
      }

      if (!response.ok || data.status !== 200) {
        const errorMsg = data.error || data.message || 'Login failed';
        console.error('Login failed with error:', errorMsg);
        throw new Error(errorMsg);
      }

      // Backend returns: { status: 200, data: { accessToken, refreshToken, expiresIn, tokenType, user } }
      const tokenData = data.data;
      
      console.log('Token data:', tokenData);
      
      if (!tokenData) {
        console.error('No data field in response');
        throw new Error('Invalid response structure - missing data field');
      }
      
      // Backend uses "accessToken" not "token"
      const token = tokenData.accessToken || tokenData.token;
      // Backend uses "user" not "userInfo"
      const user = tokenData.user || tokenData.userInfo;
      
      if (!token) {
        console.error('No token in data:', Object.keys(tokenData));
        throw new Error('Token not found in response');
      }
      
      if (!user) {
        console.error('No user in data:', Object.keys(tokenData));
        throw new Error('User info not found in response');
      }

      console.log('✓ Received token (first 20 chars):', token.substring(0, 20) + '...');
      console.log('✓ Received user:', user);

      // Store token and user info
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('✓ Login successful!');
      console.log('=== END LOGIN DEBUG ===');
      
      return { token, user };
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('=== END LOGIN ERROR ===');
      throw error;
    }
  },

  // Check contact (Step 1: Send OTP)
  checkContact: async (contact: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/check-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contact }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 200) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  },

  // Verify OTP (Step 2)
  verifyOtp: async (contact: string, otp: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contact, otp }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 200) {
      throw new Error(data.error || 'OTP verification failed');
    }

    return data;
  },

  // Register (Step 3: Create account)
  register: async (data: RegisterData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || result.status !== 200) {
      throw new Error(result.error || 'Registration failed');
    }

    return result;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  getUser: async (): Promise<User | null> => {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Login with Google
  loginWithGoogle: async (idToken: string) => {
    try {
      console.log('=== GOOGLE LOGIN DEBUG ===');
      console.log('Google ID Token (first 20 chars):', idToken.substring(0, 20) + '...');
      console.log('API URL:', `${API_CONFIG.BASE_URL}/authenticate/google`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/authenticate/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      console.log('Google login response status:', response.status);
      
      const data = await response.json();
      console.log('Google login response:', JSON.stringify(data, null, 2));

      if (!response.ok || data.status !== 200) {
        const errorMsg = data.error || data.message || 'Google login failed';
        console.error('Google login failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const tokenData = data.data;
      const token = tokenData.accessToken || tokenData.token;
      const user = tokenData.user || tokenData.userInfo;
      
      if (!token || !user) {
        throw new Error('Invalid response from Google login');
      }

      // Store token and user info
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('✓ Google login successful!');
      console.log('=== END GOOGLE LOGIN DEBUG ===');
      
      return { token, user };
    } catch (error: any) {
      console.error('=== GOOGLE LOGIN ERROR ===');
      console.error('Error:', error.message);
      console.error('=== END GOOGLE LOGIN ERROR ===');
      throw error;
    }
  },

  // Login with Facebook
  loginWithFacebook: async (accessToken: string) => {
    try {
      console.log('=== FACEBOOK LOGIN DEBUG ===');
      console.log('Facebook Access Token (first 20 chars):', accessToken.substring(0, 20) + '...');
      console.log('API URL:', `${API_CONFIG.BASE_URL}/authenticate/facebook`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/authenticate/facebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      console.log('Facebook login response status:', response.status);
      
      const data = await response.json();
      console.log('Facebook login response:', JSON.stringify(data, null, 2));

      if (!response.ok || data.status !== 200) {
        const errorMsg = data.error || data.message || 'Facebook login failed';
        console.error('Facebook login failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const tokenData = data.data;
      const token = tokenData.accessToken || tokenData.token;
      const user = tokenData.user || tokenData.userInfo;
      
      if (!token || !user) {
        throw new Error('Invalid response from Facebook login');
      }

      // Store token and user info
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('✓ Facebook login successful!');
      console.log('=== END FACEBOOK LOGIN DEBUG ===');
      
      return { token, user };
    } catch (error: any) {
      console.error('=== FACEBOOK LOGIN ERROR ===');
      console.error('Error:', error.message);
      console.error('=== END FACEBOOK LOGIN ERROR ===');
      throw error;
    }
  },
};
