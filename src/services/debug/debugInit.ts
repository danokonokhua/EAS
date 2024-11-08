import { DEBUG_CONFIG } from '../../config/debugConfig';
import { networkMonitor } from './networkMonitor';
import { performanceProfiler } from './performanceProfiler';
import { debugCommands } from './debugCommands';
import { errorHandlingService } from '../error/errorHandlingService';

export const initializeDebugTools = () => {
  if (__DEV__) {
    // Initialize network monitoring
    if (DEBUG_CONFIG.ENABLE_NETWORK_INSPECTOR) {
      networkMonitor.initialize();
    }

    // Initialize performance monitoring
    if (DEBUG_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
      performanceProfiler.startRecording();
    }

    // Register default debug commands
    debugCommands.registerDefaultCommands();

    // Setup global error handlers
    errorHandlingService.setupGlobalHandlers();

    console.log('Debug tools initialized');
  }
};
