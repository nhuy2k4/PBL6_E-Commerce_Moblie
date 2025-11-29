import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

export default function SettingsContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tài khoản</Text>
        
        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="person-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Thông tin cá nhân</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="location-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Địa chỉ giao hàng</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cài đặt</Text>
        
        <View style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="notifications-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Thông báo</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.icon + '40', true: colors.tint + '80' }}
            thumbColor={notifications ? colors.tint : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="language-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Ngôn ngữ</Text>
          <Text style={[styles.settingValue, { color: colors.icon }]}>Tiếng Việt</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hỗ trợ</Text>
        
        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="help-circle-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Trung tâm trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="document-text-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Điều khoản & Chính sách</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { borderColor: colors.icon + '20' }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.tint} />
          <Text style={[styles.settingText, { color: colors.text }]}>Về chúng tôi</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#F44336' }]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
