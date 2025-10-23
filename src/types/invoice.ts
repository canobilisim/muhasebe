import type { CustomerType, InvoiceType, InvoicePaymentType } from './sales'

// API Settings types
export type ApiSettingsRow = {
  id: string
  api_key_encrypted: string
  environment: 'test' | 'production'
  is_active: boolean | null
  last_test_date: string | null
  last_test_status: string | null
  created_at: string | null
  updated_at: string | null
}

export type ApiSettingsInsert = Omit<ApiSettingsRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string | null
  updated_at?: string | null
}

export type ApiSettingsUpdate = Partial<ApiSettingsInsert>

// API Environment
export type ApiEnvironment = 'test' | 'production'

// API Settings interface
export interface ApiSettings extends ApiSettingsRow {}

// API Settings form
export interface ApiSettingsForm {
  api_key: string
  environment: ApiEnvironment
}

// Turkcell API Customer
export interface TurkcellCustomer {
  type: CustomerType
  name: string
  identifier: string // TC Kimlik No or Vergi No
  taxOffice?: string
  email: string
  address: string
  phone?: string
}

// Turkcell API Line Item
export interface TurkcellLineItem {
  productName: string
  quantity: number
  unitPrice: number
  vatRate: number
  vatAmount: number
  totalAmount: number
}

// Turkcell API Totals
export interface TurkcellTotals {
  subtotal: number
  totalVat: number
  grandTotal: number
}

// Turkcell Invoice Payload
export interface TurkcellInvoicePayload {
  invoiceType: InvoiceType
  invoiceDate: string
  currency: string
  paymentType: InvoicePaymentType
  customer: TurkcellCustomer
  lineItems: TurkcellLineItem[]
  totals: TurkcellTotals
  note?: string
}

// Turkcell API Response
export interface TurkcellInvoiceResponse {
  success: boolean
  invoiceUuid?: string
  invoiceNumber?: string
  error?: string
  errorDetails?: any
}

// Turkcell API Error
export interface TurkcellApiError {
  code: string
  message: string
  details?: any
}

// API Test Result
export interface ApiTestResult {
  success: boolean
  message: string
  responseTime?: number
  error?: string
}

// Invoice cancellation request
export interface CancelInvoiceRequest {
  invoiceUuid: string
  reason?: string
}

// Invoice return request
export interface ReturnInvoiceRequest {
  originalInvoiceUuid: string
  returnItems: TurkcellLineItem[]
  returnTotals: TurkcellTotals
  reason?: string
}
