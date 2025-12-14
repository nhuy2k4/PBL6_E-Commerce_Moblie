# Mobile App Structure

React Native (Expo) e-commerce mobile application.

## Folder Structure

```
mobile/
├── app/                    # 📱 Expo Router (Routes & Screens)
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── cart.tsx       # Cart screen
│   │   ├── me.tsx         # Profile screen
│   │   └── notification.tsx
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── customer/          # Customer screens
│       ├── product-detail.tsx
│       ├── checkout.tsx
│       └── wishlist.tsx
│
├── components/            # 🧩 Reusable Components
│   ├── common/           # Common components (Message, ProductList)
│   ├── feature/          # Feature-specific components
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── product/
│   │   └── profile/
│   ├── form/             # Form components (SendOtpForm, VerifyOTP)
│   ├── home/             # Home screen sections
│   ├── layout/           # Layout components (Footer)
│   └── ui/               # UI components (icons)
│
├── context/              # ⚙️ React Context
│   ├── AuthContext.tsx   # Authentication state
│   └── CartContext.tsx   # Shopping cart state
│
├── constants/            # 📋 Constants
│   └── config.ts         # App configuration
│
├── styles/               # 🎨 Styles & Theme
│   ├── global.ts         # Global styles (spacing, shadows, etc.)
│   ├── theme.ts          # Color theme (light/dark)
│   └── index.ts
│
├── hooks/                # 🪝 Mobile-specific Hooks
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
│
├── services/             # 🔌 Mobile-specific Services
│   ├── nativeGoogleAuth.ts    # Google Sign-In (native)
│   ├── socialAuthService.ts   # Social auth (OAuth)
│   ├── mockSocialAuth.ts
│   ├── categoryService.ts
│   ├── orderService.ts
│   └── wishlistService.ts
│
├── types/                # 📝 TypeScript Types
│   └── index.ts          # Mobile-specific types
│
└── assets/               # 🖼️ Images & Assets
    └── images/

```

## Using Shared Code

### Services (from @shared)

```typescript
import { login, fetchCart, getAllProducts } from "@shared/services";
```

### Hooks (from @shared)

```typescript
import { useProducts, useDebounce } from "@shared/hooks";
```

### Utils (from @shared)

```typescript
import { formatPrice, isValidEmail } from "@shared/utils";
```

### Types (from @shared)

```typescript
import type { User, Product, Cart } from "@shared/types";
```

## Key Features

### 🔐 Authentication

- Login/Register with OTP verification
- Social login (Google, Facebook)
- Forgot password with OTP

### 🛒 Shopping

- Browse products by category
- Product search
- Add to cart
- Checkout process

### 👤 User Profile

- View/edit profile
- Order history
- Wishlist

### 🎨 Theming

- Light/Dark mode support
- Custom color schemes
- Responsive design

## Navigation

Using **Expo Router** (file-based routing):

- `app/(tabs)/` → Tab navigation
- `app/auth/` → Authentication flows
- `app/customer/` → Customer-specific screens

## State Management

- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **Shared Hooks** - Reusable data fetching hooks

## Mobile-Specific Features

- Native Google Sign-In
- OAuth social login (web fallback)
- AsyncStorage for local data
- React Native UI components
- Expo SDK integrations

## Development

```bash
npm install
npm start
```

## Notes

- Uses **@shared** for common code with web
- Follows Expo Router conventions
- TypeScript throughout
- Dark mode compatible
