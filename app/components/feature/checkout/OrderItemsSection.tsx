import React from 'react';
import { View, Text } from 'react-native';
import { CartItemCard } from '@/components/feature/cart/CartItemCard';

interface OrderItemsSectionProps {
  checkoutItems: any[];
}

export const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({ checkoutItems }) => (
  <View style={{ backgroundColor: '#FFF', marginBottom: 12, padding: 16, borderRadius: 8 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Chi tiết đơn hàng ({checkoutItems.length})</Text>
    {checkoutItems.map((item) => (
      <CartItemCard key={item.id} item={item} isSelected={true} onToggleSelect={() => {}} />
    ))}
  </View>
);
