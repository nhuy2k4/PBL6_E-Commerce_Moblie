import React from 'react';
import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack>
      <Stack.Screen name="messages" options={{ title: 'Trò chuyện' }} />
      <Stack.Screen name="OrderListPage" options={{ title: 'Đơn hàng' }} />
      <Stack.Screen name="order_detail" options={{ title: 'Chi tiết đơn hàng' }} />
      <Stack.Screen name="product-by-category" options={{ title: 'Sản phẩm theo danh mục' }} />
      <Stack.Screen name="product-detail" options={{ title: 'Chi tiết sản phẩm' }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="profile" options={{ title: 'Hồ sơ' }} />
      <Stack.Screen name="register-seller" options={{ title: 'Đăng ký bán hàng' }} />
      <Stack.Screen name="wishlist" options={{ title: 'Yêu thích' }} />
      <Stack.Screen name="write-review" options={{ title: 'Viết đánh giá' }} />
    </Stack>
  );
}

