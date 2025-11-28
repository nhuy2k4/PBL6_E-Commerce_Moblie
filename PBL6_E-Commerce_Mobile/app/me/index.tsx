import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MeScreen = () => {
  const navigation = useNavigation();

  const handleSwitchToSeller = () => {
    // Chuyển sang stack Seller, có thể dùng navigation.navigate('SellerDashboard') hoặc tương tự
    navigation.navigate('SellerDashboard');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchToSeller}>
        <Text style={styles.switchBtnText}>Chuyển sang kênh Người Bán</Text>
      </TouchableOpacity>
      {/* ...phần còn lại của màn hình Me... */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>Thông tin tài khoản</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  switchBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  switchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MeScreen;
