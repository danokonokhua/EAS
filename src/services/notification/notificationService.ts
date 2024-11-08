import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { NOTIFICATION_SETTINGS_KEY } from '../../constants';

class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load saved preferences
      const settings = await this.getNotificationSettings();
      
      if (settings?.enabled) {
        await this.requestPermissions();
      }

      // Create notification channels for Android
      if (Platform.OS === 'android') {
        await this.createNotificationChannels();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      this.hasPermission = authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      
      // Save permission status
      await this.saveNotificationSettings({ enabled: this.hasPermission });
      
      return this.hasPermission;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async createNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      const channels = [
        {
          id: 'emergency_alerts',
          name: 'Emergency Alerts',
          description: 'High priority alerts for emergency situations',
          importance: 'high',
          vibration: true,
        },
        {
          id: 'status_updates',
          name: 'Status Updates',
          description: 'Updates about ongoing emergency situations',
          importance: 'default',
          vibration: true,
        }
      ];

      for (const channel of channels) {
        await messaging().android.createChannel({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          importance: messaging.Android.Importance[channel.importance.toUpperCase()],
          vibration: channel.vibration,
        });
      }
    }
  }

  async getNotificationSettings(): Promise<{ enabled: boolean } | null> {
    try {
      const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return null;
    }
  }

  async saveNotificationSettings(settings: { enabled: boolean }): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      return await messaging().getToken();
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }
}

export const notificationService = NotificationService.getInstance();
