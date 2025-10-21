# Hướng dẫn Phát triển PBL6 E-Commerce Mobile

## 🎯 Tổng quan

Project này là ứng dụng mobile cho hệ thống E-Commerce, được xây dựng với React Native và Expo.

## 📋 Checklist Phát triển

### Phase 1: Setup & Authentication ✅

- [x] Khởi tạo project với Expo
- [x] Cấu hình TypeScript
- [x] Tạo API services
- [x] Thiết lập Authentication context
- [x] Thiết lập Cart context

### Phase 2: UI Screens (Đang thực hiện)

- [ ] Login Screen
- [ ] Register Screen
- [ ] Home Screen
- [ ] Product List Screen
- [ ] Product Detail Screen
- [ ] Cart Screen
- [ ] Profile Screen
- [ ] Checkout Screen
- [ ] Order History Screen

### Phase 3: Features

- [ ] Tích hợp API backend
- [ ] Image upload
- [ ] Search & Filter
- [ ] Wishlist
- [ ] Reviews & Ratings
- [ ] Push Notifications
- [ ] Payment Integration

### Phase 4: Testing & Deployment

- [ ] Unit Testing
- [ ] Integration Testing
- [ ] Build APK/IPA
- [ ] Deploy to stores

## 🛠️ Các bước phát triển tiếp theo

### 1. Tạo Login Screen

```typescript
// app/(auth)/login.tsx
import { useAuth } from "@/context/AuthContext";
// Implement login UI
```

### 2. Tạo Home Screen

```typescript
// app/(tabs)/index.tsx
import { productService } from "@/services/productService";
// Fetch và hiển thị products
```

### 3. Kết nối Backend

Cập nhật `services/api.ts`:

```typescript
const API_BASE_URL = "YOUR_BACKEND_URL";
```

## 📦 Packages chính

### Dependencies hiện tại:

- `expo` - Expo framework
- `react-native` - React Native core
- `expo-router` - File-based routing
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage

### Packages nên cài thêm:

```bash
# UI Components
npm install react-native-paper
npm install @react-native-picker/picker

# Form handling
npm install react-hook-form
npm install zod

# Image handling
npm install expo-image-picker

# Navigation helpers
npm install @react-navigation/stack
```

## 🎨 Design Guidelines

### Colors

```typescript
const colors = {
  primary: "#007AFF",
  secondary: "#5AC8FA",
  success: "#34C759",
  warning: "#FF9500",
  danger: "#FF3B30",
  background: "#F2F2F7",
  text: "#000000",
  textSecondary: "#8E8E93",
};
```

### Typography

```typescript
const typography = {
  h1: { fontSize: 34, fontWeight: "bold" },
  h2: { fontSize: 28, fontWeight: "bold" },
  h3: { fontSize: 22, fontWeight: "600" },
  body: { fontSize: 16, fontWeight: "400" },
  caption: { fontSize: 12, fontWeight: "400" },
};
```

## 🔧 API Integration

### Cập nhật API endpoint

File: `services/api.ts`

```typescript
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";
```

### Sử dụng services

```typescript
import { productService } from "@/services/productService";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";

// Example usage
const products = await productService.getAllProducts();
const user = await authService.login(credentials);
await cartService.addToCart(productId, quantity);
```

## 🧪 Testing

### Run tests

```bash
npm test
```

### Test coverage

```bash
npm run test:coverage
```

## 📱 Build & Deploy

### Development Build

```bash
expo build:android
expo build:ios
```

### Production Build

```bash
eas build --platform android
eas build --platform ios
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Metro bundler error**

   ```bash
   npm start -- --reset-cache
   ```

2. **Node modules error**

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Expo cache**
   ```bash
   expo start -c
   ```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://expo.github.io/router/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 👥 Team Workflow

1. **Branch naming**

   - Feature: `feature/feature-name`
   - Bug fix: `bugfix/bug-description`
   - Hotfix: `hotfix/issue-description`

2. **Commit messages**

   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Formatting
   - refactor: Code refactoring
   - test: Testing
   - chore: Maintenance

3. **Pull Request**
   - Tạo PR từ feature branch vào main
   - Request review từ ít nhất 1 member
   - Merge sau khi được approve

## 📝 Notes

- Luôn test trên cả Android và iOS (nếu có macOS)
- Kiểm tra performance trên thiết bị thật
- Follow coding standards và best practices
- Document code khi cần thiết
- Keep dependencies updated

## 🚀 Quick Start Commands

```bash
# Start development
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web

# Lint code
npm run lint

# Clear cache
npm start -- --reset-cache
```
