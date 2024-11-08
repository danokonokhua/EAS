import { Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { debugSettingsManager } from '../debug/debugSettings';

interface ErrorHandlerOptions {
  showAlert?: boolean;
  logToConsole?: boolean;
  reportToSentry?: boolean;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  
  private constructor() {
    this.setupGlobalHandlers();
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  private setupGlobalHandlers() {
    // Handle uncaught JS errors
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.handleError(error, {
        showAlert: isFatal,
        reportToSentry: true
      });
    });

    // Handle promise rejections
    global.onunhandledrejection = (event: any) => {
      this.handleError(event.reason, {
        showAlert: false,
        reportToSentry: true
      });
    };
  }

  handleError(error: Error, options: ErrorHandlerOptions = {}) {
    const {
      showAlert = true,
      logToConsole = __DEV__,
      reportToSentry = !__DEV__
    } = options;

    // Log to console in development
    if (logToConsole) {
      console.error('Error:', error);
    }

    // Report to Sentry in production
    if (reportToSentry) {
      Sentry.captureException(error);
    }

    // Show alert to user if needed
    if (showAlert) {
      Alert.alert(
        'Error',
        this.getErrorMessage(error),
        [{ text: 'OK' }]
      );
    }
  }

  private getErrorMessage(error: Error): string {
    if (__DEV__) {
      return `${error.message}\n\n${error.stack}`;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle API errors
  handleApiError(error: any) {
    if (error.response) {
      // Server responded with error
      this.handleError(new Error(error.response.data?.message || 'API Error'), {
        showAlert: true
      });
    } else if (error.request) {
      // Request made but no response
      this.handleError(new Error('Network Error'), {
        showAlert: true
      });
    } else {
      // Error setting up request
      this.handleError(error, {
        showAlert: true
      });
    }
  }

  // Handle navigation errors
  handleNavigationError(error: Error) {
    this.handleError(error, {
      showAlert: false,
      reportToSentry: true
    });
  }

  // Handle startup errors
  handleStartupError(error: Error) {
    this.handleError(error, {
      showAlert: true,
      reportToSentry: true
    });
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();
