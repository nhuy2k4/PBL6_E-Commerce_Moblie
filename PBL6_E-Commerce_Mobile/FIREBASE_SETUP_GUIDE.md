# Firebase Cloud Messaging Setup Guide

## Bước 1: Tạo Firebase Project

1. Truy cập https://console.firebase.google.com/
2. Click **Add project** hoặc chọn project có sẵn
3. Đặt tên project (ví dụ: `PBL6-ECommerce`)
4. Tắt Google Analytics nếu không cần → **Create project**

## Bước 2: Thêm Android App vào Firebase

1. Trong Firebase Console, click biểu tượng **Android**
2. Điền thông tin:
   - **Android package name**: `com.pbl6.ecommercemobile` (phải trùng với `package` trong `app.json`)
   - **App nickname**: `PBL6 Mobile`
   - **Debug signing certificate SHA-1**: (Bỏ qua nếu chưa cần)
3. Click **Register app**

## Bước 3: Download google-services.json

1. Firebase sẽ cho download file `google-services.json`
2. **Lưu file này vào**: `D:\PBL6\PBL6_E-Commerce_Mobile\google-services.json`
3. Click **Next** → **Next** → **Continue to console**

## Bước 4: Lấy Server Key (cho Backend)

1. Trong Firebase Console → **Project Settings** (bánh răng bên trái)
2. Tab **Cloud Messaging**
3. Tìm **Server key** hoặc **Cloud Messaging API (Legacy)**
4. **Copy Server Key** này → sẽ dùng trong Backend Java

## Bước 5: Enable Cloud Messaging API

1. Vào https://console.cloud.google.com/
2. Chọn project Firebase vừa tạo
3. Search "Cloud Messaging API" → Enable nó

## Bước 6: Cấu hình trong app.json

File `google-services.json` đã được thêm vào config trong `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "plugins": ["@react-native-firebase/app"]
  }
}
```

## Bước 7: Rebuild app

```bash
npx expo prebuild
npx expo run:android
```

## Checklist

- [ ] Đã tạo Firebase project
- [ ] Đã thêm Android app với package name: `com.pbl6.ecommercemobile`
- [ ] Đã download `google-services.json` và đặt vào thư mục gốc
- [ ] Đã copy **Server Key** để dùng cho backend
- [ ] Đã enable Cloud Messaging API
- [ ] Đã cấu hình `app.json`
- [ ] Đã rebuild app bằng `npx expo run:android`

## Lưu ý

- **Server Key** sẽ được dùng trong backend Spring Boot để gửi push notification
- File `google-services.json` chứa config của Firebase cho app Android
- Phải rebuild app mỗi khi thay đổi Firebase config
