import type { Database } from './database'
import type { Product, SerialNumber } from './product'
import type { Customer, User } from './index'

// Database table types
export type SaleRow = Database['public']['Tables']['sales']['Row']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type SaleUpdate = Database['public']['Tables']['sales']['Update']

export type SaleItemRow = Database['public']['Tables']['sale_items']['Row']
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert']
export type SaleItemUpdate = Database['public']['Tables']['sale_items']['Update']

// Customer type enum
export type CustomerType = 'Bireysel' | 'Kurumsal'

// Invoice type enum
export type InvoiceType = 'E_FATURA' | 'E_ARSIV'

// Payment type enum (for e-invoice)
export type InvoicePaymentType = 'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'TAKSITLI'

// Invoice status enum
export type InvoiceStatus = 'pending' | 'sent' | 'error' | 'cancelled'

// Extended Sale interface
export interface Sale extends SaleRow {
  // Inherited from SaleRow:
  // id, branch_id, user_id, customer_id, sale_number
  // total_amount, discount_amount, tax_amount, net_amount
  // payment_type, paid_amount, change_amount, notes, due_date
  // sale_date, created_at, updated_at
  // customer_type, customer_name, vkn_tckn, tax_office
  // email, phone, address, invoice_type, invoice_date
  // currency, note, subtotal, total_vat_amount
  // status, invoice_uuid, invoice_number, error_message, created_by
}

// Extended SaleItem interface
export interface SaleItem extends SaleItemRow {
  // Inherited from SaleItemRow:
  // id, sale_id, product_id, serial_number_id
  // product_name, barcode, quantity, unit_price
  // discount_amount, vat_rate, vat_amount, total_amount
  // note, is_miscellaneous, created_at
}

// Sale with details
export interface SaleWithDetails extends Sale {
  items: SaleItemWithProduct[]
  customer?: Customer
  user?: User
  created_by_user?: User
}

// Sale item with product details
export interface SaleItemWithProduct extends SaleItem {
  product?: Product
  serial_number?: SerialNumber
}

// Customer info for sale
export interface SaleCustomerInfo {
  customer_type: CustomerType
  customer_name: string
  vkn_tckn: string
  tax_office?: string
  email: string
  phone?: string
  address: string
}

// Invoice info for sale
export interface SaleInvoiceInfo {
  invoice_type: InvoiceType
  invoice_date: string
  currency: string
  payment_type: InvoicePaymentType
  note?: string
}

// Sale item input
export interface SaleItemInput {
  product_id?: string
  serial_number_id?: string
  product_name: string
  barcode: string
  quantity: number
  unit_price: number
  vat_rate: number
  vat_amount: number
  total_amount: number
  discount_amount?: number
  note?: string
  is_miscellaneous?: boolean
}

// Sale creation input
export interface CreateSaleInput {
  customer: SaleCustomerInfo
  invoice: SaleInvoiceInfo
  items: SaleItemInput[]
  subtotal: number
  total_vat_amount: number
  total_amount: number
}

// Sale filter
export interface SaleFilter {
  start_date?: string
  end_date?: string
  status?: InvoiceStatus
  invoice_type?: InvoiceType
  customer_id?: string
  user_id?: string
  search?: string
}

// Sale summary
export interface SaleSummary {
  subtotal: number
  totalVat: number
  grandTotal: number
}
