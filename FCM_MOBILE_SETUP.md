# Mobile FCM Setup Guide

## Quick Integration Steps

### 1. Update App.js / \_layout.tsx

Add FCM initialization when app starts:

\`\`\`typescript
// App.js or app/\_layout.tsx
import { useEffect } from 'react';
import { initializeFCM, setupBackgroundHandler } from './services/fcmService';
import { useNavigation } from '@react-navigation/native'; // or use router from expo-router

// Setup background handler (outside component)
setupBackgroundHandler();

function App() {
const navigation = useNavigation(); // or const router = useRouter();

useEffect(() => {
// Initialize FCM
initializeFCM(navigation).catch(err => {
console.error('FCM initialization failed:', err);
});
}, [navigation]);

return (
// Your app content
);
}

export default App;
\`\`\`

### 2. Update Login Flow

After successful login, refresh FCM token:

\`\`\`typescript
// services/authService.ts or your login component
import { refreshFCMToken } from './fcmService';

export const login = async (email: string, password: string) => {
try {
const response = await fetch(\`\${API_URL}/api/auth/login\`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password }),
});

    if (response.ok) {
      const data = await response.json();

      // Save auth token
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Register FCM token after login
      await refreshFCMToken();

      return data;
    }

    throw new Error('Login failed');

} catch (error) {
console.error('Login error:', error);
throw error;
}
};
\`\`\`

### 3. Update Logout Flow

Unregister FCM token on logout:

\`\`\`typescript
// services/authService.ts or your logout component
import { unregisterFCMToken } from './fcmService';

export const logout = async () => {
try {
// ✅ Unregister FCM token first
await unregisterFCMToken();

    // Clear storage
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');

    console.log('✅ Logged out successfully');

} catch (error) {
console.error('Logout error:', error);
}
};
\`\`\`

### 4. Add Navigation Handler (Optional)

If you want to navigate to order detail when notification is tapped, update `fcmService.ts`:

#### For Expo Router:

\`\`\`typescript
// services/fcmService.ts - handleNotificationTap function
import { router } from 'expo-router';

function handleNotificationTap(data: any) {
const { orderId, type } = data;

if (orderId) {
// Navigate to order detail
router.push(\`/customer/orders/\${orderId}\`);
}
}
\`\`\`

#### For React Navigation:

\`\`\`typescript
// services/fcmService.ts - handleNotificationTap function
function handleNotificationTap(data: any, navigation?: any) {
const { orderId, type } = data;

if (orderId && navigation) {
navigation.navigate('OrderDetail', { orderId });
}
}
\`\`\`

---

## Testing

### 1. Check Token Registration

Run the app and check logs:

\`\`\`
📱 Registering FCM token...
📱 FCM Token obtained: cXYz123abc...
📱 Device ID: iPhone 14 Pro
📱 Device Type: ios
✅ FCM token registered with backend
✅ FCM initialized successfully
\`\`\`

### 2. Test Push Notification

Place an order and check:

- Mobile receives push notification
- Tapping notification opens app
- Navigation works (if implemented)

### 3. Test Foreground/Background

- **Foreground**: Alert dialog should appear
- **Background**: System notification appears
- **Quit**: Notification appears, tapping opens app

---

## Troubleshooting

### No FCM token

- Ensure `google-services.json` is in `android/app/`
- Ensure `GoogleService-Info.plist` is in `ios/YourApp/`
- Rebuild native app: `npx expo run:android` or `npx expo run:ios`

### 401 Unauthorized

- Check auth token is saved correctly
- Verify token is sent in Authorization header

### No notifications received

- Check backend logs for "📱 Sent FCM push notification"
- Verify FCM token is active in database
- Test with Firebase Console

---

## Files Modified

✅ Created: `services/fcmService.ts`  
⏳ Update: `App.js` or `app/_layout.tsx`  
⏳ Update: Login flow in `services/authService.ts`  
⏳ Update: Logout flow in `services/authService.ts`

---

## Environment Requirements

- `@react-native-firebase/app` ✅ installed
- `@react-native-firebase/messaging` ✅ installed
- `google-services.json` (Android) - must be in `android/app/`
- `GoogleService-Info.plist` (iOS) - must be in `ios/YourApp/`
- Development build or EAS build (not Expo Go)

---

## Next Steps

1. ✅ Backend FCM integration complete
2. ✅ Mobile service created
3. ⏳ Update App.js with initialization
4. ⏳ Update login/logout flows
5. ⏳ Test token registration
6. ⏳ Test push notifications
7. ⏳ Add navigation handling
8. ⏳ Build and deploy

---

## Notes

- FCM only works in **development build** or **EAS build**, NOT Expo Go
- Foreground messages show alert, background/quit show system notification
- Invalid tokens are auto-deactivated by backend
- Token refreshes automatically on app restart
