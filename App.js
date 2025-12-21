import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet } from 'react-native';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
const defaultProductImage = require('./assets/images/default-product.png');

// Hàm lấy dữ liệu sản phẩm mẫu (hoặc gọi API thực tế nếu muốn)
const fetchProducts = async () => {
  // Dữ liệu mẫu, bạn có thể thay bằng fetch API thực tế
  return [
    {
      id: 1,
      name: 'Wireless Mouse',
      price: 150000,
      image: 'mouse_main.jpg',
    },
  const { user } = useAuth();
    {
      id: 2,
      name: 'Bluetooth Headphones',
  }, []);

  useEffect(() => {
    if (!user || !user.id || !user.role) return;
    connectNotificationSocket({
      userId: user.id,
      role: user.role,
      onNotification: (notif) => {
        console.log('🔔 Notification received:', notif);
        // Ở đây bạn có thể cập nhật state hoặc dispatch vào context/store
      },
      onConnection: (connected) => {
        console.log('🔌 Socket connected:', connected);
      }
    });
function AppContent() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', flexGrow: 1 }}>
      <Image
        source={require('./assets/images/icon.png')}
        style={{ width: 120, height: 120, backgroundColor: 'red', borderWidth: 2, borderColor: 'blue' }}
      />
    </View>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
        style={{ width: 120, height: 120, backgroundColor: 'red', borderWidth: 2, borderColor: 'blue' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', marginBottom: 16, width: 180 },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  price: { fontSize: 14, color: '#007AFF' },
});