# PBL6 E-Commerce Mobile 🛒

Ứng dụng mobile E-Commerce được xây dựng với React Native và Expo.

## 📱 Công nghệ sử dụng

- **Framework**: React Native với Expo
- **Ngôn ngữ**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## 🚀 Cài đặt và Chạy ứng dụng

### Yêu cầu

- Node.js >= 20.19.4 (khuyến nghị)
- npm hoặc yarn
- Expo Go app (cho testing trên thiết bị thật)

### Các bước cài đặt

1. Clone repository (nếu chưa có):

```bash
git clone <repository-url>
cd PBL6_E-Commerce_Mobile
```

2. Cài đặt dependencies:

```bash
npm install
```

Chạy ngrok để test:

- Tải ngrok
- Mở ngrok.exe
- Chạy lệnh ngrok http https://localhost:8081

3. Cấu hình API endpoint:

- Copy file `.env.example` thành `.env`
- Cập nhật trong `.env` dòng `EXPO_PUBLIC_API_URL` = '{link Forwarding trong ngrok}/api/'

4. Chạy ứng dụng:

**Development mode:**

```bash
npm start
# hoặc
npx expo start
```

Sau đó chọn platform:

- Press **a** - mở Android emulator
- Press **i** - mở iOS simulator (chỉ trên macOS)
- Press **w** - mở web browser
- Scan QR code với Expo Go app để chạy trên thiết bị thật

**Chạy trực tiếp:**

```bash
npm run android   # Android
npm run ios       # iOS (chỉ trên macOS)
npm run web       # Web browser
```

## 📂 Cấu trúc thư mục

```
PBL6_E-Commerce_Mobile/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
├── constants/             # Constants and theme
├── context/              # React Context providers
│   ├── AuthContext.tsx   # Authentication context
│   └── CartContext.tsx   # Shopping cart context
├── hooks/                # Custom React hooks
├── services/             # API services
│   ├── api.ts           # Axios configuration
│   ├── authService.ts   # Authentication API
│   ├── cartService.ts   # Cart API
│   └── productService.ts # Product API
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   └── helpers.ts       # Helper functions
├── assets/              # Images, fonts, etc.
├── .env.example         # Environment variables example
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## 🔧 Services

### Authentication Service (`authService.ts`)

- ✅ Login
- ✅ Register
- ✅ Logout
- ✅ Token management với AsyncStorage
- ✅ Get user info

### Product Service (`productService.ts`)

- ✅ Get all products
- ✅ Get product by ID
- ✅ Get products by category
- ✅ Search products

### Cart Service (`cartService.ts`)

- ✅ Get cart
- ✅ Add to cart
- ✅ Update cart item quantity
- ✅ Remove from cart
- ✅ Clear cart

## 🎨 Features

### ✅ Đã hoàn thành:

- Project setup với Expo & TypeScript
- API services configuration
- Authentication context
- Cart context
- Type definitions
- Utility helpers

### 📋 Planned Features:

- [ ] User authentication screens (Login/Register)
- [ ] Home screen với featured products
- [ ] Browse products by categories
- [ ] Product search và filtering
- [ ] Product details screen
- [ ] Shopping cart screen
- [ ] Checkout process
- [ ] Order history
- [ ] User profile screen
- [ ] Wishlist
- [ ] Product reviews & ratings
- [ ] Push notifications
- [ ] Dark mode support

## 🔐 Environment Variables

Tạo file `.env` trong thư mục root với các biến sau:

```env
API_BASE_URL=http://localhost:8080/api
NODE_ENV=development
```

## 📝 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (macOS only)
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset to blank project

## 🛠️ Development

Project này sử dụng **Expo Router** cho navigation, cho phép file-based routing tương tự Next.js:

- Files trong `app/` folder tự động trở thành routes
- `app/(tabs)/` - Tab navigation layout
- `app/_layout.tsx` - Root layout wrapper
- `app/modal.tsx` - Modal screens


## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📖 Learn More

Tài liệu tham khảo:

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 👥 Team

PBL6 Development Team

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Liên hệ support qua email hoặc tạo issue trên GitHub repository.
