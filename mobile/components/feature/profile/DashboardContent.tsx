import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

export default function DashboardContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const stats = [
    { icon: 'cart-outline', label: 'Đơn hàng', value: '0' },
    { icon: 'heart-outline', label: 'Yêu thích', value: '0' },
    { icon: 'checkmark-circle-outline', label: 'Hoàn thành', value: '0' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.welcomeCard, { backgroundColor: colors.tint }]}>
        <Text style={styles.welcomeText}>Xin chào, {user?.username || 'Khách'}!</Text>
        <Text style={styles.welcomeSubtext}>Chào mừng bạn quay trở lại</Text>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}
          >
            <Ionicons name={stat.icon as any} size={32} color={colors.tint} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Truy cập nhanh</Text>
        
        <TouchableOpacity style={[styles.actionItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="location-outline" size={24} color={colors.tint} />
          <Text style={[styles.actionText, { color: colors.text }]}>Địa chỉ giao hàng</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="card-outline" size={24} color={colors.tint} />
          <Text style={[styles.actionText, { color: colors.text }]}>Phương thức thanh toán</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="notifications-outline" size={24} color={colors.tint} />
          <Text style={[styles.actionText, { color: colors.text }]}>Thông báo</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
  },
});
