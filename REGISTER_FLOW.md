# Register Flow - Mobile App

## Backend API Endpoints

### 1. Check Contact & Send OTP

**POST** `/api/register/check-contact`

**Request:**

```json
{
  "contact": "email@example.com" // or phone number
}
```

**Response:**

```json
{
  "status": 200,
  "error": null,
  "message": "Thành công",
  "data": "OTP đã được gửi"
}
```

### 2. Verify OTP

**POST** `/api/register/verify-otp`

**Request:**

```json
{
  "contact": "email@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "status": 200,
  "error": null,
  "message": "Thành công",
  "data": "Xác thực thành công"
}
```

### 3. Register Account

**POST** `/api/register/register`

**Request (RegisterDTO):**

```json
{
  "contact": "email@example.com",
  "username": "johndoe",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**

```json
{
  "status": 200,
  "error": null,
  "message": "Thành công",
  "data": "Đăng ký thành công"
}
```

## Mobile Implementation

### File Structure

```
app/auth/register.tsx          # Main register screen with 3 steps
services/authService.ts        # API calls for registration
```

### Register Steps

1. **Step 1: Contact Input**

   - User enters email or phone number
   - Call `authService.checkContact(contact)`
   - OTP is sent to the contact

2. **Step 2: OTP Verification**

   - User enters the received OTP code
   - Call `authService.verifyOtp(contact, otp)`
   - OTP is verified in backend

3. **Step 3: Account Information**
   - User enters username, password, confirmPassword
   - Call `authService.register({ contact, username, password, confirmPassword })`
   - Account is created successfully

### Usage Example

```typescript
// From login screen, navigate to register
router.push("/auth/register");

// From Me screen (when not logged in)
router.push("/auth/register");
```

## Validation Rules

- **Contact**: Required, must be valid email or phone number
- **OTP**: Required, 6 digits
- **Username**: Required, 1-50 characters
- **Password**: Required, minimum 4 characters
- **Confirm Password**: Must match password

## Error Handling

All API calls return standardized error format:

```json
{
  "status": 400,
  "error": "Error message here",
  "message": "Thất bại",
  "data": null
}
```

Mobile app displays errors using `Alert.alert()`.
