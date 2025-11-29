import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SellerRevenue = () => {
  // TODO: Lấy dữ liệu thực tế từ API
  const totalRevenue = 12000000;
  const totalOrders = 120;
  const totalProducts = 35;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phân tích doanh thu</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalRevenue.toLocaleString()}₫</Text>
          <Text style={styles.statLabel}>Tổng doanh thu</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalOrders}</Text>
          <Text style={styles.statLabel}>Số đơn hàng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Sản phẩm</Text>
        </View>
      </View>
      <View style={styles.chartPlaceholder}>
        <Text style={{ color: '#aaa' }}>[Biểu đồ doanh thu sẽ hiển thị ở đây]</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#888', fontSize: 13 },
  chartPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});

export default SellerRevenue;
