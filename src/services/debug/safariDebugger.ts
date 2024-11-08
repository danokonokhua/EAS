import { Platform, NativeModules } from 'react-native';
import { loggerService } from './loggerService';

interface SafariDebugConfig {
  enableSourceMaps: boolean;
  autoShowInspector: boolean;
  breakOnFirstLine: boolean;
}

class SafariDebugger {
  private static instance: SafariDebugger;
  private isDebugging: boolean = false;
  private config: SafariDebugConfig = {
    enableSourceMaps: true,
    autoShowInspector: true,
    breakOnFirstLine: false,
  };

  private constructor() {
    if (Platform.OS === 'ios') {
      this.setupJSContext();
    }
  }

  static getInstance(): SafariDebugger {
    if (!SafariDebugger.instance) {
      SafariDebugger.instance = new SafariDebugger();
    }
    return SafariDebugger.instance;
  }

  private setupJSContext() {
    if (__DEV__) {
      try {
        // Enable JSContext debugging
        NativeModules.JSCContext?.enableDebugging();
        
        // Configure source maps
        if (this.config.enableSourceMaps) {
          NativeModules.JSCContext?.enableSourceMaps();
        }

        loggerService.info('Safari debugger initialized');
      } catch (error) {
        loggerService.error('Failed to setup Safari debugger', error as Error);
      }
    }
  }

  async startDebugging() {
    if (Platform.OS !== 'ios') {
      loggerService.warn('Safari debugging is only available on iOS');
      return;
    }

    try {
      this.isDebugging = true;
      await NativeModules.JSCContext?.startDebugging();
      loggerService.info('Safari debugging started');
    } catch (error) {
      loggerService.error('Failed to start Safari debugging', error as Error);
      this.isDebugging = false;
    }
  }

  stopDebugging() {
    if (this.isDebugging) {
      NativeModules.JSCContext?.stopDebugging();
      this.isDebugging = false;
      loggerService.info('Safari debugging stopped');
    }
  }

  updateConfig(newConfig: Partial<SafariDebugConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    if (Platform.OS === 'ios' && this.isDebugging) {
      this.setupJSContext(); // Reapply configuration
    }
  }

  isDebuggingEnabled(): boolean {
    return this.isDebugging;
  }
}

export const safariDebugger = SafariDebugger.getInstance();
