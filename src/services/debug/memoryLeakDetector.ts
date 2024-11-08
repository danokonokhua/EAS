import { NativeEventEmitter, NativeModules } from 'react-native';
import { loggerService } from './loggerService';
import { performanceProfiler } from './performanceProfiler';

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  components: Map<string, number>;
  subscriptions: Map<string, number>;
}

class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = 10000; // 10 seconds
  private readonly LEAK_THRESHOLD = 1024 * 1024 * 5; // 5MB

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  private setupEventListeners() {
    if (__DEV__) {
      const eventEmitter = new NativeEventEmitter(NativeModules.MemoryInfo);
      eventEmitter.addListener('memoryWarning', this.handleMemoryWarning);
    }
  }

  private handleMemoryWarning = () => {
    const snapshot = this.takeSnapshot();
    loggerService.warn('Memory Warning Received', {
      heapUsed: snapshot.heapUsed,
      heapTotal: snapshot.heapTotal,
    });
  };

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      const snapshot = this.takeSnapshot();
      this.analyzeMemoryUsage(snapshot);
    }, this.INTERVAL_MS);

    loggerService.info('Memory leak detection started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    loggerService.info('Memory leak detection stopped');
  }

  private takeSnapshot(): MemorySnapshot {
    const memoryUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      components: new Map(),
      subscriptions: new Map(),
    };

    // Track component instances
    this.trackComponentInstances(snapshot);
    // Track event subscriptions
    this.trackEventSubscriptions(snapshot);

    this.snapshots.push(snapshot);
    return snapshot;
  }

  private analyzeMemoryUsage(currentSnapshot: MemorySnapshot) {
    if (this.snapshots.length < 2) return;

    const previousSnapshot = this.snapshots[this.snapshots.length - 2];
    const memoryDiff = currentSnapshot.heapUsed - previousSnapshot.heapUsed;

    if (memoryDiff > this.LEAK_THRESHOLD) {
      this.detectLeaks(previousSnapshot, currentSnapshot);
    }
  }

  private detectLeaks(previous: MemorySnapshot, current: MemorySnapshot) {
    // Detect component leaks
    current.components.forEach((count, component) => {
      const previousCount = previous.components.get(component) || 0;
      if (count > previousCount * 1.5) { // 50% increase threshold
        loggerService.warn('Potential component memory leak detected', {
          component,
          previousCount,
          currentCount: count,
        });
      }
    });

    // Detect subscription leaks
    current.subscriptions.forEach((count, subscription) => {
      const previousCount = previous.subscriptions.get(subscription) || 0;
      if (count > previousCount) {
        loggerService.warn('Potential subscription leak detected', {
          subscription,
          previousCount,
          currentCount: count,
        });
      }
    });
  }

  private trackComponentInstances(snapshot: MemorySnapshot) {
    // Implementation for tracking React component instances
    // This would require integration with React DevTools
  }

  private trackEventSubscriptions(snapshot: MemorySnapshot) {
    // Implementation for tracking event subscriptions
    // This would require integration with React Native's EventEmitter
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  clearSnapshots() {
    this.snapshots = [];
  }
}

export const memoryLeakDetector = MemoryLeakDetector.getInstance();
