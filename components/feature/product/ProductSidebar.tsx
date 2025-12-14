import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';

interface ProductSidebarProps {
  onFilterChange: (filters: any) => void;
}

export default function ProductSidebar({ onFilterChange }: ProductSidebarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const priceRanges = [
    { label: 'Dưới 500.000đ', min: 0, max: 500000 },
    { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
    { label: '1.000.000đ - 3.000.000đ', min: 1000000, max: 3000000 },
    { label: 'Trên 3.000.000đ', min: 3000000, max: 10000000 },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lọc theo giá</Text>
        {priceRanges.map((range, index) => (
          <TouchableOpacity
            key={index}
            style={styles.filterItem}
            onPress={() => onFilterChange({ priceRange: [range.min, range.max] })}
          >
            <Ionicons name="radio-button-off" size={20} color={colors.icon} />
            <Text style={[styles.filterText, { color: colors.text }]}>{range.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
  },
});
