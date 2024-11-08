import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiService } from '../api/apiService';
import { APP_CONFIG } from '../../config/appConfig';

interface EmergencyAlert {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  emergencyType: 'MEDICAL' | 'ACCIDENT' | 'CRITICAL';
  description?: string;
  contactNumbers: string[];
}

class EmergencyAlertService {
  private static instance: EmergencyAlertService;

  private constructor() {}

  static getInstance(): EmergencyAlertService {
    if (!EmergencyAlertService.instance) {
      EmergencyAlertService.instance = new EmergencyAlertService();
    }
    return EmergencyAlertService.instance;
  }

  async sendEmergencyAlert(alert: EmergencyAlert) {
    try {
      // Send alert to backend
      const response = await apiService.post('/emergency/alert', alert);

      // Send SMS to emergency contacts
      await this.notifyEmergencyContacts(alert);

      // Send push notifications
      await this.sendPushNotifications(alert);

      return response.data;
    } catch (error) {
      console.error('Emergency alert failed:', error);
      throw error;
    }
  }

  private async notifyEmergencyContacts(alert: EmergencyAlert) {
    try {
      await apiService.post('/emergency/notify-contacts', {
        contactNumbers: alert.contactNumbers,
        location: alert.location,
        emergencyType: alert.emergencyType,
      });
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
    }
  }

  private async sendPushNotifications(alert: EmergencyAlert) {
    try {
      await messaging().sendMessage({
        data: {
          type: 'EMERGENCY_ALERT',
          userId: alert.userId,
          emergencyType: alert.emergencyType,
          latitude: String(alert.location.latitude),
          longitude: String(alert.location.longitude),
        },
        notification: {
          title: 'Emergency Alert',
          body: `Emergency ${alert.emergencyType} reported near your location`,
        },
      });
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }
}

export const emergencyAlertService = EmergencyAlertService.getInstance();
