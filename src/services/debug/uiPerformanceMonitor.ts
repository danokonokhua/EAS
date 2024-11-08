import { InteractionManager } from 'react-native';
import { loggerService } from './loggerService';
import { performanceService } from './performanceService';

class UIPerformanceMonitor {
  private static instance: UIPerformanceMonitor;
  private frameDrops: number = 0;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_DURATION = 1000 / 60;

  private constructor() {}

  static getInstance(): UIPerformanceMonitor {
    if (!UIPerformanceMonitor.instance) {
      UIPerformanceMonitor.instance = new UIPerformanceMonitor();
    }
    return UIPerformanceMonitor.instance;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.frameDrops = 0;
    this.lastFrameTime = performance.now();

    const checkFrame = () => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      const delta = currentTime - this.lastFrameTime;

      if (delta > this.FRAME_DURATION + 5) {
        const droppedFrames = Math.floor(delta / this.FRAME_DURATION);
        this.frameDrops += droppedFrames;
        
        if (droppedFrames > 1) {
          loggerService.warn('Frame drop detected', {
            droppedFrames,
            location: 'UI render',
            timestamp: currentTime,
          });
        }
      }

      this.lastFrameTime = currentTime;
      requestAnimationFrame(checkFrame);
    };

    requestAnimationFrame(checkFrame);
  }

  stopMonitoring() {
    this.isMonitoring = false;
    const report = this.getPerformanceReport();
    loggerService.info('UI Performance Report', report);
  }

  private getPerformanceReport() {
    return {
      totalFrameDrops: this.frameDrops,
      averageFPS: this.TARGET_FPS - (this.frameDrops / (performance.now() / 1000)),
      monitoringDuration: `${(performance.now() / 1000).toFixed(2)}s`,
    };
  }

  async measureRenderTime(componentName: string, renderFunction: () => Promise<void>) {
    performanceService.startMeasurement(`${componentName}_render`);
    
    await InteractionManager.runAfterInteractions(async () => {
      try {
        await renderFunction();
      } catch (error) {
        loggerService.error(`Render error in ${componentName}`, error as Error);
      } finally {
        performanceService.endMeasurement(`${componentName}_render`);
      }
    });
  }
}

export const uiPerformanceMonitor = UIPerformanceMonitor.getInstance();
