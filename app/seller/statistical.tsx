import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getShopAnalytics } from '@/services/sellerService';

type MonthlyRevenue = {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  orderCount: number;
};

type AnalyticsData = {
  totalRevenue: number;
  totalCompletedOrders: number;
  monthlyRevenue: MonthlyRevenue[];
};

const SellerRevenue = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchAnalytics = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getShopAnalytics(selectedYear);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Year Picker */}
      <View style={styles.yearPickerContainer}>
        <Text style={styles.yearLabel}>Chọn năm:</Text>
        <View style={styles.yearButtons}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.yearButtonActive,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.yearButtonTextActive,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(analytics?.totalRevenue || 0)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Đơn hàng hoàn thành</Text>
          <Text style={styles.summaryValue}>{analytics?.totalCompletedOrders || 0}</Text>
        </View>
      </View>

      {/* Monthly Revenue Table */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Doanh thu theo tháng {selectedYear}</Text>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Tháng</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Doanh thu</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Đơn</Text>
        </View>

        {analytics?.monthlyRevenue?.map((item) => (
          <View key={`${item.year}-${item.month}`} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.monthName}</Text>
            <Text style={[styles.tableCell, styles.revenueCellText, { flex: 2 }]}>
              {formatCurrency(item.revenue)}
            </Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
              {item.orderCount}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  yearPickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  yearButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  yearButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  yearButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tableContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tableHeaderCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 14,
    color: '#666',
  },
  revenueCellText: {
    fontWeight: '600',
    color: '#F44336',
  },
});

export default SellerRevenue;
