import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import NotificationItem from '@/components/NotificationItem';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SellerNotifications() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { notifications, unreadCount, isConnected, markAsRead, deleteNotification, clearAll } = useNotification();

  const router = require('expo-router').useRouter();
  const handlePress = (notif: any) => {
    console.log('🔔 Notification pressed:', notif);
    if (!notif.read) markAsRead(notif.id);
    console.log('🔔 Notification pressed:', notif);
    console.log('🔁 Try to navigate to /me');
    try {
      router.replace('/me');
      console.log('✅ Called router.replace');
    } catch (err) {
      console.error('❌ Navigation error:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.tint }]}> 
        <Text style={styles.headerTitle}>Thông báo cho Người bán</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            key={item.id}
            notification={item}
            onDelete={(id) => deleteNotification(id)}
            onPress={handlePress}
            colors={colors}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Ionicons name="notifications-outline" size={64} color={colors.icon} /><Text style={[styles.emptyText, { color: colors.icon }]}>Chưa có thông báo</Text></View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  badge: { backgroundColor: '#ff4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 12, fontSize: 16 }
});
