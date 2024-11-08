import { PerformanceObserver, performance } from 'react-native';
import { loggerService } from './loggerService';

interface PerformanceMetric {
  timestamp: number;
  value: number;
  type: 'fps' | 'memory' | 'cpu' | 'network';
}

interface PerformanceSnapshot {
  fps: number;
  memory: {
    used: number;
    total: number;
  };
  cpu: number;
  network: {
    latency: number;
    bandwidth: number;
  };
}

class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private metrics: PerformanceMetric[] = [];
  private observers: Set<(snapshot: PerformanceSnapshot) => void> = new Set();
  private isRecording: boolean = false;
  private recordingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupPerformanceObserver();
  }

  static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler();
    }
    return PerformanceProfiler.instance;
  }

  private setupPerformanceObserver() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric({
          timestamp: entry.startTime,
          value: entry.duration,
          type: this.getMetricType(entry.entryType),
        });
      });
    });

    observer.observe({ entryTypes: ['measure', 'resource'] });
  }

  private getMetricType(entryType: string): 'fps' | 'memory' | 'cpu' | 'network' {
    switch (entryType) {
      case 'frame':
        return 'fps';
      case 'memory':
        return 'memory';
      case 'cpu':
        return 'cpu';
      default:
        return 'network';
    }
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.notifyObservers();
  }

  private notifyObservers() {
    const snapshot = this.getPerformanceSnapshot();
    this.observers.forEach((observer) => {
      try {
        observer(snapshot);
      } catch (error) {
        loggerService.error('Performance observer error', error as Error);
      }
    });
  }

  startRecording(interval: number = 1000) {
    if (this.isRecording) return;

    this.isRecording = true;
    this.recordingInterval = setInterval(() => {
      this.capturePerformanceMetrics();
    }, interval);
  }

  stopRecording() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    this.isRecording = false;
  }

  private async capturePerformanceMetrics() {
    try {
      const snapshot = this.getPerformanceSnapshot();
      this.notifyObservers();
    } catch (error) {
      loggerService.error('Failed to capture performance metrics', error as Error);
    }
  }

  getPerformanceSnapshot(): PerformanceSnapshot {
    return {
      fps: this.calculateFPS(),
      memory: this.getMemoryUsage(),
      cpu: this.getCPUUsage(),
      network: this.getNetworkMetrics(),
    };
  }

  private calculateFPS(): number {
    // Implementation for FPS calculation
    return 60; // Placeholder
  }

  private getMemoryUsage(): { used: number; total: number } {
    // Implementation for memory usage
    return {
      used: 0,
      total: 0,
    };
  }

  private getCPUUsage(): number {
    // Implementation for CPU usage
    return 0;
  }

  private getNetworkMetrics(): { latency: number; bandwidth: number } {
    // Implementation for network metrics
    return {
      latency: 0,
      bandwidth: 0,
    };
  }

  addObserver(observer: (snapshot: PerformanceSnapshot) => void) {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  clearMetrics() {
    this.metrics = [];
  }

  getMetricsHistory(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

export const performanceProfiler = PerformanceProfiler.getInstance();
