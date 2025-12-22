import React from 'react';
import { Stack } from 'expo-router';

export default function MeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { paddingTop: 35 } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="add-address" />
      <Stack.Screen name="edit-address" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="sporty-pay" />
    </Stack>
  );
}
