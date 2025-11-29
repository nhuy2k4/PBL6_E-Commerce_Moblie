
import React from 'react';
// Import ảnh mặc định bằng biến để Expo bundle asset
const defaultProductImage = require('../../assets/images/default-product.png');
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Product } from '../../types';

// Sử dụng ngrok URL thực tế
const BASE_IMAGE_URL = 'https://nikolas-unstrenuous-augustus.ngrok-free.dev/images/';

function getImageUrl(img: string | undefined) {
  if (!img) return undefined;
  if (img.startsWith('http')) return img;
  return BASE_IMAGE_URL + img;
}

type Props = {
  product: Product;
  onPress?: () => void;
};

export const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  // Lấy biến thể rẻ nhất (nếu có)
  console.log('ProductCard:', product);
  const cheapestVariant = product.variants?.reduce((min, v) =>
    v.price < min.price ? v : min
  , product.variants?.[0]) || {};
  const displayPrice = cheapestVariant.price || product.basePrice || 0;

  // Lấy uri ảnh hợp lệ
  // Lấy uri ảnh hợp lệ (build url nếu chỉ là tên file)
  // Luôn hiển thị ảnh mặc định cho mọi sản phẩm
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image
        source={defaultProductImage}
        style={styles.image}
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{displayPrice.toLocaleString('vi-VN')}₫</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    width: 160, // cố định chiều rộng
    height: 220, // cố định chiều cao
    justifyContent: 'flex-start',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  price: { fontSize: 14, color: '#007AFF' },
});