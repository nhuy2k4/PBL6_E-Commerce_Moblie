
import AsyncStorage from '@react-native-async-storage/async-storage';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API_CONFIG } from '../constants/config';
import { showLocalNotification } from './notificationService';

let stompClient = null;
let isConnected = false;
let currentChannel = null;

// Callback sẽ được gọi khi có notification mới
let onNotificationCallback = null;
let onConnectionChange = null;

function getNotificationTitle(type) {
  switch (type) {
    case 'ORDER_PLACED': return '🛒 Đơn hàng mới';
    case 'ORDER_CONFIRMED': return '✅ Xác nhận đơn hàng';
    case 'ORDER_SHIPPING': return '🚚 Đang giao hàng';
    case 'ORDER_COMPLETED': return '🎉 Hoàn thành';
    case 'ORDER_CANCELLED': return '❌ Đã hủy';
    case 'PAYMENT_RECEIVED': return '💰 Thanh toán';
    case 'NEW_ORDER': return '🛍️ Đơn hàng mới';
    default: return '🔔 Thông báo mới';
  }
}

export async function connectNotificationSocket({ userId, role = 'BUYER', onNotification, onConnection }) {
  if (!userId) {
    console.log('⚠️ No userId provided, skipping WebSocket connection');
    return;
  }
  // determine channel early so reconnect logic can compare properly
  const channelMap: { [key: string]: string } = {
    BUYER: `/topic/orderws/${userId}`,
    SELLER: `/topic/sellerws/${userId}`,
    ADMIN: `/topic/admin/${userId}`,
  };
  const channel = channelMap[(role || 'BUYER').toUpperCase()] || `/topic/orderws/${userId}`;

  if (stompClient) {
    // If already connected to the same channel, skip
    if (currentChannel && currentChannel === channel) {
      console.log('⚠️ Socket already connected to channel, skipping');
      return;
    }
    // If connected but channel differs, disconnect and reconnect to correct channel
    console.log('⚠️ Socket connected to different channel, reconnecting to correct channel');
    disconnectNotificationSocket();
  }
  console.log(`🔌 [${role}] Attempting to connect WebSocket for user: ${userId}`);
  onNotificationCallback = onNotification;
  onConnectionChange = onConnection;
  const clientId = Math.random().toString(36).substring(2, 11);
  
  // Try both 'token' and 'access_token' keys
  let authToken = await AsyncStorage.getItem('token');
  if (!authToken) {
    authToken = await AsyncStorage.getItem('access_token');
  }
  
  if (!authToken) {
    console.error('❌ No auth token found in AsyncStorage, cannot connect to WebSocket');
    return;
  }
  
  console.log(`🔑 Token found: ${authToken.substring(0, 20)}...`);
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
  const sockJsUrl = `${baseUrl}/ws?token=${authToken}`;

  console.log(`🔌 WebSocket URL: ${baseUrl}/ws?token=***`);
  console.log(`📡 Will subscribe to channel: ${channel}`);
  stompClient = new Client({
    webSocketFactory: () => new SockJS(sockJsUrl),
    connectHeaders: {
      'Authorization': `Bearer ${authToken}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.log(`✅ [${role}] [${clientId}] WebSocket connected successfully!`);
      isConnected = true;
      if (onConnectionChange) onConnectionChange(true);
      console.log(`📡 Subscribing to channel: ${channel}`);
      // remember current channel
      currentChannel = channel;
      stompClient.subscribe(channel, async (message) => {
        console.log(`📬 [${clientId}] Received notification message`);
        try {
          const notification = JSON.parse(message.body);
          const newNotification = {
            id: notification.id || `${Date.now()}_${Math.random()}`,
            type: notification.type || 'INFO',
            message: notification.message || 'Thông báo mới',
            orderId: notification.orderId,
            read: false,
            timestamp: notification.timestamp || Date.now(),
            receivedAt: new Date().toISOString(),
            // preserve full payload for consumers to inspect and filter
            payload: notification,
            // include channel to help client-side filtering
            channel,
          };
          if (onNotificationCallback) onNotificationCallback(newNotification);
          // Không hiển thị local notification nữa, chỉ cập nhật vào context
        } catch (error) {
          console.error('❌ Error parsing notification:', error);
        }
      });
    },
    onStompError: (frame) => {
      console.error(`❌ [${role}] [${clientId}] STOMP error:`, frame.headers['message']);
      console.error(`❌ Full STOMP error frame:`, frame);
      isConnected = false;
      if (onConnectionChange) onConnectionChange(false);
    },
    onWebSocketClose: (event) => {
      isConnected = false;
      if (onConnectionChange) onConnectionChange(false);
      console.log(`🔌 [${clientId}] WebSocket closed`);
    },
    onWebSocketError: (event) => {
      isConnected = false;
      if (onConnectionChange) onConnectionChange(false);
      console.error(`❌ [${clientId}] WebSocket error:`, event);
    },
  });
  
  console.log(`🚀 Activating WebSocket client...`);
  stompClient.activate();
}

export function disconnectNotificationSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    isConnected = false;
    if (onConnectionChange) onConnectionChange(false);
  }
}