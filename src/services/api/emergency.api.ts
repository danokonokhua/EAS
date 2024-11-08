import axios from 'axios';
import { EmergencyRequest, Location, EmergencyType } from '../types/emergency.types';
import { API_CONFIG } from '../config/api.config';

class EmergencyService {
  private baseUrl = API_CONFIG.baseUrl;

  async createEmergencyRequest(data: {
    location: Location;
    emergencyType: EmergencyType;
    patientId: string;
  }): Promise<EmergencyRequest> {
    try {
      const response = await axios.post(`${this.baseUrl}/emergency/request`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create emergency request');
    }
  }

  async getNearbyAmbulances(location: Location): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/ambulances/nearby`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000 // 5km radius
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch nearby ambulances');
    }
  }

  async updateRequestStatus(requestId: string, status: string): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/emergency/request/${requestId}/status`, {
        status
      });
    } catch (error) {
      throw new Error('Failed to update request status');
    }
  }
}

export const emergencyService = new EmergencyService();
