import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getSportyPayWallet, 
  getSportyPayTransactions, 
  depositToSportyPay,
  withdrawFromSportyPay,
  SportyPayWallet,
  SportyPayTransaction 
} from '../../services/sportyPayService';

export const options = { headerShown: false };

/**
 * Convert MoMo web payment URL to deep link for direct app opening
 */
const convertToMoMoDeepLink = (webUrl: string): string => {
  try {
    // If already a deep link, return as is
    if (webUrl.startsWith('momo://') || webUrl.startsWith('partnerapp://')) {
      return webUrl;
    }
    
    // Try to construct MoMo deep link
    // Format: momo://app or open web URL and let MoMo handle it
    // For now, return original URL as MoMo should handle universal links
    return webUrl;
  } catch (error) {
    console.error('Error converting to deep link:', error);
    return webUrl;
  }
};

const SportyPayScreen = () => {
  const [wallet, setWallet] = useState<SportyPayWallet | null>(null);
  const [transactions, setTransactions] = useState<SportyPayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Listen for deep link when screen is focused (user returns from MoMo)
  useFocusEffect(
    useCallback(() => {
      const handlePaymentResult = (event: { url: string }) => {
        const url = event.url;
        console.log('🔗 SportyPay received deep link:', url);
        
        if (url.includes('payment-result')) {
          // Reload wallet when returning from payment
          console.log('💰 Reloading wallet after payment...');
          setTimeout(() => loadWalletData(), 1000);
        }
      };

      const subscription = Linking.addEventListener('url', handlePaymentResult);
      
      // Also reload on screen focus
      loadWalletData();

      return () => {
        subscription?.remove();
      };
    }, [])
  );

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionData] = await Promise.all([
        getSportyPayWallet(),
        getSportyPayTransactions()
      ]);
      setWallet(walletData);
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      // Mock data for demo
      setWallet({
        id: 1,
        userId: 1,
        balance: 250000,
        currency: 'VND',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setTransactions([
        {
          id: 1,
          walletId: 1,
          type: 'DEPOSIT',
          amount: 100000,
          description: 'Nạp tiền vào ví',
          status: 'COMPLETED',
          createdAt: '2024-11-28T10:00:00Z'
        },
        {
          id: 2,
          walletId: 1,
          type: 'PAYMENT',
          amount: -50000,
          description: 'Thanh toán đơn hàng #123',
          status: 'COMPLETED',
          createdAt: '2024-11-27T15:30:00Z',
          orderId: 123
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setProcessing(true);
    setDepositModal(false);
    
    try {
      console.log('💰 Creating MoMo deposit payment for amount:', amount);
      const response = await depositToSportyPay(Number(amount));
      
      if (response?.payUrl) {
        console.log('🏦 Opening MoMo URL:', response.payUrl);
        
        try {
          // Convert to deep link if possible
          const paymentUrl = convertToMoMoDeepLink(response.payUrl);
          console.log('🔗 Converted URL:', paymentUrl);
          
          // Kiểm tra xem có MoMo app không
          const canOpenMoMo = await Linking.canOpenURL('momo://');
          
          if (canOpenMoMo) {
            // Có MoMo app - mở trực tiếp
            console.log('✅ MoMo app detected, opening directly');
            await Linking.openURL(paymentUrl);
            
            Alert.alert(
              'Đã chuyển sang MoMo',
              'Vui lòng hoàn tất thanh toán trên app MoMo.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setAmount('');
                  },
                },
              ]
            );
          } else {
            // Không có MoMo app - thông báo cài đặt
            console.log('⚠️ MoMo app not found');
            Alert.alert(
              'Cần cài đặt MoMo',
              'Bạn cần cài đặt app MoMo để thanh toán. Bạn có muốn mở trình duyệt?',
              [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Mở trình duyệt',
                  onPress: async () => {
                    await Linking.openURL(response.payUrl);
                    setAmount('');
                  },
                },
              ]
            );
          }
        } catch (linkError) {
          console.error('❌ Error opening MoMo:', linkError);
          // Fallback: mở browser với URL gốc
          const paymentUrl = convertToMoMoDeepLink(response.payUrl);
          await Linking.openURL(paymentUrl);
          setAmount('');
        }
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('❌ Deposit error:', error);
      Alert.alert('Lỗi', 'Không thể tạo giao dịch nạp tiền. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!bankAccount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại MoMo');
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(bankAccount)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.');
      return;
    }
    
    if (wallet && Number(amount) > wallet.balance) {
      Alert.alert(
        'Số dư không đủ',
        `Số dư hiện tại: ${wallet.balance.toLocaleString('vi-VN')} đ\nSố tiền muốn rút: ${Number(amount).toLocaleString('vi-VN')} đ`
      );
      return;
    }

    setProcessing(true);
    try {
      console.log('💰 Processing withdrawal:', amount, 'to MoMo:', bankAccount);
      const result = await withdrawFromSportyPay(Number(amount), bankAccount);
      
      Alert.alert(
        'Yêu cầu rút tiền thành công!',
        `Số tiền ${Number(amount).toLocaleString('vi-VN')} đ sẽ được chuyển vào tài khoản MoMo ${bankAccount}\n\nThời gian xử lý: ${result.estimatedTime || '1-3 ngày làm việc'}`,
        [{
          text: 'OK',
          onPress: () => {
            setWithdrawModal(false);
            setAmount('');
            setBankAccount('');
            loadWalletData();
          }
        }]
      );
    } catch (error: any) {
      console.error('❌ Withdrawal error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể rút tiền. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '📥';
      case 'WITHDRAW':
        return '📤';
      case 'PAYMENT':
        return '💳';
      case 'REFUND':
        return '🔄';
      default:
        return '💰';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
        return '#28a745';
      case 'WITHDRAW':
      case 'PAYMENT':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toLocaleString('vi-VN')} đ`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SportyPay</Text>
        <TouchableOpacity style={styles.historyButton}>
          <Ionicons name="time-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư SportyPay</Text>
          <Text style={styles.balanceAmount}>
            {wallet?.balance.toLocaleString('vi-VN') || '0'} đ
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setDepositModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Nạp tiền</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={() => setWithdrawModal(true)}
            >
              <Ionicons name="remove-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Rút tiền</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Tính năng</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="card" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.featureText}>Liên kết thẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.featureText}>Bảo hiểm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="gift" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.featureText}>Ưu đãi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="settings" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.featureText}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: getTransactionColor(transaction.type) }
                ]}>
                  {formatAmount(transaction.amount)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal visible={depositModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nạp tiền vào SportyPay</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tiền"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setDepositModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleDeposit}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Nạp tiền</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={withdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rút tiền từ SportyPay</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tiền"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại MoMo (VD: 0912345678)"
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setWithdrawModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleWithdraw}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Rút tiền</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 14,
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#212529',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SportyPayScreen;