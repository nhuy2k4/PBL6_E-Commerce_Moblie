import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/context/CartContext';
import { CartItemCard } from '@/components/feature/cart/CartItemCard';

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items, getTotalPrice, loading, clearCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Auto-select all items when cart loads
  useEffect(() => {
    if (items.length > 0 && selectedItems.length === 0) {
      setSelectedItems(items.map(item => item.id));
    }
  }, [items]);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleShopSelection = (shopId: string) => {
    const shopItems = items.filter(item => (item.shopId || 'unknown').toString() === shopId);
    const shopItemIds = shopItems.map(item => item.id);
    const allShopItemsSelected = shopItemIds.every(id => selectedItems.includes(id));
    
    if (allShopItemsSelected) {
      // Unselect all items from this shop
      setSelectedItems(prev => prev.filter(id => !shopItemIds.includes(id)));
    } else {
      // Select all items from this shop
      setSelectedItems(prev => [...new Set([...prev, ...shopItemIds])]);
    }
  };

  const isShopSelected = (shopId: string) => {
    const shopItems = items.filter(item => (item.shopId || 'unknown').toString() === shopId);
    const shopItemIds = shopItems.map(item => item.id);
    return shopItemIds.length > 0 && shopItemIds.every(id => selectedItems.includes(id));
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const getSelectedTotal = () => {
    return items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + (item.subTotal || item.unitPrice * item.quantity), 0);
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedItems.includes(item.id));
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để thanh toán');
      return;
    }
    
    // Store selected items for checkout
    const checkoutData = getSelectedItems();
    router.push({
      pathname: '/customer/checkout',
      params: { selectedItems: JSON.stringify(checkoutData) }
    });
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xóa giỏ hàng',
      'Bạn chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              setSelectedItems([]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng (0)</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#CCC" />
          <Text style={styles.emptyText}>Giỏ hàng của bạn trống</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  return (
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Select All Header */}
        <View style={styles.selectAllContainer}>
          <TouchableOpacity
            onPress={toggleSelectAll}
            style={styles.selectAllButton}
          >
            <View style={[
              styles.checkbox,
              allSelected && styles.checkboxChecked
            ]}>
              {allSelected && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </View>
            <Text style={styles.selectAllText}>
              Chọn tất cả ({items.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items Grouped by Shop */}
        {Object.entries(
          items.reduce((acc: Record<string, { shopName: string; products: any[] }>, item) => {
            const shopKey = String(item.shopId || 'unknown');
            if (!acc[shopKey]) acc[shopKey] = { shopName: item.shopName || 'Shop', products: [] };
            acc[shopKey].products.push(item);
            return acc;
          }, {} as Record<string, { shopName: string; products: any[] }>)
        ).map(([shopId, group]) => (
          <View key={shopId} style={styles.storeGroup}>
            {/* Shop Header with Checkbox */}
            <TouchableOpacity 
              style={styles.storeHeader}
              onPress={() => toggleShopSelection(shopId)}
              activeOpacity={0.7}
            >
              <View style={styles.storeCheckboxContainer}>
                <View style={[
                  styles.checkbox,
                  isShopSelected(shopId) && styles.checkboxChecked
                ]}>
                  {isShopSelected(shopId) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <Ionicons name="storefront-outline" size={18} color="#FF6B35" />
                <Text style={styles.storeName}>
                  {group.shopName}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Shop Products */}
            {group.products.map((item: any) => (
              <CartItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.includes(item.id)}
                onToggleSelect={() => toggleItemSelection(item.id)}
              />
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutLeft}>
          <Text style={styles.checkoutLabel}>
            Tổng ({selectedItems.length} sản phẩm)
          </Text>
          <Text style={styles.checkoutTotal}>
            {getSelectedTotal().toLocaleString('vi-VN')}₫
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.length === 0 && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>THANH TOÁN</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Store Group
  storeGroup: {
    marginTop: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  storeCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  
  // Checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'flex-start',
  },
  itemCheckbox: {
    paddingTop: 4,
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 20,
    marginRight: 8,
  },
  productSize: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },

  // Expired Section (for future)
  expiredSection: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  expiredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
  },

  // Checkout Bar
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  checkoutLeft: {
    flex: 1,
  },
  checkoutLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#CCC',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 24,
    marginBottom: 32,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Legacy styles (kept for compatibility, can be removed if not used)
  quantityContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  // New styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
