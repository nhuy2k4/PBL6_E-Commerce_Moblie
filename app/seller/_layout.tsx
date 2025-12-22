import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { paddingTop: 5 } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="products" options={{ headerShown: false }} />
      <Stack.Screen name="orders" options={{ headerShown: false }} />
      <Stack.Screen name="vouchers" options={{ headerShown: false }} />
      <Stack.Screen name="statistical" options={{ headerShown: false }} />
      <Stack.Screen name="reviews" options={{ headerShown: false }} />
    </Stack>
  );
}