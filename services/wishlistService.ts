// Shared wishlist service
import { fetchWithAuth } from './api';

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  addedAt: string;
}

/**
 * Get wishlist
 */
export async function getWishlist(): Promise<WishlistItem[]> {
  return fetchWithAuth<WishlistItem[]>('/wishlist', '', {
    method: 'GET',
  });
}

/**
 * Add to wishlist
 */
export async function addToWishlist(productId: number): Promise<WishlistItem> {
  return fetchWithAuth<WishlistItem>('/wishlist', '', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

/**
 * Remove from wishlist
 */
export async function removeFromWishlist(productId: number): Promise<void> {
  return fetchWithAuth<void>(`/wishlist/${productId}`, '', {
    method: 'DELETE',
  });
}

/**
 * Toggle wishlist (add if not exists, remove if exists)
 */
export async function toggleWishlist(productId: number): Promise<{ isInWishlist: boolean }> {
  return fetchWithAuth<{ isInWishlist: boolean }>('/wishlist/toggle', '', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: number): Promise<boolean> {
  const wishlist = await getWishlist();
  return wishlist.some(item => item.productId === productId);
}
