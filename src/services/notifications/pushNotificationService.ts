import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { store } from '../../store';
import { updateFCMToken } from '../../store/slices/notificationSlice';
import { apiService } from '../api/apiService';

class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.requestPermission();
      await this.setupFCMToken();
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  private async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
    return true;
  }

  private async setupFCMToken(): Promise<void> {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      store.dispatch(updateFCMToken(fcmToken));
      await this.registerDeviceToken(fcmToken);
    }

    messaging().onTokenRefresh(async (token) => {
      store.dispatch(updateFCMToken(token));
      await this.registerDeviceToken(token);
    });
  }

  private async registerDeviceToken(token: string): Promise<void> {
    try {
      await apiService.post('/devices/register', { token });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  private setupNotificationListeners(): void {
    messaging().onMessage(async (remoteMessage) => {
      // Handle foreground messages
      console.log('Received foreground message:', remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      // Handle background messages
      console.log('Received background message:', remoteMessage);
    });
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
