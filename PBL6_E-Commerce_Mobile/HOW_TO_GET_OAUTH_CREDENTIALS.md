# 🚀 Hướng Dẫn Lấy OAuth Credentials Thực Tế

## ⚠️ QUAN TRỌNG

Các credentials trong code hiện tại là **PLACEHOLDER** và **KHÔNG hoạt động**.

Để sử dụng đăng nhập Google/Facebook, bạn **BẮT BUỘC** phải:

1. Tạo tài khoản developer (miễn phí)
2. Lấy credentials thực tế
3. Cập nhật vào code

**Lý do:** Google và Facebook yêu cầu mỗi app phải đăng ký riêng để đảm bảo bảo mật.

---

## 🔑 Cách Lấy Google Client ID (5-10 phút)

### Bước 1: Truy cập Google Cloud Console

```
URL: https://console.cloud.google.com/
```

### Bước 2: Tạo Project

1. Click "Select a project" ở top bar
2. Click "NEW PROJECT"
3. Project name: `PBL6-Ecommerce`
4. Click "CREATE"

### Bước 3: Bật APIs

1. Menu → "APIs & Services" → "Library"
2. Tìm "Google+ API" hoặc "Google People API"
3. Click "ENABLE"

### Bước 4: Tạo OAuth Credentials

1. Menu → "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS"
3. Chọn "OAuth 2.0 Client ID"

4. **Configure consent screen** (nếu hỏi):

   - User Type: External
   - App name: PBL6 E-Commerce
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
   - Click SAVE AND CONTINUE → SAVE AND CONTINUE → BACK TO DASHBOARD

5. **Create OAuth client ID:**
   - Application type: **Web application**
   - Name: `PBL6 Web Client`
6. **Authorized redirect URIs** - Thêm TẤT CẢ các URIs sau:

   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/PBL6_E-Commerce_Mobile
   http://localhost:8081
   http://localhost:19006
   exp://localhost:19000
   ```

7. Click "CREATE"

8. **LƯU LẠI Client ID:**
   ```
   Sẽ có dạng: 123456789-abc123def456.apps.googleusercontent.com
   ```

### Bước 5: Cập nhật Code

Mở file: `services/socialAuthService.ts`

Tìm dòng:

```typescript
webClientId: '485428376412-v9vg57p8d7d5h3fo0lk2t6q3g0g1b9m1.apps.googleusercontent.com',
```

Thay bằng Client ID của bạn:

```typescript
webClientId: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
```

### Bước 6: Test

```bash
# Reload app
npx expo start

# Click nút Google login → Browser sẽ mở
```

---

## 🔑 Cách Lấy Facebook App ID (5-10 phút)

### Bước 1: Truy cập Facebook Developers

```
URL: https://developers.facebook.com/
```

### Bước 2: Tạo App

1. Click "My Apps" → "Create App"
2. Use case: **Other**
3. App type: **Consumer**
4. Click "Next"
5. App name: `PBL6 E-Commerce`
6. App contact email: your-email@gmail.com
7. Click "Create app"

### Bước 3: Add Facebook Login

1. Trong Dashboard, tìm "Facebook Login"
2. Click "Set Up"
3. Platform: **Website**
4. Site URL: `http://localhost:8081`
5. Click "Save" → "Continue"

### Bước 4: Configure Settings

1. Sidebar → "Settings" → "Basic"
2. **Copy App ID** (dạng số: 1234567890123456)

3. Sidebar → "Facebook Login" → "Settings"
4. **Valid OAuth Redirect URIs** - Thêm:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/PBL6_E-Commerce_Mobile
   http://localhost:8081
   http://localhost:19006
   ```
5. Click "Save Changes"

### Bước 5: Cập nhật Code

Mở file: `services/socialAuthService.ts`

Tìm dòng:

```typescript
appId: '1234567890123456',
```

Thay bằng App ID của bạn:

```typescript
appId: 'YOUR_FACEBOOK_APP_ID',
```

### Bước 6: Test

```bash
# Reload app
npx expo start

# Click nút Facebook login → Browser sẽ mở
```

---

## 🎯 Checklist Hoàn Thành

### Google

- [ ] Tạo project trên Google Cloud Console
- [ ] Bật Google+ API
- [ ] Tạo OAuth Client ID (Web application)
- [ ] Thêm redirect URIs
- [ ] Copy Client ID
- [ ] Paste vào `socialAuthService.ts` → `GOOGLE_CONFIG.webClientId`
- [ ] Test login

### Facebook

- [ ] Tạo app trên Facebook Developers
- [ ] Add Facebook Login product
- [ ] Configure redirect URIs
- [ ] Copy App ID
- [ ] Paste vào `socialAuthService.ts` → `FACEBOOK_CONFIG.appId`
- [ ] Test login

---

## 📝 File Cần Sửa

**CHỈ CẦN SỬA 1 FILE:**

```
PBL6_E-Commerce_Mobile/
  services/
    socialAuthService.ts  <-- SỬA FILE NÀY
```

**DÒNG CẦN SỬA:**

```typescript
// Dòng ~30
export const GOOGLE_CONFIG = {
  webClientId: "THAY_BẰNG_GOOGLE_CLIENT_ID_CỦA_BẠN.apps.googleusercontent.com",
  // ...
};

// Dòng ~37
export const FACEBOOK_CONFIG = {
  appId: "THAY_BẰNG_FACEBOOK_APP_ID_CỦA_BẠN",
};
```

---

## ❓ FAQ

**Q: Có mất phí không?**
A: KHÔNG! Hoàn toàn miễn phí cho cả Google và Facebook.

**Q: Tôi có thể skip social login không?**
A: CÓ! App hoạt động hoàn toàn với username/password login. Social login chỉ là tùy chọn.

**Q: Làm sao biết đã đúng?**
A: Khi click nút Google/Facebook, browser sẽ mở ra trang đăng nhập thực của Google/Facebook.

**Q: Placeholder credentials có hoạt động không?**
A: KHÔNG! Bạn PHẢI lấy credentials thực từ Google/Facebook.

**Q: Mất bao lâu?**
A: Khoảng 5-10 phút cho mỗi platform (Google hoặc Facebook).

**Q: Có cần credit card không?**
A: KHÔNG! Chỉ cần email là đủ.

---

## 🆘 Gặp Vấn Đề?

### Error: "Invalid OAuth redirect URI"

- ✅ Check lại redirect URIs trong console
- ✅ Đảm bảo có thêm cả localhost và expo URIs

### Error: "Invalid Client ID"

- ✅ Check lại Client ID đã copy đúng chưa
- ✅ Đảm bảo không có khoảng trắng thừa

### Browser mở nhưng không redirect về

- ✅ Check `app.json` có `"scheme": "pbl6ecommercemobile"`
- ✅ Reload app: `npx expo start --clear`

---

## 🎉 Sau Khi Setup Xong

App sẽ có:

- ✅ Login bằng username/password (đã hoạt động)
- ✅ Login bằng Google (sau khi setup)
- ✅ Login bằng Facebook (sau khi setup)
- ✅ Register với OTP (đã hoạt động)

---

## 🔗 Links Quan Trọng

- **Google Cloud Console:** https://console.cloud.google.com/
- **Facebook Developers:** https://developers.facebook.com/
- **Expo Docs:** https://docs.expo.dev/guides/authentication/

---

**LƯU Ý:** Credentials trong code hiện tại CHỈ LÀ PLACEHOLDER. Bạn PHẢI thay bằng credentials thật của mình!
