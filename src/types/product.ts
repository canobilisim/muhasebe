import type { Database } from './database'

// Database table types
export type ProductRow = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type SerialNumberRow = Database['public']['Tables']['product_serial_numbers']['Row']
export type SerialNumberInsert = Database['public']['Tables']['product_serial_numbers']['Insert']
export type SerialNumberUpdate = Database['public']['Tables']['product_serial_numbers']['Update']

// Product condition enum
export type ProductCondition = 'Yeni' | '2. El' | 'Yenilenmiş' | 'Demo'

// Serial number status enum
export type SerialNumberStatus = 'available' | 'reserved' | 'sold'

// Extended Product interface with all fields
export interface Product extends ProductRow {
  // Inherited from ProductRow:
  // id, barcode, name, category, category_id, branch_id
  // purchase_price, sale_price, sale_price_1, sale_price_2, sale_price_3
  // stock_quantity, critical_stock_level, is_active
  // show_in_fast_sale, fast_sale_category_id, fast_sale_order
  // brand, model, color, serial_number, condition
  // serial_number_tracking_enabled, vat_rate, is_vat_included
  // unit, description, stock_tracking_enabled
  // created_at, updated_at
}

// Serial Number interface
export interface SerialNumber extends SerialNumberRow {
  // Inherited from SerialNumberRow:
  // id, product_id, serial_number, status
  // added_date, sold_date, sale_id, created_at
}

// Product with serial numbers
export interface ProductWithSerialNumbers extends Product {
  serialNumbers?: SerialNumber[]
  availableSerialNumbersCount?: number
}

// Product form data
export interface ProductFormData {
  // Basic Info
  name: string
  barcode: string
  category?: string
  category_id?: string
  unit: string
  vat_rate: number
  is_vat_included: boolean
  purchase_price: number
  sale_price: number
  description?: string
  stock_tracking_enabled: boolean
  serial_number_tracking_enabled: boolean
  
  // Technical Specs
  brand?: string
  model?: string
  color?: string
  serial_number?: string
  condition?: ProductCondition
  
  // Serial Numbers (for products with serial number tracking)
  serialNumbers?: string[]
}

// VAT calculation result
export interface VatCalculation {
  vatExcludedPrice: number
  vatIncludedPrice: number
  vatAmount: number
}

// Product filter
export interface ProductFilter {
  search?: string
  category?: string
  category_id?: string
  brand?: string
  condition?: ProductCondition
  is_active?: boolean
  serial_number_tracking_enabled?: boolean
  show_in_fast_sale?: boolean
}

// Product with stock status
export interface ProductWithStockStatus extends Product {
  isLowStock: boolean
  stockStatus: 'critical' | 'low' | 'normal'
}
