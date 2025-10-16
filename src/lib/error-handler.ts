import { showToast } from './toast';

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Custom error classes
export class NetworkError extends Error {
  constructor(message: string = 'Ağ bağlantısı hatası') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Geçersiz veri') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Kimlik doğrulama hatası') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Yetki hatası') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Kayıt bulunamadı') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Error handler functions
export const handleApiError = (error: any): ApiError => {
  console.error('API Error:', error);

  // Network errors
  if (!navigator.onLine) {
    return {
      message: 'İnternet bağlantınızı kontrol edin',
      code: 'NETWORK_ERROR'
    };
  }

  // Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return {
          message: 'Kayıt bulunamadı',
          code: error.code,
          status: 404
        };
      case '23505':
        return {
          message: 'Bu kayıt zaten mevcut',
          code: error.code,
          status: 409
        };
      case '23503':
        return {
          message: 'Bu kayıt başka kayıtlar tarafından kullanılıyor',
          code: error.code,
          status: 409
        };
      case 'PGRST301':
        return {
          message: 'Bu işlem için yetkiniz bulunmuyor',
          code: error.code,
          status: 403
        };
      default:
        return {
          message: error.message || 'Veritabanı hatası',
          code: error.code,
          status: 500
        };
    }
  }

  // HTTP status errors
  if (error?.status) {
    switch (error.status) {
      case 400:
        return {
          message: 'Geçersiz istek',
          status: 400
        };
      case 401:
        return {
          message: 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın',
          status: 401
        };
      case 403:
        return {
          message: 'Bu işlem için yetkiniz bulunmuyor',
          status: 403
        };
      case 404:
        return {
          message: 'Kayıt bulunamadı',
          status: 404
        };
      case 409:
        return {
          message: 'Çakışma hatası',
          status: 409
        };
      case 422:
        return {
          message: 'Geçersiz veri',
          status: 422
        };
      case 500:
        return {
          message: 'Sunucu hatası',
          status: 500
        };
      default:
        return {
          message: 'Bilinmeyen hata',
          status: error.status
        };
    }
  }

  // Custom error types
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR'
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR'
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      message: error.message,
      code: 'AUTH_ERROR'
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      message: error.message,
      code: 'AUTHORIZATION_ERROR'
    };
  }

  if (error instanceof NotFoundError) {
    return {
      message: error.message,
      code: 'NOT_FOUND'
    };
  }

  // Generic error
  return {
    message: error?.message || 'Beklenmeyen bir hata oluştu',
    code: 'UNKNOWN_ERROR'
  };
};

// Error handler with toast notification
export const handleErrorWithToast = (error: any, customMessage?: string) => {
  const apiError = handleApiError(error);
  const message = customMessage || apiError.message;
  showToast.error(message);
  return apiError;
};

// Async error handler wrapper
export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    handleErrorWithToast(error, errorMessage);
    return null;
  }
};

// Form validation error handler
export const handleFormErrors = (errors: Record<string, any>) => {
  const errorMessages = Object.values(errors)
    .map((error: any) => error?.message)
    .filter(Boolean);
  
  if (errorMessages.length > 0) {
    showToast.error(errorMessages[0]);
  }
};