import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async saveAuthData(token: string, userId: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['userId', userId],
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const preferences = await AsyncStorage.getItem('userPreferences');
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const storageService = StorageService.getInstance();
