import type { Category } from '../../types';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { getAllCategories } from '../../services/categoryService';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Map category names to icons
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Electronics': 'laptop-outline',
    'Fashion': 'shirt-outline',
    'Home': 'home-outline',
    'Sports': 'football-outline',
    'Books': 'book-outline',
    'Toys': 'game-controller-outline',
    'Beauty': 'brush-outline',
    'Food': 'fast-food-outline',
  };
  return iconMap[categoryName] || 'grid-outline';
};

export default function CategoryList() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'] as typeof Colors.light;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      // Map API categories to component format
      if (Array.isArray(data)) {
        const mappedCategories: Category[] = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: getCategoryIcon(cat.name),
        }));
        setCategories(mappedCategories);
      } else {
        throw new Error('Invalid categories data');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default categories if API fails
      setCategories([
        { id: 1, name: 'Electronics', icon: 'laptop-outline' },
        { id: 2, name: 'Fashion', icon: 'shirt-outline' },
        { id: 3, name: 'Home', icon: 'home-outline' },
        { id: 4, name: 'Sports', icon: 'football-outline' },
        { id: 5, name: 'Books', icon: 'book-outline' },
        { id: 6, name: 'Toys', icon: 'game-controller-outline' },
        { id: 7, name: 'Beauty', icon: 'brush-outline' },
        { id: 8, name: 'Food', icon: 'fast-food-outline' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category.name);
    // Navigate to category products
    // router.push(`/category/${category.id}`);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: colors.background }]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
        <Ionicons
          name={item.icon as any}
          size={28}
          color={colors.tint}
        />
      </View>
      <Text
        style={[styles.categoryName, { color: colors.text }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.indicator, { backgroundColor: colors.tint }]} />
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item: Category) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
