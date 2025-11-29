import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../styles/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';

interface ProductTopBarProps {
  onFilterChange: (filters: any) => void;
}

export default function ProductTopBar({ onFilterChange }: ProductTopBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showSortModal, setShowSortModal] = useState(false);

  const sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá thấp đến cao', value: 'price_asc' },
    { label: 'Giá cao đến thấp', value: 'price_desc' },
    { label: 'Bán chạy', value: 'bestseller' },
  ];

  const handleSort = (value: string) => {
    onFilterChange({ sortBy: value });
    setShowSortModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.icon + '20' }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowSortModal(true)}
      >
        <Ionicons name="swap-vertical" size={20} color={colors.tint} />
        <Text style={[styles.buttonText, { color: colors.text }]}>Sắp xếp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="filter" size={20} color={colors.tint} />
        <Text style={[styles.buttonText, { color: colors.text }]}>Lọc</Text>
      </TouchableOpacity>

      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sắp xếp theo</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sortOption}
                onPress={() => handleSort(option.value)}
              >
                <Text style={[styles.sortText, { color: colors.text }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sortOption: {
    paddingVertical: 12,
  },
  sortText: {
    fontSize: 16,
  },
});
