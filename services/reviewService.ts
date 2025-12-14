import { fetchPublic } from '../utils/fetch';
import { API_CONFIG } from '../constants/config';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  sellerResponse: string | null;
  sellerResponseDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  userFullName: string;
  userAvatarUrl: string | null;
  productId: number;
  productName: string;
  productImage: string;
  variantInfo: string;
  orderId: number;
  purchaseDate: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  canEdit: boolean;
  editCount: number;
  daysRemainingToEdit: number;
}

export interface ReviewsResponse {
  content: Review[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: number,
  page: number = 0,
  size: number = 10
): Promise<ReviewsResponse> {
  try {
    const response = await fetchPublic<ReviewsResponse>(
      `products/${productId}/reviews?page=${page}&size=${size}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

/**
 * Get average rating and stats for a product
 */
export async function getProductRatingStats(productId: number): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}> {
  try {
    const response = await fetchPublic<any>(
      `products/${productId}/reviews/stats`
    );
    return response;
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {},
    };
  }
}

/**
 * Check if user can review a product
 */
export async function checkReviewEligibility(productId: number): Promise<{
  canReview: boolean;
  hasReviewed: boolean;
  hasPurchased: boolean;
  message?: string;
}> {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      return {
        canReview: false,
        hasReviewed: false,
        hasPurchased: false,
        message: 'Vui lòng đăng nhập',
      };
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}products/${productId}/review-eligibility`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check review eligibility');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return {
      canReview: false,
      hasReviewed: false,
      hasPurchased: false,
      message: 'Không thể kiểm tra trạng thái đánh giá',
    };
  }
}

/**
 * Create a review for a product
 */
export async function createReview(productId: number, data: {
  rating: number;
  comment: string;
  images?: string[];
}): Promise<any> {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để đánh giá');
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}products/${productId}/reviews`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo đánh giá');
    }

    const result = await response.json();
    console.log('✅ createReview response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating review:', error);
    throw error;
  }
}

/**
 * Upload review images (before creating review)
 */
export async function uploadReviewImages(formData: FormData): Promise<any> {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để tải ảnh');
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}reviews/images/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tải lên hình ảnh');
    }

    const result = await response.json();
    console.log('✅ uploadReviewImages response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error uploading review images:', error);
    throw error;
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
