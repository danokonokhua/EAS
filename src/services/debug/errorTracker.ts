import { Platform } from 'react-native';
import { loggerService } from './loggerService';
import { debugReportGenerator } from './debugReportGenerator';
import { performanceProfiler } from '../../services/debug/performanceProfiler';
import { memoryLeakDetector } from '../../services/debug/memoryLeakDetector';

interface ErrorContext {
  componentStack?: string;
  additionalData?: Record<string, any>;
  severity: 'fatal' | 'error' | 'warning';
  timestamp: number;
}

interface ErrorReport {
  error: Error;
  context: ErrorContext;
  deviceInfo: any;
  performanceMetrics: any;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorHistory: ErrorReport[] = [];
  private readonly MAX_ERROR_HISTORY = 50;
  private isInitialized: boolean = false;
  private errorHandlers: Set<(error: ErrorReport) => void> = new Set();

  private constructor() {
    this.setupGlobalErrorHandling();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private setupGlobalErrorHandling() {
    if (this.isInitialized) return;

    // Handle uncaught JS errors
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.trackError(error, {
        severity: isFatal ? 'fatal' : 'error',
        timestamp: Date.now(),
      });
    });

    // Handle unhandled promise rejections
    const originalHandler = global.Promise.prototype.catch;
    global.Promise.prototype.catch = function(onRejected) {
      return originalHandler.call(this, (error: Error) => {
        ErrorTracker.getInstance().trackError(error, {
          severity: 'error',
          timestamp: Date.now(),
          additionalData: { type: 'unhandled_promise_rejection' },
        });
        return onRejected(error);
      });
    };

    this.isInitialized = true;
  }

  async trackError(error: Error, context: Partial<ErrorContext> = {}) {
    try {
      const errorReport: ErrorReport = {
        error,
        context: {
          severity: context.severity || 'error',
          timestamp: context.timestamp || Date.now(),
          componentStack: context.componentStack,
          additionalData: context.additionalData,
        },
        deviceInfo: await this.getDeviceInfo(),
        performanceMetrics: await this.getPerformanceMetrics(),
      };

      this.errorHistory.unshift(errorReport);
      if (this.errorHistory.length > this.MAX_ERROR_HISTORY) {
        this.errorHistory.pop();
      }

      this.notifyErrorHandlers(errorReport);
      await this.persistError(errorReport);

      if (errorReport.context.severity === 'fatal') {
        await this.handleFatalError(errorReport);
      }

      loggerService.error('Error tracked', {
        error: error.message,
        stack: error.stack,
        context: errorReport.context,
      });
    } catch (trackingError) {
      loggerService.error('Failed to track error', trackingError as Error);
    }
  }

  private async getDeviceInfo() {
    // Implementation to get device info
    return {
      platform: Platform.OS,
      version: Platform.Version,
      // Add more device info as needed
    };
  }

  private async getPerformanceMetrics() {
    // Implementation to get current performance metrics
    return {
      memory: await memoryLeakDetector.getCurrentMemoryUsage(),
      cpu: await performanceProfiler.getCurrentCPUUsage(),
      fps: await performanceProfiler.getCurrentFPS(),
    };
  }

  private async persistError(errorReport: ErrorReport) {
    try {
      // Implementation to persist error to storage or send to server
    } catch (error) {
      loggerService.error('Failed to persist error', error as Error);
    }
  }

  private async handleFatalError(errorReport: ErrorReport) {
    try {
      // Generate debug report for fatal errors
      await debugReportGenerator.generateReport();
      // Additional fatal error handling
    } catch (error) {
      loggerService.error('Failed to handle fatal error', error as Error);
    }
  }

  addErrorHandler(handler: (error: ErrorReport) => void) {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  private notifyErrorHandlers(errorReport: ErrorReport) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorReport);
      } catch (error) {
        loggerService.error('Error handler failed', error as Error);
      }
    });
  }

  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  clearErrorHistory() {
    this.errorHistory = [];
  }
}

export const errorTracker = ErrorTracker.getInstance();
