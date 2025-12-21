import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getRegistrationStatus, cancelRejectedApplication } from '@/services/sellerRegistrationService';

type RegistrationStatus = {
  shopName: string;
  status: string;
  statusDescription: string;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  shopPhone?: string;
  shopEmail?: string;
  idCardNumberMasked?: string;
  // Additional fields for editing
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  fullAddress?: string;
  provinceName?: string;
  provinceId?: number;
  districtName?: string;
  districtId?: number;
  wardName?: string;
  wardId?: number;
  contactName?: string;
  contactPhone?: string;
  idCardNumber?: string;
  idCardName?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  selfieWithIdUrl?: string;
};

const RegistrationStatusScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [canceling, setCanceling] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await getRegistrationStatus();
      // API may wrap payload as response.data.data or response.data
      const statusData = response?.data?.data || response?.data || response;
      setStatus(statusData);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log('📦 No registration found (404)');
        setStatus(null);
      } else {
        console.error('❌ Error loading status:', error);
        setStatus(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleEditRegistration = () => {
    // Navigate to register form with existing data for editing
    router.push({
      pathname: '/customer/register-seller',
      params: { editData: JSON.stringify(status) },
    });
  };

  const handleCancelAndResubmit = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy đơn đăng ký hiện tại để đăng ký lại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setCanceling(true);
            try {
              await cancelRejectedApplication();
              Alert.alert('Thành công', 'Đã hủy đơn đăng ký. Bạn có thể đăng ký lại.', [
                { text: 'OK', onPress: () => handleEditRegistration() },
              ]);
            } catch (error) {
              console.error('Error canceling:', error);
              Alert.alert('Lỗi', 'Không thể hủy đơn đăng ký');
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = () => {
    switch (status?.status) {
      case 'PENDING':
        return {
          color: '#FFA500',
          bgColor: '#FFF3E0',
          icon: '⏳',
          title: 'Đang chờ xét duyệt',
          description: 'Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.',
        };
      case 'REJECTED':
        return {
          color: '#F44336',
          bgColor: '#FFEBEE',
          icon: '❌',
          title: 'Đơn bị từ chối',
          description: 'Rất tiếc, đơn đăng ký của bạn không được chấp nhận.',
        };
      case 'ACTIVE':
      case 'APPROVED':
        return {
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          icon: '✅',
          title: 'Đã được duyệt',
          description: 'Chúc mừng! Bạn đã trở thành người bán trên SportZone.',
        };
      default:
        return {
          color: '#999',
          bgColor: '#F5F5F5',
          icon: '❓',
          title: 'Không tìm thấy',
          description: 'Không tìm thấy đơn đăng ký nào.',
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Trạng thái đăng ký</Text>
        </View>

        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn đăng ký</Text>
          <Text style={styles.emptyText}>Bạn chưa đăng ký trở thành người bán. Hãy bắt đầu ngay!</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/seller/register')}
          >
            <Text style={styles.primaryButtonText}>Đăng ký bán hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const config = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trạng thái đăng ký</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: config.bgColor }]}>
          <Text style={styles.statusIcon}>{config.icon}</Text>
          <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
          <Text style={styles.statusDescription}>{config.description}</Text>
        </View>

        {/* Rejection Reason */}
        {status.status === 'REJECTED' && status.rejectionReason && (
          <View style={styles.rejectionCard}>
            <View style={styles.rejectionHeader}>
              <Text style={styles.rejectionIcon}>⚠️</Text>
              <Text style={styles.rejectionTitle}>Lý do từ chối</Text>
            </View>
            <Text style={styles.rejectionText}>{status.rejectionReason}</Text>
            <View style={styles.rejectionGuide}>
              <Text style={styles.rejectionGuideIcon}>💡</Text>
              <Text style={styles.rejectionGuideText}>
                Vui lòng đọc kỹ lý do từ chối và chỉnh sửa thông tin theo yêu cầu. 
                Nhấn nút "Chỉnh sửa đơn đăng ký" bên dưới để cập nhật và gửi lại.
              </Text>
            </View>
          </View>
        )}

        {/* Application Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Thông tin đơn đăng ký</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tên shop:</Text>
            <Text style={styles.detailValue}>{status.shopName}</Text>
          </View>

          {status.submittedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày nộp:</Text>
              <Text style={styles.detailValue}>
                {new Date(status.submittedAt).toLocaleString('vi-VN')}
              </Text>
            </View>
          )}

          {status.reviewedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày xét duyệt:</Text>
              <Text style={styles.detailValue}>
                {new Date(status.reviewedAt).toLocaleString('vi-VN')}
              </Text>
            </View>
          )}

          {status.shopPhone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Điện thoại:</Text>
              <Text style={styles.detailValue}>{status.shopPhone}</Text>
            </View>
          )}

          {status.shopEmail && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{status.shopEmail}</Text>
            </View>
          )}

          {status.idCardNumberMasked && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CMND/CCCD:</Text>
              <Text style={styles.detailValue}>{status.idCardNumberMasked}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {status.status === 'REJECTED' && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleEditRegistration}
              >
                <Text style={styles.primaryButtonText}>✏️ Chỉnh sửa đơn đăng ký</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, canceling && styles.buttonDisabled]}
                onPress={handleCancelAndResubmit}
                disabled={canceling}
              >
                {canceling ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={styles.secondaryButtonText}>🗑️ Hủy và đăng ký mới</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {(status.status === 'ACTIVE' || status.status === 'APPROVED') && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/seller')}
            >
              <Text style={styles.primaryButtonText}>Vào Kênh Người bán →</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  rejectionCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rejectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  rejectionText: {
    fontSize: 15,
    color: '#C62828',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  rejectionGuide: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  rejectionGuideIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  rejectionGuideText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
});

export default RegistrationStatusScreen;
