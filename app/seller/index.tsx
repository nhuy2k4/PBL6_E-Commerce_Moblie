import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import SellerNavigator from '../../navigation/SellerNavigator';
import { getRegistrationStatus } from '@/services/sellerRegistrationService';

const BuyerRegisterView = () => {
  const router = useRouter();
  const [hasRegistration, setHasRegistration] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isApprovedSeller, setIsApprovedSeller] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      console.log('🔍 Checking registration status...');
      const response = await getRegistrationStatus();
      const statusData = response?.data?.data || response?.data || response;
      const status = statusData?.status;
      
      console.log('✅ Registration status:', status);
      
      // If status is ACTIVE or APPROVED, show seller dashboard
      if (status === 'ACTIVE' || status === 'APPROVED') {
        console.log('✅ User is approved seller, showing SellerNavigator');
        setIsApprovedSeller(true);
        setHasRegistration(false);
      }
      // If status is PENDING or REJECTED, redirect to status page
      else if (status === 'PENDING' || status === 'REJECTED') {
        setHasRegistration(true);
        console.log('📋 Has pending/rejected registration, redirecting to status page...');
        setTimeout(() => {
          router.replace('/seller/registration-status');
        }, 100);
      } else {
        // No status means no registration
        setHasRegistration(false);
        console.log('📦 No registration found, showing register button');
      }
    } catch (error: any) {
      // 404 means no registration exists -> show register button
      if (error?.response?.status === 404) {
        console.log('📦 No registration (404), showing register button');
        setHasRegistration(false);
      } else {
        console.error('❌ Error checking registration:', error);
        // On other errors, assume no registration to allow user to try
        setHasRegistration(false);
      }
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If approved seller, show SellerNavigator
  if (isApprovedSeller) {
    return <SellerNavigator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🏪</Text>
        <Text style={styles.title}>Trở thành Người bán</Text>
        <Text style={styles.description}>
          {hasRegistration
            ? 'Bạn đã có đơn đăng ký. Kiểm tra trạng thái đơn của bạn.'
            : 'Đăng ký mở shop và bắt đầu bán hàng trên SportZone ngay hôm nay!'}
        </Text>

        {hasRegistration ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/seller/registration-status')}
          >
            <Text style={styles.primaryButtonText}>Xem trạng thái đăng ký</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/customer/register-seller')}
          >
            <Text style={styles.primaryButtonText}>Đăng ký bán hàng</Text>
          </TouchableOpacity>
        )}

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Lợi ích khi bán hàng:</Text>
          <Text style={styles.benefitItem}>✓ Tiếp cận hàng ngàn khách hàng</Text>
          <Text style={styles.benefitItem}>✓ Quản lý shop dễ dàng</Text>
          <Text style={styles.benefitItem}>✓ Hỗ trợ thanh toán an toàn</Text>
          <Text style={styles.benefitItem}>✓ Công cụ marketing miễn phí</Text>
        </View>
      </View>
    </View>
  );
};

const SellerIndex = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  // role = 1 (SELLER) -> Kênh người bán
  if (user.role === 'SELLER') {
    return <SellerNavigator />;
  }

  // role = 2 (BUYER) -> Đăng ký shop
  if (user.role === 'BUYER') {
    return <BuyerRegisterView />;
  }

  // role = 0 (ADMIN) -> Trang admin
  if (user.role === 'ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trang Admin</Text>
        <Text style={styles.message}>Tính năng quản trị sẽ được cập nhật sau</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Không xác định được vai trò người dùng</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  benefits: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SellerIndex;
