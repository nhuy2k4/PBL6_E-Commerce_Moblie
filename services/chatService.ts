import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/config';
import { buildUrl } from '../utils/api';

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export async function getMyConversations(): Promise<any> {
  const url = buildUrl(API_ENDPOINTS.CHAT.MY_CONVERSATIONS);
  return fetchApi(url);
}

export async function getConversationDetail(conversationId: number): Promise<any> {
  const url = buildUrl(API_ENDPOINTS.CHAT.CONVERSATION_DETAIL, conversationId);
  return fetchApi(url);
}

export async function getConversationMessages(conversationId: number): Promise<any> {
  const url = buildUrl(API_ENDPOINTS.CHAT.MESSAGES_BY_CONVERSATION, conversationId);
  return fetchApi(url);
}

export async function getConversationMessagesPaginated(
  conversationId: number,
  page = 0,
  size = 50
): Promise<any> {
  const baseUrl = buildUrl(API_ENDPOINTS.CHAT.MESSAGES_PAGINATED(conversationId));
  const url = new URL(baseUrl);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('size', size.toString());
  return fetchApi(url.toString());
}

export async function createConversation(data: {
  type: 'ORDER' | 'SHOP' | 'SUPPORT';
  orderId?: number;
  shopId?: number;
}): Promise<any> {
  const url = buildUrl(API_ENDPOINTS.CHAT.CONVERSATIONS);
  return fetchApi(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function sendMessage(data: {
  conversationId: number;
  messageType: 'TEXT' | 'IMAGE';
  content: string;
}): Promise<any> {
  const url = buildUrl(API_ENDPOINTS.CHAT.SEND_MESSAGE);
  return fetchApi(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

