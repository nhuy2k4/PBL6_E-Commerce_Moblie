import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getSearchSuggestions,
  getTrendingSearches,
  getSearchHistory,
  trackSearch,
  trackSearchClick,
  deleteFromHistory,
  clearSearchHistory,
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  type SearchSuggestionDTO,
  type TrendingSearchDTO,
} from '@/services/searchService';
import { useAuth } from '@/context/AuthContext';

export const options = { headerShown: false };

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestionDTO | null>(null);
  const [trending, setTrending] = useState<TrendingSearchDTO | null>(null);
  const [serverHistory, setServerHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Auto focus on mount
    setTimeout(() => inputRef.current?.focus(), 100);
    
    // Load initial data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load local recent searches
      const localRecent = await getRecentSearches();
      setRecentSearches(localRecent);

      // Load trending
      const trendingData = await getTrendingSearches(10);
      setTrending(trendingData);

      // Load server history if authenticated
      if (isAuthenticated) {
        const history = await getSearchHistory(10);
        setServerHistory(history);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);

    // Debounce search - real-time suggestions
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (text.trim().length >= 1) {
      searchTimeout.current = setTimeout(() => {
        loadSuggestions(text);
      }, 250); // 250ms debounce như web
    } else {
      setSuggestions(null);
    }
  };

  const loadSuggestions = async (searchQuery: string) => {
    try {
      setLoading(true);
      const data = await getSearchSuggestions(searchQuery, 5);
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    await saveRecentSearch(searchQuery);
    setRecentSearches(await getRecentSearches());

    // Track search
    trackSearch(searchQuery);

    // Navigate to search results
    router.push({
      pathname: '/customer/search-results',
      params: { q: searchQuery },
    });
  };

  const handleSelectQuery = async (text: string) => {
    setQuery(text);
    await handleSearch(text);
  };

  const handleSelectProduct = (productId: number) => {
    if (query) {
      trackSearchClick(query, productId);
    }
    router.push({
      pathname: '/customer/product-detail',
      params: { productId: productId.toString() },
    });
  };

  const handleSelectCategory = (categoryId: number) => {
    router.push({
      pathname: '/customer/search-results',
      params: { categoryId: categoryId.toString() },
    });
  };

  const handleSelectShop = (shopId: number) => {
    router.push({
      pathname: '/customer/shop-detail',
      params: { shopId: shopId.toString() },
    });
  };

  const handleRemoveRecent = async (item: string) => {
    await removeRecentSearch(item);
    setRecentSearches(await getRecentSearches());
  };

  const handleClearRecent = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveServerHistory = async (item: string) => {
    try {
      await deleteFromHistory(item);
      setServerHistory(prev => prev.filter(h => h !== item));
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };

  const handleClearServerHistory = async () => {
    try {
      await clearSearchHistory();
      setServerHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  // Combine server history and local recent searches
  const combinedRecent = isAuthenticated 
    ? [...new Set([...serverHistory, ...recentSearches])].slice(0, 10)
    : recentSearches;

  const showRecent = query.trim().length === 0;

  return (
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Tìm sản phẩm..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        )}

        {!loading && (
          <>
            {/* Did You Mean */}
            {suggestions?.didYouMean && (
              <View style={styles.didYouMeanContainer}>
                <Text style={styles.didYouMeanLabel}>Ý bạn là: </Text>
                <TouchableOpacity onPress={() => handleSelectQuery(suggestions.didYouMean!)}>
                  <Text style={styles.didYouMeanText}>{suggestions.didYouMean}</Text>
                </TouchableOpacity>
                <Text style={styles.didYouMeanLabel}>?</Text>
              </View>
            )}

            {/* Recent Searches (when no query) */}
            {showRecent && combinedRecent.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons 
                      name={isAuthenticated ? "cloud-outline" : "time-outline"} 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.sectionTitle}>
                      {isAuthenticated ? 'Lịch sử tìm kiếm' : 'Tìm kiếm gần đây'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={isAuthenticated ? handleClearServerHistory : handleClearRecent}
                  >
                    <Text style={styles.clearAllText}>Xóa tất cả</Text>
                  </TouchableOpacity>
                </View>
                {combinedRecent.slice(0, 5).map((item, index) => {
                  const isServerItem = isAuthenticated && serverHistory.includes(item);
                  return (
                    <View key={index} style={styles.historyItem}>
                      <TouchableOpacity
                        style={styles.historyLeft}
                        onPress={() => handleSelectQuery(item)}
                      >
                        <Ionicons 
                          name={isServerItem ? "cloud-outline" : "time-outline"} 
                          size={18} 
                          color={isServerItem ? "#4A90E2" : "#666"} 
                        />
                        <Text style={styles.historyText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => isServerItem ? handleRemoveServerHistory(item) : handleRemoveRecent(item)}
                      >
                        <Ionicons name="close" size={18} color="#999" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Trending Searches */}
            {showRecent && trending && trending.trending.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="flame-outline" size={16} color="#FF6B35" />
                  <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
                </View>
                <View style={styles.trendingGrid}>
                  {trending.trending.slice(0, 6).map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.trendingChip}
                      onPress={() => handleSelectQuery(item.query)}
                    >
                      {index < 3 && <Ionicons name="flame" size={14} color="#FF6B35" />}
                      <Text style={styles.trendingText}>{item.query}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Query Suggestions */}
            {suggestions?.queries && suggestions.queries.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="search-outline" size={16} color="#666" />
                  <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
                </View>
                {suggestions.queries.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectQuery(item.text)}
                  >
                    <Ionicons name="search-outline" size={18} color="#999" />
                    <Text style={styles.suggestionText}>{item.text}</Text>
                    {item.estimatedCount > 0 && (
                      <Text style={styles.countText}>{item.estimatedCount} kết quả</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Category Suggestions */}
            {suggestions?.categories && suggestions.categories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.sectionTitle}>Danh mục</Text>
                </View>
                {suggestions.categories.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectCategory(item.id)}
                  >
                    <Ionicons name="pricetag-outline" size={18} color="#999" />
                    <Text style={styles.suggestionText}>{item.name}</Text>
                    <Text style={styles.countText}>{item.productCount} sản phẩm</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Product Suggestions */}
            {suggestions?.products && suggestions.products.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <Text style={styles.sectionTitle}>Sản phẩm gợi ý</Text>
                </View>
                {suggestions.products.map((product, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.productItem}
                    onPress={() => handleSelectProduct(product.id)}
                  >
                    <Image
                      source={{ uri: product.image || 'https://via.placeholder.com/60' }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.productPrice}>
                        {product.price.toLocaleString('vi-VN')}₫
                      </Text>
                      <View style={styles.productMeta}>
                        {product.rating > 0 && (
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color="#FFA500" />
                            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                          </View>
                        )}
                        {product.soldCount > 0 && (
                          <Text style={styles.soldText}>Đã bán {product.soldCount}</Text>
                        )}
                      </View>
                      {product.shopName && (
                        <Text style={styles.shopName} numberOfLines={1}>{product.shopName}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Shop Suggestions */}
            {suggestions?.shops && suggestions.shops.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="storefront-outline" size={16} color="#666" />
                  <Text style={styles.sectionTitle}>Shop gợi ý</Text>
                </View>
                {suggestions.shops.map((shop, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.shopItem}
                    onPress={() => handleSelectShop(shop.id)}
                  >
                    <Image
                      source={{ uri: shop.logoUrl || 'https://via.placeholder.com/40' }}
                      style={styles.shopLogo}
                    />
                    <View style={styles.shopInfo}>
                      <Text style={styles.shopInfoName} numberOfLines={1}>{shop.name}</Text>
                      <Text style={styles.shopCount}>{shop.productCount} sản phẩm</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  didYouMeanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF5E6',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  didYouMeanLabel: {
    fontSize: 14,
    color: '#666',
  },
  didYouMeanText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  clearAllText: {
    fontSize: 12,
    color: '#999',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  historyLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  trendingText: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  countText: {
    fontSize: 12,
    color: '#999',
  },
  productItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  productName: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B35',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  soldText: {
    fontSize: 12,
    color: '#999',
  },
  shopName: {
    fontSize: 12,
    color: '#666',
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  shopLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  shopInfo: {
    flex: 1,
  },
  shopInfoName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  shopCount: {
    fontSize: 12,
    color: '#999',
  },
});
