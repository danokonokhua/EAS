import { useCallback } from 'react';
import { errorHandlingService } from '../services/error/errorHandlingService';

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, options?: {
    showAlert?: boolean;
    logToConsole?: boolean;
    reportToSentry?: boolean;
  }) => {
    errorHandlingService.handleError(error, options);
  }, []);

  const handleApiError = useCallback((error: any) => {
    errorHandlingService.handleApiError(error);
  }, []);

  const handleNavigationError = useCallback((error: Error) => {
    errorHandlingService.handleNavigationError(error);
  }, []);

  return {
    handleError,
    handleApiError,
    handleNavigationError,
  };
};
