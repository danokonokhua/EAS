import AsyncStorage from '@react-native-async-storage/async-storage';
import { loggerService } from './loggerService';
import { networkMonitor } from './networkMonitor';
import { performanceProfiler } from './performanceProfiler';
import { safariDebugger } from './safariDebugger';

interface DebugSettings {
  isDebugModeEnabled: boolean;
  isRemoteDebuggingEnabled: boolean;
  isNetworkInspectionEnabled: boolean;
  isPerformanceMonitoringEnabled: boolean;
  isSafariDebuggingEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  networkInspectionConfig: {
    captureRequests: boolean;
    captureResponses: boolean;
    captureWebSockets: boolean;
  };
  performanceConfig: {
    captureFrameMetrics: boolean;
    captureMemoryMetrics: boolean;
    captureCPUMetrics: boolean;
  };
}

const DEFAULT_SETTINGS: DebugSettings = {
  isDebugModeEnabled: __DEV__,
  isRemoteDebuggingEnabled: false,
  isNetworkInspectionEnabled: true,
  isPerformanceMonitoringEnabled: true,
  isSafariDebuggingEnabled: false,
  logLevel: 'info',
  networkInspectionConfig: {
    captureRequests: true,
    captureResponses: true,
    captureWebSockets: true,
  },
  performanceConfig: {
    captureFrameMetrics: true,
    captureMemoryMetrics: true,
    captureCPUMetrics: true,
  },
};

class DebugSettingsManager {
  private static instance: DebugSettingsManager;
  private settings: DebugSettings = DEFAULT_SETTINGS;
  private readonly STORAGE_KEY = '@debug_settings';
  private settingsListeners: Set<(settings: DebugSettings) => void> = new Set();

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): DebugSettingsManager {
    if (!DebugSettingsManager.instance) {
      DebugSettingsManager.instance = new DebugSettingsManager();
    }
    return DebugSettingsManager.instance;
  }

  private async loadSettings() {
    try {
      const storedSettings = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        this.applySettings();
      }
    } catch (error) {
      loggerService.error('Failed to load debug settings', error as Error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      loggerService.error('Failed to save debug settings', error as Error);
    }
  }

  private applySettings() {
    // Apply log level
    loggerService.setLogLevel(this.settings.logLevel);

    // Apply network inspection settings
    if (this.settings.isNetworkInspectionEnabled) {
      networkMonitor.startMonitoring();
    } else {
      networkMonitor.stopMonitoring();
    }

    // Apply performance monitoring settings
    if (this.settings.isPerformanceMonitoringEnabled) {
      performanceProfiler.startMonitoring(this.settings.performanceConfig);
    } else {
      performanceProfiler.stopMonitoring();
    }

    // Apply Safari debugging settings
    if (this.settings.isSafariDebuggingEnabled) {
      safariDebugger.startDebugging();
    } else {
      safariDebugger.stopDebugging();
    }
  }

  async updateSettings(newSettings: Partial<DebugSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
    await this.saveSettings();
  }

  getSettings(): DebugSettings {
    return { ...this.settings };
  }

  addSettingsListener(listener: (settings: DebugSettings) => void) {
    this.settingsListeners.add(listener);
    return () => {
      this.settingsListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const settings = this.getSettings();
    this.settingsListeners.forEach(listener => {
      try {
        listener(settings);
      } catch (error) {
        loggerService.error('Settings listener error', error as Error);
      }
    });
  }

  resetToDefaults() {
    this.settings = DEFAULT_SETTINGS;
    this.applySettings();
    this.saveSettings();
  }
}

export const debugSettingsManager = DebugSettingsManager.getInstance();
