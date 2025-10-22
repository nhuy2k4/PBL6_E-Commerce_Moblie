import { Platform } from 'react-native';

// Determine the API base URL based on platform
const getBaseUrl = () => {
  // For Android Emulator, use 10.0.2.2 to access localhost on host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081/api';
  }
  
  // For iOS Simulator or web, localhost works fine
  // For physical device, replace with your computer's IP address
  // Example: return 'http://192.168.1.100:8081/api';
  return 'http://localhost:8081/api';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'PBL6 E-Commerce',
  VERSION: '1.0.0',
};
