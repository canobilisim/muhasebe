import { toast } from 'react-hot-toast'

/**
 * Error Handling Utilities
 * Provides centralized error handling, parsing, and user-friendly messages
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export const ErrorType = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
} as const

export type ErrorType = typeof ErrorType[keyof typeof ErrorType]

export interface AppError {
  type: ErrorType
  message: string
  details?: any
  field?: string
  statusCode?: number
}

// ============================================================================
// ERROR DETECTION
// ============================================================================

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    !navigator.onLine ||
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('fetch') ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK'
  )
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: any): boolean {
  return (
    error?.code === 'ECONNABORTED' ||
    error?.message?.toLowerCase().includes('timeout')
  )
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return (
    error?.statusCode === 401 ||
    error?.status === 401 ||
    error?.message?.includes('401') ||
    error?.message?.toLowerCase().includes('unauthorized') ||
    error?.message?.toLowerCase().includes('authentication')
  )
}

/**
 * Check if error is a forbidden error
 */
export function isForbiddenError(error: any): boolean {
  return (
    error?.statusCode === 403 ||
    error?.status === 403 ||
    error?.message?.includes('403') ||
    error?.message?.toLowerCase().includes('forbidden')
  )
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: any): boolean {
  return (
    error?.statusCode === 404 ||
    error?.status === 404 ||
    error?.message?.includes('404') ||
    error?.message?.toLowerCase().includes('not found') ||
    error?.message?.toLowerCase().includes('bulunamadı')
  )
}

/**
 * Check if error is a duplicate error
 */
export function isDuplicateError(error: any): boolean {
  return (
    error?.statusCode === 409 ||
    error?.status === 409 ||
    error?.code === '23505' || // PostgreSQL unique violation
    error?.message?.toLowerCase().includes('duplicate') ||
    error?.message?.toLowerCase().includes('already exists') ||
    error?.message?.toLowerCase().includes('zaten mevcut')
  )
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return (
    error?.statusCode === 400 ||
    error?.status === 400 ||
    error?.type === ErrorType.VALIDATION_ERROR ||
    error?.message?.toLowerCase().includes('validation') ||
    error?.message?.toLowerCase().includes('geçersiz') ||
    error?.message?.toLowerCase().includes('zorunlu')
  )
}

// ============================================================================
// ERROR PARSING
// ============================================================================

/**
 * Parse error and return AppError object
 */
export function parseError(error: any): AppError {
  // Network error
  if (isNetworkError(error)) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      details: error
    }
  }

  // Timeout error
  if (isTimeoutError(error)) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
      details: error
    }
  }

  // Authentication error
  if (isAuthError(error)) {
    return {
      type: ErrorType.UNAUTHORIZED,
      message: 'API Key geçersiz veya süresi dolmuş. Lütfen ayarları kontrol edin.',
      statusCode: 401,
      details: error
    }
  }

  // Forbidden error
  if (isForbiddenError(error)) {
    return {
      type: ErrorType.FORBIDDEN,
      message: 'Bu işlem için yetkiniz bulunmamaktadır.',
      statusCode: 403,
      details: error
    }
  }

  // Not found error
  if (isNotFoundError(error)) {
    return {
      type: ErrorType.NOT_FOUND,
      message: 'İstenen kayıt bulunamadı.',
      statusCode: 404,
      details: error
    }
  }

  // Duplicate error
  if (isDuplicateError(error)) {
    return {
      type: ErrorType.DUPLICATE,
      message: 'Bu kayıt zaten mevcut.',
      statusCode: 409,
      details: error
    }
  }

  // Validation error
  if (isValidationError(error)) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: error.message || 'Girilen bilgiler geçersiz.',
      statusCode: 400,
      details: error
    }
  }

  // Database error
  if (error?.code?.startsWith('23') || error?.message?.toLowerCase().includes('database')) {
    return {
      type: ErrorType.DATABASE_ERROR,
      message: 'Veritabanı hatası oluştu. Lütfen tekrar deneyin.',
      details: error
    }
  }

  // API error with message
  if (error?.message) {
    return {
      type: ErrorType.API_ERROR,
      message: error.message,
      statusCode: error.statusCode || error.status,
      details: error
    }
  }

  // Unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    details: error
  }
}

/**
 * Parse Turkcell API error response
 */
export function parseTurkcellApiError(error: any): AppError {
  // Check for specific Turkcell error messages
  const message = error?.message || error?.error || error?.errorMessage

  if (message) {
    // API Key errors
    if (
      message.includes('API Key') ||
      message.includes('authentication') ||
      message.includes('unauthorized')
    ) {
      return {
        type: ErrorType.UNAUTHORIZED,
        message: 'API Key geçersiz veya süresi dolmuş',
        statusCode: 401,
        details: error
      }
    }

    // Validation errors
    if (
      message.includes('gereklidir') ||
      message.includes('required') ||
      message.includes('invalid')
    ) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: message,
        statusCode: 400,
        details: error
      }
    }

    // Invoice already exists
    if (message.includes('already exists') || message.includes('zaten mevcut')) {
      return {
        type: ErrorType.DUPLICATE,
        message: 'Bu fatura zaten oluşturulmuş',
        statusCode: 409,
        details: error
      }
    }
  }

  // Use generic error parser
  return parseError(error)
}

// ============================================================================
// ERROR DISPLAY
// ============================================================================

/**
 * Display error toast notification
 */
export function showErrorToast(error: any, customMessage?: string): void {
  const appError = parseError(error)
  const message = customMessage || appError.message

  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  })

  // Log error for debugging
  console.error('Error:', appError)
}

/**
 * Display Turkcell API error toast
 */
export function showTurkcellApiErrorToast(error: any, customMessage?: string): void {
  const appError = parseTurkcellApiError(error)
  const message = customMessage || appError.message

  toast.error(message, {
    duration: 6000,
    position: 'top-right',
  })

  // Log error for debugging
  console.error('Turkcell API Error:', appError)
}

/**
 * Display success toast notification
 */
export function showSuccessToast(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  })
}

/**
 * Display warning toast notification
 */
export function showWarningToast(message: string): void {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
  })
}

/**
 * Display info toast notification
 */
export function showInfoToast(message: string): void {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
  })
}

// ============================================================================
// FORM ERROR HELPERS
// ============================================================================

/**
 * Get CSS class for form field with error
 */
export function getFieldErrorClass(hasError: boolean, baseClass: string = ''): string {
  return hasError ? `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500` : baseClass
}

/**
 * Get form validation error summary
 */
export function getFormErrorSummary(errors: Record<string, any>): string[] {
  const errorMessages: string[] = []
  
  Object.keys(errors).forEach((key) => {
    const error = errors[key]
    if (error?.message) {
      errorMessages.push(error.message)
    }
  })
  
  return errorMessages
}

/**
 * Display form error summary
 */
export function showFormErrorSummary(errors: Record<string, any>): void {
  const errorMessages = getFormErrorSummary(errors)
  
  if (errorMessages.length > 0) {
    const summary = errorMessages.length === 1
      ? errorMessages[0]
      : `${errorMessages.length} hata bulundu:\n${errorMessages.join('\n')}`
    
    toast.error(summary, {
      duration: 5000,
      position: 'top-right',
    })
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: any) => boolean
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = (error) => !isAuthError(error) && !isValidationError(error)
  } = options

  let lastError: any
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry if shouldRetry returns false
      if (!shouldRetry(error)) {
        throw error
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`)
        await sleep(delay)
        delay *= backoffMultiplier
      }
    }
  }

  // All retries failed
  throw lastError
}

// ============================================================================
// NETWORK STATUS
// ============================================================================

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Add online/offline event listeners
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
