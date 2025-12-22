import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingTop: 5,
  },
});
