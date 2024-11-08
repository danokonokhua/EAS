import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandlingService } from '../error/errorHandlingService';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private static instance: AuthService;
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };
  private listeners: Set<(state: AuthState) => void> = new Set();

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        this.state = {
          token,
          user: JSON.parse(userData),
          isAuthenticated: true,
        };
        this.notifyListeners();
      }
    } catch (error) {
      errorHandlingService.handleError(error as Error);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      // TODO: Implement actual API call
      const mockResponse = {
        token: 'mock_token_' + Date.now(),
        user: {
          id: '123',
          name: 'John Doe',
          email,
          phone: '+1234567890',
          emergencyContacts: [],
        },
      };

      await AsyncStorage.setItem('auth_token', mockResponse.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockResponse.user));

      this.state = {
        token: mockResponse.token,
        user: mockResponse.user,
        isAuthenticated: true,
      };
      this.notifyListeners();
    } catch (error) {
      errorHandlingService.handleError(error as Error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');

      this.state = {
        token: null,
        user: null,
        isAuthenticated: false,
      };
      this.notifyListeners();
    } catch (error) {
      errorHandlingService.handleError(error as Error);
      throw error;
    }
  }

  addAuthStateListener(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }
}

export const authService = AuthService.getInstance();
