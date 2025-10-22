// Application configuration management

interface AppConfig {
  supabase: {
    url: string
    anonKey: string
  }
  app: {
    name: string
    version: string
    environment: 'development' | 'production' | 'test'
  }
  features: {
    analytics: boolean
    errorReporting: boolean
    performanceMonitoring: boolean
  }
  api: {
    timeout: number
    maxFileSize: number
  }
  ui: {
    defaultLanguage: string
    currency: string
  }
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value || defaultValue || ''
}

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export const config: AppConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'HesapOnda'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    environment: getEnvVar('VITE_APP_ENVIRONMENT', 'development') as AppConfig['app']['environment'],
  },
  features: {
    analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
    errorReporting: getBooleanEnvVar('VITE_ENABLE_ERROR_REPORTING', false),
    performanceMonitoring: getBooleanEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', false),
  },
  api: {
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
    maxFileSize: getNumberEnvVar('VITE_MAX_FILE_SIZE', 5242880), // 5MB
  },
  ui: {
    defaultLanguage: getEnvVar('VITE_DEFAULT_LANGUAGE', 'tr'),
    currency: getEnvVar('VITE_CURRENCY', 'TRY'),
  },
}

// Validate critical configuration
export const validateConfig = (): void => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ]

  const missing = requiredVars.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Development helpers
export const isDevelopment = config.app.environment === 'development'
export const isProduction = config.app.environment === 'production'
export const isTest = config.app.environment === 'test'