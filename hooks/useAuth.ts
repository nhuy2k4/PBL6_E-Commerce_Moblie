// Shared hook for authentication state management
import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface UseAuthStorageOptions {
  tokenKey?: string;
  refreshTokenKey?: string;
  onTokenChange?: (token: string | null) => void;
}

interface UseAuthStorageReturn {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string, refresh?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/**
 * Hook for managing authentication storage
 * Platform-specific implementation required (localStorage for web, AsyncStorage for mobile)
 * @param options - Configuration options
 * @returns Auth storage state and operations
 */
export function useAuthStorage(options: UseAuthStorageOptions = {}): UseAuthStorageReturn {
  const { tokenKey = 'token', refreshTokenKey = 'refreshToken', onTokenChange } = options;
  
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const setToken = useCallback(async (newToken: string, newRefreshToken?: string) => {
    setTokenState(newToken);
    if (newRefreshToken) {
      setRefreshTokenState(newRefreshToken);
    }
    if (onTokenChange) {
      onTokenChange(newToken);
    }
  }, [onTokenChange]);

  const clearAuth = useCallback(async () => {
    setTokenState(null);
    setRefreshTokenState(null);
    setUser(null);
    if (onTokenChange) {
      onTokenChange(null);
    }
  }, [onTokenChange]);

  return {
    token,
    refreshToken,
    user,
    isAuthenticated: !!token && !!user,
    setToken,
    clearAuth,
    setUser,
  };
}
