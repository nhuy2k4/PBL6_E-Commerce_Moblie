import { buildUrl, fetchJsonWithAuth } from '../utils/api';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Refund service - synced with Web API
 */

export interface CreateRefundPayload {
  orderId: number;
  amount: number;
  description: string;
  imageUrl: string; // JSON array string of image URLs
}

export interface RefundDTO {
  id: number;
  orderId: number;
  status: string;
  amount: number;
  description: string;
  imageUrl: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create refund request for an order
 * POST /api/refund/request/{orderId}
 */
export async function createRefund(payload: CreateRefundPayload) {
  try {
    const { orderId, ...data } = payload;
    const url = buildUrl(API_ENDPOINTS.REFUND.CREATE(orderId));
    
    console.log('📤 Sending refund request to:', url);
    console.log('📤 Request data:', data);
    
    const response = await fetchJsonWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('✅ Refund response:', response);
    return response.data || response;
  } catch (error: any) {
    console.error('❌ Create refund error:', error);
    throw error;
  }
}

/**
 * Get buyer's refund requests
 * GET /api/refund/my-requests
 */
export async function getMyRefundRequests(): Promise<RefundDTO[]> {
  const url = buildUrl(API_ENDPOINTS.REFUND.MY_REQUESTS);
  const response = await fetchJsonWithAuth(url);
  return response.data;
}

/**
 * Get refund detail by ID
 * GET /api/refund/{refundId}
 */
export async function getRefundDetail(refundId: number): Promise<RefundDTO> {
  const url = buildUrl(API_ENDPOINTS.REFUND.DETAIL(refundId));
  const response = await fetchJsonWithAuth(url);
  return response.data;
}

/**
 * Get refund by ID (alias for getRefundDetail)
 */
export async function getRefundById(refundId: number): Promise<RefundDTO> {
  return getRefundDetail(refundId);
}

/**
 * Mark refund as returning (buyer sent the product back)
 * POST /api/refund/{refundId}/mark-returning
 */
export async function markAsReturning(refundId: number) {
  const url = buildUrl(API_ENDPOINTS.REFUND.MARK_RETURNING(refundId));
  const response = await fetchJsonWithAuth(url, { method: 'POST' });
  return response.data;
}
