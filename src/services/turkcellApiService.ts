import { apiSettingsService } from './apiSettingsService'
import type { 
  SaleCustomerInfo, 
  SaleItemInput, 
  InvoiceType, 
  InvoicePaymentType 
} from '@/types/sales'
import { 
  parseTurkcellApiError, 
  retryWithBackoff, 
  isAuthError, 
  isValidationError 
} from '@/utils/errorHandling'

/**
 * Turkcell e-Fatura API Service
 * Handles invoice creation, cancellation, and return operations
 */

/**
 * Turkcell API Invoice Payload
 * Based on OutboxUblBuilderModel schema from Swagger documentation
 */
export interface TurkcellInvoicePayload {
  recordType: number // 1 for e-Fatura
  status?: number // 0 = Draft, 20 = Save and Send
  localReferenceId?: string
  note?: string
  addressBook: {
    name: string
    identificationNumber: string // VKN or TCKN
    alias?: string // e-Fatura alias
    receiverCity?: string
    receiverCountry?: string
    receiverTaxOffice?: string
    address?: string
  }
  generalInfoModel: {
    invoiceProfileType: number // 0 = Temel, 1 = Ticari
    type: number // 1 = Satış, 2 = İade
    issueDate: string
    currencyCode: string
  }
  invoiceLines: Array<{
    description: string
    amount: number
    unitCode: string
    unitPrice: number
    vatRate: number
  }>
}

/**
 * Turkcell API Response
 */
export interface TurkcellApiResponse {
  success: boolean
  invoiceUuid?: string
  invoiceNumber?: string
  message?: string
  error?: string
}

/**
 * Invoice creation input
 */
export interface CreateInvoiceInput {
  customer: SaleCustomerInfo
  items: SaleItemInput[]
  invoiceType: InvoiceType
  invoiceDate: string
  currency: string
  paymentType: InvoicePaymentType
  subtotal: number
  totalVatAmount: number
  totalAmount: number
  note?: string
}

/**
 * Retry configuration
 */
const MAX_RETRIES = 3

/**
 * Turkcell e-Fatura API Service Implementation
 */
class TurkcellApiServiceImpl {
  
  /**
   * Get API settings and access token
   * @private
   */
  private async getApiConfig(): Promise<{ accessToken: string; apiUrl: string }> {
    const settings = await apiSettingsService.getApiSettings()
    
    if (!settings) {
      throw new Error('e-Fatura API ayarları yapılmamış. Lütfen ayarlar sayfasından API yapılandırmasını tamamlayın.')
    }

    if (!settings.username || !settings.password) {
      throw new Error('Kullanıcı adı veya şifre bulunamadı')
    }

    // Get access token using OAuth 2.0
    const tokenResponse = await apiSettingsService.getAccessToken(
      settings.username, 
      settings.password, 
      settings.environment
    )

    const apiUrl = apiSettingsService.getApiUrl(settings.environment)
    
    return {
      accessToken: tokenResponse.access_token,
      apiUrl
    }
  }



  /**
   * Build invoice payload for Turkcell API
   * @private
   */
  private buildInvoicePayload(input: CreateInvoiceInput): TurkcellInvoicePayload {
    return {
      recordType: 1, // e-Fatura
      status: 20, // Save and Send
      localReferenceId: `HESAPONDA_${Date.now()}`, // Unique reference
      note: input.note,
      addressBook: {
        name: input.customer.customer_name,
        identificationNumber: input.customer.vkn_tckn,
        alias: 'urn:mail:defaultgb@efatura.gov.tr', // Default e-Fatura alias
        receiverCity: 'İstanbul', // Default city
        receiverCountry: 'Türkiye',
        receiverTaxOffice: input.customer.tax_office,
        address: input.customer.address
      },
      generalInfoModel: {
        invoiceProfileType: 0, // 0 = Temel fatura
        type: 1, // 1 = Satış faturası
        issueDate: input.invoiceDate,
        currencyCode: input.currency
      },
      invoiceLines: input.items.map(item => ({
        description: item.product_name,
        amount: item.quantity,
        unitCode: 'C62', // Default unit code (piece)
        unitPrice: item.unit_price,
        vatRate: item.vat_rate
      }))
    }
  }

  /**
   * Validate invoice payload
   * @private
   */
  private validatePayload(payload: TurkcellInvoicePayload): void {
    // Required fields validation
    if (payload.recordType !== 1) {
      throw new Error('Record type e-Fatura için 1 olmalıdır')
    }

    if (!payload.generalInfoModel?.issueDate) {
      throw new Error('Fatura tarihi gereklidir')
    }

    if (!payload.addressBook?.name) {
      throw new Error('Müşteri adı gereklidir')
    }

    if (!payload.addressBook?.identificationNumber) {
      throw new Error('Müşteri kimlik numarası gereklidir')
    }

    if (!payload.invoiceLines || payload.invoiceLines.length === 0) {
      throw new Error('En az bir ürün gereklidir')
    }

    // Validate line items
    for (const item of payload.invoiceLines) {
      if (!item.description) {
        throw new Error('Ürün açıklaması gereklidir')
      }
      if (item.amount <= 0) {
        throw new Error('Ürün miktarı 0\'dan büyük olmalıdır')
      }
      if (item.unitPrice < 0) {
        throw new Error('Birim fiyat negatif olamaz')
      }
    }
  }

  /**
   * Make API request with retry logic
   * @private
   */
  private async makeApiRequest<T>(
    url: string,
    method: string,
    accessToken: string,
    body?: any
  ): Promise<T> {
    const requestFn = async (): Promise<T> => {
      console.log('API Request:', {
        url,
        method,
        hasBody: !!body
      })

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      })

      // Parse response
      let responseData: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      // Check if request was successful
      if (!response.ok) {
        const errorMessage = typeof responseData === 'object' 
          ? responseData.message || responseData.error || response.statusText
          : responseData || response.statusText

        const error: any = new Error(`API Hatası (${response.status}): ${errorMessage}`)
        error.statusCode = response.status
        error.response = responseData
        throw error
      }

      console.log('API Request successful')
      return responseData as T
    }

    // Use retry with backoff, but don't retry on auth or validation errors
    return retryWithBackoff(requestFn, {
      maxRetries: MAX_RETRIES,
      initialDelay: 1000,
      backoffMultiplier: 2,
      shouldRetry: (error) => !isAuthError(error) && !isValidationError(error)
    })
  }

  /**
   * Create invoice via Turkcell API
   * @param input - Invoice creation input
   * @returns Promise with API response
   */
  async createInvoice(input: CreateInvoiceInput): Promise<TurkcellApiResponse> {
    try {
      // Get API configuration and access token
      const { accessToken, apiUrl } = await this.getApiConfig()

      // Build payload
      const payload = this.buildInvoicePayload(input)

      // Validate payload
      this.validatePayload(payload)

      console.log('Creating invoice with payload:', {
        recordType: payload.recordType,
        customerName: payload.addressBook.name,
        itemCount: payload.invoiceLines.length,
        issueDate: payload.generalInfoModel.issueDate
      })

      // Make API request
      const response = await this.makeApiRequest<any>(
        `${apiUrl}/outboxinvoice/create`,
        'POST',
        accessToken,
        payload
      )

      // Extract invoice UUID and number from response
      const invoiceUuid = response.uuid || response.invoiceUuid || response.id
      const invoiceNumber = response.invoiceNumber || response.number

      if (!invoiceUuid) {
        console.warn('Invoice UUID not found in response:', response)
      }

      return {
        success: true,
        invoiceUuid,
        invoiceNumber,
        message: 'Fatura başarıyla oluşturuldu'
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      
      const appError = parseTurkcellApiError(error)

      return {
        success: false,
        error: appError.message,
        message: appError.message
      }
    }
  }

  /**
   * Cancel invoice via Turkcell API
   * @param invoiceUuid - UUID of the invoice to cancel
   * @returns Promise with API response
   */
  async cancelInvoice(invoiceUuid: string): Promise<TurkcellApiResponse> {
    try {
      if (!invoiceUuid) {
        throw new Error('Fatura UUID gereklidir')
      }

      // Get API configuration and access token
      const { accessToken, apiUrl } = await this.getApiConfig()

      console.log('Cancelling invoice:', invoiceUuid)

      // Make API request - Use status update for cancellation
      await this.makeApiRequest(
        `${apiUrl}/outboxinvoice/updatestatuslist`,
        'PUT',
        accessToken,
        { 
          ids: [invoiceUuid],
          status: 0 // Cancel status
        }
      )

      return {
        success: true,
        message: 'Fatura başarıyla iptal edildi'
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error)
      
      const appError = parseTurkcellApiError(error)

      return {
        success: false,
        error: appError.message,
        message: appError.message
      }
    }
  }

  /**
   * Create return invoice via Turkcell API
   * @param originalInvoiceUuid - UUID of the original invoice
   * @param input - Return invoice creation input
   * @returns Promise with API response
   */
  async createReturnInvoice(
    originalInvoiceUuid: string,
    input: CreateInvoiceInput
  ): Promise<TurkcellApiResponse> {
    try {
      if (!originalInvoiceUuid) {
        throw new Error('Orijinal fatura UUID gereklidir')
      }

      // Get API configuration and access token
      const { accessToken, apiUrl } = await this.getApiConfig()

      // Build payload
      const payload = {
        ...this.buildInvoicePayload(input),
        originalInvoiceUuid
      }

      // Validate payload
      this.validatePayload(payload)

      console.log('Creating return invoice for:', originalInvoiceUuid)

      // Make API request - Use regular invoice creation for returns
      const response = await this.makeApiRequest<any>(
        `${apiUrl}/outboxinvoice/create`,
        'POST',
        accessToken,
        payload
      )

      // Extract invoice UUID and number from response
      const invoiceUuid = response.uuid || response.invoiceUuid || response.id
      const invoiceNumber = response.invoiceNumber || response.number

      return {
        success: true,
        invoiceUuid,
        invoiceNumber,
        message: 'İade faturası başarıyla oluşturuldu'
      }
    } catch (error) {
      console.error('Error creating return invoice:', error)
      
      const appError = parseTurkcellApiError(error)

      return {
        success: false,
        error: appError.message,
        message: appError.message
      }
    }
  }
}

// Export singleton instance
export const turkcellApiService = new TurkcellApiServiceImpl()
export default turkcellApiService
