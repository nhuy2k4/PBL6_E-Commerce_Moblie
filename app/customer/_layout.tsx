import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerLayout() {
  return (
    <SafeAreaProvider>
      <CustomerStack />
    </SafeAreaProvider>
  );
}

function CustomerStack() {
  const insets = useSafeAreaInsets();
  const statusBarPadding = Platform.OS === 'android' ? insets.top + 16 : insets.top || 35;
  const statusBarHeight = insets.top || 0;
  const headerTitleOffset = Platform.OS === 'android' ? (insets.top / 2) : 0;

  return (
    <Stack screenOptions={{ headerShown: false, headerStyle: { paddingTop: statusBarHeight }, headerTitleStyle: { marginTop: headerTitleOffset } }}>
      {/* Hiện header cho messages */}
      <Stack.Screen
        name="messages"
        options={{
          headerShown: true,
          title: 'Trò chuyện',
        }}
      />

      {/* Tắt header cho các màn hình khác (mặc định đã tắt) */}
      <Stack.Screen name="OrderListPage"
          options={{
          headerShown: true,
          title: 'Đơn mua',
        }}/>
      <Stack.Screen name="order_detail" />

      {/* Hiện header cho profile */}
      <Stack.Screen
        name="profile"
          options={{
          headerShown: true,
          title: 'Hồ sơ',
        }}
      />

      <Stack.Screen name="register-seller" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="write-review" />
      <Stack.Screen name="product-detail" />
      <Stack.Screen name="product-by-category" options={{ contentStyle: { paddingTop: statusBarPadding } }} />
      <Stack.Screen
        name="checkout"
        options={{ headerShown: true, title: 'Thanh toán' }}
      />
      <Stack.Screen name="return-request" />
      <Stack.Screen name="refund-detail" />
    </Stack>
  );
}

