import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { Product } from '../../types';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ProductCard } from '../common/ProductCard';
import { getAllProducts } from '../../services/productService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

export default function FlashSaleSection() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'] as typeof Colors.light;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading flash sale products...');
      const response = await getAllProducts(0, 12);
      
      // Handle ResponseDTO structure from backend
      if (response && response.status === 200 && response.data) {
        const productsArray = Array.isArray(response.data.content) 
          ? response.data.content 
          : [];
        setProducts(productsArray.slice(0, 10));
      } else {
        console.warn('Unexpected response format:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading flash sale products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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
    router.push(`/customer/product-detail?productId=${product.id}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header with See All */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <View style={[styles.indicator, { backgroundColor: '#FF6B6B' }]} />
            <Text style={[styles.subtitle, { color: '#FF6B6B' }]}>Today&apos;s</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Flash Sales</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/customer/product-list', params: { title: 'Flash Sales' } } as any)}>
          <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
        </TouchableOpacity>
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item: Product) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
