import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '@/services/productService'
import { CustomerService } from '@/services/customerService'
import { SalesService } from '@/services/salesService'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase')
const mockSupabase = vi.mocked(supabase)

describe('API Calls Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProductService', () => {
    it('should search products by barcode', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Test Ürün',
        barcode: '1234567890',
        sale_price: 100,
        stock_quantity: 10
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProduct,
          error: null
        })
      } as any)

      const result = await ProductService.searchByBarcode('1234567890')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProduct)
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
    })

    it('should handle product not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows returned' }
        })
      } as any)

      const result = await ProductService.searchByBarcode('9999999999')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Ürün bulunamadı')
    })

    it('should get all products with pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Ürün 1', barcode: '111' },
        { id: '2', name: 'Ürün 2', barcode: '222' }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 2
        })
      } as any)

      const result = await ProductService.getProducts('branch-1', 0, 10)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProducts)
      expect(result.total).toBe(2)
    })

    it('should create new product', async () => {
      const newProduct = {
        name: 'Yeni Ürün',
        barcode: '1111111111',
        sale_price: 50,
        stock_quantity: 5,
        category: 'Test',
        branch_id: 'branch-1'
      }

      const createdProduct = { id: 'new-product-id', ...newProduct }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: createdProduct,
          error: null
        })
      } as any)

      const result = await ProductService.createProduct(newProduct)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdProduct)
    })

    it('should update product', async () => {
      const updatedProduct = {
        id: 'product-1',
        name: 'Güncellenmiş Ürün',
        sale_price: 75
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedProduct,
          error: null
        })
      } as any)

      const result = await ProductService.updateProduct('product-1', {
        name: 'Güncellenmiş Ürün',
        sale_price: 75
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedProduct)
    })

    it('should delete product', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      } as any)

      const result = await ProductService.deleteProduct('product-1')

      expect(result.success).toBe(true)
    })
  })

  describe('CustomerService', () => {
    it('should get all customers', async () => {
      const mockCustomers = [
        { id: '1', name: 'Müşteri 1', phone: '5551111111' },
        { id: '2', name: 'Müşteri 2', phone: '5552222222' }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockCustomers,
          error: null
        })
      } as any)

      const result = await CustomerService.getCustomers('branch-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCustomers)
    })

    it('should create new customer', async () => {
      const newCustomer = {
        name: 'Yeni Müşteri',
        phone: '5553333333',
        email: 'yeni@example.com',
        address: 'Yeni Adres',
        branch_id: 'branch-1'
      }

      const createdCustomer = { id: 'new-customer-id', ...newCustomer, balance: 0 }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: createdCustomer,
          error: null
        })
      } as any)

      const result = await CustomerService.createCustomer(newCustomer)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdCustomer)
    })

    it('should search customers by name or phone', async () => {
      const mockCustomers = [
        { id: '1', name: 'Ahmet Yılmaz', phone: '5551111111' }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockCustomers,
          error: null
        })
      } as any)

      const result = await CustomerService.searchCustomers('branch-1', 'Ahmet')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCustomers)
    })
  })

  describe('SalesService', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        cartItems: [
          {
            product: { id: 'product-1', name: 'Test Ürün', sale_price: 100 },
            quantity: 2,
            unitPrice: 100,
            discountAmount: 0,
            totalAmount: 200
          }
        ],
        paymentInfo: {
          type: 'CASH' as const,
          paidAmount: 250,
          changeAmount: 14
        },
        customer: null,
        userId: 'user-1',
        branchId: 'branch-1',
        subtotal: 200,
        totalDiscount: 0,
        taxAmount: 36,
        totalAmount: 236
      }

      const mockSale = {
        id: 'sale-1',
        sale_number: 'SAT-001',
        total_amount: 236
      }

      // Mock sale creation
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSale,
          error: null
        })
      } as any)

      // Mock sale items creation
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          error: null
        })
      } as any)

      // Mock stock update
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      } as any)

      const result = await SalesService.processPayment(paymentData)

      expect(result.success).toBe(true)
      expect(result.saleId).toBe('sale-1')
      expect(result.saleNumber).toBe('SAT-001')
    })

    it('should handle payment processing errors', async () => {
      const paymentData = {
        cartItems: [],
        paymentInfo: { type: 'CASH' as const, paidAmount: 0, changeAmount: 0 },
        customer: null,
        userId: 'user-1',
        branchId: 'branch-1',
        subtotal: 0,
        totalDiscount: 0,
        taxAmount: 0,
        totalAmount: 0
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      } as any)

      const result = await SalesService.processPayment(paymentData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('should get sales with filters', async () => {
      const mockSales = [
        {
          id: 'sale-1',
          sale_number: 'SAT-001',
          total_amount: 100,
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'sale-2',
          sale_number: 'SAT-002',
          total_amount: 200,
          created_at: '2024-01-01T11:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockSales,
          error: null
        })
      } as any)

      const result = await SalesService.getSales('branch-1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSales)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockRejectedValue(new Error('Network error'))
      } as any)

      const result = await ProductService.searchByBarcode('1234567890')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('should handle database constraint violations', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { 
            message: 'duplicate key value violates unique constraint',
            code: '23505'
          }
        })
      } as any)

      const result = await ProductService.createProduct({
        name: 'Test',
        barcode: '1234567890', // Duplicate barcode
        sale_price: 100,
        stock_quantity: 10,
        category: 'Test',
        branch_id: 'branch-1'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Bu barkod zaten kullanılıyor')
    })
  })
})