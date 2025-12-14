import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors , sportColors } from '../../constants';

import { useColorScheme } from '../../hooks/use-color-scheme';
import { useCart } from '@/context/CartContext';

export default function HomeHeader() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items } = useCart();

  const cartItemCount = items?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}> 
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: sportColors.primaryLight + '33' }]}> 
        <Ionicons name="search-outline" size={20} color={sportColors.textWhite} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: sportColors.textWhite }]}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor={sportColors.textWhite + 'B3'}
          onFocus={() => {
            // Navigate to search screen
            console.log('Navigate to search');
          }}
        />
      </View>

      {/* Right Icons */}
      <View style={styles.rightIcons}>
        {/* Cart Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="cart-outline" size={24} color={sportColors.textWhite} />
          {cartItemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: sportColors.secondary }]}> 
              <Text style={styles.badgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Message Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            // Navigate to messages
            console.log('Navigate to messages');
          }}
        >
          <Ionicons name="chatbubble-outline" size={24} color={sportColors.textWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
