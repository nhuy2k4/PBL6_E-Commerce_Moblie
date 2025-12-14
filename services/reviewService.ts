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
