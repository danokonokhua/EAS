import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { ChatMessage, ChatRoom } from '../../types/chat.types';

class ChatService {
  private static instance: ChatService;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async createChatRoom(emergencyId: string, participants: string[]): Promise<string> {
    try {
      const chatRoom = await firestore().collection('chatRooms').add({
        emergencyId,
        participants,
        createdAt: Date.now(),
        lastMessage: null,
      });
      return chatRoom.id;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  }

  async sendMessage(roomId: string, message: Partial<ChatMessage>): Promise<void> {
    try {
      await firestore().collection('chatRooms').doc(roomId)
        .collection('messages').add({
          ...message,
          timestamp: Date.now(),
          status: 'sent'
        });

      await firestore().collection('chatRooms').doc(roomId)
        .update({
          lastMessage: message,
          lastMessageAt: Date.now()
        });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendImage(roomId: string, imageUri: string): Promise<string> {
    try {
      const reference = storage().ref(`chat_images/${roomId}/${Date.now()}`);
      await reference.putFile(imageUri);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  }

  subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
    return firestore()
      .collection('chatRooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatMessage));
        callback(messages);
      });
  }
}

export const chatService = ChatService.getInstance();
