import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';

type Voucher = {
  id: number;
  code: string;
  discount: number;
};

const mockVouchers: Voucher[] = [
  { id: 1, code: 'SALE10', discount: 10 },
  { id: 2, code: 'FREESHIP', discount: 0 },
];

const SellerVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<{ code: string; discount: string }>({ code: '', discount: '' });
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

  const openAddModal = () => {
    setEditVoucher(null);
    setForm({ code: '', discount: '' });
    setModalVisible(true);
  };
  const openEditModal = (voucher: Voucher) => {
    setEditVoucher(voucher);
    setForm({ code: voucher.code, discount: voucher.discount.toString() });
    setModalVisible(true);
  };
  const handleSave = () => {
    if (form.code.trim() === '' || form.discount.trim() === '') return;
    const discount = parseFloat(form.discount);
    if (isNaN(discount)) return;
    if (editVoucher) {
      setVouchers(vouchers.map(v => v.id === editVoucher.id ? { ...v, code: form.code, discount } : v));
    } else {
      setVouchers([...vouchers, { id: Date.now(), code: form.code, discount }]);
    }
    setModalVisible(false);
  };
  const handleDelete = (id: number) => {
    setVouchers(vouchers.filter(v => v.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Quản lý voucher</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>＋</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={vouchers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.code}</Text>
              <Text style={{ color: '#888', marginTop: 2 }}>Giảm: {item.discount}%</Text>
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
              {editVoucher ? 'Sửa voucher' : 'Thêm voucher'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Mã voucher"
              value={form.code}
              onChangeText={code => setForm(f => ({ ...f, code }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Giảm (%)"
              keyboardType="numeric"
              value={form.discount}
              onChangeText={discount => setForm(f => ({ ...f, discount }))}
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

export default SellerVouchers;
