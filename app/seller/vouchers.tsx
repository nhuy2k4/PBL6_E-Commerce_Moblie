import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { getSellerVouchers, deleteVoucher, createVoucher } from '@/services/sellerService';

type SellerVoucher = {
  id: number;
  code: string;
  description: string;
  shopId: number;
  shopName: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  applicableType: string;
  status: string;
  createdAt: string;
};

type VoucherForm = {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minOrderValue: string;
  maxDiscountAmount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  applicableType: 'ALL' | 'SPECIFIC_PRODUCTS' | 'SPECIFIC_USERS' | 'TOP_BUYERS';
};

const SellerVouchers = () => {
  const [vouchers, setVouchers] = useState<SellerVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<VoucherForm>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    applicableType: 'ALL',
  });

  const fetchVouchers = async (pageNum = 0) => {
    try {
      if (!refreshing) setLoading(true);
      const response = await getSellerVouchers(pageNum, 20);
      console.log('Fetched vouchers count:', response.vouchers.length);
      setVouchers(response.vouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVouchers(page);
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchVouchers(0);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa voucher này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVoucher(id);
            Alert.alert('Thành công', 'Đã xóa voucher');
            fetchVouchers(page);
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa voucher');
          }
        },
      },
    ]);
  };

  const openCreateModal = () => {
    // Set default dates
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    
    setForm({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '',
      maxDiscountAmount: '',
      startDate: today.toISOString().split('T')[0] + 'T00:00:00',
      endDate: endDate.toISOString().split('T')[0] + 'T23:59:59',
      usageLimit: '',
      applicableType: 'ALL',
    });
    setModalVisible(true);
  };

  const handleCreateVoucher = async () => {
    // Validation
    if (!form.code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
      return;
    }
    if (!form.description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả');
      return;
    }
    if (!form.discountValue || isNaN(Number(form.discountValue))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá trị giảm giá hợp lệ');
      return;
    }
    // Validate % range
    if (form.discountType === 'PERCENTAGE') {
      const percentValue = Number(form.discountValue);
      if (percentValue <= 0 || percentValue > 100) {
        Alert.alert('Lỗi', 'Giá trị phần trăm phải từ 1-100');
        return;
      }
      if (!form.maxDiscountAmount || isNaN(Number(form.maxDiscountAmount))) {
        Alert.alert('Lỗi', 'Vui lòng nhập giảm giá tối đa khi dùng %');
        return;
      }
    }
    if (!form.minOrderValue || isNaN(Number(form.minOrderValue))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá trị đơn hàng tối thiểu hợp lệ');
      return;
    }
    if (!form.usageLimit || isNaN(Number(form.usageLimit))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giới hạn sử dụng hợp lệ');
      return;
    }

    try {
      setCreating(true);
      const voucherData = {
        code: form.code.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: Number(form.usageLimit),
        applicableType: form.applicableType,
      };

      console.log('Creating voucher:', voucherData);
      await createVoucher(voucherData);
      Alert.alert('Thành công', 'Đã tạo voucher mới');
      setModalVisible(false);
      fetchVouchers(page);
    } catch (error: any) {
      console.error('Create voucher error:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo voucher');
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Không giới hạn';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'EXPIRED':
        return '#F44336';
      case 'UPCOMING':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'EXPIRED':
        return 'Đã hết hạn';
      case 'UPCOMING':
        return 'Sắp diễn ra';
      default:
        return status;
    }
  };

  const renderVoucher = ({ item }: { item: SellerVoucher }) => (
    <View style={styles.voucherCard}>
      <View style={styles.voucherHeader}>
        <Text style={styles.voucherCode}>{item.code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.voucherDescription}>{item.description}</Text>

      <View style={styles.voucherInfo}>
        <Text style={styles.label}>Loại giảm giá:</Text>
        <Text style={styles.value}>
          {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : formatCurrency(item.discountValue)}
        </Text>
      </View>

      <View style={styles.voucherInfo}>
        <Text style={styles.label}>Đơn tối thiểu:</Text>
        <Text style={styles.value}>{formatCurrency(item.minOrderValue)}</Text>
      </View>

      <View style={styles.voucherInfo}>
        <Text style={styles.label}>Giảm tối đa:</Text>
        <Text style={styles.value}>{formatCurrency(item.maxDiscountAmount)}</Text>
      </View>

      <View style={styles.voucherInfo}>
        <Text style={styles.label}>Thời gian:</Text>
        <Text style={styles.value}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
      </View>

      <View style={styles.voucherInfo}>
        <Text style={styles.label}>Đã dùng/Giới hạn:</Text>
        <Text style={styles.value}>
          {item.usedCount}/{item.usageLimit}
        </Text>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Text style={styles.addButtonText}>+ Tạo Voucher Mới</Text>
      </TouchableOpacity>

      <FlatList
        data={vouchers}
        renderItem={renderVoucher}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
            <Text style={styles.emptySubText}>Tạo voucher để thu hút khách hàng</Text>
          </View>
        }
      />

      {/* Create Voucher Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tạo Voucher Mới</Text>
            <TouchableOpacity onPress={handleCreateVoucher} disabled={creating}>
              <Text style={[styles.modalSaveText, creating && styles.modalSaveTextDisabled]}>
                {creating ? 'Đang tạo...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mã Voucher *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: SUMMER2025"
                value={form.code}
                onChangeText={(text) => setForm({ ...form, code: text.toUpperCase() })}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô Tả *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả về voucher"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại Giảm Giá *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setForm({ ...form, discountType: 'PERCENTAGE' })}
                >
                  <View style={[styles.radio, form.discountType === 'PERCENTAGE' && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>Phần trăm (%)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setForm({ ...form, discountType: 'FIXED_AMOUNT' })}
                >
                  <View style={[styles.radio, form.discountType === 'FIXED_AMOUNT' && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>Số tiền cố định (₫)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {form.discountType === 'PERCENTAGE' ? 'Giá Trị Giảm * (%)' : 'Giá Trị Giảm * (₫)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={form.discountType === 'PERCENTAGE' ? 'VD: 20 (cho 20%)' : 'VD: 50000 (cho 50k)'}
                value={form.discountValue}
                onChangeText={(text) => setForm({ ...form, discountValue: text })}
                keyboardType="numeric"
              />
              {form.discountType === 'PERCENTAGE' && (
                <Text style={styles.formHint}>Nhập số từ 1-100</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá Trị Đơn Hàng Tối Thiểu * (₫)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 100000"
                value={form.minOrderValue}
                onChangeText={(text) => setForm({ ...form, minOrderValue: text })}
                keyboardType="numeric"
              />
            </View>

            {form.discountType === 'PERCENTAGE' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giảm Giá Tối Đa * (₫)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 50000 (giảm tối đa 50k)"
                  value={form.maxDiscountAmount}
                  onChangeText={(text) => setForm({ ...form, maxDiscountAmount: text })}
                  keyboardType="numeric"
                />
                <Text style={styles.formHint}>Bắt buộc khi dùng giảm theo %</Text>
              </View>
            )}


            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ngày Bắt Đầu * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 2025-12-01"
                value={form.startDate.split('T')[0]}
                onChangeText={(text) => setForm({ ...form, startDate: text + 'T00:00:00' })}
              />
              <Text style={styles.formHint}>Format: 2025-12-01</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ngày Kết Thúc * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 2025-12-31"
                value={form.endDate.split('T')[0]}
                onChangeText={(text) => setForm({ ...form, endDate: text + 'T23:59:59' })}
              />
              <Text style={styles.formHint}>Format: 2025-12-31</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giới Hạn Sử Dụng *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 100"
                value={form.usageLimit}
                onChangeText={(text) => setForm({ ...form, usageLimit: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại Áp Dụng *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setForm({ ...form, applicableType: 'ALL' })}
                >
                  <View style={[styles.radio, form.applicableType === 'ALL' && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>Tất cả</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setForm({ ...form, applicableType: 'SPECIFIC_PRODUCTS' })}
                >
                  <View style={[styles.radio, form.applicableType === 'SPECIFIC_PRODUCTS' && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>Sản phẩm cụ thể</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setForm({ ...form, applicableType: 'SPECIFIC_USERS' })}
                >
                  <View style={[styles.radio, form.applicableType === 'SPECIFIC_USERS' && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>Khách hàng cụ thể</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setForm({ ...form, applicableType: 'TOP_BUYERS' })}
                >
                  <View style={[styles.radio, form.applicableType === 'TOP_BUYERS' && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>Khách hàng VIP</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.formHint}>Chọn phạm vi áp dụng voucher</Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  voucherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  voucherDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  voucherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalSaveTextDisabled: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default SellerVouchers;
