// Shared hook for fetching and managing products
import { useState, useEffect } from 'react';
import { getAllProducts, getProductsByCategory, searchProducts } from '../services/productService';
import type { Product } from '../types';

interface UseProductsOptions {
  autoLoad?: boolean;
  categoryId?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  loadProductsByCategory: (categoryId: number) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing products
 * @param options - Configuration options
 * @returns Products state and operations
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { autoLoad = true, categoryId } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (catId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductsByCategory(catId);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products by category');
      console.error('Error loading products by category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProducts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchProducts(query);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search products');
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (categoryId) {
      await loadProductsByCategory(categoryId);
    } else {
      await loadProducts();
    }
  };

  useEffect(() => {
    if (autoLoad) {
      if (categoryId) {
        loadProductsByCategory(categoryId);
      } else {
        loadProducts();
      }
    }
  }, [autoLoad, categoryId]);

  return {
    products,
    loading,
    error,
    loadProducts,
    loadProductsByCategory,
    searchProducts: handleSearchProducts,
    refresh,
  };
}
