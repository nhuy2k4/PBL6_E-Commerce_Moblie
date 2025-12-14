import React, { useState } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../../types';

// Thử dùng icon.png có sẵn của Expo trước
const defaultProductImage = require('../../assets/images/icon.png');
const BASE_IMAGE_URL = 'https://nikolas-unstrenuous-augustus.ngrok-free.dev/images/';

function getImageUrl(img: string | undefined) {
  if (!img) return undefined;
  if (img.startsWith('http')) return img;
  return BASE_IMAGE_URL + img;
}

interface Props {
  product: Product;
  onPress?: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  const [error, setError] = useState(false);

  const imageUri = getImageUrl(
    product.mainImage ||
    (product.images && product.images[0]?.imageUrl) ||
    product.image
  );

  const displayPrice = product.price || product.basePrice || 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image
        source={
          !error && imageUri
            ? { uri: imageUri }
            : defaultProductImage
        }
        style={styles.image}
        onError={() => setError(true)}
      />
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.price}>{displayPrice.toLocaleString('vi-VN')}₫</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    width: 160,
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});
