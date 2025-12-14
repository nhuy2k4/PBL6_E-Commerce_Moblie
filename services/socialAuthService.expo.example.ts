/**
 * Social Authentication Service - Expo AuthSession Implementation
 * 
 * This is a complete implementation using Expo AuthSession
 * Replace the placeholder in socialAuthService.ts with this code after:
 * 1. Running: npx expo install expo-auth-session expo-crypto expo-web-browser
 * 2. Setting up Google and Facebook OAuth credentials
 * 3. Updating the Client IDs below
 */

import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Required for proper OAuth flow
WebBrowser.maybeCompleteAuthSession();

/**
 * CONFIGURATION - REPLACE THESE WITH YOUR CREDENTIALS
 */
export const GOOGLE_CONFIG = {
  // From Google Cloud Console
  expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

export const FACEBOOK_CONFIG = {
  // From Facebook Developers
  appId: 'YOUR_FACEBOOK_APP_ID',
};

/**
 * Google Sign-In Hook
 * Usage in component:
 * 
 * const { request, response, promptAsync } = useGoogleSignIn();
 * 
 * useEffect(() => {
 *   if (response?.type === 'success') {
 *     const { authentication } = response;
 *     handleGoogleToken(authentication.idToken);
 *   }
 * }, [response]);
 */
export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
  });

  return { request, response, promptAsync };
};

/**
 * Facebook Login Hook
 * Usage in component:
 * 
 * const { request, response, promptAsync } = useFacebookLogin();
 * 
 * useEffect(() => {
 *   if (response?.type === 'success') {
 *     const { authentication } = response;
 *     handleFacebookToken(authentication.accessToken);
 *   }
 * }, [response]);
 */
export const useFacebookLogin = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_CONFIG.appId,
    redirectUri: makeRedirectUri({
      scheme: 'pbl6ecommerce', // Must match app.json scheme
      path: 'redirect',
    }),
  });

  return { request, response, promptAsync };
};

/**
 * Helper: Get Google User Info from ID Token
 * Decodes JWT to extract user information
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
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode ID token:', error);
    return null;
  }
};

/**
 * Helper: Get Facebook User Info
 * Fetches user profile from Facebook Graph API
 */
export const getFacebookUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get Facebook user info:', error);
    return null;
  }
};

/**
 * Example Complete Implementation in Login Screen
 * 
 * import { useGoogleSignIn, useFacebookLogin } from '@/services/socialAuthService.expo';
 * 
 * export default function LoginScreen() {
 *   const { loginWithGoogle, loginWithFacebook } = useAuth();
 *   const [isLoading, setIsLoading] = useState(false);
 * 
 *   // Google Sign-In
 *   const { request: googleRequest, response: googleResponse, promptAsync: googlePromptAsync } = useGoogleSignIn();
 * 
 *   useEffect(() => {
 *     if (googleResponse?.type === 'success') {
 *       const { authentication } = googleResponse;
 *       handleGoogleLogin(authentication.idToken);
 *     } else if (googleResponse?.type === 'error') {
 *       Alert.alert('Error', 'Google login failed');
 *     }
 *   }, [googleResponse]);
 * 
 *   const handleGoogleLogin = async (idToken: string) => {
 *     setIsLoading(true);
 *     try {
 *       await loginWithGoogle(idToken);
 *       router.replace('/(tabs)');
 *     } catch (error) {
 *       Alert.alert('Error', error.message);
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 * 
 *   // Facebook Login
 *   const { request: fbRequest, response: fbResponse, promptAsync: fbPromptAsync } = useFacebookLogin();
 * 
 *   useEffect(() => {
 *     if (fbResponse?.type === 'success') {
 *       const { authentication } = fbResponse;
 *       handleFacebookLogin(authentication.accessToken);
 *     } else if (fbResponse?.type === 'error') {
 *       Alert.alert('Error', 'Facebook login failed');
 *     }
 *   }, [fbResponse]);
 * 
 *   const handleFacebookLogin = async (accessToken: string) => {
 *     setIsLoading(true);
 *     try {
 *       await loginWithFacebook(accessToken);
 *       router.replace('/(tabs)');
 *     } catch (error) {
 *       Alert.alert('Error', error.message);
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 * 
 *   return (
 *     <View>
 *       <TouchableOpacity 
 *         onPress={() => googlePromptAsync()}
 *         disabled={!googleRequest || isLoading}
 *       >
 *         <Ionicons name="logo-google" size={24} color="#DB4437" />
 *       </TouchableOpacity>
 * 
 *       <TouchableOpacity 
 *         onPress={() => fbPromptAsync()}
 *         disabled={!fbRequest || isLoading}
 *       >
 *         <Ionicons name="logo-facebook" size={24} color="#fff" />
 *       </TouchableOpacity>
 *     </View>
 *   );
 * }
 */
