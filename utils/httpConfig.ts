/**
 * HTTP Configuration for Development
 * Handle SSL certificate issues in development mode
 */
import { Platform } from 'react-native';

declare global {
  var __DEV__: boolean;
}

export const configureHTTP = () => {
  if (__DEV__ && Platform.OS === 'android') {
    // For Android development - disable SSL verification
    // Note: This is only for development, never use in production
    
    // Override global fetch to accept self-signed certificates
    const originalFetch = global.fetch;
    global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      // Add rejectUnauthorized: false for development
      const modifiedInit = {
        ...init,
        // @ts-ignore - React Native specific
        rejectUnauthorized: false,
      };
      
      return originalFetch(input, modifiedInit);
    };
  }
};

// Call this in App.js or index.js
export default configureHTTP;