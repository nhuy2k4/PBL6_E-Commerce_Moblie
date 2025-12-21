import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

export const options = { headerShown: false };

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  showArrow?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'orders',
    icon: 'receipt-outline',
    title: 'Đơn mua',
    subtitle: 'Xem đơn hàng đã mua',
    showArrow: true,
  },
  {
    id: 'wishlist',
    icon: 'heart-outline',
    title: 'Yêu thích',
    subtitle: 'Danh sách sản phẩm yêu thích',
    showArrow: true,
  },
  {
    id: 'viewed',
    icon: 'eye-outline',
    title: 'Đã xem gần đây',
    showArrow: true,
  },
  {
    id: 'settings',
    icon: 'settings-outline',
    title: 'Cài đặt',
    showArrow: true,
  },
  {
    id: 'help',
    icon: 'help-circle-outline',
    title: 'Trợ giúp',
    showArrow: true,
  },
];

const walletItems: MenuItem[] = [
  {
    id: 'sportypay',
    icon: 'wallet-outline',
    title: 'SportyPay',
    subtitle: 'Ví điện tử SportyPay',
    showArrow: true,
  },
  {
    id: 'bank',
    icon: 'card-outline', 
    title: 'Thẻ ngân hàng',
    subtitle: 'Quản lý thẻ thanh toán',
    showArrow: true,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Nút chuyển sang kênh Người Bán đặt ở trên cùng
  const handleSwitchToSeller = () => {
    router.push('/seller');
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'orders':
        router.push('/customer/OrderListPage');
        break;
      case 'sportypay':
        router.push('/me/sporty-pay');
        break;
      case 'bank':
        // TODO: Navigate to bank cards management
        break;
      case 'wishlist':
        // TODO: Navigate to wishlist
        break;
      case 'viewed':
        // TODO: Navigate to viewed items
        break;
      case 'settings':
        setSettingsExpanded(!settingsExpanded);
        break;
      case 'settings-profile':
        router.push('/me/profile');
        break;
      case 'settings-addresses':
        router.push('/me/addresses');
        break;
      case 'settings-password':
        router.push('/me/change-password');
        break;
      case 'help':
        // TODO: Navigate to help
        break;
    }
  };
  
  let user = null;
  let logout = () => {};
  
  try {
    const auth = useAuth();
    user = auth?.user;
    logout = auth?.logout || (() => {});
  } catch {
    console.log('Auth context not available');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView>
        {/* Header with Profile Info */}
        <View style={[styles.header, { backgroundColor: colors.tint }]}> 
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {/* Avatar or Placeholder */}
              <Text style={styles.avatarText}>{user ? user.username?.charAt(0).toUpperCase() : '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              {/* Nút chuyển kênh người bán chỉ hiển thị khi đã đăng nhập */}
              {user && (
                <TouchableOpacity style={styles.sellerSwitchBtn} onPress={handleSwitchToSeller}>
                  <Text style={styles.sellerSwitchBtnText}>Kênh người bán</Text>
                </TouchableOpacity>
              )}
              {user ? (
                <Text style={styles.userName}>{user.fullName || user.username || 'User'}</Text>
              ) : (
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.loginText}>Đăng nhập / Đăng ký</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Wallet Section */}
        {user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ví & Thanh toán</Text>
            {walletItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderBottomColor: colors.icon + '20' }]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#FF6B6B10' }]}> 
                  <Ionicons name={item.icon as any} size={24} color="#FF6B6B" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                {item.showArrow && (
                  <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Đơn hàng & Tài khoản</Text>
          {menuItems.map((item) => (
            <View key={item.id}>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.icon + '20' }]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: colors.tint + '10' }]}> 
                  <Ionicons name={item.icon as any} size={24} color={colors.tint} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                {item.id === 'settings' ? (
                  <Ionicons 
                    name={settingsExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.icon} 
                  />
                ) : item.showArrow ? (
                  <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                ) : null}
              </TouchableOpacity>
              
              {/* Submenu for Settings */}
              {item.id === 'settings' && settingsExpanded && (
                <View style={[styles.submenuContainer, { backgroundColor: colors.icon + '08' }]}>
                  <TouchableOpacity
                    style={[styles.submenuItem, { borderBottomColor: colors.icon + '20' }]}
                    onPress={() => handleMenuPress('settings-profile')}
                  >
                    <Text style={[styles.submenuText, { color: colors.text }]}>Tài khoản của tôi</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.submenuItem, { borderBottomColor: colors.icon + '20' }]}
                    onPress={() => handleMenuPress('settings-addresses')}
                  >
                    <Text style={[styles.submenuText, { color: colors.text }]}>Địa chỉ</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.submenuItem, { borderBottomColor: colors.icon + '20' }]}
                    onPress={() => handleMenuPress('settings-password')}
                  >
                    <Text style={[styles.submenuText, { color: colors.text }]}>Thay đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Logout Button */}
        {user && (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.tint + '10' }]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.tint} />
            <Text style={[styles.logoutText, { color: colors.tint }]}>
              Đăng xuất
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  menuSection: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Thêm style cho nút chuyển kênh người bán
  sellerSwitchBtn: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
    marginTop: 4,
    elevation: 2,
  },
  sellerSwitchBtnText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  submenuContainer: {
    paddingLeft: 52,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
  },
  submenuText: {
    fontSize: 15,
  },
});
