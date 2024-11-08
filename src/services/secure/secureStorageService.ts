import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

class SecureStorageService {
  async saveSecureItem(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        // Web doesn't support secure storage, fallback to localStorage
        localStorage.setItem(key, value);
      } else if (Platform.OS === 'ios') {
        await SecureStore.setItemAsync(key, value);
      } else {
        await EncryptedStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error saving secure item:', error);
      throw error;
    }
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else if (Platform.OS === 'ios') {
        return await SecureStore.getItemAsync(key);
      } else {
        return await EncryptedStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting secure item:', error);
      return null;
    }
  }

  async removeSecureItem(key: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else if (Platform.OS === 'ios') {
        await SecureStore.deleteItemAsync(key);
      } else {
        await EncryptedStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw error;
    }
  }
}

export const secureStorageService = new SecureStorageService();
