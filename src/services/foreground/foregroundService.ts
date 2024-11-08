import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Platform } from 'react-native';

class ForegroundService {
  private static instance: ForegroundService;
  private isRunning: boolean = false;

  private constructor() {}

  static getInstance(): ForegroundService {
    if (!ForegroundService.instance) {
      ForegroundService.instance = new ForegroundService();
    }
    return ForegroundService.instance;
  }

  async startService(): Promise<void> {
    if (Platform.OS !== 'android' || this.isRunning) {
      return;
    }

    try {
      const channelConfig = {
        id: 'emergency_service',
        name: 'Emergency Service',
        description: 'Keeps the emergency response service active',
        enableVibration: false,
        importance: 2,
      };

      await VIForegroundService.createChannel(channelConfig);

      const notificationConfig = {
        channelId: 'emergency_service',
        id: 3456,
        title: 'Emergency Response Active',
        text: 'Ready to respond to emergencies',
        icon: 'ic_notification',
        priority: 2,
      };

      await VIForegroundService.startService(notificationConfig);
      this.isRunning = true;
    } catch (error) {
      console.error('Failed to start foreground service:', error);
    }
  }

  async stopService(): Promise<void> {
    if (Platform.OS !== 'android' || !this.isRunning) {
      return;
    }

    try {
      await VIForegroundService.stopService();
      this.isRunning = false;
    } catch (error) {
      console.error('Failed to stop foreground service:', error);
    }
  }
}

export const foregroundService = ForegroundService.getInstance();
