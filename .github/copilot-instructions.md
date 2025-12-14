# Copilot Instructions for PBL6 E-Commerce Mobile

## Project Overview
- **Mobile app built with React Native + Expo**
- Uses **TypeScript** for type safety
- File-based routing via **Expo Router** (`app/` directory)
- State managed with **Context API** (see `context/`)
- API communication via **Axios** wrappers in `services/api.ts`
- Authentication tokens stored in **AsyncStorage**
- Shared types/interfaces in `types/index.ts`

## Key Architecture & Patterns
- **Providers**: `AuthProvider` and `CartProvider` wrap the app in `app/_layout.tsx`
- **Auth**: Use `useAuth` hook and `AuthContext` for login/logout, Google/Facebook social login via `services/socialAuthService.ts`
- **API**: Use `fetchWithAuth` for authenticated requests, `fetchPublic` for public endpoints
- **Screens**: Organized in `app/` (e.g., `auth/login.tsx`, `seller/`, `customer/`)
- **Theme**: Colors and fonts defined in `styles/theme.ts`, switchable via `useColorScheme`
- **Environment**: API base URL set in `.env` (copy from `.env.example`)

## Developer Workflows
- **Install**: `npm install` in project root
- **Run**: `npm start` (or `expo start`) to launch Metro bundler
- **Test on device**: Use Expo Go app, scan QR code
- **API config**: Edit `.env` and `services/api.ts` for endpoint changes
- **Debug Auth**: Tokens in AsyncStorage, user state in `AuthContext`

## Conventions & Integration
- **TypeScript everywhere**; types in `types/index.ts`
- **Context API** for global state, avoid Redux
- **Service layer**: All network calls via `services/`, never directly in screens/components
- **Social login**: Use provided hooks/services, do not reimplement
- **Theme**: Use `Colors` and `Fonts` from `styles/theme.ts`, respect color scheme
- **Navigation**: Use Expo Router, do not use React Navigation directly

## External Dependencies
- **Expo** (core, router, status bar)
- **AsyncStorage** for persistence
- **Axios** for HTTP
- **Social login**: Google/Facebook via Expo/Native modules

## Examples
- Auth usage: `const { login } = useAuth();`
- API call: `await fetchWithAuth('/products')`
- Theme: `const colors = Colors[colorScheme]`

## Key Files
- `app/_layout.tsx`: App providers, theme, navigation
- `context/AuthContext.tsx`: Auth state, login/logout
- `services/api.ts`: API wrappers
- `types/index.ts`: Shared types
- `styles/theme.ts`: Colors/fonts
- `.env.example`: Environment config

---
**Update this file if major architecture or workflow changes occur.**
