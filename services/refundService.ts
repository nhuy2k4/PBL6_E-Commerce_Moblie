import { buildUrl, fetchJsonWithAuth } from '../utils/api';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Refund service - minimal endpoints scaffold
 */

export interface CreateRefundPayload {
  orderId: number;
  items: Array<{ cartItemId?: number; productId?: number; variantId?: number; quantity: number }>;
  reason: string;
  detail?: string;
  refundMethod?: string; // e.g. 'ORIGINAL', 'WALLET', 'BANK_TRANSFER'
  bankInfo?: any;
  attachments?: string[]; // array of uploaded file URLs
}

export async function createRefund(payload: CreateRefundPayload) {
  const url = buildUrl(API_ENDPOINTS.REFUND.CREATE);
  const response = await fetchJsonWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function getRefundsByOrder(orderId: number) {
  const url = buildUrl(API_ENDPOINTS.REFUND.BY_ORDER, orderId);
  const response = await fetchJsonWithAuth(url);
  return response.data;
}

export async function getRefundDetail(refundId: number) {
  const url = buildUrl(API_ENDPOINTS.REFUND.DETAIL, refundId);
  const response = await fetchJsonWithAuth(url);
  return response.data;
}

export async function cancelRefund(refundId: number) {
  const url = buildUrl(API_ENDPOINTS.REFUND.CANCEL, refundId);
  const response = await fetchJsonWithAuth(url, { method: 'POST' });
  return response.data;
}
