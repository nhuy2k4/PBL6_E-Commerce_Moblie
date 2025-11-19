# 🔐 Setup OAuth Credentials

## Trạng Thái Hiện Tại

✅ **Packages đã cài:** expo-auth-session, expo-crypto, expo-web-browser  
✅ **Backend APIs sẵn sàng:** `/api/authenticate/google` & `/api/authenticate/facebook`  
✅ **Frontend code hoàn chỉnh:** Hooks và UI integration đã sẵn sàng  
⚠️ **Cần cấu hình:** Google Client ID và Facebook App ID

---

## 🚀 Cách Setup (Chi Tiết)

### Option 1: Chỉ Test Login Thường (Không cần OAuth)

Nếu bạn chỉ muốn test app mà không cần Google/Facebook login:

- ✅ **Không cần làm gì thêm!**
- ✅ Dùng login thường với username/password
- ✅ App sẽ hiển thị thông báo hướng dẫn khi click vào nút social login

### Option 2: Setup Google Login (15-20 phút)

#### Bước 1: Tạo Google OAuth Client ID

1. Mở https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project hiện có
3. **Bật APIs:**

   - Vào "APIs & Services" → "Library"
   - Tìm và bật "Google+ API" hoặc "Google People API"

4. **Tạo OAuth Credentials:**
   - Vào "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - **Application type:** Web application
   - **Name:** PBL6 E-Commerce Web Client
5. **Authorized redirect URIs:**
   Thêm các URIs sau:

   ```
   https://auth.expo.io/@your-expo-username/PBL6_E-Commerce_Mobile
   http://localhost:8081
   exp://localhost:8081
   pbl6ecommercemobile://
   ```

   > 💡 **Tip:** Nếu dùng Expo Go, dùng username Expo của bạn.  
   > Nếu build standalone, có thể bỏ qua Expo redirect URI.

6. **Lấy Client ID:**
   - Sau khi tạo, copy **Client ID** (dạng: `xxxxx.apps.googleusercontent.com`)

#### Bước 2: Cập nhật Code

Mở file `services/socialAuthService.ts` và sửa:

```typescript
export const GOOGLE_CONFIG = {
  // Thay YOUR_GOOGLE_WEB_CLIENT_ID bằng Client ID vừa copy
  webClientId: "123456789-abc123def456.apps.googleusercontent.com",

  // Optional: Nếu có iOS/Android Client ID riêng
  iosClientId: undefined as string | undefined,
  androidClientId: undefined as string | undefined,
};
```

#### Bước 3: Test

1. Reload app: Shake device → Reload
2. Vào màn hình Login
3. Click nút Google (màu đỏ)
4. Browser sẽ mở → Chọn tài khoản Google
5. Đồng ý permissions
6. App tự động login và redirect về Home!

---

### Option 3: Setup Facebook Login (15-20 phút)

#### Bước 1: Tạo Facebook App

1. Mở https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. **Use case:** Consumer / Other
4. **App name:** PBL6 E-Commerce
5. **App contact email:** Your email

#### Bước 2: Thêm Facebook Login

1. Trong dashboard, click "Add Product"
2. Chọn **"Facebook Login"** → Click Setup
3. **Choose Platform:** Website
4. **Site URL:** `http://localhost:8081`
5. Save

#### Bước 3: Cấu hình Settings

1. **Basic Settings:**

   - Vào "Settings" → "Basic"
   - Copy **App ID** (dạng số: 1234567890123456)

2. **Facebook Login Settings:**
   - Vào "Facebook Login" → "Settings"
   - **Valid OAuth Redirect URIs:**
     ```
     https://auth.expo.io/@your-expo-username/PBL6_E-Commerce_Mobile
     http://localhost:8081
     exp://localhost:8081
     pbl6ecommercemobile://
     ```
   - Save changes

#### Bước 4: Cập nhật Code

Mở file `services/socialAuthService.ts` và sửa:

```typescript
export const FACEBOOK_CONFIG = {
  // Thay YOUR_FACEBOOK_APP_ID bằng App ID vừa copy
  appId: "1234567890123456",
};
```

#### Bước 5: Test

1. Reload app
2. Vào màn hình Login
3. Click nút Facebook (màu xanh)
4. Browser sẽ mở → Login Facebook
5. Đồng ý permissions
6. App tự động login và redirect về Home!

---

## 🔍 Troubleshooting

### ❌ "Invalid OAuth redirect URI"

**Nguyên nhân:** Redirect URI trong config không khớp với URI đã đăng ký.

**Giải pháp:**

1. Check lại redirect URI trong Google/Facebook console
2. Đảm bảo có thêm tất cả các URIs:
   - `https://auth.expo.io/@username/app-slug`
   - `http://localhost:8081`
   - `pbl6ecommercemobile://`

### ❌ "Developer Error" (Google)

**Nguyên nhân:** Client ID không đúng hoặc API chưa được bật.

**Giải pháp:**

1. Check lại Client ID trong `socialAuthService.ts`
2. Bật Google+ API hoặc Google People API
3. Đợi vài phút để Google cập nhật

### ❌ Browser mở nhưng không redirect về app

**Nguyên nhân:** Scheme không được config đúng.

**Giải pháp:**

1. Check `app.json` có `"scheme": "pbl6ecommercemobile"`
2. Rebuild app: `npx expo start --clear`

### ❌ "Login failed" sau khi chọn tài khoản

**Nguyên nhân:** Backend không validate được token.

**Giải pháp:**

1. Check backend đang chạy: http://localhost:8081
2. Check logs trong console để xem error message
3. Kiểm tra backend có đúng Google/Facebook App credentials không

---

## 📝 File Cần Sửa

Chỉ cần sửa **1 file duy nhất:**

```
PBL6_E-Commerce_Mobile/
  services/
    socialAuthService.ts   <-- Sửa GOOGLE_CONFIG và FACEBOOK_CONFIG ở đây
```

Tìm và thay thế:

```typescript
// TÌM DÒNG NÀY:
webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',

// THAY BẰNG:
webClientId: '123456789-abc123def456.apps.googleusercontent.com',

// VÀ:
appId: 'YOUR_FACEBOOK_APP_ID',

// THAY BẰNG:
appId: '1234567890123456',
```

---

## ✅ Checklist

### Google Login

- [ ] Tạo project trên Google Cloud Console
- [ ] Bật Google+ API hoặc Google People API
- [ ] Tạo OAuth 2.0 Client ID (Web application)
- [ ] Thêm redirect URIs
- [ ] Copy Client ID
- [ ] Paste vào `socialAuthService.ts`
- [ ] Test login

### Facebook Login

- [ ] Tạo app trên Facebook Developers
- [ ] Thêm Facebook Login product
- [ ] Copy App ID
- [ ] Cấu hình redirect URIs
- [ ] Paste App ID vào `socialAuthService.ts`
- [ ] Test login

---

## 🎯 Kết Quả

Sau khi setup xong:

- ✅ Click nút Google → Browser mở → Chọn tài khoản → Login thành công
- ✅ Click nút Facebook → Browser mở → Login Facebook → Login thành công
- ✅ Token tự động gửi đến backend để verify
- ✅ User info được lưu vào AsyncStorage
- ✅ Redirect về Home screen

---

## 📚 Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/)
- [Backend API Documentation](../PBL6_E-Commerce/Ecommerce/src/main/api.md)

---

## 💬 Câu Hỏi Thường Gặp

**Q: Có thể bỏ qua social login không?**  
A: Có! App hoạt động hoàn toàn với login thường (username/password). Social login chỉ là tùy chọn bổ sung.

**Q: Có mất phí không?**  
A: Không, cả Google và Facebook OAuth đều miễn phí.

**Q: Có hoạt động trên Expo Go không?**  
A: Có, với Expo AuthSession. Chỉ cần config đúng redirect URI với username Expo của bạn.

**Q: Phải setup cả 2 (Google và Facebook) không?**  
A: Không, có thể setup riêng lẻ. Nếu chỉ config Google thì chỉ nút Google hoạt động, còn Facebook sẽ hiển thị hướng dẫn.

**Q: Token có an toàn không?**  
A: Có! ID Token/Access Token được gửi từ mobile → backend, backend sẽ verify trực tiếp với Google/Facebook để đảm bảo tính hợp lệ.

---

**Happy Coding! 🚀**
