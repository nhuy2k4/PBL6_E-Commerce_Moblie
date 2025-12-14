import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Voucher } from '@/services/voucherService';
import { formatPrice } from './checkoutUtils';

interface VoucherSectionProps {
  selectedVoucher: Voucher | null;
  onSelectVoucher: (voucher: Voucher | null) => void;
  orderTotal: number;
  shopId: number;
  productIds: number[];
}

export const VoucherSection: React.FC<VoucherSectionProps> = ({
  selectedVoucher,
  onSelectVoucher,
  orderTotal,
  shopId,
  productIds,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectVoucher = (voucher: Voucher) => {
    onSelectVoucher(voucher);
    setModalVisible(false);
  };

  const handleRemoveVoucher = () => {
    onSelectVoucher(null);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mã giảm giá</Text>

      <TouchableOpacity
        style={styles.voucherButton}
        onPress={() => setModalVisible(true)}
      >
        {selectedVoucher ? (
          <View style={styles.selectedVoucherContainer}>
            <View style={styles.voucherIcon}>
              <Text style={styles.voucherIconText}>🎫</Text>
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherCode}>{selectedVoucher.code}</Text>
              <Text style={styles.voucherName}>{selectedVoucher.name}</Text>
            </View>
            <TouchableOpacity
              onPress={handleRemoveVoucher}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noVoucherContainer}>
            <Text style={styles.noVoucherText}>Chọn mã giảm giá</Text>
            <Text style={styles.arrowText}>›</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal chọn voucher */}
      <VoucherModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectVoucher={handleSelectVoucher}
        orderTotal={orderTotal}
        selectedVoucherId={selectedVoucher?.id}
        shopId={shopId}
        productIds={productIds}
      />
    </View>
  );
};

interface VoucherModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVoucher: (voucher: Voucher) => void;
  orderTotal: number;
  selectedVoucherId?: number;
  shopId: number;
  productIds: number[];
}

const VoucherModal: React.FC<VoucherModalProps> = ({
  visible,
  onClose,
  onSelectVoucher,
  orderTotal,
  selectedVoucherId,
  shopId,
  productIds,
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  // Load vouchers khi modal mở
  React.useEffect(() => {
    if (visible) {
      loadVouchers();
    }
  }, [visible, shopId, productIds, orderTotal]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const { getAvailableVouchers } = require('@/services/voucherService');
      const data = await getAvailableVouchers({
        shopId,
        productIds,
        cartTotal: orderTotal,
      });
      setVouchers(data);
      console.log('📦 Loaded vouchers:', data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const renderVoucherItem = ({ item }: { item: Voucher }) => {
    const isEligible = orderTotal >= item.minOrderValue;
    const isSelected = item.id === selectedVoucherId;

    return (
      <TouchableOpacity
        style={[
          styles.voucherItem,
          !isEligible && styles.voucherItemDisabled,
          isSelected && styles.voucherItemSelected,
        ]}
        onPress={() => isEligible && onSelectVoucher(item)}
        disabled={!isEligible}
      >
        <View style={styles.voucherItemLeft}>
          <View style={styles.voucherBadge}>
            <Text style={styles.voucherBadgeText}>🎫</Text>
          </View>
          <View style={styles.voucherItemInfo}>
            <Text style={[styles.voucherItemCode, !isEligible && styles.disabledText]}>
              {item.code}
            </Text>
            <Text style={[styles.voucherItemName, !isEligible && styles.disabledText]}>
              {item.name}
            </Text>
            <Text style={styles.voucherItemDesc}>
              {item.discountType === 'PERCENTAGE'
                ? `Giảm ${item.discountValue}%${
                    item.maxDiscountAmount
                      ? ` (tối đa ${formatPrice(item.maxDiscountAmount)})`
                      : ''
                  }`
                : `Giảm ${formatPrice(item.discountValue)}`}
            </Text>
            <Text style={styles.voucherItemMinOrder}>
              Đơn tối thiểu: {formatPrice(item.minOrderValue)}
            </Text>
            {!isEligible && (
              <Text style={styles.ineligibleText}>
                Không đủ điều kiện áp dụng
              </Text>
            )}
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn mã giảm giá</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Đang tải voucher...</Text>
            </View>
          ) : vouchers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có voucher khả dụng</Text>
            </View>
          ) : (
            <FlatList
              data={vouchers}
              renderItem={renderVoucherItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.voucherList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  voucherButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 16,
  },
  selectedVoucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  voucherIconText: {
    fontSize: 20,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 2,
  },
  voucherName: {
    fontSize: 13,
    color: '#666',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noVoucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noVoucherText: {
    fontSize: 14,
    color: '#666',
  },
  arrowText: {
    fontSize: 20,
    color: '#CCC',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  voucherList: {
    padding: 16,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  voucherItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9F9F9',
  },
  voucherItemSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  voucherItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  voucherBadge: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  voucherBadgeText: {
    fontSize: 24,
  },
  voucherItemInfo: {
    flex: 1,
  },
  voucherItemCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  voucherItemName: {
    fontSize: 13,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  voucherItemDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  voucherItemMinOrder: {
    fontSize: 11,
    color: '#999',
  },
  disabledText: {
    color: '#CCC',
  },
  ineligibleText: {
    fontSize: 11,
    color: '#FF6B6B',
    marginTop: 4,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
