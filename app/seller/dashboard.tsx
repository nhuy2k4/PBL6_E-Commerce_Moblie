import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SellerDashboard = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Sản phẩm',
      description: 'Quản lý sản phẩm của shop',
      icon: '📦',
      screen: 'SellerProducts',
      color: '#2196F3',
    },
    {
      title: 'Đơn hàng',
      description: 'Xử lý đơn hàng',
      icon: '📋',
      screen: 'SellerOrders',
      color: '#4CAF50',
    },
    {
      title: 'Voucher',
      description: 'Quản lý mã giảm giá',
      icon: '🎫',
      screen: 'SellerVouchers',
      color: '#FF9800',
    },
    {
      title: 'Khách hàng',
      description: 'Xem khách hàng top',
      icon: '👥',
      screen: 'SellerCustomers',
      color: '#9C27B0',
    },
    {
      title: 'Doanh thu',
      description: 'Phân tích doanh thu',
      icon: '📊',
      screen: 'SellerRevenue',
      color: '#F44336',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kênh Người Bán</Text>
        <Text style={styles.headerSubtitle}>Quản lý shop của bạn</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.screen as never)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Mẹo Bán Hàng</Text>
        <Text style={styles.infoText}>
          • Cập nhật sản phẩm thường xuyên{'\n'}
          • Xử lý đơn hàng nhanh chóng{'\n'}
          • Tạo voucher để thu hút khách hàng{'\n'}
          • Theo dõi doanh thu để tối ưu kinh doanh
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  menuGrid: {
    padding: 16,
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 28,
    color: '#ccc',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});

export default SellerDashboard;
