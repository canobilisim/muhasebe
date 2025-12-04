import { z } from 'zod'

/**
 * Centralized Zod Validation Schemas
 * Provides reusable validation schemas for forms across the application
 */

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

/**
 * TC Kimlik No validation (11 digits)
 */
export const tcKimlikNoSchema = z
  .string()
  .regex(/^\d{11}$/, 'TC Kimlik No 11 haneli olmalıdır')
  .refine((val) => val.length === 11, 'TC Kimlik No 11 haneli olmalıdır')

/**
 * Vergi No validation (10 digits)
 */
export const vergiNoSchema = z
  .string()
  .regex(/^\d{10}$/, 'Vergi No 10 haneli olmalıdır')
  .refine((val) => val.length === 10, 'Vergi No 10 haneli olmalıdır')

/**
 * Email validation with Turkish error message
 */
export const emailSchema = z
  .string()
  .min(1, 'E-posta adresi zorunludur')
  .email('Geçerli bir e-posta adresi giriniz')

/**
 * Phone number validation (optional but must be valid if provided)
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[0-9\s\-\(\)]+$/.test(val),
    'Geçerli bir telefon numarası giriniz'
  )

/**
 * Positive number validation
 */
export const positiveNumberSchema = z
  .number()
  .min(0, 'Değer negatif olamaz')

/**
 * Positive price validation
 */
export const priceSchema = z
  .number()
  .min(0, 'Fiyat negatif olamaz')
  .refine((val) => !isNaN(val), 'Geçerli bir fiyat giriniz')

/**
 * VAT rate validation (0-100)
 */
export const vatRateSchema = z
  .number()
  .min(0, 'KDV oranı 0-100 arası olmalıdır')
  .max(100, 'KDV oranı 0-100 arası olmalıdır')

/**
 * Barcode validation
 */
export const barcodeSchema = z
  .string()
  .min(1, 'Barkod zorunludur')
  .refine((val) => val.trim().length > 0, 'Barkod boş olamaz')

// ============================================================================
// PRODUCT VALIDATION SCHEMAS
// ============================================================================

/**
 * Product form validation schema
 */
export const productFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Ürün adı zorunludur'),
  barcode: barcodeSchema,
  category: z.string().optional(),
  unit: z.string().min(1, 'Birim zorunludur'),
  vat_rate: vatRateSchema,
  is_vat_included: z.boolean(),
  purchase_price: priceSchema,
  sale_price_1: priceSchema,
  sale_price_2: z.number().min(0, 'Fiyat negatif olamaz').optional().or(z.undefined()),
  description: z.string().optional(),
  stock_tracking_enabled: z.boolean(),
  serial_number_tracking_enabled: z.boolean(),
  is_active: z.boolean().optional(),
  stock_quantity: z.number().min(0, 'Stok miktarı negatif olamaz').optional(),
  
  // Technical Specs
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  serial_number: z.string().optional(),
  condition: z.enum(['Yeni', '2. El', 'Yenilenmiş', 'Demo']).optional(),
  
  // Fast Sale Settings
  show_in_fast_sale: z.boolean().optional(),
  fast_sale_category_id: z.string().optional(),
  fast_sale_order: z.number().min(1, 'Sıra numarası en az 1 olmalıdır').max(99, 'Sıra numarası en fazla 99 olabilir').optional(),
  
  // Serial Numbers
  serialNumbers: z.array(z.string()).optional()
}).refine(
  (data) => data.sale_price_1 >= data.purchase_price || data.purchase_price === 0,
  {
    message: '1. Satış fiyatı alış fiyatından düşük olamaz',
    path: ['sale_price_1']
  }
).refine(
  (data) => !data.sale_price_2 || isNaN(data.sale_price_2) || data.sale_price_2 >= data.purchase_price || data.purchase_price === 0,
  {
    message: '2. Satış fiyatı alış fiyatından düşük olamaz',
    path: ['sale_price_2']
  }
).refine(
  (data) => !data.show_in_fast_sale || (data.fast_sale_category_id && data.fast_sale_category_id.trim().length > 0),
  {
    message: 'Hızlı satış kategorisi seçmelisiniz',
    path: ['fast_sale_category_id']
  }
).refine(
  (data) => !data.show_in_fast_sale || (data.fast_sale_order && data.fast_sale_order >= 1 && data.fast_sale_order <= 99),
  {
    message: 'Sıra numarası 1-99 arasında olmalıdır',
    path: ['fast_sale_order']
  }
)

/**
 * Quick product creation schema (for ProductNotFoundModal)
 */
export const quickProductSchema = z.object({
  name: z.string().min(1, 'Ürün adı zorunludur'),
  barcode: barcodeSchema,
  salePrice: z.string()
    .min(1, 'Satış fiyatı zorunludur')
    .refine((val) => !isNaN(parseFloat(val)), 'Geçerli bir fiyat giriniz')
    .refine((val) => parseFloat(val) >= 0, 'Fiyat negatif olamaz'),
  vatRate: z.string()
    .min(1, 'KDV oranı zorunludur')
    .refine((val) => !isNaN(parseFloat(val)), 'Geçerli bir KDV oranı giriniz')
    .refine(
      (val) => parseFloat(val) >= 0 && parseFloat(val) <= 100,
      'KDV oranı 0-100 arası olmalıdır'
    ),
  category: z.string().optional(),
})

// ============================================================================
// CUSTOMER VALIDATION SCHEMAS
// ============================================================================

/**
 * Base customer schema
 */
const baseCustomerSchema = z.object({
  customerType: z.enum(['Bireysel', 'Kurumsal']),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(1, 'Adres zorunludur'),
})

/**
 * Bireysel customer schema
 */
const bireyselCustomerSchema = baseCustomerSchema.extend({
  customerType: z.literal('Bireysel'),
  customerName: z.string().min(1, 'Ad Soyad zorunludur'),
  vknTckn: tcKimlikNoSchema,
  taxOffice: z.string().optional(),
})

/**
 * Kurumsal customer schema
 */
const kurumsalCustomerSchema = baseCustomerSchema.extend({
  customerType: z.literal('Kurumsal'),
  customerName: z.string().min(1, 'Ünvan zorunludur'),
  vknTckn: vergiNoSchema,
  taxOffice: z.string().min(1, 'Vergi Dairesi zorunludur'),
})

/**
 * Customer info union schema
 */
export const customerInfoSchema = z.discriminatedUnion('customerType', [
  bireyselCustomerSchema,
  kurumsalCustomerSchema,
])

// ============================================================================
// INVOICE VALIDATION SCHEMAS
// ============================================================================

/**
 * Invoice info validation schema
 */
export const invoiceInfoSchema = z.object({
  invoiceType: z.enum(['E_FATURA', 'E_ARSIV']),
  invoiceDate: z.string().min(1, 'Fatura tarihi zorunludur'),
  currency: z.string().default('TRY'),
  paymentType: z.enum(['NAKIT', 'KREDI_KARTI', 'HAVALE', 'TAKSITLI']),
  note: z.string().optional(),
})

// ============================================================================
// API SETTINGS VALIDATION SCHEMAS
// ============================================================================

/**
 * API settings validation schema
 */
export const apiSettingsSchema = z.object({
  apiKey: z.string().min(1, 'API Key zorunludur'),
  environment: z.enum(['test', 'production']),
  isActive: z.boolean().default(true),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ProductFormData = z.infer<typeof productFormSchema>
export type QuickProductFormData = z.infer<typeof quickProductSchema>
export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>
export type InvoiceInfoFormData = z.infer<typeof invoiceInfoSchema>
export type ApiSettingsFormData = z.infer<typeof apiSettingsSchema>
