import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import DashboardContent from '@/components/feature/profile/DashboardContent';
import OrderHistoryContent from '@/components/feature/profile/OrderHistoryContent';
import SettingsContent from '@/components/feature/profile/SettingsContent';
import WishlistContent from '@/components/feature/profile/WishlistContent';

type TabType = 'dashboard' | 'orders' | 'wishlist' | 'settings';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'grid-outline' },
    { id: 'orders', label: 'Đơn hàng', icon: 'receipt-outline' },
    { id: 'wishlist', label: 'Yêu thích', icon: 'heart-outline' },
    { id: 'settings', label: 'Cài đặt', icon: 'settings-outline' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'orders':
        return <OrderHistoryContent />;
      case 'wishlist':
        return <WishlistContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.icon + '20' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { borderBottomColor: colors.tint },
              ]}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? colors.tint : colors.icon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? colors.tint : colors.icon },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>{renderContent()}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    borderBottomWidth: 1,
    paddingTop: 48,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
