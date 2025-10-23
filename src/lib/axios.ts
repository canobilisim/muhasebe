import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { parseError, showErrorToast, isNetworkError, retryWithBackoff } from '@/utils/errorHandling'

/**
 * Axios Configuration with Interceptors
 * Provides centralized HTTP client with error handling and retry logic
 */

// ============================================================================
// AXIOS INSTANCE CREATION
// ============================================================================

/**
 * Create axios instance with default configuration
 */
export const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Request interceptor
 * - Adds authentication headers
 * - Logs requests in development
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Response interceptor
 * - Handles errors globally
 * - Parses error responses
 * - Logs responses in development
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    return response
  },
  (error: AxiosError) => {
    // Parse error
    const appError = parseError(error)

    // Log error
    console.error('API Error:', {
      type: appError.type,
      message: appError.message,
      statusCode: appError.statusCode,
      url: error.config?.url,
      details: appError.details,
    })

    // Network error - show toast
    if (isNetworkError(error)) {
      showErrorToast(error, 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.')
    }

    // Return parsed error
    return Promise.reject(appError)
  }
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make GET request with error handling
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.get<T>(url, config)
    return response.data
  } catch (error) {
    throw parseError(error)
  }
}

/**
 * Make POST request with error handling
 */
export async function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await axiosInstance.post<T>(url, data, config)
    return response.data
  } catch (error) {
    throw parseError(error)
  }
}

/**
 * Make PUT request with error handling
 */
export async function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await axiosInstance.put<T>(url, data, config)
    return response.data
  } catch (error) {
    throw parseError(error)
  }
}

/**
 * Make PATCH request with error handling
 */
export async function patch<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await axiosInstance.patch<T>(url, data, config)
    return response.data
  } catch (error) {
    throw parseError(error)
  }
}

/**
 * Make DELETE request with error handling
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.delete<T>(url, config)
    return response.data
  } catch (error) {
    throw parseError(error)
  }
}

/**
 * Make request with retry logic
 */
export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  return retryWithBackoff(requestFn, {
    maxRetries,
    initialDelay: 1000,
    backoffMultiplier: 2,
  })
}

// ============================================================================
// EXPORTS
// ============================================================================

export default axiosInstance
