# Social Login Implementation Guide (Google & Facebook)

## Overview

This guide explains how to implement Google and Facebook OAuth authentication in the mobile app.

## Current Status

✅ Backend APIs ready:

- `POST /api/authenticate/google` - Accepts Google ID Token
- `POST /api/authenticate/facebook` - Accepts Facebook Access Token

✅ Frontend structure ready:

- `services/authService.ts` - API integration functions
- `services/socialAuthService.ts` - OAuth flow placeholders
- `context/AuthContext.tsx` - State management
- `app/auth/login.tsx` - Login UI with social buttons

⚠️ **OAuth Configuration Required** - Need to set up Google and Facebook developer accounts

---

## Option 1: Using Expo AuthSession (Recommended for Expo)

### Advantages

- No native modules needed
- Works with Expo Go
- Easier setup
- Cross-platform

### Setup Steps

#### 1. Install Dependencies

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

#### 2. Configure app.json

Add to your `app.json`:

```json
{
  "expo": {
    "scheme": "pbl6ecommerce",
    "android": {
      "package": "com.yourcompany.pbl6ecommerce"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.pbl6ecommerce"
    }
  }
}
```

#### 3. Google OAuth Setup

**A. Create Google OAuth Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → Create Credentials → OAuth 2.0 Client ID
5. Create **Web application** type (for Expo)
6. Add authorized redirect URI:
   ```
   https://auth.expo.io/@your-expo-username/pbl6ecommerce
   ```
7. Get your **Client ID**

**B. Implement Google Sign-In:**

Update `services/socialAuthService.ts`:

```typescript
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com", // Optional
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com", // Optional
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  });

  return { request, response, promptAsync };
};

export const signInWithGoogle = async (): Promise<SocialAuthResult> => {
  // Implementation will use promptAsync from the hook
  // See example below
};
```

**C. Update Login Screen:**

```typescript
import * as Google from "expo-auth-session/providers/google";

export default function LoginScreen() {
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      expoClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    });

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { authentication } = googleResponse;
      handleGoogleLogin(authentication.idToken);
    }
  }, [googleResponse]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      await loginWithGoogle(idToken);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableOpacity onPress={() => googlePromptAsync()}>
      <Ionicons name="logo-google" size={24} color="#DB4437" />
    </TouchableOpacity>
  );
}
```

#### 4. Facebook Login Setup

**A. Create Facebook App:**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add **Facebook Login** product
4. Go to Settings → Basic
5. Get your **App ID**
6. Add platform: Website with URL `https://auth.expo.io`

**B. Implement Facebook Login:**

Update `services/socialAuthService.ts`:

```typescript
import * as Facebook from "expo-auth-session/providers/facebook";

export const useFacebookAuth = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: "YOUR_FACEBOOK_APP_ID",
  });

  return { request, response, promptAsync };
};
```

**C. Update Login Screen:**

```typescript
import * as Facebook from "expo-auth-session/providers/facebook";

export default function LoginScreen() {
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: "YOUR_FACEBOOK_APP_ID",
  });

  useEffect(() => {
    if (fbResponse?.type === "success") {
      const { authentication } = fbResponse;
      handleFacebookLogin(authentication.accessToken);
    }
  }, [fbResponse]);

  const handleFacebookLogin = async (accessToken: string) => {
    try {
      await loginWithFacebook(accessToken);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableOpacity onPress={() => fbPromptAsync()}>
      <Ionicons name="logo-facebook" size={24} color="#fff" />
    </TouchableOpacity>
  );
}
```

---

## Option 2: Using Native Modules (Better Performance)

### For Google Sign-In

#### 1. Install Native Module

```bash
npx expo install @react-native-google-signin/google-signin
```

#### 2. Configure

```typescript
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  offlineAccess: true,
});

export const signInWithGoogle = async (): Promise<SocialAuthResult> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    return {
      idToken: tokens.idToken,
      user: {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        photo: userInfo.user.photo,
      },
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};
```

### For Facebook Login

#### 1. Install Native Module

```bash
npx expo install react-native-fbsdk-next
```

#### 2. Configure app.json

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_FACEBOOK_CLIENT_TOKEN",
          "displayName": "PBL6 E-Commerce",
          "scheme": "fb YOUR_FACEBOOK_APP_ID",
          "advertiserIDCollectionEnabled": false,
          "autoLogAppEventsEnabled": false,
          "isAutoInitEnabled": true
        }
      ]
    ]
  }
}
```

#### 3. Implement

```typescript
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

export const signInWithFacebook = async (): Promise<SocialAuthResult> => {
  try {
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      throw new Error("User cancelled Facebook login");
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw new Error("Failed to get Facebook access token");
    }

    return {
      accessToken: data.accessToken,
    };
  } catch (error) {
    console.error("Facebook Login Error:", error);
    throw error;
  }
};
```

#### 4. Rebuild

```bash
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

---

## Testing

### Test Google Login

1. Click Google button
2. Browser opens with Google login
3. Select account
4. App redirects back with ID Token
5. Backend validates token and returns JWT
6. User is logged in

### Test Facebook Login

1. Click Facebook button
2. Browser opens with Facebook login
3. Authorize app
4. App redirects back with Access Token
5. Backend validates token and returns JWT
6. User is logged in

---

## Backend API Format

### Google Login Request

```json
POST /api/authenticate/google
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY..."
}
```

### Facebook Login Request

```json
POST /api/authenticate/facebook
{
  "accessToken": "EAABw..."
}
```

### Response (Both)

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "7af798d1-6994-4ba5-9e9f-cb66aad5f5d4",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": 10,
      "email": "user@gmail.com",
      "username": "user123",
      "role": "BUYER"
    }
  }
}
```

---

## Security Notes

1. **Never commit credentials** - Add to `.env` or secure storage
2. **Use HTTPS** in production
3. **Validate tokens on backend** - Backend already does this
4. **Short-lived tokens** - Backend uses JWT expiration
5. **Refresh tokens** - Backend provides refresh token

---

## Troubleshooting

### Google Login Issues

- ❌ "Developer Error" - Check Client ID matches
- ❌ "Redirect URI mismatch" - Add correct URI in Google Console
- ❌ "Invalid ID Token" - Check token not expired, valid format

### Facebook Login Issues

- ❌ "App not setup" - Check App ID in Facebook Developer
- ❌ "Invalid OAuth redirect" - Add redirect URI in Facebook Login settings
- ❌ "Access Token invalid" - Check token not expired

### Common Issues

- ❌ "Network error" - Check backend is running on correct port
- ❌ "CORS error" - Backend already configured, check if running
- ❌ "Module not found" - Run `npm install` again

---

## Next Steps

1. **Choose implementation option** (Expo AuthSession or Native Modules)
2. **Set up Google OAuth** credentials
3. **Set up Facebook App** credentials
4. **Update `socialAuthService.ts`** with real implementation
5. **Test on physical device** (OAuth may not work in simulator)
6. **Add error handling** for edge cases
7. **Add loading states** during OAuth flow

---

## Resources

- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/)
- [Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)
- [Facebook Login Guide](https://docs.expo.dev/guides/facebook-authentication/)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [React Native FBSDK Next](https://github.com/thebergamo/react-native-fbsdk-next)
