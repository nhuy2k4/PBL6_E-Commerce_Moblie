# Hướng Dẫn Nhanh: Setup Google & Facebook Login

## ⚠️ QUAN TRỌNG

Hiện tại chức năng đăng nhập bằng Google và Facebook **CHƯA được cấu hình**. Bạn cần làm theo các bước sau để kích hoạt.

---

## 🚀 Setup Nhanh (Chọn 1 trong 2 cách)

### Cách 1: Sử dụng Expo AuthSession (Đơn giản, không cần rebuild)

#### Bước 1: Cài đặt packages

```bash
cd PBL6_E-Commerce_Mobile
npx expo install expo-auth-session expo-crypto expo-web-browser
```

#### Bước 2: Tạo Google OAuth Credentials

1. Vào https://console.cloud.google.com/
2. Tạo project mới: "PBL6 E-Commerce"
3. Bật API: **Google+ API** hoặc **Google People API**
4. Credentials → Create Credentials → OAuth 2.0 Client ID
5. Chọn **Web application**
6. Authorized redirect URIs: `https://auth.expo.io/@your-username/pbl6ecommerce`
7. Copy **Client ID** (dạng: xxx.apps.googleusercontent.com)

#### Bước 3: Tạo Facebook App

1. Vào https://developers.facebook.com/
2. My Apps → Create App → Consumer
3. Tên app: "PBL6 E-Commerce"
4. Add Product: **Facebook Login**
5. Settings → Basic → Copy **App ID**
6. Facebook Login Settings → Valid OAuth Redirect URIs: `https://auth.expo.io/@your-username/pbl6ecommerce`

#### Bước 4: Cập nhật code

**A. Sửa `services/socialAuthService.ts`:**

Thay thế toàn bộ nội dung bằng:

```typescript
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// ========== THAY ĐỔI CÁC GIÁ TRỊ NÀY ==========
export const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
export const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID";
// ===============================================

export interface SocialAuthResult {
  idToken?: string;
  accessToken?: string;
}

export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
  });
  return { request, response, promptAsync };
};

export const useFacebookLogin = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
  });
  return { request, response, promptAsync };
};
```

**B. Sửa `app/auth/login.tsx`:**

Thêm import và hooks:

```typescript
import { useGoogleSignIn, useFacebookLogin } from '@/services/socialAuthService';
import { useEffect } from 'react';

// Trong component:
export default function LoginScreen() {
  const { loginWithGoogle, loginWithFacebook } = useAuth();

  // Google
  const { response: googleResponse, promptAsync: googlePromptAsync } = useGoogleSignIn();

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      loginWithGoogle(authentication.idToken);
      router.replace('/(tabs)');
    }
  }, [googleResponse]);

  // Facebook
  const { response: fbResponse, promptAsync: fbPromptAsync } = useFacebookLogin();

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      loginWithFacebook(authentication.accessToken);
      router.replace('/(tabs)');
    }
  }, [fbResponse]);

  // Buttons:
  <TouchableOpacity onPress={() => googlePromptAsync()}>
    <Ionicons name="logo-google" size={24} color="#DB4437" />
  </TouchableOpacity>

  <TouchableOpacity onPress={() => fbPromptAsync()}>
    <Ionicons name="logo-facebook" size={24} color="#fff" />
  </TouchableOpacity>
}
```

#### Bước 5: Test

```bash
npx expo start
```

---

### Cách 2: Sử dụng Native Modules (Hiệu suất tốt hơn, cần rebuild)

#### Bước 1: Cài đặt

```bash
npx expo install @react-native-google-signin/google-signin
npx expo install react-native-fbsdk-next
```

#### Bước 2: Cấu hình `app.json`

```json
{
  "expo": {
    "plugins": [
      "@react-native-google-signin/google-signin",
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_CLIENT_TOKEN",
          "displayName": "PBL6 E-Commerce"
        }
      ]
    ]
  }
}
```

#### Bước 3: Prebuild & Run

```bash
npx expo prebuild
npx expo run:android
# hoặc
npx expo run:ios
```

---

## 📝 Checklist Setup

- [ ] Cài đặt packages cần thiết
- [ ] Tạo Google OAuth Client ID
- [ ] Tạo Facebook App ID
- [ ] Copy Client ID vào code
- [ ] Test Google login
- [ ] Test Facebook login

---

## ❓ Câu Hỏi Thường Gặp

**Q: Tôi có thể bỏ qua social login không?**
A: Có, chỉ cần dùng login thường (username/password). Social login là tính năng bổ sung.

**Q: Tại sao cần tạo OAuth credentials?**
A: Để Google/Facebook xác thực app của bạn và cho phép người dùng đăng nhập an toàn.

**Q: Có mất phí không?**
A: Không, Google và Facebook OAuth hoàn toàn miễn phí.

**Q: OAuth có hoạt động trên Expo Go không?**
A: Có với Expo AuthSession. Native modules cần build riêng.

**Q: Làm sao biết setup đã đúng?**
A: Khi nhấn nút Google/Facebook, browser sẽ mở và cho phép đăng nhập.

---

## 🔗 Links Hữu Ích

- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/)

---

## ⚡ Tóm Tắt Nhanh

1. Cài package: `npx expo install expo-auth-session expo-crypto expo-web-browser`
2. Tạo Google Client ID tại console.cloud.google.com
3. Tạo Facebook App ID tại developers.facebook.com
4. Sửa `socialAuthService.ts` với credentials của bạn
5. Reload app và test!

**Nếu bạn không muốn setup ngay:** Chỉ cần dùng login thường, skip phần social login.
