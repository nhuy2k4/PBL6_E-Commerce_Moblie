// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// const MeScreen = () => {
//   const navigation = useNavigation();
//   const router = useRouter();
//   const [settingsExpanded, setSettingsExpanded] = React.useState(false);

//   const handleSwitchToSeller = () => {
//     // Chuyển sang stack Seller, có thể dùng navigation.navigate('SellerDashboard') hoặc tương tự
//     navigation.navigate('SellerDashboard');
//   };

//   const handleSportyPayPress = () => {
//     router.push('/me/sporty-pay');
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchToSeller}>
//         <Text style={styles.switchBtnText}>Chuyển sang kênh Người Bán</Text>
//       </TouchableOpacity>
      
//       <ScrollView 
//         style={styles.content}
//         showsVerticalScrollIndicator={true}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       >
//         {/* User Info Section */}
//         <View style={styles.userSection}>
//           <View style={styles.userInfo}>
//             <View style={styles.avatar}>
//               <Ionicons name="person" size={32} color="#fff" />
//             </View>
//             <View>
//               <Text style={styles.userName}>Người dùng</Text>
//               <Text style={styles.userPhone}>+84 123 456 789</Text>
//             </View>
//           </View>
//         </View>

//         {/* Wallet Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Ví & Thanh toán</Text>
//           <TouchableOpacity style={styles.menuItem} onPress={handleSportyPayPress}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuIcon, { backgroundColor: '#FF6B6B' }]}>
//                 <Ionicons name="wallet" size={20} color="#fff" />
//               </View>
//               <Text style={styles.menuItemText}>SportyPay</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuIcon, { backgroundColor: '#007bff' }]}>
//                 <Ionicons name="card" size={20} color="#fff" />
//               </View>
//               <Text style={styles.menuItemText}>Thẻ ngân hàng</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
//         </View>

//         {/* Orders Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Đơn hàng</Text>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuIcon, { backgroundColor: '#28a745' }]}>
//                 <Ionicons name="receipt" size={20} color="#fff" />
//               </View>
//               <Text style={styles.menuItemText}>Đơn mua</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuIcon, { backgroundColor: '#ffc107' }]}>
//                 <Ionicons name="heart" size={20} color="#fff" />
//               </View>
//               <Text style={styles.menuItemText}>Sản phẩm yêu thích</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
//         </View>

//         {/* Settings Section - Expandable */}
//         {/* <View style={styles.section}>
//           <TouchableOpacity 
//             style={styles.expandableHeader}
//             onPress={() => setSettingsExpanded(!settingsExpanded)}
//           >
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuIcon, { backgroundColor: '#6c757d' }]}>
//                 <Ionicons name="settings" size={20} color="#fff" />
//               </View>
//               <Text style={styles.menuItemText}>Cài đặt</Text>
//             </View>
//             <Ionicons 
//               name={settingsExpanded ? "chevron-up" : "chevron-down"} 
//               size={20} 
//               color="#666" 
//             />
//           </TouchableOpacity>

//           {settingsExpanded && (
//             <View style={styles.submenuContainer}>
//               <TouchableOpacity 
//                 style={styles.submenuItem} 
//                 onPress={() => router.push('/me/profile')}
//               >
//                 <Text style={styles.submenuText}>Tài khoản của tôi</Text>
//                 <Ionicons name="chevron-forward" size={18} color="#ccc" />
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.submenuItem} 
//                 onPress={() => router.push('/me/addresses')}
//               >
//                 <Text style={styles.submenuText}>Địa chỉ</Text>
//                 <Ionicons name="chevron-forward" size={18} color="#ccc" />
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.submenuItem} 
//                 onPress={() => router.push('/me/change-password')}
//               >
//                 <Text style={styles.submenuText}>Thay đổi mật khẩu</Text>
//                 <Ionicons name="chevron-forward" size={18} color="#ccc" />
//               </TouchableOpacity>
//             </View> */}
//           {/* )}
//         </View> */}

//         {/* Help Section */}
//         <View style={styles.section}>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuIcon, { backgroundColor: '#17a2b8' }]}>
//                 <Ionicons name="help-circle" size={20} color="#fff" />
//               </View>
//               <Text style={styles.menuItemText}>Trợ giúp</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#ccc" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   switchBtn: {
//     backgroundColor: '#007bff',
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//   },
//   switchBtnText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   content: {
//     flex: 1,
//     paddingTop: 16,
//   },
//   userSection: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 16,
//     paddingVertical: 20,
//     marginBottom: 16,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#ccc',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 4,
//   },
//   userPhone: {
//     fontSize: 14,
//     color: '#6c757d',
//   },
//   section: {
//     backgroundColor: '#fff',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#212529',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f3f4',
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f3f4',
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   menuItemText: {
//     fontSize: 16,
//     color: '#212529',
//   },
//   expandableHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f3f4',
//   },
//   submenuContainer: {
//     backgroundColor: '#f8f9fa',
//     paddingLeft: 48,
//   },
//   submenuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 14,
//     paddingRight: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   submenuText: {
//     fontSize: 15,
//     color: '#495057',
//   },
// });

// export default MeScreen;
