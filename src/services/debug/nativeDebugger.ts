import { NativeModules, Platform } from 'react-native';
import { loggerService } from './loggerService';

interface NativeLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  tag?: string;
}

class NativeDebugger {
  private static instance: NativeDebugger;
  private nativeLogs: NativeLog[] = [];

  private constructor() {
    this.setupNativeLogListener();
  }

  static getInstance(): NativeDebugger {
    if (!NativeDebugger.instance) {
      NativeDebugger.instance = new NativeDebugger();
    }
    return NativeDebugger.instance;
  }

  private setupNativeLogListener() {
    if (Platform.OS === 'android') {
      NativeModules.LogcatModule?.startLogging();
      NativeModules.LogcatModule?.addListener('onLogReceived', this.handleNativeLog);
    } else {
      // iOS logging setup
      NativeModules.RCTLog?.addListener('LogMessage', this.handleNativeLog);
    }
  }

  private handleNativeLog = (log: NativeLog) => {
    this.nativeLogs.push(log);
    
    if (__DEV__) {
      loggerService.debug('Native Log', log);
    }

    // Keep logs under limit
    if (this.nativeLogs.length > 1000) {
      this.nativeLogs.shift();
    }
  };

  getNativeLogs(): NativeLog[] {
    return [...this.nativeLogs];
  }

  clearNativeLogs() {
    this.nativeLogs = [];
  }

  async captureNativeCrash() {
    try {
      if (Platform.OS === 'android') {
        const crashLog = await NativeModules.CrashReporter.getLastCrashLog();
        if (crashLog) {
          loggerService.error('Native Crash Detected', new Error(crashLog));
        }
      } else {
        // iOS crash reporting
        const crashLog = await NativeModules.RCTCrashReporter.getLastCrashLog();
        if (crashLog) {
          loggerService.error('Native Crash Detected', new Error(crashLog));
        }
      }
    } catch (error) {
      loggerService.error('Failed to capture native crash', error as Error);
    }
  }
}

export const nativeDebugger = NativeDebugger.getInstance();
