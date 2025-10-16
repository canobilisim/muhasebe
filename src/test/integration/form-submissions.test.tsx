import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { ProductForm } from '@/components/stock/ProductForm'
import { CustomerService } from '@/services/customerService'
import { ProductService } from '@/services/productService'

// Mock services
vi.mock('@/services/customerService')
vi.mock('@/services/productService')

const mockCustomerService = vi.mocked(CustomerService)
const mockProductService = vi.mocked(ProductService)

describe('Form Submissions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CustomerForm', () => {
    it('should submit new customer form successfully', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      const newCustomer = {
        id: 'new-customer-id',
        name: 'Yeni Müşteri',
        phone: '5551234567',
        email: 'yeni@example.com',
        address: 'Yeni Adres',
        balance: 0,
        branch_id: 'branch-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockCustomerService.createCustomer.mockResolvedValue({
        success: true,
        data: newCustomer
      })

      render(
        <CustomerForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Fill form fields
      await user.type(screen.getByLabelText('Müşteri Adı'), 'Yeni Müşteri')
      await user.type(screen.getByLabelText('Telefon'), '5551234567')
      await user.type(screen.getByLabelText('E-posta'), 'yeni@example.com')
      await user.type(screen.getByLabelText('Adres'), 'Yeni Adres')

      // Submit form
      await user.click(screen.getByText('Kaydet'))

      // Wait for form submission
      await waitFor(() => {
        expect(mockCustomerService.createCustomer).toHaveBeenCalledWith({
          name: 'Yeni Müşteri',
          phone: '5551234567',
          email: 'yeni@example.com',
          address: 'Yeni Adres',
          branch_id: 'branch-1'
        })
      })

      expect(mockOnSuccess).toHaveBeenCalledWith(newCustomer)
    })

    it('should handle customer form validation errors', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <CustomerForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Try to submit form without required fields
      await user.click(screen.getByText('Kaydet'))

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText('Müşteri adı gereklidir')).toBeInTheDocument()
        expect(screen.getByText('Telefon numarası gereklidir')).toBeInTheDocument()
      })

      expect(mockCustomerService.createCustomer).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should handle phone number format validation', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <CustomerForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Fill form with invalid phone number
      await user.type(screen.getByLabelText('Müşteri Adı'), 'Test Müşteri')
      await user.type(screen.getByLabelText('Telefon'), '123') // Invalid phone

      await user.click(screen.getByText('Kaydet'))

      await waitFor(() => {
        expect(screen.getByText('Geçerli bir telefon numarası giriniz')).toBeInTheDocument()
      })

      expect(mockCustomerService.createCustomer).not.toHaveBeenCalled()
    })

    it('should update existing customer', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      const existingCustomer = {
        id: 'customer-1',
        name: 'Mevcut Müşteri',
        phone: '5551111111',
        email: 'mevcut@example.com',
        address: 'Mevcut Adres',
        balance: 100,
        branch_id: 'branch-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const updatedCustomer = {
        ...existingCustomer,
        name: 'Güncellenmiş Müşteri',
        phone: '5552222222'
      }

      mockCustomerService.updateCustomer.mockResolvedValue({
        success: true,
        data: updatedCustomer
      })

      render(
        <CustomerForm
          customer={existingCustomer}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Update form fields
      const nameInput = screen.getByDisplayValue('Mevcut Müşteri')
      await user.clear(nameInput)
      await user.type(nameInput, 'Güncellenmiş Müşteri')

      const phoneInput = screen.getByDisplayValue('5551111111')
      await user.clear(phoneInput)
      await user.type(phoneInput, '5552222222')

      // Submit form
      await user.click(screen.getByText('Güncelle'))

      await waitFor(() => {
        expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith('customer-1', {
          name: 'Güncellenmiş Müşteri',
          phone: '5552222222',
          email: 'mevcut@example.com',
          address: 'Mevcut Adres'
        })
      })

      expect(mockOnSuccess).toHaveBeenCalledWith(updatedCustomer)
    })

    it('should handle customer form submission errors', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      mockCustomerService.createCustomer.mockResolvedValue({
        success: false,
        error: 'Bu telefon numarası zaten kullanılıyor'
      })

      render(
        <CustomerForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Fill and submit form
      await user.type(screen.getByLabelText('Müşteri Adı'), 'Test Müşteri')
      await user.type(screen.getByLabelText('Telefon'), '5551234567')
      await user.click(screen.getByText('Kaydet'))

      await waitFor(() => {
        expect(screen.getByText('Bu telefon numarası zaten kullanılıyor')).toBeInTheDocument()
      })

      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  describe('ProductForm', () => {
    it('should submit new product form successfully', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      const newProduct = {
        id: 'new-product-id',
        name: 'Yeni Ürün',
        barcode: '1234567890',
        sale_price: 100,
        stock_quantity: 50,
        category: 'Elektronik',
        branch_id: 'branch-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockProductService.createProduct.mockResolvedValue({
        success: true,
        data: newProduct
      })

      render(
        <ProductForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Fill form fields
      await user.type(screen.getByLabelText('Ürün Adı'), 'Yeni Ürün')
      await user.type(screen.getByLabelText('Barkod'), '1234567890')
      await user.type(screen.getByLabelText('Satış Fiyatı'), '100')
      await user.type(screen.getByLabelText('Stok Miktarı'), '50')
      await user.type(screen.getByLabelText('Kategori'), 'Elektronik')

      // Submit form
      await user.click(screen.getByText('Kaydet'))

      await waitFor(() => {
        expect(mockProductService.createProduct).toHaveBeenCalledWith({
          name: 'Yeni Ürün',
          barcode: '1234567890',
          sale_price: 100,
          stock_quantity: 50,
          category: 'Elektronik',
          branch_id: 'branch-1'
        })
      })

      expect(mockOnSuccess).toHaveBeenCalledWith(newProduct)
    })

    it('should handle product form validation errors', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <ProductForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Try to submit form without required fields
      await user.click(screen.getByText('Kaydet'))

      await waitFor(() => {
        expect(screen.getByText('Ürün adı gereklidir')).toBeInTheDocument()
        expect(screen.getByText('Barkod gereklidir')).toBeInTheDocument()
        expect(screen.getByText('Satış fiyatı gereklidir')).toBeInTheDocument()
      })

      expect(mockProductService.createProduct).not.toHaveBeenCalled()
    })

    it('should handle negative price validation', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <ProductForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Fill form with negative price
      await user.type(screen.getByLabelText('Ürün Adı'), 'Test Ürün')
      await user.type(screen.getByLabelText('Barkod'), '1234567890')
      await user.type(screen.getByLabelText('Satış Fiyatı'), '-10')

      await user.click(screen.getByText('Kaydet'))

      await waitFor(() => {
        expect(screen.getByText('Fiyat 0\'dan büyük olmalıdır')).toBeInTheDocument()
      })

      expect(mockProductService.createProduct).not.toHaveBeenCalled()
    })

    it('should handle duplicate barcode error', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      mockProductService.createProduct.mockResolvedValue({
        success: false,
        error: 'Bu barkod zaten kullanılıyor'
      })

      render(
        <ProductForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Fill and submit form
      await user.type(screen.getByLabelText('Ürün Adı'), 'Test Ürün')
      await user.type(screen.getByLabelText('Barkod'), '1234567890')
      await user.type(screen.getByLabelText('Satış Fiyatı'), '100')
      await user.click(screen.getByText('Kaydet'))

      await waitFor(() => {
        expect(screen.getByText('Bu barkod zaten kullanılıyor')).toBeInTheDocument()
      })

      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should update existing product', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      const existingProduct = {
        id: 'product-1',
        name: 'Mevcut Ürün',
        barcode: '1111111111',
        sale_price: 50,
        stock_quantity: 25,
        category: 'Gıda',
        branch_id: 'branch-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const updatedProduct = {
        ...existingProduct,
        name: 'Güncellenmiş Ürün',
        sale_price: 75
      }

      mockProductService.updateProduct.mockResolvedValue({
        success: true,
        data: updatedProduct
      })

      render(
        <ProductForm
          product={existingProduct}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      // Update form fields
      const nameInput = screen.getByDisplayValue('Mevcut Ürün')
      await user.clear(nameInput)
      await user.type(nameInput, 'Güncellenmiş Ürün')

      const priceInput = screen.getByDisplayValue('50')
      await user.clear(priceInput)
      await user.type(priceInput, '75')

      // Submit form
      await user.click(screen.getByText('Güncelle'))

      await waitFor(() => {
        expect(mockProductService.updateProduct).toHaveBeenCalledWith('product-1', {
          name: 'Güncellenmiş Ürün',
          barcode: '1111111111',
          sale_price: 75,
          stock_quantity: 25,
          category: 'Gıda'
        })
      })

      expect(mockOnSuccess).toHaveBeenCalledWith(updatedProduct)
    })
  })

  describe('Form Cancel Actions', () => {
    it('should call onCancel when customer form is cancelled', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <CustomerForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      await user.click(screen.getByText('İptal'))

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should call onCancel when product form is cancelled', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      const mockOnCancel = vi.fn()

      render(
        <ProductForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          branchId="branch-1"
        />
      )

      await user.click(screen.getByText('İptal'))

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })
})