import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../../context/CartContext';

const BASE_IMAGE_URL = 'https://nikolas-unstrenuous-augustus.ngrok-free.dev/images/';

interface CartItemCardProps {
  item: any;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  isSelected,
  onToggleSelect,
}) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert('Thông báo', 'Số lượng phải ít nhất là 1');
      return;
    }

    if (newQuantity > 100) {
      Alert.alert('Thông báo', 'Số lượng không được vượt quá 100');
      return;
    }

    if (newQuantity > item.stockAvailable) {
      Alert.alert('Thông báo', `Chỉ còn ${item.stockAvailable} sản phẩm trong kho`);
      return;
    }

    setUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Lỗi cập nhật số lượng');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              await removeFromCart(item.id);
            } catch (error: any) {
              Alert.alert('Lỗi', error?.response?.data?.message || 'Lỗi xóa sản phẩm');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isLowStock = item.stockAvailable < 10;

  const getImageUrl = (img: string | undefined) => {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return BASE_IMAGE_URL + img;
  };

  const imageUri = getImageUrl(item.productImage);

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity onPress={onToggleSelect} style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
        </View>
      </TouchableOpacity>

      {/* Product Image */}
      <Image
        source={
          imageUri
            ? { uri: imageUri }
            : require('../../../assets/images/icon.png')
        }
        style={styles.productImage}
      />

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>

        {/* Variant Attributes */}
        {item.variantAttributes && item.variantAttributes.length > 0 && (
          <View style={styles.variantContainer}>
            {item.variantAttributes.map((attr: any, idx: number) => (
              <View key={idx} style={styles.variantBadge}>
                <Text style={styles.variantText}>{attr.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SKU */}
        <Text style={styles.sku}>SKU: {item.sku}</Text>

        {/* Stock Warning */}
        {isLowStock && (
          <View style={styles.stockWarning}>
            <Ionicons name="alert-circle-outline" size={14} color="#FF8C00" />
            <Text style={styles.stockWarningText}>
              Chỉ còn {item.stockAvailable} sản phẩm
            </Text>
          </View>
        )}

        {/* Unit Price */}
        <Text style={styles.unitPrice}>{formatPrice(item.unitPrice)}</Text>
      </View>

      {/* Right Column - Quantity & Actions */}
      <View style={styles.rightColumn}>
        {/* Quantity Controls */}
        <View style={styles.quantityControl}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            style={[
              styles.quantityButton,
              (updating || item.quantity <= 1) && styles.quantityButtonDisabled,
            ]}
          >
            <Ionicons name="remove" size={16} color="#333" />
          </TouchableOpacity>

          {updating ? (
            <ActivityIndicator size="small" color="#FF6B6B" style={styles.quantityText} />
          ) : (
            <Text style={styles.quantityText}>{item.quantity}</Text>
          )}

          <TouchableOpacity
            onPress={() => handleQuantityChange(item.quantity + 1)}
            disabled={updating || item.quantity >= item.stockAvailable}
            style={[
              styles.quantityButton,
              (updating || item.quantity >= item.stockAvailable) &&
                styles.quantityButtonDisabled,
            ]}
          >
            <Ionicons name="add" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Subtotal */}
        <Text style={styles.subtotal}>{formatPrice(item.subTotal)}</Text>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={handleRemove}
          disabled={updating}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    paddingTop: 4,
    marginRight: 12,
  },
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
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
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
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  variantContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  variantBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  variantText: {
    fontSize: 10,
    color: '#666',
  },
  sku: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  stockWarningText: {
    fontSize: 10,
    color: '#FF8C00',
  },
  unitPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 8,
  },
  rightColumn: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 2,
    marginBottom: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 12,
    minWidth: 36,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
  },
});
