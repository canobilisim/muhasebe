import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

interface AsyncStateOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export const useAsyncState = <T>(
  initialData: T | null = null,
  options: AsyncStateOptions = {}
) => {
  const { showErrorToast = true, showSuccessToast = false, successMessage } = options;
  const { handleError, showSuccess } = useErrorHandler();

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: isLoading ? null : prev.error,
      isSuccess: false,
      isError: false,
    }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({
      data,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    });

    if (showSuccessToast && successMessage) {
      showSuccess(successMessage);
    }
  }, [showSuccessToast, successMessage, showSuccess]);

  const setError = useCallback((error: any, customMessage?: string) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Bir hata oluştu';
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: errorMessage,
      isSuccess: false,
      isError: true,
    }));

    if (showErrorToast) {
      handleError(error, customMessage);
    }
  }, [showErrorToast, handleError]);

  const execute = useCallback(
    async <R = T>(
      asyncFn: () => Promise<R>,
      options?: {
        onSuccess?: (data: R) => void;
        onError?: (error: any) => void;
        errorMessage?: string;
        successMessage?: string;
      }
    ): Promise<R | null> => {
      setLoading(true);
      
      try {
        const result = await asyncFn();
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        } else {
          setData(result as unknown as T);
        }

        if (options?.successMessage) {
          showSuccess(options.successMessage);
        }

        return result;
      } catch (error) {
        if (options?.onError) {
          options.onError(error);
        } else {
          setError(error, options?.errorMessage);
        }
        return null;
      }
    },
    [setLoading, setData, setError, showSuccess]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, [initialData]);

  const retry = useCallback(
    (asyncFn: () => Promise<T>) => {
      return execute(asyncFn);
    },
    [execute]
  );

  return {
    ...state,
    setLoading,
    setData,
    setError,
    execute,
    reset,
    retry,
  };
};

// Specialized hook for API calls
export const useApiCall = <T>(options?: AsyncStateOptions) => {
  return useAsyncState<T>(null, options);
};

// Hook for managing multiple async operations
export const useAsyncOperations = () => {
  const [operations, setOperations] = useState<Record<string, AsyncState<any>>>({});

  const getOperation = useCallback((key: string) => {
    return operations[key] || {
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    };
  }, [operations]);

  const setOperationState = useCallback((key: string, state: Partial<AsyncState<any>>) => {
    setOperations(prev => ({
      ...prev,
      [key]: { ...getOperation(key), ...state }
    }));
  }, [getOperation]);

  const executeOperation = useCallback(
    async <T>(
      key: string,
      asyncFn: () => Promise<T>,
      options?: AsyncStateOptions
    ): Promise<T | null> => {
      const { showErrorToast = true } = options || {};
      const { handleError } = useErrorHandler();

      setOperationState(key, { isLoading: true, error: null, isSuccess: false, isError: false });

      try {
        const result = await asyncFn();
        setOperationState(key, { 
          data: result, 
          isLoading: false, 
          isSuccess: true, 
          isError: false 
        });
        return result;
      } catch (error) {
        setOperationState(key, { 
          isLoading: false, 
          error: error?.message || 'Bir hata oluştu', 
          isSuccess: false, 
          isError: true 
        });
        
        if (showErrorToast) {
          handleError(error);
        }
        
        return null;
      }
    },
    [setOperationState]
  );

  return {
    operations,
    getOperation,
    executeOperation,
    isLoading: (key: string) => getOperation(key).isLoading,
    isError: (key: string) => getOperation(key).isError,
    isSuccess: (key: string) => getOperation(key).isSuccess,
    getData: (key: string) => getOperation(key).data,
    getError: (key: string) => getOperation(key).error,
  };
};