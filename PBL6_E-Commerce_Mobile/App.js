import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet } from 'react-native';
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
    {
      id: 2,
      name: 'Bluetooth Headphones',
      price: 650000,
      image: 'headphone_main.jpg',
    },
    {
      id: 3,
      name: 'Ceramic Coffee Mug',
      price: 90000,
      image: '', // Không có ảnh, sẽ dùng mặc định
    },
  ];
};

const BASE_IMAGE_URL = 'https://nikolas-unstrenuous-augustus.ngrok-free.dev/images/';

function getImageSource(img) {
  if (!img) return defaultProductImage;
  if (img.startsWith('http')) return { uri: img };
  return { uri: BASE_IMAGE_URL + img };
}

export default function App() {
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
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', marginBottom: 16, width: 180 },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  price: { fontSize: 14, color: '#007AFF' },
});