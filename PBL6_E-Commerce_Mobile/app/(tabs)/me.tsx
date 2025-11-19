import React from 'react';
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

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
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
              {user ? (
                <Text style={styles.avatarText}>
                  {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person-outline" size={40} color="#fff" />
              )}
            </View>
            <View style={styles.profileInfo}>
              {user ? (
                <>
                  <Text style={styles.userName}>{user.username || 'User'}</Text>
                </>
              ) : (
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.loginText}>Đăng nhập / Đăng ký</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderBottomColor: colors.icon + '20' }]}
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
              {item.showArrow && (
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              )}
            </TouchableOpacity>
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
});
