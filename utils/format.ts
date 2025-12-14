// Shared format utility
export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN');
}
