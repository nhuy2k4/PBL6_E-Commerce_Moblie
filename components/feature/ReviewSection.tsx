import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProductReviews, Review } from '../../services/reviewService';
import ReviewItem from './ReviewItem';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ReviewSectionProps {
  productId: number;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
  const [ratingCounts, setRatingCounts] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadReviews();
  }, [productId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getProductReviews(productId, page, 10);
      
      if (page === 0) {
        setReviews(response.content);
        
        // Calculate rating counts and average from all reviews
        const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;
        
        response.content.forEach(review => {
          counts[review.rating] = (counts[review.rating] || 0) + 1;
          totalRating += review.rating;
        });
        
        setRatingCounts(counts);
        if (response.content.length > 0) {
          setAverageRating(totalRating / response.content.length);
        }
      } else {
        setReviews(prev => [...prev, ...response.content]);
      }
      
      setTotalPages(response.page.totalPages);
      setTotalReviews(response.page.totalElements);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (page < totalPages - 1) {
      setPage(prev => prev + 1);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={20}
            color="#FFA500"
          />
        ))}
      </View>
    );
  };

  const filterButtons = [
    { label: 'Tất cả', value: 'all' as const },
    { label: '5★', value: 5 as const },
    { label: '4★', value: 4 as const },
    { label: '3★', value: 3 as const },
    { label: '2★', value: 2 as const },
    { label: '1★', value: 1 as const },
  ];

  if (loading && page === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Đánh giá sản phẩm
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Đánh giá sản phẩm
        </Text>
      </View>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <View style={[styles.ratingSummary, { backgroundColor: colors.card }]}>
          <View style={styles.ratingLeft}>
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingNumber, { color: '#FFA500' }]}>
                {averageRating.toFixed(1)}
              </Text>
              <Text style={styles.starSymbol}>★</Text>
            </View>
            <Text style={[styles.totalReviews, { color: colors.subText }]}>
              ({totalReviews} đánh giá)
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Đánh giá sản phẩm tại mục Đơn hàng sau khi nhận hàng
          </Text>
        </View>
      )}

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterButtons.map((button) => {
          const count = button.value === 'all' ? totalReviews : (ratingCounts[button.value] || 0);
          const showCount = button.value !== 'all' && count > 0;
          
          return (
            <TouchableOpacity
              key={button.value}
              style={[
                styles.filterButton,
                selectedFilter === button.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(button.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === button.value && styles.filterButtonTextActive,
                ]}
              >
                {button.label}{showCount ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            Chưa có đánh giá nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews.filter(r => selectedFilter === 'all' || r.rating === selectedFilter)}
          renderItem={({ item }) => <ReviewItem review={item} />}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 0 ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  starSymbol: {
    fontSize: 24,
    color: '#FFA500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  ratingSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
