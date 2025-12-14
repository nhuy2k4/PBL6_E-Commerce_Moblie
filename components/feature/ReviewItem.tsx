import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../services/reviewService';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ReviewItemProps {
  review: Review;
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showFullComment, setShowFullComment] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFA500"
          />
        ))}
      </View>
    );
  };

  const commentText = review.comment || '';
  const shouldTruncate = commentText.length > 150;
  const displayComment = shouldTruncate && !showFullComment
    ? commentText.slice(0, 150) + '...'
    : commentText;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.userAvatarUrl ? (
            <Image
              source={{ uri: review.userAvatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {review.userFullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {review.userFullName || review.userName}
              </Text>
              {review.verifiedPurchase && (
                <View style={styles.verifiedBadgeInline}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Đã mua hàng</Text>
                </View>
              )}
            </View>
            {renderStars(review.rating)}
            <Text style={[styles.date, { color: colors.subText }]}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Variant Info */}
      {review.variantInfo && (
        <Text style={[styles.variantInfo, { color: colors.subText }]}>
          Phân loại: {review.variantInfo}
        </Text>
      )}

      {/* Comment */}
      {commentText && (
        <View style={styles.commentSection}>
          <Text style={[styles.comment, { color: colors.text }]}>
            {displayComment}
          </Text>
          {shouldTruncate && (
            <TouchableOpacity
              onPress={() => setShowFullComment(!showFullComment)}
            >
              <Text style={styles.seeMore}>
                {showFullComment ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
        >
          {review.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}

      {/* Seller Response */}
      {review.sellerResponse && (
        <View style={styles.sellerResponseContainer}>
          <View style={styles.sellerResponseHeader}>
            <Text style={styles.sellerResponseTitle}>Phản hồi từ người bán</Text>
            <Text style={[styles.sellerResponseDate, { color: colors.subText }]}>
              {formatDate(review.sellerResponseDate || '')}
            </Text>
          </View>
          <Text style={[styles.sellerResponseText, { color: colors.text }]}>
            {review.sellerResponse}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name={review.isLikedByCurrentUser ? 'heart' : 'heart-outline'}
            size={18}
            color={review.isLikedByCurrentUser ? '#FF6B35' : '#666'}
          />
          <Text style={styles.actionText}>
            {review.likesCount > 0 ? review.likesCount : 'Thích'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  verifiedBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  variantInfo: {
    fontSize: 12,
    marginBottom: 8,
  },
  commentSection: {
    marginBottom: 12,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
  seeMore: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '500',
    marginTop: 4,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  sellerResponseContainer: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  sellerResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sellerResponseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  sellerResponseDate: {
    fontSize: 11,
  },
  sellerResponseText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#666',
  },
});
