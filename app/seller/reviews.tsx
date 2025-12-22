import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review, getShopReviews, replyToReview } from '../../services/reviewService';
import { Colors } from '../../constants/theme';

type TabType = 'all' | 'replied' | 'unreplied';
type RatingFilter = 'all' | '1-2' | '3-4' | '5';

export default function SellerReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<{ replied: Review[]; unreplied: Review[] }>({
    replied: [],
    unreplied: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [replyModal, setReplyModal] = useState<{ visible: boolean; review: Review | null }>({
    visible: false,
    review: null,
  });
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageModal, setImageModal] = useState<{ visible: boolean; images: string[]; index: number }>({
    visible: false,
    images: [],
    index: 0,
  });

  const loadReviews = useCallback(async () => {
    try {
      const data = await getShopReviews();
      setReviews(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách đánh giá');
      setReviews({ replied: [], unreplied: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReviews();
  }, [loadReviews]);

  const filterByRating = useCallback((reviewsList: Review[]) => {
    if (ratingFilter === 'all') return reviewsList;

    return reviewsList.filter(review => {
      if (ratingFilter === '1-2') return review.rating >= 1 && review.rating <= 2;
      if (ratingFilter === '3-4') return review.rating >= 3 && review.rating <= 4;
      if (ratingFilter === '5') return review.rating === 5;
      return true;
    });
  }, [ratingFilter]);

  const filteredReviews = useMemo(() => {
    let allReviews: Review[] = [];

    switch (activeTab) {
      case 'replied':
        allReviews = reviews.replied;
        break;
      case 'unreplied':
        allReviews = reviews.unreplied;
        break;
      default:
        allReviews = [...reviews.replied, ...reviews.unreplied];
    }

    return filterByRating(allReviews);
  }, [activeTab, reviews, filterByRating]);

  const getCountByRating = useCallback((ratingRange: RatingFilter) => {
    const allReviews = [...reviews.replied, ...reviews.unreplied];

    if (ratingRange === 'all') return allReviews.length;

    return allReviews.filter(review => {
      if (ratingRange === '1-2') return review.rating >= 1 && review.rating <= 2;
      if (ratingRange === '3-4') return review.rating >= 3 && review.rating <= 4;
      if (ratingRange === '5') return review.rating === 5;
      return true;
    }).length;
  }, [reviews]);

  const handleReply = useCallback((review: Review) => {
    setReplyModal({ visible: true, review });
    setReplyText(review.sellerResponse || '');
  }, []);

  const submitReply = useCallback(async () => {
    if (!replyModal.review || !replyText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung phản hồi');
      return;
    }

    setSubmitting(true);
    try {
      await replyToReview(replyModal.review.id, replyText.trim());
      Alert.alert('Thành công', 'Đã gửi phản hồi thành công');
      setReplyModal({ visible: false, review: null });
      setReplyText('');
      loadReviews();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi phản hồi');
    } finally {
      setSubmitting(false);
    }
  }, [replyModal, replyText, loadReviews]);

  const openImageModal = useCallback((images: string[], index: number) => {
    setImageModal({ visible: true, images, index });
  }, []);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFB800' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const renderReviewCard = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: review.userAvatarUrl || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{review.userFullName}</Text>
          <View style={styles.ratingRow}>
            {renderStars(review.rating)}
            <Text style={styles.dateText}>
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Image source={{ uri: review.productImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {review.productName}
          </Text>
          {review.variantInfo && (
            <Text style={styles.variantInfo}>{review.variantInfo}</Text>
          )}
        </View>
      </View>

      {/* Comment */}
      {review.comment && (
        <Text style={styles.comment}>{review.comment}</Text>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {review.images.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => openImageModal(review.images, idx)}
            >
              <Image source={{ uri: img }} style={styles.reviewImage} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Seller Response */}
      {review.sellerResponse && (
        <View style={styles.sellerResponse}>
          <View style={styles.sellerHeader}>
            <Ionicons name="storefront" size={16} color={Colors.light.primary} />
            <Text style={styles.sellerLabel}>Phản hồi của shop</Text>
          </View>
          <Text style={styles.sellerText}>{review.sellerResponse}</Text>
          {review.sellerResponseDate && (
            <Text style={styles.responseDate}>
              {new Date(review.sellerResponseDate).toLocaleDateString('vi-VN')}
            </Text>
          )}
        </View>
      )}

      {/* Reply Button */}
      {/* <TouchableOpacity
        style={styles.replyButton}
        onPress={() => handleReply(review)}
      >
        <Ionicons name="chatbox-outline" size={18} color={Colors.light.primary} />
        <Text style={styles.replyButtonText}>
          {review.sellerResponse ? 'Chỉnh sửa phản hồi' : 'Phản hồi'}
        </Text>
      </TouchableOpacity> */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reviews.unreplied.length}</Text>
          <Text style={styles.statLabel}>Chưa phản hồi</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={styles.statNumber}>{reviews.replied.length}</Text>
          <Text style={styles.statLabel}>Đã phản hồi</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả ({reviews.replied.length + reviews.unreplied.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unreplied' && styles.activeTab]}
          onPress={() => setActiveTab('unreplied')}
        >
          <Text style={[styles.tabText, activeTab === 'unreplied' && styles.activeTabText]}>
            Chưa phản hồi ({reviews.unreplied.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'replied' && styles.activeTab]}
          onPress={() => setActiveTab('replied')}
        >
          <Text style={[styles.tabText, activeTab === 'replied' && styles.activeTabText]}>
            Đã phản hồi ({reviews.replied.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}contentContainerStyle={styles.filterContainer}>
        {(['all', '5', '3-4', '1-2'] as RatingFilter[]).map(filter => (
  <TouchableOpacity
    key={filter}
    style={[
      styles.filterChip,
      ratingFilter === filter && styles.activeFilterChip,
    ]}
    onPress={() => setRatingFilter(filter)}
    activeOpacity={0.8}
  >
    <Text
      style={[
        styles.filterText,
        ratingFilter === filter && styles.activeFilterText,
      ]}
    >
      {filter === 'all'
        ? `Tất cả (${getCountByRating('all')})`
        : filter === '5'
        ? `⭐ 5 (${getCountByRating('5')})`
        : filter === '3-4'
        ? `⭐ 3-4 (${getCountByRating('3-4')})`
        : `⭐ 1-2 (${getCountByRating('1-2')})`}
    </Text>
  </TouchableOpacity>
))}
      </ScrollView>

      {/* Reviews List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredReviews.length > 0 ? (
          filteredReviews.map(renderReviewCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbox-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={replyModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplyModal({ visible: false, review: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phản hồi đánh giá</Text>
              <TouchableOpacity onPress={() => setReplyModal({ visible: false, review: null })}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {replyModal.review && (
              <View style={styles.reviewPreview}>
                <View style={styles.previewRating}>{renderStars(replyModal.review.rating)}</View>
                <Text style={styles.previewComment} numberOfLines={3}>
                  {replyModal.review.comment}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.replyInput}
              placeholder="Nhập phản hồi của bạn..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReplyModal({ visible: false, review: null })}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={submitReply}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi phản hồi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={imageModal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setImageModal({ visible: false, images: [], index: 0 })}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setImageModal({ visible: false, images: [], index: 0 })}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {imageModal.images.length > 0 && (
            <Image
              source={{ uri: imageModal.images[imageModal.index] }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          {imageModal.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {imageModal.index + 1} / {imageModal.images.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#fff',
},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#374151',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  scrollView: {
    // flex: 1,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  productInfo: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  variantInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  comment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E5E7EB',
  },
  sellerResponse: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 6,
  },
  sellerText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  responseDate: {
    fontSize: 11,
    color: '#A16207',
    marginTop: 6,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
  },
  replyButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  reviewPreview: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewRating: {
    marginBottom: 8,
  },
  previewComment: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: '90%',
    height: '70%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
