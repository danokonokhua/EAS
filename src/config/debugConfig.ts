import { LogBox } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { networkInterceptor } from '../services/network/networkInterceptor';
import { SENTRY_DSN } from '@env';

export const DEBUG_CONFIG = {
  // Debug modes
  ENABLE_NETWORK_INSPECTOR: __DEV__,
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  ENABLE_CONSOLE_LOGS: __DEV__,
  ENABLE_ERROR_BOUNDARY: true,
  
  // Logging levels
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
  
  // Performance thresholds
  PERFORMANCE_FPS_THRESHOLD: 30,
  PERFORMANCE_MEMORY_THRESHOLD: 300, // MB
  
  // Network monitoring
  MAX_NETWORK_LOGS: 100,
  NETWORK_REQUEST_TIMEOUT: 30000,
  
  // Debug UI
  DEBUG_PANEL_HEIGHT: 300,
  INITIAL_TAB: 'network',
  
  // Error handling
  MAX_ERROR_LOGS: 50,
  SENTRY_ENABLED: !__DEV__,
  
  // Development ports
  METRO_PORT: 8081,
  DEBUG_PORT: 8097,
};

export const setupDebugConfig = () => {
  if (__DEV__) {
    // Enable debugging features in development
    global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
    global.FormData = global.originalFormData || global.FormData;

    // Ignore specific warnings
    LogBox.ignoreLogs([
      'Require cycle:',
      'ViewPropTypes will be removed',
      '[react-native-gesture-handler]',
      'Non-serializable values were found',
    ]);

    // Enable network debugging
    networkInterceptor.enableDebugMode();
  } else {
    // Initialize Sentry for production
    Sentry.init({
      dsn: SENTRY_DSN,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      environment: 'production',
      tracesSampleRate: 1.0,
    });
  }
};
