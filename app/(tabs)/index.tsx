import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '@/styles/theme';
import HomeHeader from '@/components/home/HomeHeader';
import PromoBanner from '@/components/home/PromoBanner';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import BestSellerSection from '@/components/home/BestSellerSection';
import NewArrivalSection from '@/components/home/NewArrivalSection';
import ProductExplorer from '@/components/home/ProductExplorer';
import ServiceFeatures from '@/components/home/ServiceFeatures';
import CategoryList from '@/components/home/CategoryList';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, isLoading]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Nếu đang kiểm tra đăng nhập thì không render gì
  if (isLoading) return null;

  // Nếu chưa đăng nhập thì sẽ bị redirect, không render Home
  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header with Search, Cart, Message */}
      <HomeHeader />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Category List */}
        <View style={styles.section}>
          <CategoryList />
        </View>

        {/* Promo Banner */}
        <View style={styles.section}>
          <PromoBanner />
        </View>

        {/* Flash Sale Section */}
        <FlashSaleSection />

        {/* Best Seller Section */}
        <BestSellerSection />

        {/* Product Explorer */}
        <ProductExplorer />

        {/* New Arrival Section */}
        <NewArrivalSection />

        {/* Service Features */}
        <ServiceFeatures />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 16,
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});
