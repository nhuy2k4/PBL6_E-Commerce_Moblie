import { useAuth } from '@/context/AuthContext';
import { useRouter, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function IndexRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    // Nếu đã đăng nhập thì vào home, chưa đăng nhập cũng vào home
    router.replace('/(tabs)');
  }, [user, isLoading]);

  return null;
}
