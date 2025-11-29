# Hướng dẫn Fix Lỗi Login Mobile App

## Vấn đề

- Đăng nhập bị lỗi mặc dù đúng tài khoản mật khẩu
- Lỗi: "Login failed. Please check your credentials."

## Nguyên nhân

### 1. Backend chưa chạy

Backend server phải chạy trên port 8081 để mobile app có thể kết nối.

### 2. Sai địa chỉ IP

- **Nếu test trên Android Emulator**: Phải dùng `10.0.2.2` thay vì `localhost`
- **Nếu test trên điện thoại thật (Expo Go)**: Phải dùng IP máy tính (ví dụ: `192.168.1.100`)
- **Nếu test trên iOS Simulator**: Có thể dùng `localhost`

## Giải pháp

### Bước 1: Start Backend Server

Mở terminal mới và chạy:

```powershell
cd D:\PBL6\PBL6_E-Commerce\Ecommerce
mvn spring-boot:run
```

Đợi đến khi thấy:

```
Tomcat started on port 8081 (http) with context path '/'
Started EcommerceApplication in X.XXX seconds
```

### Bước 2: Kiểm tra địa chỉ IP

#### Nếu test trên Android Emulator:

Config đã tự động dùng `10.0.2.2`. Không cần thay đổi gì.

#### Nếu test trên điện thoại thật (Expo Go):

1. Lấy IP máy tính:

   ```powershell
   ipconfig
   ```

   Tìm dòng "IPv4 Address" (ví dụ: 192.168.1.100)

2. Mở file `constants/config.ts`

3. Thay đổi dòng 12:

   ```typescript
   // Thay đổi từ:
   return "http://localhost:8081/api";

   // Thành (thay YOUR_IP bằng IP thực tế):
   return "http://192.168.1.100:8081/api";
   ```

#### Nếu test trên iOS Simulator:

Giữ nguyên `localhost:8081`

### Bước 3: Test Login

1. Mở app mobile (đảm bảo đã reload sau khi đổi config)
2. Nhập username và password
3. Click "Sign In"
4. Kiểm tra console log để debug:
   - Expo terminal sẽ hiển thị log từ `console.log()`
   - Xem status code và response data

### Bước 4: Kiểm tra Log

Nếu vẫn lỗi, check log:

**Mobile console (Expo terminal):**

```
Login attempt: { username: 'your_username' }
Login response status: 200 hoặc 400/401
Login response data: { status: ..., message: ..., data: ... }
```

**Backend console:**

```
Hibernate queries
Any authentication errors
```

## Test Account

Nếu chưa có tài khoản, hãy đăng ký mới qua Register flow:

1. Click "Sign up now"
2. Nhập email → Nhận OTP
3. Nhập OTP → Xác thực
4. Nhập username, password → Đăng ký

## Troubleshooting

### Lỗi: Network request failed

- Backend chưa chạy
- Sai địa chỉ IP
- Firewall chặn kết nối

**Giải pháp:**

- Kiểm tra backend đang chạy: `http://localhost:8081/actuator/health`
- Tắt firewall tạm thời để test
- Đảm bảo điện thoại và máy tính cùng mạng WiFi

### Lỗi: 401 Unauthorized

- Sai username/password
- User chưa được activate

**Giải pháp:**

- Kiểm tra lại username/password
- Đảm bảo đã đăng ký và xác thực OTP thành công

### Lỗi: 400 Bad Request

- Backend trả về lỗi cụ thể

**Giải pháp:**

- Xem chi tiết lỗi trong console log
- Check backend log để biết nguyên nhân

## API Endpoints

### Login

```
POST http://localhost:8081/api/authenticate
Body: { "username": "...", "password": "..." }
Response: {
  "status": 200,
  "data": {
    "token": "...",
    "userInfo": {...}
  }
}
```

### Get Current User

```
GET http://localhost:8081/api/user/me
Headers: { "Authorization": "Bearer <token>" }
Response: {
  "status": 200,
  "data": {
    "id": 1,
    "username": "...",
    "email": "...",
    "role": "BUYER"
  }
}
```

## Notes

- Backend phải chạy trước khi test mobile app
- Sau khi đổi config IP, phải reload app (shake device → Reload)
- Console log sẽ hiển thị chi tiết request/response để debug
- Nếu dùng Expo Go, đảm bảo điện thoại và máy tính cùng mạng WiFi
