import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
// TODO: import getSellerOrders từ service

type Order = {
  id: number;
  code: string;
  status: string;
  total: number;
};

const mockOrders: Order[] = [
  { id: 1, code: 'DH001', status: 'Chờ xác nhận', total: 120000 },
  { id: 2, code: 'DH002', status: 'Đang giao', total: 350000 },
  { id: 3, code: 'DH003', status: 'Hoàn thành', total: 210000 },
];

const SellerOrders = () => {
  // const [orders, setOrders] = useState<Order[]>([]);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   getSellerOrders().then(setOrders).finally(() => setLoading(false));
  // }, []);
  const [orders] = useState<Order[]>(mockOrders);
  const loading = false;

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Quản lý đơn hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>#{item.code}</Text>
              <Text>Trạng thái: {item.status}</Text>
              <Text>Tổng: {item.total}₫</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={{ color: '#fff' }}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  actionBtn: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
});

export default SellerOrders;
