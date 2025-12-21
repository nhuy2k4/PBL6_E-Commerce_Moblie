import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProductCard } from '@/components/ProductCard';
import { searchProducts } from '@/services/productService';
import { getFacetedFilters, trackSearch, type FacetedSearchDTO } from '@/services/searchService';
import type { Product } from '@/types';

export const options = { headerShown: false };

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const query = (params.q as string) || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<FacetedSearchDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minRating: undefined as number | undefined,
    sortBy: 'relevance' as 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'sold',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query) {
      loadSearchResults();
      loadFacets();
      trackSearch(query);
    }
  }, [query, filters]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      const response = await searchProducts({
        keyword: query,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        page: 0,
        size: 50,
      });
      setProducts(response.content || []);
    } catch (error) {
      console.error('Failed to load search results:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFacets = async () => {
    try {
      const facetsData = await getFacetedFilters(
        query,
        filters.categoryId,
        filters.minPrice,
        filters.maxPrice,
        filters.minRating
      );
      setFacets(facetsData);
    } catch (error) {
      console.error('Failed to load facets:', error);
    }
  };

  const handleCategoryFilter = (categoryId: number) => {
    setFilters(prev => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
  };

  const handlePriceFilter = (minPrice: number, maxPrice: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: prev.minPrice === minPrice ? undefined : minPrice,
      maxPrice: prev.maxPrice === maxPrice ? undefined : maxPrice,
    }));
  };

  const handleRatingFilter = (minRating: number) => {
    setFilters(prev => ({
      ...prev,
      minRating: prev.minRating === minRating ? undefined : minRating,
    }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      sortBy: 'relevance',
    });
  };

  const hasActiveFilters = () => {
    return filters.categoryId || filters.minPrice || filters.maxPrice || filters.minRating;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/customer/search')}
        >
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text style={styles.searchText} numberOfLines={1}>{query}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort & Filter Bar */}
      <View style={styles.toolbar}>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultText, { color: colors.text }]}>
            {loading ? 'Đang tìm...' : `${products.length} kết quả`}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, filters.sortBy === 'relevance' && styles.sortButtonActive]}
            onPress={() => setFilters(prev => ({ ...prev, sortBy: 'relevance' }))}
          >
            <Text style={filters.sortBy === 'relevance' ? styles.sortTextActive : styles.sortText}>
              Liên quan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, filters.sortBy === 'sold' && styles.sortButtonActive]}
            onPress={() => setFilters(prev => ({ ...prev, sortBy: 'sold' }))}
          >
            <Text style={filters.sortBy === 'sold' ? styles.sortTextActive : styles.sortText}>
              Bán chạy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, filters.sortBy === 'price-asc' && styles.sortButtonActive]}
            onPress={() => setFilters(prev => ({ ...prev, sortBy: 'price-asc' }))}
          >
            <Text style={filters.sortBy === 'price-asc' ? styles.sortTextActive : styles.sortText}>
              Giá thấp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, filters.sortBy === 'price-desc' && styles.sortButtonActive]}
            onPress={() => setFilters(prev => ({ ...prev, sortBy: 'price-desc' }))}
          >
            <Text style={filters.sortBy === 'price-desc' ? styles.sortTextActive : styles.sortText}>
              Giá cao
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={16} color={hasActiveFilters() ? '#FFF' : '#666'} />
            <Text style={hasActiveFilters() ? styles.sortTextActive : styles.sortText}>
              Lọc
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Filters Panel */}
      {showFilters && facets && (
        <ScrollView style={styles.filtersPanel}>
          {/* Category Filters */}
          {facets.categories && facets.categories.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Danh mục</Text>
              <View style={styles.filterChips}>
                {facets.categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.filterChip,
                      filters.categoryId === cat.id && styles.filterChipActive,
                    ]}
                    onPress={() => handleCategoryFilter(cat.id)}
                  >
                    <Text
                      style={filters.categoryId === cat.id ? styles.filterChipTextActive : styles.filterChipText}
                    >
                      {cat.name} ({cat.productCount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Price Filters */}
          {facets.priceRanges && facets.priceRanges.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Khoảng giá</Text>
              <View style={styles.filterChips}>
                {facets.priceRanges.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterChip,
                      filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice && styles.filterChipActive,
                    ]}
                    onPress={() => handlePriceFilter(range.minPrice, range.maxPrice)}
                  >
                    <Text
                      style={
                        filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice
                          ? styles.filterChipTextActive
                          : styles.filterChipText
                      }
                    >
                      {range.label} ({range.productCount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Rating Filters */}
          {facets.ratings && facets.ratings.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Đánh giá</Text>
              <View style={styles.filterChips}>
                {facets.ratings.map((rating) => (
                  <TouchableOpacity
                    key={rating.minRating}
                    style={[
                      styles.filterChip,
                      filters.minRating === rating.minRating && styles.filterChipActive,
                    ]}
                    onPress={() => handleRatingFilter(rating.minRating)}
                  >
                    <Ionicons name="star" size={14} color={filters.minRating === rating.minRating ? '#FFF' : '#FFB800'} />
                    <Text
                      style={filters.minRating === rating.minRating ? styles.filterChipTextActive : styles.filterChipText}
                    >
                      {rating.label} ({rating.productCount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {hasActiveFilters() && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Xóa tất cả bộ lọc</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
          <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard
                product={item}
                onPress={() => router.push({
                  pathname: '/customer/product-detail',
                  params: { id: item.id },
                })}
              />
            </View>
          )}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 48,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  toolbar: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  sortButtonActive: {
    backgroundColor: '#FF6B35',
  },
  sortText: {
    fontSize: 13,
    color: '#666',
  },
  sortTextActive: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filtersPanel: {
    maxHeight: 250,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  clearFiltersButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  productList: {
    padding: 8,
  },
  productWrapper: {
    width: '50%',
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
});
