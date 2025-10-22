/**
 * Social Authentication Service
 * Implements Google and Facebook OAuth flows using Expo AuthSession
 * 
 * ✅ Packages installed: expo-auth-session, expo-crypto, expo-web-browser
 * ✅ Backend APIs ready: /api/authenticate/google & /api/authenticate/facebook
 */

import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Required for proper OAuth flow
WebBrowser.maybeCompleteAuthSession();

/**
 * CONFIGURATION
 * 
 * ✅ Google credentials synced from backend (application.properties)
 * ⚠️ Facebook needs configuration
 */
export const GOOGLE_CONFIG = {
  // ✅ FROM BACKEND: google.clientId in application.properties
  webClientId: '675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com',
  androidClientId: '675831796221-drm1ihkc84pkl1596agslscqs9ngce9f.apps.googleusercontent.com',
  iosClientId: undefined as string | undefined,
};

export const FACEBOOK_CONFIG = {
  // TODO: Get from: https://developers.facebook.com/apps
  // See HOW_TO_GET_OAUTH_CREDENTIALS.md for setup guide
  appId: 'YOUR_FACEBOOK_APP_ID',
};

/**
 * Check if Google OAuth is configured
 */
export const isGoogleConfigured = (): boolean => {
  return GOOGLE_CONFIG.webClientId !== 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';
};

/**
 * Check if Facebook OAuth is configured
 */
export const isFacebookConfigured = (): boolean => {
  return FACEBOOK_CONFIG.appId !== 'YOUR_FACEBOOK_APP_ID';
};

/**
 * Google Sign-In Hook
 * 
 * Usage in component:
 * ```typescript
 * const { request, response, promptAsync } = useGoogleSignIn();
 * 
 * useEffect(() => {
 *   if (response?.type === 'success') {
 *     const { authentication } = response;
 *     handleGoogleToken(authentication.idToken);
 *   }
 * }, [response]);
 * 
 * <Button onPress={() => promptAsync()} />
 * ```
 */
export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    scopes: ['profile', 'email'],
  });

  console.log('🔧 Google OAuth Config:', {
    webClientId: GOOGLE_CONFIG.webClientId,
    hasRequest: !!request,
  });

  return { request, response, promptAsync };
};

/**
 * Facebook Login Hook
 * 
 * Usage in component:
 * ```typescript
 * const { request, response, promptAsync } = useFacebookLogin();
 * 
 * useEffect(() => {
 *   if (response?.type === 'success') {
 *     const { authentication } = response;
 *     handleFacebookToken(authentication.accessToken);
 *   }
 * }, [response]);
 * 
 * <Button onPress={() => promptAsync()} />
 * ```
 */
export const useFacebookLogin = () => {
  const redirectUri = makeRedirectUri({
    scheme: 'pbl6ecommercemobile',
  });

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_CONFIG.appId,
    redirectUri,
  });

  return { request, response, promptAsync };
};

/**
 * Helper: Decode Google ID Token to get user info
 * (For debugging/display purposes only - backend validates the token)
 */
export const decodeGoogleIdToken = (idToken: string) => {
  try {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      sub: decoded.sub, // Google user ID
    };
  } catch (error) {
    console.error('Failed to decode ID token:', error);
    return null;
  }
};

/**
 * Helper: Fetch Facebook user profile
 * (For debugging/display purposes only - backend validates the token)
 */
export const getFacebookUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture?.data?.url,
    };
  } catch (error) {
    console.error('Failed to fetch Facebook user info:', error);
    return null;
  }
};
