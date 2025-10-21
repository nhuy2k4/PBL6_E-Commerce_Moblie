import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addToCart } from '@/services/cartService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

// Mock data - replace with API call
const flashSaleProducts: Product[] = [
  {
    id: 1,
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop',
    price: 25000000,
    imageUrl: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Gaming+Laptop',
    category: 'Electronics',
    stock: 10,
    rating: 4.8,
    reviews: 256,
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    description: 'Noise-cancelling headphones',
    price: 3500000,
    imageUrl: 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Headphones',
    category: 'Electronics',
    stock: 25,
    rating: 4.6,
    reviews: 189,
  },
  {
    id: 3,
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch',
    price: 5000000,
    imageUrl: 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Smart+Watch',
    category: 'Electronics',
    stock: 15,
    rating: 4.7,
    reviews: 342,
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard',
    price: 2000000,
    imageUrl: 'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Keyboard',
    category: 'Electronics',
    stock: 30,
    rating: 4.5,
    reviews: 128,
  },
];

export default function FlashSaleSection() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const handleProductPress = (product: Product) => {
    // Navigate to product detail
    console.log('Product pressed:', product.id);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.indicator, { backgroundColor: '#FF6B6B' }]} />
          <Text style={[styles.subtitle, { color: '#FF6B6B' }]}>Today's</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Flash Sales</Text>
      </View>

      {/* Countdown Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.timerItem}>
          <Text style={[styles.timerValue, { color: colors.text }]}>
            {formatTime(timeLeft.days)}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.icon }]}>Days</Text>
        </View>
        <Text style={[styles.timerSeparator, { color: '#FF6B6B' }]}>:</Text>
        <View style={styles.timerItem}>
          <Text style={[styles.timerValue, { color: colors.text }]}>
            {formatTime(timeLeft.hours)}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.icon }]}>Hours</Text>
        </View>
        <Text style={[styles.timerSeparator, { color: '#FF6B6B' }]}>:</Text>
        <View style={styles.timerItem}>
          <Text style={[styles.timerValue, { color: colors.text }]}>
            {formatTime(timeLeft.minutes)}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.icon }]}>Mins</Text>
        </View>
        <Text style={[styles.timerSeparator, { color: '#FF6B6B' }]}>:</Text>
        <View style={styles.timerItem}>
          <Text style={[styles.timerValue, { color: colors.text }]}>
            {formatTime(timeLeft.seconds)}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.icon }]}>Secs</Text>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={flashSaleProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* View All Button */}
      <TouchableOpacity
        style={[styles.viewAllButton, { backgroundColor: '#FF6B6B' }]}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.viewAllText}>View All Products</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerItem: {
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  timerSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  listContent: {
    paddingRight: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  viewAllButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
