import { locationService } from '../location/locationService';
import { notificationService } from '../notification/notificationService';
import { EmergencyDetails, EmergencyType } from '../../types/emergency.types';

class EmergencyFeatureService {
  private static instance: EmergencyFeatureService;

  private constructor() {}

  static getInstance(): EmergencyFeatureService {
    if (!EmergencyFeatureService.instance) {
      EmergencyFeatureService.instance = new EmergencyFeatureService();
    }
    return EmergencyFeatureService.instance;
  }

  async sendSOSSignal(location: { latitude: number; longitude: number }): Promise<void> {
    try {
      // Trigger high-priority emergency signal
      await notificationService.sendPriorityNotification({
        type: 'SOS',
        location,
        timestamp: Date.now()
      });

      // Activate emergency beacon
      await this.activateEmergencyBeacon(location);
    } catch (error) {
      console.error('Failed to send SOS signal:', error);
      throw error;
    }
  }

  async activateEmergencyBeacon(location: { latitude: number; longitude: number }): Promise<void> {
    // Implementation for emergency beacon activation
    // This could involve native module calls for device features
  }

  async calculateETAToHospital(
    currentLocation: { latitude: number; longitude: number },
    hospitalId: string
  ): Promise<number> {
    try {
      // Calculate ETA using routing service
      const route = await locationService.getRouteToHospital(
        currentLocation,
        hospitalId
      );
      return route.duration;
    } catch (error) {
      console.error('Failed to calculate ETA:', error);
      throw error;
    }
  }

  async updateEmergencyStatus(
    emergencyId: string,
    status: EmergencyDetails['status'],
    details?: Partial<EmergencyDetails>
  ): Promise<void> {
    try {
      // Update emergency status and notify relevant parties
      await Promise.all([
        this.updateEmergencyRecord(emergencyId, status, details),
        this.notifyStatusChange(emergencyId, status)
      ]);
    } catch (error) {
      console.error('Failed to update emergency status:', error);
      throw error;
    }
  }
}

export const emergencyFeatureService = EmergencyFeatureService.getInstance();
