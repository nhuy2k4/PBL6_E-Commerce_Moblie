import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface MessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function Message({ type, message }: MessageProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return colors.tint;
    }
  };

  const iconColor = getColor();

  return (
    <View style={[styles.container, { backgroundColor: iconColor + '20', borderColor: iconColor }]}>
      <Ionicons name={getIcon() as any} size={24} color={iconColor} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginVertical: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});
