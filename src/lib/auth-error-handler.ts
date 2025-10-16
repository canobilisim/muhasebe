/**
 * Auth Error Handler
 * Centralized error handling for authentication operations
 */

export type ErrorCategory = 'connection' | 'auth' | 'authorization' | 'system'

export interface AuthError {
  category: ErrorCategory
  message: string
  devMessage: string
  timestamp: string
  context: string
  originalError?: unknown
}

export class AuthErrorHandler {
  /**
   * Handle and categorize authentication errors
   */
  static handle(error: unknown, context: string): AuthError {
    const timestamp = new Date().toISOString()
    
    // Log to console with context
    console.error(`[Auth Error - ${context}]`, {
      timestamp,
      error,
    })
    
    // Categorize error
    const category = this.categorize(error)
    
    // Generate user-friendly message
    const message = this.getUserMessage(category, error)
    
    // Generate developer message
    const devMessage = this.getDevMessage(error)
    
    return {
      category,
      message,
      devMessage,
      timestamp,
      context,
      originalError: error,
    }
  }

  /**
   * Categorize error based on type and message
   */
  private static categorize(error: unknown): ErrorCategory {
    if (!error) return 'system'

    const errorMessage = this.getErrorMessage(error).toLowerCase()

    // Connection errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('cors')
    ) {
      return 'connection'
    }

    // Authentication errors
    if (
      errorMessage.includes('invalid') ||
      errorMessage.includes('credentials') ||
      errorMessage.includes('password') ||
      errorMessage.includes('email') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('confirmation')
    ) {
      return 'auth'
    }

    // Authorization errors
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('access') ||
      errorMessage.includes('denied') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('profile') ||
      errorMessage.includes('inactive') ||
      errorMessage.includes('disabled')
    ) {
      return 'authorization'
    }

    // Default to system error
    return 'system'
  }

  /**
   * Get user-friendly Turkish message based on error category
   */
  private static getUserMessage(category: ErrorCategory, error: unknown): string {
    const errorMessage = this.getErrorMessage(error).toLowerCase()

    switch (category) {
      case 'connection':
        if (errorMessage.includes('timeout')) {
          return 'Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.'
        }
        if (errorMessage.includes('cors')) {
          return 'Sunucu yapılandırma hatası. Lütfen sistem yöneticinize başvurun.'
        }
        return 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'

      case 'auth':
        if (errorMessage.includes('invalid login credentials')) {
          return 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
        }
        if (errorMessage.includes('email not confirmed')) {
          return 'E-posta adresiniz onaylanmamış. Lütfen e-postanızı kontrol edin.'
        }
        if (errorMessage.includes('user not found')) {
          return 'Kullanıcı bulunamadı. Lütfen bilgilerinizi kontrol edin.'
        }
        return 'Giriş bilgileri hatalı. Lütfen tekrar deneyin.'

      case 'authorization':
        if (errorMessage.includes('inactive') || errorMessage.includes('disabled')) {
          return 'Hesabınız devre dışı bırakılmış. Lütfen sistem yöneticinize başvurun.'
        }
        if (errorMessage.includes('profile') || errorMessage.includes('bulunamadı')) {
          return 'Kullanıcı profili bulunamadı. Lütfen sistem yöneticinize başvurun.'
        }
        if (errorMessage.includes('branch')) {
          return 'Şube ataması bulunamadı. Lütfen sistem yöneticinize başvurun.'
        }
        return 'Erişim izniniz yok. Lütfen sistem yöneticinize başvurun.'

      case 'system':
      default:
        if (errorMessage.includes('session')) {
          return 'Oturum hatası oluştu. Lütfen tekrar giriş yapın.'
        }
        return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    }
  }

  /**
   * Get detailed developer message
   */
  private static getDevMessage(error: unknown): string {
    if (!error) return 'Unknown error'

    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack || 'No stack trace'}`
    }

    if (typeof error === 'object') {
      try {
        return JSON.stringify(error, null, 2)
      } catch {
        return String(error)
      }
    }

    return String(error)
  }

  /**
   * Extract error message from various error types
   */
  private static getErrorMessage(error: unknown): string {
    if (!error) return ''

    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        return error.message
      }
      if ('error' in error && typeof error.error === 'string') {
        return error.error
      }
    }

    return String(error)
  }

  /**
   * Check if running in development mode
   */
  static isDevelopment(): boolean {
    return import.meta.env.DEV || import.meta.env.MODE === 'development'
  }
}
