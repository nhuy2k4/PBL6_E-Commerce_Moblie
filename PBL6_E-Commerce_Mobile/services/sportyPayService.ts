// SportyPay service - Electronic wallet similar to ShopeePay
import { fetchPrivate } from '../utils/fetch';

export interface SportyPayWallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SportyPayTransaction {
  id: number;
  walletId: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'REFUND';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  orderId?: number;
}

/**
 * Get SportyPay wallet info
 */
export async function getSportyPayWallet(): Promise<SportyPayWallet> {
  try {
    const response = await fetchPrivate('wallet');
    console.log('✅ getSportyPayWallet response:', response);
    const walletData = response.data || response;
    
    // Transform backend wallet to SportyPay format
    return {
      id: walletData.id,
      userId: walletData.userId || walletData.user?.id,
      balance: Number(walletData.balance || 0),
      currency: 'VND',
      isActive: true,
      createdAt: walletData.createdAt || new Date().toISOString(),
      updatedAt: walletData.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('⚠️ SportyPay backend not available, using mock data:', error);
    // Return mock wallet data for demo purposes
    return {
      id: 1,
      userId: 1,
      balance: 250000,
      currency: 'VND',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Get SportyPay transaction history
 */
export async function getSportyPayTransactions(page: number = 0, size: number = 20): Promise<SportyPayTransaction[]> {
  try {
    const response = await fetchPrivate(`wallet/transactions?page=${page}&size=${size}`);
    console.log('✅ getSportyPayTransactions response:', response);
    const transactions = response.data || response;
    
    // Transform backend transactions to SportyPay format
    return transactions.map((tx: any) => ({
      id: tx.id,
      walletId: tx.walletId || tx.wallet?.id,
      type: tx.transactionType || tx.type || 'PAYMENT',
      amount: Number(tx.amount || 0),
      description: tx.description || tx.note || 'Giao dịch',
      status: tx.status || 'COMPLETED',
      createdAt: tx.createdAt || new Date().toISOString(),
      orderId: tx.orderId
    }));
  } catch (error) {
    console.warn('⚠️ SportyPay backend not available, using mock data:', error);
    // Return mock transaction data for demo
    return [
      {
        id: 1,
        walletId: 1,
        type: 'DEPOSIT',
        amount: 100000,
        description: 'Nạp tiền vào ví',
        status: 'COMPLETED',
        createdAt: '2024-11-28T10:00:00Z'
      },
      {
        id: 2,
        walletId: 1,
        type: 'PAYMENT',
        amount: -50000,
        description: 'Thanh toán đơn hàng #123',
        status: 'COMPLETED',
        createdAt: '2024-11-27T15:30:00Z',
        orderId: 123
      }
    ];
  }
}

/**
 * Deposit money to SportyPay wallet via MoMo
 * Returns MoMo payment URL to redirect user
 */
export async function depositToSportyPay(amount: number, description?: string): Promise<any> {
  try {
    const response = await fetchPrivate('wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        description: description || 'Nạp tiền vào ví SportyPay' 
      }),
    });
    console.log('✅ depositToSportyPay response:', response);
    
    // Response should contain: payUrl, orderId, requestId, amount
    return response.data || response;
  } catch (error) {
    console.error('❌ Error depositing to SportyPay:', error);
    throw error;
  }
}

/**
 * Withdraw money from SportyPay wallet
 */
/**
 * Withdraw money from SportyPay to MoMo account
 */
export async function withdrawFromSportyPay(amount: number, momoPhone: string): Promise<any> {
  try {
    const response = await fetchPrivate('wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        momoPhone,
        description: `Rút tiền từ SportyPay về MoMo ${momoPhone}`
      }),
    });
    console.log('✅ withdrawFromSportyPay response:', response);
    return response.data || response;
  } catch (error) {
    console.error('❌ Error withdrawing from SportyPay:', error);
    throw error;
  }
}

/**
 * Pay with SportyPay wallet
 */
export async function payWithSportyPay(orderId: number, amount: number, description: string): Promise<any> {
  try {
    console.log('💳 Calling payWithSportyPay API:', { orderId, amount, description });
    
    const payload = { 
      amount, 
      description: `Payment for order #${orderId}: ${description}`,
      type: 'PAYMENT',
      orderId 
    };
    console.log('💳 Request payload:', payload);
    
    const response = await fetchPrivate('wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('✅ payWithSportyPay response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error paying with SportyPay:', error);
    throw error;
  }
}

/**
 * Check if wallet has sufficient balance
 */
export function hasSufficientBalance(wallet: SportyPayWallet, amount: number): boolean {
  return wallet.balance >= amount;
}