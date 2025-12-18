# Safe FCM Implementation for Expo Apps

## 📚 Tổng quan

Document này giải thích cách implement Firebase Cloud Messaging (FCM) một cách **an toàn** trong Expo apps, tránh crashes và có thể bật/tắt bằng biến môi trường.

---

## 🎯 Vấn đề

### Tại sao Expo Go bị crash?

```typescript
// ❌ WRONG - Crashes in Expo Go
import messaging from "@react-native-firebase/messaging";

export function initFCM() {
  const token = await messaging().getToken(); // 💥 CRASH!
}
```

**Nguyên nhân:**

1. `@react-native-firebase/messaging` là **native module** (Java/Swift code)
2. Expo Go **không có** native module này compiled sẵn
3. Khi JavaScript try to call native code không tồn tại → **CRASH**

### Các trường hợp crash khác:

- ❌ Build native app nhưng không config Firebase (thiếu google-services.json)
- ❌ Môi trường development không cần FCM nhưng code vẫn import
- ❌ Testing trên simulator không có FCM support

---

## ✅ Giải pháp: Lazy Import + Environment Toggle

### Kiến trúc

```
┌─────────────────────────────────────────────┐
│  App Start (_layout.tsx)                    │
│  ↓                                           │
│  Check EXPO_PUBLIC_ENABLE_FCM              │
│  ↓                                           │
│  Is Expo Go?  ──Yes──→ Skip FCM (Safe!)    │
│  ↓ No                                        │
│  Lazy import('@react-native-firebase/...')  │
│  ↓                                           │
│  try { use module } catch { skip }          │
│  ↓                                           │
│  FCM Active ✅ or Gracefully Disabled ⚠️    │
└─────────────────────────────────────────────┘
```

---

## 🚀 Implementation

### 1. Tạo `.env` file

```bash
# .env
EXPO_PUBLIC_ENABLE_FCM=true   # true = enable, false = disable
EXPO_PUBLIC_API_URL=http://localhost:8081
```

**Development:**

```bash
# .env.development
EXPO_PUBLIC_ENABLE_FCM=false  # Disable for Expo Go
```

**Production:**

```bash
# .env.production
EXPO_PUBLIC_ENABLE_FCM=true   # Enable for release builds
```

---

### 2. Service Implementation

File: `services/fcmService.safe.ts`

#### Các kỹ thuật quan trọng:

##### A. Environment Check

```typescript
const isFCMEnabled = (): boolean => {
  return process.env.EXPO_PUBLIC_ENABLE_FCM === "true";
};
```

##### B. Expo Go Detection

```typescript
import Constants from "expo-constants";

const isExpoGo = (): boolean => {
  // Expo Go có appOwnership === 'expo'
  // Native builds có appOwnership === undefined hoặc 'standalone'
  return Constants.appOwnership === "expo";
};
```

##### C. Lazy Import Pattern

```typescript
// ❌ BAD: Top-level import
import messaging from "@react-native-firebase/messaging";

// ✅ GOOD: Lazy import
let messagingModule = null;

async function getMessagingModule() {
  if (messagingModule) return messagingModule;

  if (!shouldEnableFCM()) return null;

  try {
    // Chỉ load khi thực sự cần
    const { default: messaging } = await import(
      "@react-native-firebase/messaging"
    );
    messagingModule = messaging;
    return messaging;
  } catch (error) {
    console.warn("Firebase module not available");
    return null;
  }
}
```

**Tại sao lazy import hoạt động?**

- JavaScript không execute `import()` cho đến khi function được gọi
- Nếu không gọi function → không load module → không crash
- `try/catch` bắt được error nếu module không tồn tại

##### D. Safe Function Wrapper

```typescript
export async function registerFCMToken(apiUrl: string): Promise<boolean> {
  // 1. Check if module available
  const messaging = await getMessagingModule();
  if (!messaging) {
    console.log("FCM not available - skipping");
    return false; // Không crash, chỉ return false
  }

  // 2. Use module safely
  try {
    const token = await messaging().getToken();
    // ... register với backend
    return true;
  } catch (error) {
    console.error("FCM error:", error);
    return false; // Không throw, chỉ return false
  }
}
```

---

### 3. App Integration

File: `app/_layout.tsx`

```typescript
import {
  initializeFCM,
  setupBackgroundHandler,
} from "@/services/fcmService.safe";

// Background handler ở top level
setupBackgroundHandler(); // Safe - checks internally

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081";

      // Safe to call - won't crash
      const success = await initializeFCM(apiUrl, router);

      if (success) {
        console.log("✅ FCM active");
      } else {
        console.log("⚠️ FCM disabled");
      }
    };

    init();
  }, [router]);

  return <Stack>...</Stack>;
}
```

---

### 4. Auth Integration

File: `services/authService.ts`

```typescript
import { refreshFCMToken, unregisterFCMToken } from "./fcmService.safe";

export const authService = {
  async login(email: string, password: string) {
    // 1. Login
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    await AsyncStorage.setItem("authToken", data.token);

    // 2. Register FCM (safe - won't break login if fails)
    try {
      await refreshFCMToken(API_URL);
    } catch (fcmError) {
      console.warn("FCM registration failed, login succeeded:", fcmError);
    }

    return data;
  },

  async logout() {
    // 1. Unregister FCM (safe - won't break logout)
    try {
      await unregisterFCMToken(API_URL);
    } catch (fcmError) {
      console.warn("FCM unregistration failed:", fcmError);
    }

    // 2. Logout
    await AsyncStorage.clear();
  },
};
```

---

## 📋 Testing Guide

### Test 1: Expo Go (FCM Disabled)

```bash
# Set environment
EXPO_PUBLIC_ENABLE_FCM=false

# Run
npx expo start
```

**Expected:**

```
⚠️ Running in Expo Go - FCM disabled
⚠️ FCM initialization skipped (disabled or not available)
```

**Result:** ✅ App runs, no crashes

---

### Test 2: Native Build (FCM Enabled)

```bash
# Set environment
EXPO_PUBLIC_ENABLE_FCM=true

# Build and run
npx expo prebuild --clean
npx expo run:android
```

**Expected:**

```
✅ Firebase Messaging module loaded
✅ FCM permission granted
📱 FCM Token obtained: ey...
✅ FCM token registered with backend
✅ FCM initialized successfully!
```

**Result:** ✅ FCM active, notifications work

---

### Test 3: Native Build (FCM Disabled by ENV)

```bash
# Set environment
EXPO_PUBLIC_ENABLE_FCM=false

# Run
npx expo run:android
```

**Expected:**

```
⚠️ FCM disabled by environment variable
⚠️ FCM initialization skipped
```

**Result:** ✅ App runs, FCM gracefully disabled

---

## 🔧 Debugging

### Check FCM Status

```typescript
import { getFCMStatus } from "@/services/fcmService.safe";

// In any component
const status = await getFCMStatus();
console.log("FCM Status:", status);
/*
{
  enabled: true,           // ENV variable
  expoGo: false,          // Running environment
  moduleAvailable: true,   // Native module present
  hasToken: true          // Token registered
}
*/
```

---

## 🎨 Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Application                        │
├──────────────────────────────────────────────────────┤
│  _layout.tsx                                         │
│    ↓                                                  │
│  initializeFCM()  ←──────────────┐                  │
│    ↓                              │                   │
├──────────────────────────────────┼──────────────────┤
│  fcmService.safe.ts              │                   │
│                                   │                   │
│  1. shouldEnableFCM()            │                   │
│     - Check ENV variable         │                   │
│     - Detect Expo Go             │                   │
│     ↓                             │                   │
│  2. getMessagingModule()         │                   │
│     - Lazy import()              │                   │
│     - try/catch                   │                   │
│     ↓                             │                   │
│  3. requestPermission()          │                   │
│     ↓                             │                   │
│  4. registerFCMToken()           │                   │
│     - Get token from Firebase    │                   │
│     - POST to backend            │                   │
│     ↓                             │                   │
├──────────────────────────────────┼──────────────────┤
│  @react-native-firebase/         │                   │
│  messaging (Native Module)       │                   │
│     ↓                             │                   │
├──────────────────────────────────┼──────────────────┤
│  Firebase Cloud Messaging        │                   │
│  (Google Services)                │                   │
│     ↓                             │                   │
├──────────────────────────────────┼──────────────────┤
│  Backend API                      │                   │
│  (Spring Boot)                   │                   │
│    - Store token in DB           │                   │
│    - Send notifications          │                   │
└──────────────────────────────────┴──────────────────┘
```

---

## 🚨 Common Issues

### Issue 1: "Metro error: Cannot find module"

```
Error: Cannot find module '@react-native-firebase/messaging'
```

**Solution:**

```bash
# Install dependencies
npm install @react-native-firebase/app @react-native-firebase/messaging

# Rebuild native
npx expo prebuild --clean
npx expo run:android
```

---

### Issue 2: App crashes on startup

**Cause:** Top-level import in Expo Go

**Solution:** Use lazy import pattern from `fcmService.safe.ts`

---

### Issue 3: Token not registered

**Debug:**

```typescript
// Add to _layout.tsx
const status = await getFCMStatus();
console.log("Debug:", status);
```

**Check:**

- ✅ `enabled: true` - ENV set correctly
- ✅ `expoGo: false` - Running native build
- ✅ `moduleAvailable: true` - Firebase installed
- ❌ `hasToken: false` - Check backend logs

---

## 📊 Comparison: Old vs New Approach

| Aspect                  | Old (Unsafe)          | New (Safe)      |
| ----------------------- | --------------------- | --------------- |
| **Import**              | Top-level             | Lazy `import()` |
| **Expo Go**             | 💥 Crashes            | ✅ Works        |
| **Environment Control** | ❌ No                 | ✅ Yes (ENV)    |
| **Error Handling**      | ❌ Throws             | ✅ Graceful     |
| **Development**         | Requires native build | Can use Expo Go |
| **Testing**             | Difficult             | Easy            |
| **Production**          | Works                 | Works           |

---

## ✅ Checklist

### Setup

- [ ] Install dependencies: `@react-native-firebase/app`, `@react-native-firebase/messaging`
- [ ] Create `.env` with `EXPO_PUBLIC_ENABLE_FCM=true`
- [ ] Add `google-services.json` to `android/app/`
- [ ] Copy `fcmService.safe.ts` to `services/`

### Integration

- [ ] Update `app/_layout.tsx` to use safe FCM service
- [ ] Update `authService.ts` to register/unregister tokens
- [ ] Add `setupBackgroundHandler()` at top level

### Testing

- [ ] Test in Expo Go (FCM disabled) - no crash
- [ ] Test native build (FCM enabled) - notifications work
- [ ] Test with ENV=false (FCM disabled) - graceful fallback

### Production

- [ ] Set `EXPO_PUBLIC_ENABLE_FCM=true` in production ENV
- [ ] Build release: `eas build --platform android`
- [ ] Test push notifications
- [ ] Monitor backend logs for token registration

---

## 🎓 Summary

**Key Takeaways:**

1. **Never import native modules at top level** → Use lazy `import()`
2. **Always check environment** → `isExpoGo()`, ENV variables
3. **Wrap in try/catch** → Graceful failure, no crashes
4. **Use feature flags** → Enable/disable via ENV
5. **Test both paths** → Expo Go (disabled) and native (enabled)

**Benefits:**

- ✅ No crashes in any environment
- ✅ Easy to enable/disable FCM
- ✅ Supports Expo Go for development
- ✅ Production-ready with full FCM support
- ✅ Clear error messages for debugging

---

## 📞 Support

Nếu có vấn đề:

1. Check `getFCMStatus()` output
2. Check console logs (có emoji để dễ filter)
3. Verify ENV variables: `console.log(process.env.EXPO_PUBLIC_ENABLE_FCM)`
4. Test in both Expo Go and native build

---

**Created by:** Senior React Native Engineer  
**Last Updated:** December 17, 2025  
**Version:** 1.0.0
