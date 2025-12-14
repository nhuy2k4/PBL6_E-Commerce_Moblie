import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { Colors } from '@/styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Footer() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.icon + '20' }]}>
      <Text style={[styles.text, { color: colors.icon }]}>
        © 2025 E-Commerce. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  text: {
    fontSize: 12,
  },
});
