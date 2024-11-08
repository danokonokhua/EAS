import { networkMonitor } from './networkMonitor';
import { performanceProfiler } from './performanceProfiler';
import { loggerService } from './loggerService';
import { debugSettingsManager } from './debugSettings';

interface DebugReport {
  timestamp: number;
  deviceInfo: {
    platform: string;
    version: string;
    deviceId: string;
  };
  performanceMetrics: {
    fps: number[];
    memory: number[];
    cpu: number[];
    networkLatency: number[];
  };
  networkLogs: {
    requests: any[];
    responses: any[];
    errors: any[];
  };
  errorReports: {
    jsErrors: any[];
    nativeErrors: any[];
    crashReports: any[];
  };
  debugSession: {
    startTime: number;
    endTime: number;
    actions: any[];
    stateChanges: any[];
  };
}

class DebugReportGenerator {
  private static instance: DebugReportGenerator;
  private isRecording: boolean = false;
  private sessionStartTime: number = 0;
  private recordedActions: any[] = [];

  private constructor() {}

  static getInstance(): DebugReportGenerator {
    if (!DebugReportGenerator.instance) {
      DebugReportGenerator.instance = new DebugReportGenerator();
    }
    return DebugReportGenerator.instance;
  }

  startRecording() {
    this.isRecording = true;
    this.sessionStartTime = Date.now();
    this.recordedActions = [];
    loggerService.info('Debug session recording started');
  }

  stopRecording(): DebugReport {
    this.isRecording = false;
    const sessionEndTime = Date.now();

    const report: DebugReport = {
      timestamp: Date.now(),
      deviceInfo: this.collectDeviceInfo(),
      performanceMetrics: this.collectPerformanceMetrics(),
      networkLogs: this.collectNetworkLogs(),
      errorReports: this.collectErrorReports(),
      debugSession: {
        startTime: this.sessionStartTime,
        endTime: sessionEndTime,
        actions: this.recordedActions,
        stateChanges: this.collectStateChanges(),
      },
    };

    loggerService.info('Debug session recording stopped');
    return report;
  }

  private collectDeviceInfo() {
    // Implementation for collecting device info
    return {
      platform: 'platform',
      version: 'version',
      deviceId: 'deviceId',
    };
  }

  private collectPerformanceMetrics() {
    return {
      fps: performanceProfiler.getFPSHistory(),
      memory: performanceProfiler.getMemoryUsageHistory(),
      cpu: performanceProfiler.getCPUUsageHistory(),
      networkLatency: networkMonitor.getLatencyHistory(),
    };
  }

  private collectNetworkLogs() {
    return {
      requests: networkMonitor.getRequests(),
      responses: networkMonitor.getResponses(),
      errors: networkMonitor.getErrors(),
    };
  }

  private collectErrorReports() {
    return {
      jsErrors: [],
      nativeErrors: [],
      crashReports: [],
    };
  }

  private collectStateChanges() {
    return [];
  }

  recordAction(action: any) {
    if (this.isRecording) {
      this.recordedActions.push({
        timestamp: Date.now(),
        action,
      });
    }
  }

  async generateReport(): Promise<DebugReport> {
    const report = this.stopRecording();
    try {
      // Save report to file or send to server
      return report;
    } catch (error) {
      loggerService.error('Failed to generate debug report', error as Error);
      throw error;
    }
  }
}

export const debugReportGenerator = DebugReportGenerator.getInstance();
