import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SellerDashboard = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kênh Người Bán</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SellerProducts')}>
          <Text style={styles.cardTitle}>Sản phẩm</Text>
          <Text style={styles.cardDesc}>Quản lý sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SellerOrders')}>
          <Text style={styles.cardTitle}>Đơn hàng</Text>
          <Text style={styles.cardDesc}>Quản lý đơn hàng</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SellerVouchers')}>
          <Text style={styles.cardTitle}>Voucher</Text>
          <Text style={styles.cardDesc}>Quản lý voucher</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SellerRevenue')}>
          <Text style={styles.cardTitle}>Doanh thu</Text>
          <Text style={styles.cardDesc}>Phân tích doanh thu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardDesc: { color: '#888', fontSize: 14 },
});

export default SellerDashboard;
