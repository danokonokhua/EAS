import { Platform, NativeModules } from 'react-native';
import { loggerService } from './loggerService';

interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  version: string;
  isEmulator: boolean;
}

interface ConnectionConfig {
  port: number;
  host: string;
  timeout: number;
  retryAttempts: number;
}

class DeviceConnection {
  private static instance: DeviceConnection;
  private isConnected: boolean = false;
  private deviceInfo: DeviceInfo | null = null;
  private config: ConnectionConfig = {
    port: 8081,
    host: 'localhost',
    timeout: 5000,
    retryAttempts: 3,
  };

  private constructor() {
    this.initializeDeviceInfo();
  }

  static getInstance(): DeviceConnection {
    if (!DeviceConnection.instance) {
      DeviceConnection.instance = new DeviceConnection();
    }
    return DeviceConnection.instance;
  }

  private async initializeDeviceInfo() {
    try {
      const deviceInfo = await this.getDeviceInfo();
      this.deviceInfo = deviceInfo;
      loggerService.info('Device info initialized', deviceInfo);
    } catch (error) {
      loggerService.error('Failed to initialize device info', error as Error);
    }
  }

  async connect(): Promise<boolean> {
    try {
      // Setup port forwarding for Android
      if (Platform.OS === 'android') {
        await this.setupPortForwarding();
      }

      // Attempt connection
      await this.establishConnection();
      this.isConnected = true;
      loggerService.info('Device connected successfully');
      return true;
    } catch (error) {
      loggerService.error('Failed to connect device', error as Error);
      return false;
    }
  }

  disconnect() {
    try {
      // Cleanup port forwarding
      if (Platform.OS === 'android') {
        this.cleanupPortForwarding();
      }
      this.isConnected = false;
      loggerService.info('Device disconnected');
    } catch (error) {
      loggerService.error('Failed to disconnect device', error as Error);
    }
  }

  private async setupPortForwarding() {
    if (Platform.OS === 'android') {
      try {
        await NativeModules.DeviceInfo.setupPortForwarding(this.config.port);
      } catch (error) {
        throw new Error(`Failed to setup port forwarding: ${error}`);
      }
    }
  }

  private async cleanupPortForwarding() {
    if (Platform.OS === 'android') {
      try {
        await NativeModules.DeviceInfo.cleanupPortForwarding(this.config.port);
      } catch (error) {
        loggerService.error('Failed to cleanup port forwarding', error as Error);
      }
    }
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const tryConnect = async () => {
        try {
          // Attempt to establish connection
          await this.testConnection();
          resolve();
        } catch (error) {
          attempts++;
          if (attempts >= this.config.retryAttempts) {
            reject(new Error('Failed to establish connection after multiple attempts'));
          } else {
            setTimeout(tryConnect, 1000);
          }
        }
      };
      tryConnect();
    });
  }

  private async testConnection(): Promise<void> {
    // Implementation for testing connection
    return Promise.resolve();
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    // Implementation for getting device info
    return {
      id: 'device_id',
      name: 'device_name',
      platform: Platform.OS,
      version: Platform.Version.toString(),
      isEmulator: false,
    };
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  getDeviceInformation(): DeviceInfo | null {
    return this.deviceInfo;
  }

  updateConfig(newConfig: Partial<ConnectionConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const deviceConnection = DeviceConnection.getInstance();
