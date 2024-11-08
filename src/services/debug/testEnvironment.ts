import { Platform } from 'react-native';
import { loggerService } from './loggerService';
import { performanceService } from './performanceService';

class TestEnvironmentDebugger {
  private static instance: TestEnvironmentDebugger;
  private mockData: Map<string, any> = new Map();
  private isTestMode: boolean = false;
  private testScenarios: Map<string, () => void> = new Map();

  private constructor() {
    this.setupTestEnvironment();
  }

  static getInstance(): TestEnvironmentDebugger {
    if (!TestEnvironmentDebugger.instance) {
      TestEnvironmentDebugger.instance = new TestEnvironmentDebugger();
    }
    return TestEnvironmentDebugger.instance;
  }

  private setupTestEnvironment() {
    if (__DEV__) {
      // Override console methods for test environment
      const originalConsole = { ...console };
      (global as any).originalConsole = originalConsole;

      console.log = (...args) => {
        if (this.isTestMode) {
          loggerService.debug('Test Log', { args });
        }
        originalConsole.log(...args);
      };

      // Add test-specific error handling
      global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        loggerService.error('Test Environment Error', error, { isFatal });
        if (isFatal) {
          this.handleFatalError(error);
        }
      });
    }
  }

  enableTestMode() {
    this.isTestMode = true;
    loggerService.info('Test Mode Enabled');
  }

  disableTestMode() {
    this.isTestMode = false;
    this.mockData.clear();
    this.testScenarios.clear();
    loggerService.info('Test Mode Disabled');
  }

  addMockData(key: string, data: any) {
    this.mockData.set(key, data);
  }

  getMockData(key: string): any {
    return this.mockData.get(key);
  }

  addTestScenario(name: string, scenario: () => void) {
    this.testScenarios.set(name, scenario);
  }

  async runTestScenario(name: string) {
    const scenario = this.testScenarios.get(name);
    if (scenario) {
      try {
        performanceService.startMeasurement(`test_scenario_${name}`);
        await scenario();
        performanceService.endMeasurement(`test_scenario_${name}`);
      } catch (error) {
        loggerService.error(`Test Scenario '${name}' failed`, error as Error);
      }
    }
  }

  private handleFatalError(error: Error) {
    if (Platform.OS === 'ios') {
      // iOS-specific error handling
    } else {
      // Android-specific error handling
    }
  }
}

export const testEnvironmentDebugger = TestEnvironmentDebugger.getInstance();
