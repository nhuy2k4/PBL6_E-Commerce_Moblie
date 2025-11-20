// Shared configuration constants
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081/api/',
  TIMEOUT: 30000,
};

// API Endpoints (synced from Web)
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: 'authenticate',
    LOGIN_GOOGLE: 'authenticate/google',
    LOGIN_FACEBOOK: 'authenticate/facebook',
    REFRESH_TOKEN: 'refresh-token',
    LOGOUT: 'logout',
    
    // Register
    REGISTER: {
      CHECK_CONTACT: 'register/check-contact',
      VERIFY_OTP: 'register/verify-otp',
      REGISTER: 'register/register',
    },
    
    // Forgot Password
    FORGOT_PASSWORD: {
      SEND_OTP: 'forgot-password/send-otp',
      VERIFY_OTP: 'forgot-password/verify-otp',
      RESET: 'forgot-password/reset',
    },
  },
  
  // User Profile
  PROFILE: {
    ME: 'user/me',
    GET: 'user/profile',
    UPDATE: 'user/profile',
    CHANGE_PASSWORD: 'user/change-password',
    CHANGE_EMAIL: 'user/change-email',
    VERIFY_EMAIL_CHANGE: 'user/verify-email-change',
  },
  
  // Cart
  CART: {
    GET: 'cart',
    ADD_ITEM: 'cart/items',
    UPDATE_ITEM: (itemId: number) => `cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: number) => `cart/items/${itemId}`,
    CLEAR: 'cart',
  },
  
  // Product
  PRODUCT: {
    GET_ALL: 'products',
    GET_BY_ID: (id: number) => `products/${id}`,
    SEARCH: 'products/search',
    BY_CATEGORY: (categoryId: number) => `products/category/${categoryId}`,
  },
  
  // Category
  CATEGORY: {
    GET_ALL: 'categories',
    GET_BY_ID: (id: number) => `categories/${id}`,
  },
  
  // Order
  ORDER: {
    CREATE: 'orders',
    GET_LIST: 'orders',
    GET_BY_ID: (orderId: number) => `orders/${orderId}`,
    CANCEL: (orderId: number) => `orders/${orderId}/cancel`,
  },
  
  // Checkout with GHN
  CHECKOUT: {
    AVAILABLE_SERVICES: 'checkout/available-services',
    CALCULATE_FEE: 'checkout/calculate-fee',
    CONFIRM: 'checkout/confirm',
  },
  
  // Payment
  PAYMENT: {
    MOMO_CREATE: 'payment/momo/create',
    MOMO_VERIFY: 'payment/momo/verify',
    WALLET_WITHDRAW: 'wallet/withdraw',
  },
  
  // Security
  SECURITY: {
    LOGIN_HISTORY: 'user/login-history',
    ACTIVE_SESSIONS: 'user/active-sessions',
    REVOKE_SESSION: 'user/revoke-session',
  },
};

export const APP_CONFIG = {
  APP_NAME: 'SportZone E-Commerce',
  VERSION: '1.0.0',
};

// OAuth Configuration (shared between web and mobile)
export const GOOGLE_CONFIG = {
  WEB_CLIENT_ID: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
};

export const FACEBOOK_CONFIG = {
  APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID || process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Request Timeout
export const REQUEST_TIMEOUT = 30000;
