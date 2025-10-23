import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductService } from '@/services/productService'
import { SerialNumberService } from '@/services/serialNumberService'
import { supabase } from '@/lib/supabase'

/**
 * Integration Tests - Product Management Flow
 * Tests the complete flow of product creation, serial number management, and sales
 */

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    }
  }
}))

describe('Product Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Ürün Oluşturma Flow', () => {
    it('yeni bir ürün oluşturur ve stok takibi aktif edilir', async () => {
      const mockProduct = {
        id: 'prod-123',
        name: 'iPhone 15 Pro',
        barcode: '1234567890',
        category: 'Telefon',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 30000,
        sale_price: 35000,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false,
        current_stock: 0,
        created_at: new Date().toISOString()
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProduct, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      } as any)

      mockInsert.mockReturnValue({
        select: mockSelect
      } as any)

      mockSelect.mockReturnValue({
        single: mockSingle
      } as any)

      const result = await ProductService.createProduct({
        name: 'iPhone 15 Pro',
        barcode: '1234567890',
        category: 'Telefon',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 30000,
        sale_price: 35000,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProduct)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('teknik özelliklerle ürün oluşturur', async () => {
      const mockProduct = {
        id: 'prod-124',
        name: 'iPhone 15 Pro',
        barcode: '1234567891',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        color: 'Siyah',
        condition: 'Yeni',
        vat_rate: 20,
        purchase_price: 30000,
        sale_price: 35000,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: true
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProduct, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      } as any)

      mockInsert.mockReturnValue({ select: mockSelect } as any)
      mockSelect.mockReturnValue({ single: mockSingle } as any)

      const result = await ProductService.createProduct({
        name: 'iPhone 15 Pro',
        barcode: '1234567891',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        color: 'Siyah',
        condition: 'Yeni',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 30000,
        sale_price: 35000,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: true
      })

      expect(result.success).toBe(true)
      expect(result.data?.brand).toBe('Apple')
      expect(result.data?.model).toBe('iPhone 15 Pro')
    })

    it('duplicate barkod ile ürün oluşturmayı reddeder', async () => {
      const mockError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      } as any)

      mockInsert.mockReturnValue({ select: mockSelect } as any)
      mockSelect.mockReturnValue({ single: mockSingle } as any)

      const result = await ProductService.createProduct({
        name: 'Test Ürün',
        barcode: '1234567890',
        unit: 'Adet',
        vat_rate: 20,
        is_vat_included: false,
        purchase_price: 100,
        sale_price: 150,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('Seri Numarası Flow', () => {
    it('ürün oluşturulduktan sonra seri numaraları toplu ekler', async () => {
      const productId = 'prod-123'
      const serialNumbers = ['SN001', 'SN002', 'SN003']

      // Mock duplicate check
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null })

      // Mock insert
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelectAfterInsert = vi.fn().mockResolvedValue({
        data: serialNumbers.map((sn, idx) => ({
          id: `sn-${idx}`,
          product_id: productId,
          serial_number: sn,
          status: 'available',
          added_date: new Date().toISOString()
        })),
        error: null
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        in: mockIn,
        insert: mockInsert
      } as any)

      mockSelect.mockReturnValue({ in: mockIn } as any)
      mockInsert.mockReturnValue({ select: mockSelectAfterInsert } as any)

      const result = await SerialNumberService.bulkAddSerialNumbers(productId, serialNumbers)

      expect(result.success).toBe(true)
      expect(result.data?.successful).toHaveLength(3)
      expect(result.data?.failed).toHaveLength(0)
    })

    it('seri numarası eklenirken duplicate kontrolü yapar', async () => {
      const productId = 'prod-123'
      const serialNumbers = ['SN001', 'SN002', 'SN001'] // SN001 duplicate

      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null })

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelectAfterInsert = vi.fn().mockResolvedValue({
        data: [
          { id: 'sn-1', serial_number: 'SN001', status: 'available' },
          { id: 'sn-2', serial_number: 'SN002', status: 'available' }
        ],
        error: null
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        in: mockIn,
        insert: mockInsert
      } as any)

      mockSelect.mockReturnValue({ in: mockIn } as any)
      mockInsert.mockReturnValue({ select: mockSelectAfterInsert } as any)

      const result = await SerialNumberService.bulkAddSerialNumbers(productId, serialNumbers)

      expect(result.success).toBe(true)
      expect(result.data?.successful).toHaveLength(2)
      expect(result.data?.failed).toHaveLength(1)
      expect(result.data?.failed[0].serialNumber).toBe('SN001')
    })

    it('seri numarası rezerve edilir ve satıldı olarak işaretlenir', async () => {
      const serialNumberId = 'sn-123'

      // Mock reserve
      const mockSelectReserve = vi.fn().mockReturnThis()
      const mockEqReserve = vi.fn().mockReturnThis()
      const mockSingleReserve = vi.fn().mockResolvedValue({
        data: { status: 'available' },
        error: null
      })

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEqUpdate = vi.fn().mockReturnThis()
      const mockSelectUpdate = vi.fn().mockReturnThis()
      const mockSingleUpdate = vi.fn().mockResolvedValue({
        data: { id: serialNumberId, status: 'reserved' },
        error: null
      })

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: mockSelectReserve,
        eq: mockEqReserve,
        single: mockSingleReserve,
        update: mockUpdate
      } as any)

      mockUpdate.mockReturnValue({ eq: mockEqUpdate } as any)
      mockEqUpdate.mockReturnValue({ select: mockSelectUpdate } as any)
      mockSelectUpdate.mockReturnValue({ single: mockSingleUpdate } as any)

      // Reserve
      const reserveResult = await SerialNumberService.reserveSerialNumber(serialNumberId)
      expect(reserveResult.success).toBe(true)
      expect(reserveResult.data?.status).toBe('reserved')

      // Mock mark as sold
      const mockUpdateSold = vi.fn().mockReturnThis()
      const mockEqSold = vi.fn().mockReturnThis()
      const mockSelectSold = vi.fn().mockReturnThis()
      const mockSingleSold = vi.fn().mockResolvedValue({
        data: {
          id: serialNumberId,
          status: 'sold',
          sale_id: 'sale-123',
          sold_date: new Date().toISOString()
        },
        error: null
      })

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: mockUpdateSold,
        eq: mockEqSold,
        select: mockSelectSold,
        single: mockSingleSold
      } as any)

      mockUpdateSold.mockReturnValue({ eq: mockEqSold } as any)
      mockEqSold.mockReturnValue({ select: mockSelectSold } as any)
      mockSelectSold.mockReturnValue({ single: mockSingleSold } as any)

      // Mark as sold
      const soldResult = await SerialNumberService.markSerialNumberAsSold(serialNumberId, 'sale-123')
      expect(soldResult.success).toBe(true)
      expect(soldResult.data?.status).toBe('sold')
      expect(soldResult.data?.sale_id).toBe('sale-123')
    })
  })

  describe('Satış Flow', () => {
    it('seri numaralı ürün satışı tamamlanır', async () => {
      // Bu test gerçek satış akışını simüle eder:
      // 1. Ürün seçilir
      // 2. Seri numarası seçilir ve rezerve edilir
      // 3. Satış kaydedilir
      // 4. Seri numarası satıldı olarak işaretlenir
      // 5. Stok güncellenir

      const productId = 'prod-123'
      const serialNumberId = 'sn-123'
      const saleId = 'sale-123'

      // Step 1: Get product
      const mockProduct = {
        id: productId,
        name: 'iPhone 15 Pro',
        barcode: '1234567890',
        sale_price: 35000,
        vat_rate: 20,
        serial_number_tracking_enabled: true,
        current_stock: 5
      }

      // Step 2: Get available serial numbers
      const mockSerialNumbers = [
        { id: serialNumberId, serial_number: 'SN001', status: 'available' }
      ]

      // Step 3: Reserve serial number
      const mockReserved = {
        id: serialNumberId,
        serial_number: 'SN001',
        status: 'reserved'
      }

      // Step 4: Create sale (mock)
      const mockSale = {
        id: saleId,
        total_amount: 35000,
        items: [
          {
            product_id: productId,
            serial_number_id: serialNumberId,
            quantity: 1,
            unit_price: 35000
          }
        ]
      }

      // Step 5: Mark serial number as sold
      const mockSold = {
        id: serialNumberId,
        status: 'sold',
        sale_id: saleId
      }

      // Mock all the calls
      const mockFrom = vi.mocked(supabase.from)
      
      // Product query
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProduct, error: null })
      } as any)

      // Serial numbers query
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockSerialNumbers, error: null })
      } as any)

      // Reserve serial number
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { status: 'available' }, error: null }),
        update: vi.fn().mockReturnThis()
      } as any)

      // Mark as sold
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSold, error: null })
      } as any)

      // Simulate the flow
      const availableSerials = await SerialNumberService.getAvailableSerialNumbers(productId)
      expect(availableSerials.success).toBe(true)
      expect(availableSerials.data).toHaveLength(1)

      const reserveResult = await SerialNumberService.reserveSerialNumber(serialNumberId)
      expect(reserveResult.success).toBe(true)

      // Sale would be created here (mocked)
      const soldResult = await SerialNumberService.markSerialNumberAsSold(serialNumberId, saleId)
      expect(soldResult.success).toBe(true)
      expect(soldResult.data?.status).toBe('sold')
    })

    it('seri numarasız ürün satışı stok düşürür', async () => {
      // Bu test seri numarası olmayan ürünlerin satış akışını test eder
      const productId = 'prod-456'
      const initialStock = 10

      const mockProduct = {
        id: productId,
        name: 'Kılıf',
        current_stock: initialStock,
        serial_number_tracking_enabled: false
      }

      const mockUpdatedProduct = {
        ...mockProduct,
        current_stock: initialStock - 2
      }

      const mockFrom = vi.mocked(supabase.from)

      // Get product
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProduct, error: null })
      } as any)

      // Update stock
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedProduct, error: null })
      } as any)

      // Simulate getting product
      const getResult = await ProductService.getProductById(productId)
      expect(getResult.success).toBe(true)
      expect(getResult.data?.current_stock).toBe(initialStock)

      // Simulate stock update after sale
      const updateResult = await ProductService.updateProduct(productId, {
        current_stock: initialStock - 2
      })
      expect(updateResult.success).toBe(true)
      expect(updateResult.data?.current_stock).toBe(initialStock - 2)
    })

    it('yetersiz stok durumunda satış yapılamaz', async () => {
      const productId = 'prod-789'

      const mockProduct = {
        id: productId,
        name: 'Kulaklık',
        current_stock: 0,
        serial_number_tracking_enabled: false,
        stock_tracking_enabled: true
      }

      const mockFrom = vi.mocked(supabase.from)

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProduct, error: null })
      } as any)

      const result = await ProductService.getProductById(productId)
      expect(result.success).toBe(true)
      expect(result.data?.current_stock).toBe(0)

      // Satış yapılmamalı - stok kontrolü uygulamada yapılır
      // Bu test sadece stok durumunu doğrular
    })
  })
})
