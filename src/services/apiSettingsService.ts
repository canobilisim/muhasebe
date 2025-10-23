import { supabase } from '@/lib/supabase'
import { encryptApiKey, decryptApiKey } from '@/utils/encryption'

/**
 * API Settings types
 */
export interface ApiSettings {
  id: string
  username_encrypted: string
  password_encrypted: string
  environment: 'test' | 'production'
  is_active: boolean
  last_test_date?: string
  last_test_status?: string
  created_at: string
  updated_at: string
}

export interface ApiSettingsInput {
  username: string
  password: string
  environment: 'test' | 'production'
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface ApiSettingsDecrypted {
  id: string
  username: string
  password: string
  environment: 'test' | 'production'
  is_active: boolean
  last_test_date?: string
  last_test_status?: string
  created_at: string
  updated_at: string
}



export interface TestConnectionResult {
  success: boolean
  message: string
  details?: any
}

/**
 * API Settings Service
 * Manages e-Fatura API configuration with encryption
 * 
 * Available test endpoints for connection testing:
 * - /staticlist/unit (v1) - Unit codes list
 * - /staticlist/country (v1) - Country list  
 * - /staticlist/taxoffice (v1) - Tax office list
 * - /gibuser/recipient/zip (v2) - e-Invoice users list
 */
class ApiSettingsServiceImpl {
  


  /**
   * Get API base URL based on environment
   */
  getApiUrl(environment: 'test' | 'production'): string {
    return environment === 'production'
      ? 'https://efaturaservice.turkcellesirket.com/v1'
      : 'https://efaturaservicetest.isim360.com/v1'
  }

  /**
   * Get API v2 base URL based on environment (for newer endpoints)
   */
  getApiV2Url(environment: 'test' | 'production'): string {
    return environment === 'production'
      ? 'https://efaturaservice.turkcellesirket.com/v2'
      : 'https://efaturaservicetest.isim360.com/v2'
  }

  /**
   * Get active API settings from database
   * @returns Promise with decrypted API settings or null if not configured
   */
  async getApiSettings(): Promise<ApiSettingsDecrypted | null> {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching API settings:', error)
        throw new Error(`API ayarları alınamadı: ${error.message}`)
      }

      if (!data) {
        return null
      }

      // Decrypt credentials
      const username = await decryptString(data.username_encrypted)
      const password = await decryptString(data.password_encrypted)

      return {
        id: data.id,
        username,
        password,
        environment: data.environment as 'test' | 'production',
        is_active: data.is_active ?? false,
        last_test_date: data.last_test_date ?? undefined,
        last_test_status: data.last_test_status ?? undefined,
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString()
      }
    } catch (error) {
      console.error('Error in getApiSettings:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('API ayarları alınırken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Save API settings to database
   * @param settings - API settings to save
   * @returns Promise that resolves when settings are saved
   */
  async saveApiSettings(settings: ApiSettingsInput): Promise<void> {
    try {
      // Validate input
      if (!settings.username || settings.username.trim() === '') {
        throw new Error('Kullanıcı adı gereklidir')
      }

      if (!settings.password || settings.password.trim() === '') {
        throw new Error('Şifre gereklidir')
      }

      if (!settings.environment) {
        throw new Error('Ortam seçimi gereklidir')
      }

      // Encrypt credentials
      const encryptedUsername = await encryptString(settings.username)
      const encryptedPassword = await encryptString(settings.password)

      // Check if there's an existing active setting
      const { data: existingSettings } = await supabase
        .from('api_settings')
        .select('id')
        .eq('is_active', true)
        .maybeSingle()

      if (existingSettings) {
        // Deactivate existing settings
        await supabase
          .from('api_settings')
          .update({ is_active: false })
          .eq('id', existingSettings.id)
      }

      // Insert new settings
      const { error: insertError } = await supabase
        .from('api_settings')
        .insert({
          username_encrypted: encryptedUsername,
          password_encrypted: encryptedPassword,
          environment: settings.environment,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error saving API settings:', insertError)
        throw new Error(`API ayarları kaydedilemedi: ${insertError.message}`)
      }
    } catch (error) {
      console.error('Error in saveApiSettings:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('API ayarları kaydedilirken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Test API connection
   * @param settings - API settings to test (optional, uses stored settings if not provided)
   * @returns Promise with test result
   */
  async testApiConnection(settings?: ApiSettingsInput): Promise<TestConnectionResult> {
    try {
      let username: string
      let password: string
      let environment: 'test' | 'production'

      if (settings) {
        // Use provided settings
        username = settings.username
        password = settings.password
        environment = settings.environment
      } else {
        // Use stored settings
        const storedSettings = await this.getApiSettings()
        if (!storedSettings) {
          return {
            success: false,
            message: 'API ayarları yapılmamış'
          }
        }
        username = storedSettings.username
        password = storedSettings.password
        environment = storedSettings.environment
      }

      // First get access token
      const tokenResponse = await this.getAccessToken(username, password, environment)
      
      // Get API URL
      const apiUrl = this.getApiUrl(environment)

      // Test API connection using a simple endpoint
      // Using /staticlist/unit endpoint as it's a simple GET request that requires authentication
      const response = await fetch(`${apiUrl}/staticlist/unit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenResponse.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const testSuccess = response.ok
      let testMessage: string

      if (testSuccess) {
        testMessage = 'API bağlantısı başarılı'
      } else if (response.status === 401) {
        testMessage = 'API anahtarı geçersiz veya yetkilendirme hatası'
      } else if (response.status === 403) {
        testMessage = 'API erişim yetkisi yok'
      } else if (response.status === 404) {
        testMessage = 'API endpoint bulunamadı'
      } else {
        testMessage = `API bağlantısı başarısız: ${response.status} ${response.statusText}`
      }

      // Update test results in database if using stored settings
      if (!settings) {
        const storedSettings = await this.getApiSettings()
        if (storedSettings) {
          await supabase
            .from('api_settings')
            .update({
              last_test_date: new Date().toISOString(),
              last_test_status: testSuccess ? 'success' : 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', storedSettings.id)
        }
      }

      return {
        success: testSuccess,
        message: testMessage,
        details: {
          status: response.status,
          statusText: response.statusText,
          environment,
          apiUrl,
          endpoint: '/staticlist/unit'
        }
      }
    } catch (error) {
      console.error('Error in testApiConnection:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Bağlantı hatası'

      return {
        success: false,
        message: `API bağlantısı test edilemedi: ${errorMessage}`,
        details: { error: errorMessage }
      }
    }
  }

  /**
   * Check if API is configured
   * @returns Promise with boolean indicating if API is configured
   */
  async isApiConfigured(): Promise<boolean> {
    try {
      const settings = await this.getApiSettings()
      return settings !== null
    } catch (error) {
      console.error('Error checking API configuration:', error)
      return false
    }
  }

  /**
   * Get authentication URL based on environment
   */
  getAuthUrl(environment: 'test' | 'production'): string {
    return environment === 'production'
      ? 'https://core.turkcellesirket.com/v1/token'
      : 'https://coretest.isim360.com/v1/token'
  }

  /**
   * Get access token using username and password
   * @param username - Username for authentication
   * @param password - Password for authentication
   * @param environment - Environment (test or production)
   * @returns Promise with token response
   */
  async getAccessToken(username: string, password: string, environment: 'test' | 'production'): Promise<TokenResponse> {
    try {
      const authUrl = this.getAuthUrl(environment)
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username,
          password,
          client_id: 'serviceApi'
        })
      })

      if (!response.ok) {
        throw new Error(`Token alınamadı: ${response.status} ${response.statusText}`)
      }

      const tokenData: TokenResponse = await response.json()
      return tokenData
    } catch (error) {
      console.error('Error getting access token:', error)
      throw error
    }
  }

  /**
   * Get API configuration status
   * @returns Promise with configuration status details
   */
  async getConfigurationStatus(): Promise<{
    isConfigured: boolean
    environment?: 'test' | 'production'
    lastTestDate?: string
    lastTestStatus?: string
  }> {
    try {
      const settings = await this.getApiSettings()
      
      if (!settings) {
        return { isConfigured: false }
      }

      return {
        isConfigured: true,
        environment: settings.environment,
        lastTestDate: settings.last_test_date,
        lastTestStatus: settings.last_test_status
      }
    } catch (error) {
      console.error('Error getting configuration status:', error)
      return { isConfigured: false }
    }
  }
}

// Export singleton instance
export const apiSettingsService = new ApiSettingsServiceImpl()
export default apiSettingsService
