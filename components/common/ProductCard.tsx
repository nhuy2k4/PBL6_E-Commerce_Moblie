import React, { useState } from 'react';

import { Text, Image, TouchableOpacity, StyleSheet, View } from 'react-native';

import { Product } from '../../types';

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

  const basePrice = product.basePrice || product.price || 0;
  const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : basePrice;
  const showOriginalPrice = product.discountPrice && product.discountPrice > 0 && product.discountPrice < basePrice;
  const discountPercent =
    showOriginalPrice && basePrice > 0
      ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
      : 0;

  const categoryName =
    typeof product.category === 'object'
      ? product.category?.name
      : product.category;

  const ratingText =
    typeof product.rating === 'number' ? `★ ${product.rating.toFixed(1)}` : '';
  const soldText =
    typeof product.sold === 'number' ? `Đã bán ${product.sold}` : '';
  const hasMeta = !!ratingText || !!soldText;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={
            !error && imageUri
              ? { uri: imageUri }
              : defaultProductImage
          }
          style={styles.image}
          onError={() => setError(true)}
        />
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      {categoryName ? (
        <Text style={styles.category} numberOfLines={1}>{categoryName}</Text>
      ) : null}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{finalPrice.toLocaleString('vi-VN')}₫</Text>
        {showOriginalPrice && (
          <Text style={styles.originalPrice}>
            {basePrice.toLocaleString('vi-VN')}₫
          </Text>
        )}
      </View>
      {hasMeta && (
        <View style={styles.metaRow}>
          {ratingText ? <Text style={styles.metaText}>{ratingText}</Text> : null}
          {soldText ? <Text style={styles.metaText}>{soldText}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    width: 170,
    height: 270,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'stretch',
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
});
