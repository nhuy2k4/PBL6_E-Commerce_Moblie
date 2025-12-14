export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const formatWeight = (weight: number) => {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} kg`;
  }
  return `${weight} g`;
};

export const getTotalWeight = (checkoutItems: any[]) => {
  return checkoutItems.reduce((total, item) => {
    const weight = item.product?.weightGrams || item.weightGrams || 200;
    return total + (weight * item.quantity);
  }, 0);
};
