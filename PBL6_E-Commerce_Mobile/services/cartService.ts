/**
 * Cart Service - Synced with Web
 * Service for shopping cart API calls
 */
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl, fetchJsonWithAuth } from '../utils/api';
import type { Cart } from '../types';

/**
 * Get current user's cart
 */
export async function getCart(): Promise<Cart> {
  const response = await fetchJsonWithAuth(buildUrl(API_ENDPOINTS.CART.GET));
  return response.data;
}

/**
 * Add product variant to cart
 * @param variantId - Product variant ID (sent as productId to backend)
 * @param quantity - Quantity to add
 */
export async function addToCart(variantId: number, quantity: number = 1): Promise<Cart> {
  const response = await fetchJsonWithAuth(buildUrl(API_ENDPOINTS.CART.ADD_ITEM), {
    method: 'POST',
    body: JSON.stringify({
      productId: variantId,
      quantity,
    }),
  });
  return response.data;
}

/**
 * Update cart item quantity
 * @param itemId - Cart item ID
 * @param quantity - New quantity (1-100)
 */
export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const response = await fetchJsonWithAuth(buildUrl(API_ENDPOINTS.CART.UPDATE_ITEM, itemId), {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return response.data;
}

/**
 * Remove item from cart
 * @param itemId - Cart item ID
 */
export async function removeFromCart(itemId: number): Promise<Cart> {
  const response = await fetchJsonWithAuth(buildUrl(API_ENDPOINTS.CART.REMOVE_ITEM, itemId), {
    method: 'DELETE',
  });
  return response.data;
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  await fetchJsonWithAuth(buildUrl(API_ENDPOINTS.CART.CLEAR), {
    method: 'DELETE',
  });
}

/**
 * Get cart items count
 */
export async function getCartCount(): Promise<number> {
  try {
    const cart = await getCart();
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
}

// Legacy aliases for compatibility
export const getCartItems = getCart;
export const fetchCart = getCart;
export const updateCartQuantity = updateCartItem;

