import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface OrderNoteSectionProps {
  orderNotes: string;
  setOrderNotes: (note: string) => void;
  styles: any;
}

export const OrderNoteSection: React.FC<OrderNoteSectionProps> = ({ orderNotes, setOrderNotes, styles }) => (
  <View>
    <Text style={styles.sectionTitle}>Ghi chú đơn hàng (tùy chọn)</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      placeholder="Nhập ghi chú cho người bán..."
      multiline
      numberOfLines={4}
      value={orderNotes}
      onChangeText={setOrderNotes}
    />
  </View>
);
