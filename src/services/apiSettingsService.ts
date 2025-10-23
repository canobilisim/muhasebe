import { supabase } from '@/lib/supabase'
import { encryptApiKey, decryptApiKey } from '@/utils/encryption'

/**
 * API Settings types
 */
export interface ApiSettings {
  id: string
  api_key_encrypted: string
  environment: 'test' | 'production'
  is_active: boolean
  last_test_date?: string
  last_test_status?: string
  created_at: string
  updated_at: string
}

export interface ApiSettingsInput {
  apiKey: string
  environment: 'test' | 'production'
}

export interface ApiSettingsDecrypted {
  id: string
  apiKey: string
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

      // Decrypt API key
      const apiKey = await decryptApiKey(data.api_key_encrypted)

      return {
        id: data.id,
        apiKey,
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
      if (!settings.apiKey || settings.apiKey.trim() === '') {
        throw new Error('API Key gereklidir')
      }

      if (!settings.environment) {
        throw new Error('Ortam seçimi gereklidir')
      }

      // Encrypt API key
      const encryptedApiKey = await encryptApiKey(settings.apiKey)

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
          api_key_encrypted: encryptedApiKey,
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
      let apiKey: string
      let environment: 'test' | 'production'

      if (settings) {
        // Use provided settings
        apiKey = settings.apiKey
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
        apiKey = storedSettings.apiKey
        environment = storedSettings.environment
      }

      // Get API URL
      const apiUrl = this.getApiUrl(environment)

      // Make a test request to the API
      // Using a simple endpoint to verify authentication
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const testSuccess = response.ok
      const testMessage = testSuccess 
        ? 'API bağlantısı başarılı' 
        : `API bağlantısı başarısız: ${response.statusText}`

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
          apiUrl
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
