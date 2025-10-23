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
 * Based on OutboxUblBuilderModel schema
 */
export interface TurkcellInvoicePayload {
  invoiceType: string
  invoiceDate: string
  currency: string
  paymentType: string
  customer: {
    type: string
    name: string
    identifier: string
    taxOffice?: string
    email: string
    address: string
  }
  lineItems: Array<{
    productName: string
    quantity: number
    unitPrice: number
    vatRate: number
    totalAmount: number
  }>
  totals: {
    subtotal: number
    totalVat: number
    grandTotal: number
  }
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
   * Get API settings and validate configuration
   * @private
   */
  private async getApiConfig(): Promise<{ apiKey: string; apiUrl: string }> {
    const settings = await apiSettingsService.getApiSettings()
    
    if (!settings) {
      throw new Error('e-Fatura API ayarları yapılmamış. Lütfen ayarlar sayfasından API yapılandırmasını tamamlayın.')
    }

    if (!settings.apiKey) {
      throw new Error('API Key bulunamadı')
    }

    const apiUrl = apiSettingsService.getApiUrl(settings.environment)
    
    return {
      apiKey: settings.apiKey,
      apiUrl
    }
  }

  /**
   * Format customer data for Turkcell API
   * @private
   */
  private formatCustomer(customer: SaleCustomerInfo) {
    return {
      type: customer.customer_type === 'Bireysel' ? 'TCKN' : 'VKN',
      name: customer.customer_name,
      identifier: customer.vkn_tckn,
      taxOffice: customer.tax_office,
      email: customer.email,
      address: customer.address
    }
  }

  /**
   * Format line items for Turkcell API
   * @private
   */
  private formatLineItems(items: SaleItemInput[]) {
    return items.map(item => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      vatRate: item.vat_rate,
      totalAmount: item.total_amount
    }))
  }

  /**
   * Build invoice payload for Turkcell API
   * @private
   */
  private buildInvoicePayload(input: CreateInvoiceInput): TurkcellInvoicePayload {
    return {
      invoiceType: input.invoiceType,
      invoiceDate: input.invoiceDate,
      currency: input.currency,
      paymentType: input.paymentType,
      customer: this.formatCustomer(input.customer),
      lineItems: this.formatLineItems(input.items),
      totals: {
        subtotal: input.subtotal,
        totalVat: input.totalVatAmount,
        grandTotal: input.totalAmount
      }
    }
  }

  /**
   * Validate invoice payload
   * @private
   */
  private validatePayload(payload: TurkcellInvoicePayload): void {
    // Required fields validation
    if (!payload.invoiceType) {
      throw new Error('Fatura tipi gereklidir')
    }

    if (!payload.invoiceDate) {
      throw new Error('Fatura tarihi gereklidir')
    }

    if (!payload.customer.name) {
      throw new Error('Müşteri adı gereklidir')
    }

    if (!payload.customer.identifier) {
      throw new Error('Müşteri kimlik numarası gereklidir')
    }

    if (!payload.customer.email) {
      throw new Error('Müşteri e-posta adresi gereklidir')
    }

    if (!payload.lineItems || payload.lineItems.length === 0) {
      throw new Error('En az bir ürün gereklidir')
    }

    // Validate line items
    for (const item of payload.lineItems) {
      if (!item.productName) {
        throw new Error('Ürün adı gereklidir')
      }
      if (item.quantity <= 0) {
        throw new Error('Ürün miktarı 0\'dan büyük olmalıdır')
      }
      if (item.unitPrice < 0) {
        throw new Error('Birim fiyat negatif olamaz')
      }
    }

    // Validate totals
    if (payload.totals.grandTotal <= 0) {
      throw new Error('Toplam tutar 0\'dan büyük olmalıdır')
    }
  }

  /**
   * Make API request with retry logic
   * @private
   */
  private async makeApiRequest<T>(
    url: string,
    method: string,
    apiKey: string,
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
          'Authorization': `Bearer ${apiKey}`,
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
      // Get API configuration
      const { apiKey, apiUrl } = await this.getApiConfig()

      // Build payload
      const payload = this.buildInvoicePayload(input)

      // Validate payload
      this.validatePayload(payload)

      console.log('Creating invoice with payload:', {
        invoiceType: payload.invoiceType,
        customerName: payload.customer.name,
        itemCount: payload.lineItems.length,
        total: payload.totals.grandTotal
      })

      // Make API request
      const response = await this.makeApiRequest<any>(
        `${apiUrl}/outboxinvoice/create`,
        'POST',
        apiKey,
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

      // Get API configuration
      const { apiKey, apiUrl } = await this.getApiConfig()

      console.log('Cancelling invoice:', invoiceUuid)

      // Make API request
      await this.makeApiRequest(
        `${apiUrl}/invoice/cancel`,
        'POST',
        apiKey,
        { invoiceUuid }
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

      // Get API configuration
      const { apiKey, apiUrl } = await this.getApiConfig()

      // Build payload
      const payload = {
        ...this.buildInvoicePayload(input),
        originalInvoiceUuid
      }

      // Validate payload
      this.validatePayload(payload)

      console.log('Creating return invoice for:', originalInvoiceUuid)

      // Make API request
      const response = await this.makeApiRequest<any>(
        `${apiUrl}/invoice/return`,
        'POST',
        apiKey,
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
