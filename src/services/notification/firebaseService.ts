import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { notificationService } from './notificationService';
import { secureStorageService } from '../secure/secureStorageService';
import { FIREBASE_TOKEN_KEY } from '../../config/constants';

class FirebaseService {
  private static instance: FirebaseService;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await this.requestPermission();
      await this.setupFCMToken();
      this.setupMessageHandlers();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  private async requestPermission() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        throw new Error('User declined push notifications');
      }
    }
  }

  private async setupFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        await secureStorageService.saveSecureItem(FIREBASE_TOKEN_KEY, fcmToken);
        console.log('FCM Token:', fcmToken);
      }

      // Listen to token refresh
      messaging().onTokenRefresh(async (token) => {
        await secureStorageService.saveSecureItem(FIREBASE_TOKEN_KEY, token);
        // TODO: Send token to your backend
      });
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      throw error;
    }
  }

  private setupMessageHandlers() {
    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Received foreground message:', remoteMessage);
      
      notificationService.showLocalNotification({
        title: remoteMessage.notification?.title || 'New Message',
        message: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
      });
    });

    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Received background message:', remoteMessage);
      return Promise.resolve();
    });
  }

  async getFCMToken(): Promise<string | null> {
    try {
      return await secureStorageService.getSecureItem(FIREBASE_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get FCM token from storage:', error);
      return null;
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
