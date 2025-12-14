

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, StyleSheet } from 'react-native';
import { getSellerProducts, addSellerProduct, updateSellerProduct, deleteSellerProduct } from '../../services/sellerService';

type Product = {
  id: number;
  name: string;
  price: number;
};

const SellerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<{ name: string; price: string }>({ name: '', price: '' });


  const fetchProducts = () => {
    setLoading(true);
    getSellerProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setForm({ name: '', price: '' });
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setForm({ name: product.name, price: product.price.toString() });
    setModalVisible(true);
  };


  const handleSave = async () => {
    try {
      if (form.name.trim() === '' || form.price.trim() === '') return;
      const price = parseFloat(form.price);
      if (isNaN(price)) return;
      if (editProduct) {
        await updateSellerProduct(editProduct.id, { name: form.name, price });
      } else {
        await addSellerProduct({ name: form.name, price });
      }
      setModalVisible(false);
      fetchProducts();
    } catch (e) {
      // TODO: Hiển thị thông báo lỗi
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSellerProduct(id);
      fetchProducts();
    } catch (e) {
      // TODO: Hiển thị thông báo lỗi
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Quản lý sản phẩm</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>＋</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        renderItem={({ item }: { item: Product }) => (
          <View style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: '#888', marginTop: 2 }}>Giá: {item.price}₫</Text>
            </View>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
              <Text style={{ color: '#fff' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: '#fff' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
              {editProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên sản phẩm"
              value={form.name}
              onChangeText={name => setForm(f => ({ ...f, name }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Giá"
              keyboardType="numeric"
              value={form.price}
              onChangeText={price => setForm(f => ({ ...f, price }))}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
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
  editBtn: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default SellerProducts;
