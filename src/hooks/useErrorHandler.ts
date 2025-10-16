import { useCallback } from 'react';
import { handleErrorWithToast, handleApiError, withErrorHandling } from '@/lib/error-handler';
import { showToast } from '@/lib/toast';

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, customMessage?: string) => {
    return handleErrorWithToast(error, customMessage);
  }, []);

  const handleApiErrorOnly = useCallback((error: any) => {
    return handleApiError(error);
  }, []);

  const withAsyncErrorHandling = useCallback(
    <T>(asyncFn: () => Promise<T>, errorMessage?: string) => {
      return withErrorHandling(asyncFn, errorMessage);
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    showToast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    showToast.error(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    showToast.warning(message);
  }, []);

  const showInfo = useCallback((message: string) => {
    showToast.info(message);
  }, []);

  const showLoading = useCallback((message: string) => {
    return showToast.loading(message);
  }, []);

  const dismissToast = useCallback((toastId?: string) => {
    showToast.dismiss(toastId);
  }, []);

  const showPromiseToast = useCallback(
    <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      return showToast.promise(promise, messages);
    },
    []
  );

  return {
    handleError,
    handleApiError: handleApiErrorOnly,
    withAsyncErrorHandling,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissToast,
    showPromiseToast,
  };
};