import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../styles/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { getMyConversations, getConversationMessages, sendMessage } from '../../services/chatService';
import chatbotService from '../../services/chatbotService';

interface ConversationItem {
  id: number;
  type: string;
  shopName?: string | null;
  otherParticipantName?: string | null;
  otherParticipantAvatar?: string | null;
  lastActivityAt?: string;
  lastMessage?: {
    id: number;
    content: string;
    messageType?: 'TEXT' | 'IMAGE';
    createdAt: string;
  } | null;
  unreadCount?: number;
}

interface MessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string | null;
  messageType: 'TEXT' | 'IMAGE';
  content: string;
  createdAt: string;
}

interface BotMessage {
  id: number;
  sender: 'me' | 'bot';
  content: string;
  createdAt: string;
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'chat' | 'bot'>('chat');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await getMyConversations();
      const list = Array.isArray(data) ? data : data?.data || [];
      setConversations(list);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversation: ConversationItem) => {
    try {
      setSelectedConversation(conversation);
      setLoadingMessages(true);
      const data = await getConversationMessages(conversation.id);
      const list = Array.isArray(data) ? data : data?.data || [];
      setMessages(list);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!selectedConversation || !inputText.trim() || sending) return;
    const trimmed = inputText.trim();
    setSending(true);

    const optimisticMessage: MessageItem = {
      id: Date.now(),
      conversationId: selectedConversation.id,
      senderId: user?.id || 0,
      senderName: user?.username || 'Me',
      senderAvatar: undefined,
      messageType: 'TEXT',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    try {
      const response = await sendMessage({
        conversationId: selectedConversation.id,
        messageType: 'TEXT',
        content: trimmed,
      });
      const real = response?.data || response;
      if (real && real.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? real : m))
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleSendBot = async () => {
    if (!inputText.trim() || sending) return;
    const trimmed = inputText.trim();
    setSending(true);

    const userMsg: BotMessage = {
      id: Date.now(),
      sender: 'me',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setBotMessages((prev) => [...prev, userMsg]);
    setInputText('');

    try {
      const reply = await chatbotService.ask({ question: trimmed });
      const text =
        reply?.answer ||
        reply?.data?.answer ||
        reply?.message ||
        'Bot không có câu trả lời.';

      const botMsg: BotMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        content: text,
        createdAt: new Date().toISOString(),
      };

      setBotMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg: BotMessage = {
        id: Date.now() + 2,
        sender: 'bot',
        content: 'Xin lỗi, chatbot đang gặp lỗi. Vui lòng thử lại.',
        createdAt: new Date().toISOString(),
      };
      setBotMessages((prev) => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  };

  const renderConversationItem = ({ item }: { item: ConversationItem }) => {
    const title = item.otherParticipantName || item.shopName || 'Cuộc trò chuyện';
    const lastMessageText =
      item.lastMessage?.messageType === 'IMAGE'
        ? 'Hình ảnh'
        : item.lastMessage?.content || '';
    const avatar = item.otherParticipantAvatar;
    const typeLabel =
      item.type === 'SUPPORT'
        ? 'Hỗ trợ Admin'
        : item.type === 'ORDER'
        ? 'Đơn hàng'
        : item.type === 'SHOP'
        ? 'Người bán'
        : item.type;
    const typeColors =
      item.type === 'SUPPORT'
        ? { bg: '#fee2e2', text: '#b91c1c' }
        : item.type === 'ORDER'
        ? { bg: '#dbeafe', text: '#1d4ed8' }
        : item.type === 'SHOP'
        ? { bg: '#dcfce7', text: '#166534' }
        : { bg: '#e5e7eb', text: '#374151' };
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => loadMessages(item)}
      >
        <View style={styles.conversationAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.conversationAvatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color={colors.icon} />
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeaderRow}>
            <Text
              style={[
                styles.typeBadge,
                { backgroundColor: typeColors.bg, color: typeColors.text },
              ]}
            >
              {typeLabel}
            </Text>
            <Text
              style={[styles.conversationTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          <Text
            style={[styles.conversationPreview, { color: colors.icon }]}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
        </View>
        {item.unreadCount && item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: MessageItem }) => {
    const isMe = user && item.senderId === user.id;
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMe ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMe ? colors.tint : colors.background,
              alignSelf: isMe ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          {item.messageType === 'IMAGE' ? (
            <Image source={{ uri: item.content }} style={styles.messageImage} />
          ) : (
            <Text
              style={[
                styles.messageText,
                { color: isMe ? '#fff' : colors.text },
              ]}
            >
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderBotMessageItem = ({ item }: { item: BotMessage }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMe ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMe ? colors.tint : colors.background,
              alignSelf: isMe ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isMe ? '#fff' : colors.text },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            activeTab === 'chat' && styles.modeButtonActive,
          ]}
          onPress={() => setActiveTab('chat')}
        >
          <Text
            style={[
              styles.modeButtonText,
              activeTab === 'chat' && styles.modeButtonTextActive,
            ]}
          >
            Chat thường
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            activeTab === 'bot' && styles.modeButtonActive,
          ]}
          onPress={() => {
            setSelectedConversation(null);
            setActiveTab('bot');
          }}
        >
          <Text
            style={[
              styles.modeButtonText,
              activeTab === 'bot' && styles.modeButtonTextActive,
            ]}
          >
            Chatbot
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' && !selectedConversation && (
        <View style={styles.content}>
          {loadingConversations ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.centered}>
              <Text style={{ color: colors.icon }}>Chưa có cuộc trò chuyện nào</Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderConversationItem}
              contentContainerStyle={styles.conversationList}
            />
          )}
        </View>
      )}

      {activeTab === 'chat' && selectedConversation && (
        <View style={styles.content}>
          {loadingMessages ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messageList}
            />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: colors.icon + '33', color: colors.text }]}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={colors.icon}
              value={inputText}
              onChangeText={setInputText}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? colors.tint : colors.icon + '55' },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'bot' && (
        <View style={styles.content}>
          <FlatList
            data={botMessages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBotMessageItem}
            contentContainerStyle={styles.messageList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: colors.icon + '33', color: colors.text }]}
              placeholder="Nhập tin nhắn cho chatbot..."
              placeholderTextColor={colors.icon}
              value={inputText}
              onChangeText={setInputText}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? colors.tint : colors.icon + '55' },
              ]}
              onPress={handleSendBot}
              disabled={!inputText.trim() || sending}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeSwitch: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    padding: 2,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
  },
  modeButtonText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  conversationAvatar: {
    marginRight: 12,
  },
  conversationAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  conversationAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  conversationPreview: {
    fontSize: 13,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
