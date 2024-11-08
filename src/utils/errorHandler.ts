import { Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error, isFatal: boolean = false) {
    if (__DEV__) {
      console.error(error);
    } else {
      Sentry.captureException(error);
    }

    if (isFatal) {
      Alert.alert(
        'Application Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  public logWarning(message: string, metadata?: Record<string, any>) {
    if (__DEV__) {
      console.warn(message, metadata);
    } else {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: metadata,
      });
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();
