import { InteractionManager } from 'react-native';
import * as Sentry from '@sentry/react-native';

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  startMeasurement(name: string) {
    this.metrics.set(name, performance.now());
  }

  endMeasurement(name: string, shouldLog: boolean = true) {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(name);

      if (shouldLog) {
        if (__DEV__) {
          console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        } else {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `${name}: ${duration.toFixed(2)}ms`,
            level: 'info',
          });
        }
      }
      return duration;
    }
    return 0;
  }

  async measureInteraction<T>(
    name: string,
    interaction: () => Promise<T>
  ): Promise<T> {
    this.startMeasurement(name);
    try {
      const result = await interaction();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  }

  async measureNextFrame(name: string): Promise<void> {
    return new Promise((resolve) => {
      this.startMeasurement(name);
      InteractionManager.runAfterInteractions(() => {
        this.endMeasurement(name);
        resolve();
      });
    });
  }
}

export const performanceService = PerformanceService.getInstance();
