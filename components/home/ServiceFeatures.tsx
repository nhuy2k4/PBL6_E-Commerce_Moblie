import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: 'car-outline',
    title: 'FREE AND FAST DELIVERY',
    description: 'Free delivery for all orders over $140',
  },
  {
    id: 2,
    icon: 'headset-outline',
    title: '24/7 CUSTOMER SERVICE',
    description: 'Friendly 24/7 customer support',
  },
  {
    id: 3,
    icon: 'shield-checkmark-outline',
    title: 'MONEY BACK GUARANTEE',
    description: 'We return money within 30 days',
  },
];

export default function ServiceFeatures() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {features.map((feature, index) => (
        <View key={feature.id} style={styles.featureItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
            <View style={[styles.iconInner, { backgroundColor: '#666' }]}>
              <Ionicons name={feature.icon as any} size={32} color="#fff" />
            </View>
          </View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>
            {feature.title}
          </Text>
          <Text style={[styles.featureDescription, { color: colors.icon }]}>
            {feature.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});
