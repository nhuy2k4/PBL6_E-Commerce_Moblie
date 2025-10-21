import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock categories
const categories: Category[] = [
  { id: 1, name: 'Electronics', icon: 'laptop-outline' },
  { id: 2, name: 'Fashion', icon: 'shirt-outline' },
  { id: 3, name: 'Home', icon: 'home-outline' },
  { id: 4, name: 'Sports', icon: 'football-outline' },
  { id: 5, name: 'Books', icon: 'book-outline' },
  { id: 6, name: 'Toys', icon: 'game-controller-outline' },
  { id: 7, name: 'Beauty', icon: 'brush-outline' },
  { id: 8, name: 'Food', icon: 'fast-food-outline' },
];

export default function CategoryList() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
});
