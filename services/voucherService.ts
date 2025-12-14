import { fetchWithAuth } from './api';

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface GetAvailableVouchersParams {
  shopId: number;
  productIds: number[];
  cartTotal: number;
}

export interface ApplyVoucherParams {
  voucherCode: string;
  productIds: number[];
  cartTotal: number;
}

export interface VoucherApplicationResult {
  voucher: Voucher;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
}

/**
 * Áp dụng voucher cho đơn hàng (tăng usedCount)
 */
export async function applyVoucher(params: ApplyVoucherParams): Promise<VoucherApplicationResult> {
  try {
    const { voucherCode, productIds, cartTotal } = params;
    
    const response = await fetchWithAuth<any>('/seller/vouchers/apply', {
      method: 'POST',
      body: JSON.stringify({
        voucherCode,
        productIds,
        cartTotal,
      }),
    });
    
    return response.data || response;
  } catch (error) {
    console.error('Error applying voucher:', error);
    throw error;
  }
}

/**
 * Lấy danh sách voucher còn hoạt động theo shop và sản phẩm
 */
export async function getAvailableVouchers(params: GetAvailableVouchersParams): Promise<Voucher[]> {
  try {
    const { shopId, productIds, cartTotal } = params;
    const productIdsString = Array.isArray(productIds) ? productIds.join(',') : productIds;
    
    const queryParams = new URLSearchParams({
      shopId: shopId.toString(),
      productIds: productIdsString,
      cartTotal: cartTotal.toString(),
    });
    
    const response = await fetchWithAuth<any>(`/seller/vouchers/available?${queryParams.toString()}`);
    return response.data || response || [];
  } catch (error) {
    console.error('Error fetching available vouchers:', error);
    throw error;
  }
}

/**
 * Tính toán số tiền giảm giá từ voucher
 */
export function calculateVoucherDiscount(
  voucher: Voucher,
  orderTotal: number
): number {
  // Kiểm tra đơn hàng có đủ giá trị tối thiểu
  if (orderTotal < voucher.minOrderValue) {
    return 0;
  }

  let discount = 0;

  if (voucher.discountType === 'PERCENTAGE') {
    discount = (orderTotal * voucher.discountValue) / 100;
    // Giới hạn giảm giá tối đa nếu có
    if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
      discount = voucher.maxDiscountAmount;
    }
  } else {
    // FIXED_AMOUNT
    discount = voucher.discountValue;
  }

  return Math.min(discount, orderTotal); // Không giảm quá tổng đơn hàng
}
