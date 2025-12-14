import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllCategories } from '@/services/categoryService';
import type { Category } from '@/types';

interface QuickAction {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  categoryId: number;
}

// Map category names to icons and colors
const getCategoryStyle = (name: string): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('gym')) return { icon: 'barbell', color: '#FF6B6B' };
  if (lowerName.includes('running') || lowerName.includes('run')) return { icon: 'walk', color: '#4ECDC4' };
  if (lowerName.includes('cycling') || lowerName.includes('bike')) return { icon: 'bicycle', color: '#FFB84D' };
  if (lowerName.includes('yoga') || lowerName.includes('fitness')) return { icon: 'fitness', color: '#A8E6CF' };
  if (lowerName.includes('outdoor') || lowerName.includes('hiking')) return { icon: 'leaf', color: '#95E1D3' };
  if (lowerName.includes('swimming') || lowerName.includes('swim')) return { icon: 'water', color: '#38ADA9' };
  if (lowerName.includes('boxing') || lowerName.includes('fight')) return { icon: 'hand-left', color: '#EE5A6F' };
  if (lowerName.includes('basketball')) return { icon: 'basketball', color: '#FF6B9D' };
  if (lowerName.includes('football') || lowerName.includes('soccer')) return { icon: 'football', color: '#C44569' };
  if (lowerName.includes('tennis') || lowerName.includes('racket')) return { icon: 'tennisball', color: '#F8B500' };
  
  return { icon: 'grid', color: '#B5EAD7' };
};

export default function QuickActions() {
  const router = useRouter();
  const [categories, setCategories] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      
      // Limit to 8 categories and map to QuickAction format
      const mappedCategories = data.slice(0, 8).map((cat: Category) => {
        const style = getCategoryStyle(cat.name);
        return {
          id: cat.id,
          icon: style.icon,
          label: cat.name,
          color: style.color,
          categoryId: cat.id,
        };
      });
      
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (action: QuickAction) => {
    router.push({
      pathname: '/customer/product-by-category',
      params: { categoryId: action.categoryId, categoryName: action.label },
    } as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionItem}
            onPress={() => handlePress(action)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={28} color="#FFF" />
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
