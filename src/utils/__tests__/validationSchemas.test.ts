import { describe, it, expect } from 'vitest'
import {
  tcKimlikNoSchema,
  vergiNoSchema,
  emailSchema,
  phoneSchema,
  positiveNumberSchema,
  priceSchema,
  vatRateSchema,
  barcodeSchema,
  productFormSchema,
  quickProductSchema,
  customerInfoSchema,
  invoiceInfoSchema,
  apiSettingsSchema
} from '../validationSchemas'

describe('validationSchemas', () => {
  describe('tcKimlikNoSchema', () => {
    it('geçerli 11 haneli TC Kimlik No kabul eder', () => {
      const result = tcKimlikNoSchema.safeParse('12345678901')
      expect(result.success).toBe(true)
    })

    it('10 haneli TC Kimlik No reddeder', () => {
      const result = tcKimlikNoSchema.safeParse('1234567890')
      expect(result.success).toBe(false)
    })

    it('12 haneli TC Kimlik No reddeder', () => {
      const result = tcKimlikNoSchema.safeParse('123456789012')
      expect(result.success).toBe(false)
    })

    it('harf içeren TC Kimlik No reddeder', () => {
      const result = tcKimlikNoSchema.safeParse('1234567890A')
      expect(result.success).toBe(false)
    })

    it('boş string reddeder', () => {
      const result = tcKimlikNoSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('vergiNoSchema', () => {
    it('geçerli 10 haneli Vergi No kabul eder', () => {
      const result = vergiNoSchema.safeParse('1234567890')
      expect(result.success).toBe(true)
    })

    it('9 haneli Vergi No reddeder', () => {
      const result = vergiNoSchema.safeParse('123456789')
      expect(result.success).toBe(false)
    })

    it('11 haneli Vergi No reddeder', () => {
      const result = vergiNoSchema.safeParse('12345678901')
      expect(result.success).toBe(false)
    })

    it('harf içeren Vergi No reddeder', () => {
      const result = vergiNoSchema.safeParse('123456789A')
      expect(result.success).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('geçerli e-posta kabul eder', () => {
      const result = emailSchema.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('geçerli e-posta formatlarını kabul eder', () => {
      expect(emailSchema.safeParse('user@domain.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name@domain.com').success).toBe(true)
      expect(emailSchema.safeParse('user+tag@domain.co.uk').success).toBe(true)
    })

    it('geçersiz e-posta formatını reddeder', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false)
      expect(emailSchema.safeParse('invalid@').success).toBe(false)
      expect(emailSchema.safeParse('@domain.com').success).toBe(false)
      expect(emailSchema.safeParse('user@').success).toBe(false)
    })

    it('boş string reddeder', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('phoneSchema', () => {
    it('geçerli telefon numarası kabul eder', () => {
      expect(phoneSchema.safeParse('05321234567').success).toBe(true)
      expect(phoneSchema.safeParse('0532 123 45 67').success).toBe(true)
      expect(phoneSchema.safeParse('0532-123-45-67').success).toBe(true)
      expect(phoneSchema.safeParse('(0532) 123 45 67').success).toBe(true)
    })

    it('opsiyonel olduğu için undefined kabul eder', () => {
      const result = phoneSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('harf içeren telefon reddeder', () => {
      const result = phoneSchema.safeParse('0532ABC4567')
      expect(result.success).toBe(false)
    })
  })

  describe('positiveNumberSchema', () => {
    it('pozitif sayı kabul eder', () => {
      expect(positiveNumberSchema.safeParse(100).success).toBe(true)
      expect(positiveNumberSchema.safeParse(0).success).toBe(true)
      expect(positiveNumberSchema.safeParse(0.01).success).toBe(true)
    })

    it('negatif sayı reddeder', () => {
      const result = positiveNumberSchema.safeParse(-1)
      expect(result.success).toBe(false)
    })
  })

  describe('priceSchema', () => {
    it('geçerli fiyat kabul eder', () => {
      expect(priceSchema.safeParse(100).success).toBe(true)
      expect(priceSchema.safeParse(0).success).toBe(true)
      expect(priceSchema.safeParse(99.99).success).toBe(true)
    })

    it('negatif fiyat reddeder', () => {
      const result = priceSchema.safeParse(-10)
      expect(result.success).toBe(false)
    })

    it('NaN reddeder', () => {
      const result = priceSchema.safeParse(NaN)
      expect(result.success).toBe(false)
    })
  })

  describe('vatRateSchema', () => {
    it('geçerli KDV oranları kabul eder', () => {
      expect(vatRateSchema.safeParse(0).success).toBe(true)
      expect(vatRateSchema.safeParse(1).success).toBe(true)
      expect(vatRateSchema.safeParse(10).success).toBe(true)
      expect(vatRateSchema.safeParse(20).success).toBe(true)
      expect(vatRateSchema.safeParse(50).success).toBe(true)
      expect(vatRateSchema.safeParse(100).success).toBe(true)
    })

    it('negatif KDV oranı reddeder', () => {
      const result = vatRateSchema.safeParse(-1)
      expect(result.success).toBe(false)
    })

    it('100\'den büyük KDV oranı reddeder', () => {
      const result = vatRateSchema.safeParse(101)
      expect(result.success).toBe(false)
    })
  })

  describe('barcodeSchema', () => {
    it('geçerli barkod kabul eder', () => {
      expect(barcodeSchema.safeParse('1234567890').success).toBe(true)
      expect(barcodeSchema.safeParse('ABC123').success).toBe(true)
    })

    it('boş string reddeder', () => {
      const result = barcodeSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('sadece boşluk içeren string reddeder', () => {
      const result = barcodeSchema.safeParse('   ')
      expect(result.success).toBe(false)
    })
  })

  describe('productFormSchema', () => {
    it('geçerli ürün formu kabul eder', () => {
      const validProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        category: 'Telefon',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 100,
        sale_price: 150,
        description: 'Test açıklama',
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false
      }
      const result = productFormSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('teknik özelliklerle ürün kabul eder', () => {
      const validProduct = {
        name: 'iPhone 15',
        barcode: '1234567890',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 30000,
        sale_price: 35000,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: true,
        brand: 'Apple',
        model: 'iPhone 15',
        color: 'Siyah',
        serial_number: 'ABC123',
        condition: 'Yeni'
      }
      const result = productFormSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('zorunlu alanlar eksikse reddeder', () => {
      const invalidProduct = {
        name: 'Test Ürün'
        // barcode eksik
      }
      const result = productFormSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('satış fiyatı alış fiyatından düşükse reddeder', () => {
      const invalidProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 200,
        sale_price: 100, // Alış fiyatından düşük
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false
      }
      const result = productFormSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('alış fiyatı 0 ise satış fiyatı kontrolü yapmaz', () => {
      const validProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 0,
        sale_price: 100,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false
      }
      const result = productFormSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })
  })

  describe('quickProductSchema', () => {
    it('geçerli hızlı ürün formu kabul eder', () => {
      const validProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        salePrice: '100',
        vatRate: '20'
      }
      const result = quickProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('kategori opsiyoneldir', () => {
      const validProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        salePrice: '100',
        vatRate: '20',
        category: 'Telefon'
      }
      const result = quickProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('geçersiz fiyat formatı reddeder', () => {
      const invalidProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        salePrice: 'abc',
        vatRate: '20'
      }
      const result = quickProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('negatif fiyat reddeder', () => {
      const invalidProduct = {
        name: 'Test Ürün',
        barcode: '1234567890',
        salePrice: '-100',
        vatRate: '20'
      }
      const result = quickProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })
  })

  describe('customerInfoSchema', () => {
    it('geçerli bireysel müşteri kabul eder', () => {
      const validCustomer = {
        customerType: 'Bireysel' as const,
        customerName: 'Ahmet Yılmaz',
        vknTckn: '12345678901',
        email: 'ahmet@example.com',
        address: 'Test Adres'
      }
      const result = customerInfoSchema.safeParse(validCustomer)
      expect(result.success).toBe(true)
    })

    it('geçerli kurumsal müşteri kabul eder', () => {
      const validCustomer = {
        customerType: 'Kurumsal' as const,
        customerName: 'Test A.Ş.',
        vknTckn: '1234567890',
        taxOffice: 'Kadıköy',
        email: 'info@test.com',
        address: 'Test Adres'
      }
      const result = customerInfoSchema.safeParse(validCustomer)
      expect(result.success).toBe(true)
    })

    it('bireysel müşteri için 11 haneli TC Kimlik No gerektirir', () => {
      const invalidCustomer = {
        customerType: 'Bireysel' as const,
        customerName: 'Ahmet Yılmaz',
        vknTckn: '1234567890', // 10 haneli
        email: 'ahmet@example.com',
        address: 'Test Adres'
      }
      const result = customerInfoSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
    })

    it('kurumsal müşteri için 10 haneli Vergi No gerektirir', () => {
      const invalidCustomer = {
        customerType: 'Kurumsal' as const,
        customerName: 'Test A.Ş.',
        vknTckn: '12345678901', // 11 haneli
        taxOffice: 'Kadıköy',
        email: 'info@test.com',
        address: 'Test Adres'
      }
      const result = customerInfoSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
    })

    it('kurumsal müşteri için vergi dairesi zorunludur', () => {
      const invalidCustomer = {
        customerType: 'Kurumsal' as const,
        customerName: 'Test A.Ş.',
        vknTckn: '1234567890',
        // taxOffice eksik
        email: 'info@test.com',
        address: 'Test Adres'
      }
      const result = customerInfoSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
    })
  })

  describe('invoiceInfoSchema', () => {
    it('geçerli fatura bilgisi kabul eder', () => {
      const validInvoice = {
        invoiceType: 'E_FATURA' as const,
        invoiceDate: '2024-01-15',
        currency: 'TRY',
        paymentType: 'NAKIT' as const
      }
      const result = invoiceInfoSchema.safeParse(validInvoice)
      expect(result.success).toBe(true)
    })

    it('tüm ödeme tiplerini kabul eder', () => {
      const paymentTypes = ['NAKIT', 'KREDI_KARTI', 'HAVALE', 'TAKSITLI'] as const
      
      paymentTypes.forEach(paymentType => {
        const invoice = {
          invoiceType: 'E_FATURA' as const,
          invoiceDate: '2024-01-15',
          currency: 'TRY',
          paymentType
        }
        const result = invoiceInfoSchema.safeParse(invoice)
        expect(result.success).toBe(true)
      })
    })

    it('not alanı opsiyoneldir', () => {
      const validInvoice = {
        invoiceType: 'E_ARSIV' as const,
        invoiceDate: '2024-01-15',
        currency: 'TRY',
        paymentType: 'KREDI_KARTI' as const,
        note: 'Test notu'
      }
      const result = invoiceInfoSchema.safeParse(validInvoice)
      expect(result.success).toBe(true)
    })

    it('geçersiz fatura tipi reddeder', () => {
      const invalidInvoice = {
        invoiceType: 'INVALID',
        invoiceDate: '2024-01-15',
        currency: 'TRY',
        paymentType: 'NAKIT'
      }
      const result = invoiceInfoSchema.safeParse(invalidInvoice)
      expect(result.success).toBe(false)
    })
  })

  describe('apiSettingsSchema', () => {
    it('geçerli API ayarları kabul eder', () => {
      const validSettings = {
        apiKey: 'test-api-key-12345',
        environment: 'test' as const,
        isActive: true
      }
      const result = apiSettingsSchema.safeParse(validSettings)
      expect(result.success).toBe(true)
    })

    it('production ortamı kabul eder', () => {
      const validSettings = {
        apiKey: 'prod-api-key-12345',
        environment: 'production' as const,
        isActive: true
      }
      const result = apiSettingsSchema.safeParse(validSettings)
      expect(result.success).toBe(true)
    })

    it('isActive varsayılan olarak true\'dur', () => {
      const settings = {
        apiKey: 'test-api-key',
        environment: 'test' as const
      }
      const result = apiSettingsSchema.safeParse(settings)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
      }
    })

    it('boş API Key reddeder', () => {
      const invalidSettings = {
        apiKey: '',
        environment: 'test' as const
      }
      const result = apiSettingsSchema.safeParse(invalidSettings)
      expect(result.success).toBe(false)
    })

    it('geçersiz environment reddeder', () => {
      const invalidSettings = {
        apiKey: 'test-key',
        environment: 'staging'
      }
      const result = apiSettingsSchema.safeParse(invalidSettings)
      expect(result.success).toBe(false)
    })
  })
})
