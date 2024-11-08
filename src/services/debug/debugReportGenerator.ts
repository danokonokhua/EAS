import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { loggerService } from './loggerService';
import { performanceProfiler } from './performanceProfiler';
import { networkMocker } from './networkMocker';
import { stateTimeTravel } from './stateTimeTravel';
import { memoryLeakDetector } from './memoryLeakDetector';

interface DebugReport {
  timestamp: number;
  appInfo: {
    version: string;
    buildNumber: string;
    bundleId: string;
  };
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel: string;
    deviceId: string;
  };
  performance: {
    metrics: any[];
    memory: any[];
  };
  errors: any[];
  networkCalls: any[];
  state: {
    current: any;
    history: any[];
  };
  logs: any[];
}

class DebugReportGenerator {
  private static instance: DebugReportGenerator;

  private constructor() {}

  static getInstance(): DebugReportGenerator {
    if (!DebugReportGenerator.instance) {
      DebugReportGenerator.instance = new DebugReportGenerator();
    }
    return DebugReportGenerator.instance;
  }

  async generateReport(): Promise<DebugReport> {
    try {
      const report: DebugReport = {
        timestamp: Date.now(),
        appInfo: await this.getAppInfo(),
        deviceInfo: await this.getDeviceInfo(),
        performance: this.getPerformanceInfo(),
        errors: loggerService.getErrors(),
        networkCalls: networkMocker.getMocks(),
        state: {
          current: stateTimeTravel.getCurrentSnapshot(),
          history: stateTimeTravel.getSnapshots(),
        },
        logs: loggerService.getLogs(),
      };

      return report;
    } catch (error) {
      loggerService.error('Failed to generate debug report', error as Error);
      throw error;
    }
  }

  private async getAppInfo() {
    return {
      version: await DeviceInfo.getVersion(),
      buildNumber: await DeviceInfo.getBuildNumber(),
      bundleId: await DeviceInfo.getBundleId(),
    };
  }

  private async getDeviceInfo() {
    return {
      platform: Platform.OS,
      osVersion: Platform.Version,
      deviceModel: await DeviceInfo.getModel(),
      deviceId: await DeviceInfo.getUniqueId(),
    };
  }

  private getPerformanceInfo() {
    return {
      metrics: performanceProfiler.getMetrics(),
      memory: memoryLeakDetector.getSnapshots(),
    };
  }

  async saveReport(report: DebugReport): Promise<string> {
    try {
      // Implementation for saving report to file system or cloud storage
      return 'report_path';
    } catch (error) {
      loggerService.error('Failed to save debug report', error as Error);
      throw error;
    }
  }

  async shareReport(reportPath: string): Promise<void> {
    try {
      // Implementation for sharing report via email or other channels
    } catch (error) {
      loggerService.error('Failed to share debug report', error as Error);
      throw error;
    }
  }
}

export const debugReportGenerator = DebugReportGenerator.getInstance();
