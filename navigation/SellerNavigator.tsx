import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SellerDashboard from '../app/seller/dashboard';
import SellerProducts from '../app/seller/products';
import SellerOrders from '../app/seller/orders';
import SellerVouchers from '../app/seller/vouchers';
import SellerRevenue from '../app/seller/revenue';

const SellerStack = createStackNavigator();

export default function SellerNavigator() {
  return (
    <SellerStack.Navigator initialRouteName="SellerDashboard">
      <SellerStack.Screen name="SellerDashboard" component={SellerDashboard} options={{ title: 'Kênh Người Bán' }} />
      <SellerStack.Screen name="SellerProducts" component={SellerProducts} options={{ title: 'Sản phẩm' }} />
      <SellerStack.Screen name="SellerOrders" component={SellerOrders} options={{ title: 'Đơn hàng' }} />
      <SellerStack.Screen name="SellerVouchers" component={SellerVouchers} options={{ title: 'Voucher' }} />
      <SellerStack.Screen name="SellerRevenue" component={SellerRevenue} options={{ title: 'Doanh thu' }} />
    </SellerStack.Navigator>
  );
}
