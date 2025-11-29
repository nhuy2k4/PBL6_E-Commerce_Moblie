import React from 'react';
import { Image, View } from 'react-native';
const defaultProductImage = require('./assets/images/default-product.png');

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={defaultProductImage} style={{ width: 120, height: 120, backgroundColor: '#eee' }} />
    </View>
  );
}
