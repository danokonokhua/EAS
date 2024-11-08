import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyRequest } from '../../types/emergency.types';

const ACTIVE_EMERGENCY_KEY = 'active_emergency';
const APP_STATE_KEY = 'app_state';

class PersistenceService {
  private static instance: PersistenceService;

  private constructor() {}

  static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  async saveActiveEmergency(emergency: EmergencyRequest): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_EMERGENCY_KEY, JSON.stringify(emergency));
    } catch (error) {
      console.error('Failed to save active emergency:', error);
    }
  }

  async getActiveEmergency(): Promise<EmergencyRequest | null> {
    try {
      const emergency = await AsyncStorage.getItem(ACTIVE_EMERGENCY_KEY);
      return emergency ? JSON.parse(emergency) : null;
    } catch (error) {
      console.error('Failed to get active emergency:', error);
      return null;
    }
  }

  async clearActiveEmergency(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_EMERGENCY_KEY);
    } catch (error) {
      console.error('Failed to clear active emergency:', error);
    }
  }

  async saveAppState(state: any): Promise<void> {
    try {
      await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }

  async getAppState(): Promise<any | null> {
    try {
      const state = await AsyncStorage.getItem(APP_STATE_KEY);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Failed to get app state:', error);
      return null;
    }
  }
}

export const persistenceService = PersistenceService.getInstance();
