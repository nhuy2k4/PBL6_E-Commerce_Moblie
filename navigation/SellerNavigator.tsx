import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SellerDashboard from '../app/seller/dashboard';
import SellerProducts from '../app/seller/products';
import SellerOrders from '../app/seller/orders';
import SellerVouchers from '../app/seller/vouchers';
import SellerCustomers from '../app/seller/customers';
import SellerRevenue from '../app/seller/statistical';
import SellerReviews from '../app/seller/reviews';

const SellerStack = createStackNavigator();

export default function SellerNavigator() {
  return (
    <SellerStack.Navigator 
      initialRouteName="SellerDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <SellerStack.Screen 
        name="SellerDashboard" 
        component={SellerDashboard} 
        options={{ title: 'Kênh Người Bán' }} 
      />
      <SellerStack.Screen 
        name="SellerProducts" 
        component={SellerProducts} 
        options={{ title: 'Quản Lý Sản Phẩm' }} 
      />
      <SellerStack.Screen 
        name="SellerOrders" 
        component={SellerOrders} 
        options={{ title: 'Quản Lý Đơn Hàng' }} 
      />
      <SellerStack.Screen 
        name="SellerVouchers" 
        component={SellerVouchers} 
        options={{ title: 'Quản Lý Voucher' }} 
      />
      <SellerStack.Screen 
        name="SellerReviews" 
        component={SellerReviews} 
        options={{ title: 'Quản Lý Đánh Giá' }} 
      />
      <SellerStack.Screen 
        name="SellerCustomers" 
        component={SellerCustomers} 
        options={{ title: 'Khách Hàng' }} 
      />
      <SellerStack.Screen 
        name="SellerRevenue" 
        component={SellerRevenue} 
        options={{ title: 'Phân Tích Doanh Thu' }} 
      />
    </SellerStack.Navigator>
  );
}
