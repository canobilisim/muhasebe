import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { POSLayout } from '@/components/pos/POSLayout'
import { usePOSStore } from '@/stores/posStore'
import { useAuthStore } from '@/stores/authStore'
import { ProductService } from '@/services/productService'
import { processPayment } from '@/services/salesService'

// Mock services
vi.mock('@/services/productService')
vi.mock('@/services/salesService')
vi.mock('@/stores/authStore')

const mockProductService = vi.mocked(ProductService)
const mockProcessPayment = vi.mocked(processPayment)
const mockUseAuthStore = vi.mocked(useAuthStore)

describe('POS Sales Flow Integration', () => {
  const mockProduct = {
    id: 'product-1',
    name: 'Test Ürün',
    barcode: '1234567890',
    sale_price: 100,
    stock_quantity: 10,
    category: 'Test Kategori',
    branch_id: 'test-branch-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    branch_id: 'test-branch-id',
    role: 'cashier' as const,
    name: 'Test User'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset POS store
    usePOSStore.setState({
      cartItems: [],
      selectedCustomer: null,
      paymentInfo: {
        type: 'CASH' as const,
        paidAmount: 0,
        changeAmount: 0,
      },
      isProcessingPayment: false,
      barcodeInput: '',
      showReceiptModal: false,
      subtotal: 0,
      totalDiscount: 0,
      taxAmount: 0,
      totalAmount: 0
    })

    // Mock auth store
    mockUseAuthStore.getState = vi.fn().mockReturnValue({
      user: mockUser,
      isAuthenticated: true
    })

    // Mock product service
    mockProductService.searchByBarcode.mockResolvedValue({
      success: true,
      data: mockProduct
    })
    mockProductService.isOutOfStock.mockReturnValue(false)
    mockProductService.isLowStock.mockReturnValue(false)

    // Mock payment processing
    mockProcessPayment.mockResolvedValue({
      success: true,
      saleId: 'sale-1',
      saleNumber: 'SAT-001'
    })
  })

  it('should complete full sales flow: search product -> add to cart -> process payment', async () => {
    render(<POSLayout />)

    // Step 1: Search for product by barcode
    const barcodeInput = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.change(barcodeInput, { target: { value: '1234567890' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter' })

    // Wait for product to be added to cart
    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('1234567890')
    })

    // Verify product is in cart
    const state = usePOSStore.getState()
    expect(state.cartItems).toHaveLength(1)
    expect(state.cartItems[0].product.id).toBe(mockProduct.id)
    expect(state.totalAmount).toBe(118) // 100 + 18% tax

    // Step 2: Set payment amount
    const paidAmountInput = screen.getByPlaceholderText('Ödenen tutar')
    fireEvent.change(paidAmountInput, { target: { value: '150' } })

    // Verify change calculation
    const updatedState = usePOSStore.getState()
    expect(updatedState.paymentInfo.paidAmount).toBe(150)
    expect(updatedState.paymentInfo.changeAmount).toBe(32) // 150 - 118

    // Step 3: Process payment
    const payButton = screen.getByText('Ödeme Al')
    fireEvent.click(payButton)

    // Wait for payment processing
    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledWith({
        cartItems: expect.arrayContaining([
          expect.objectContaining({
            product: mockProduct,
            quantity: 1
          })
        ]),
        paymentInfo: expect.objectContaining({
          type: 'CASH',
          paidAmount: 150,
          changeAmount: 32
        }),
        customer: null,
        userId: mockUser.id,
        branchId: mockUser.branch_id,
        subtotal: 100,
        totalDiscount: 0,
        taxAmount: 18,
        totalAmount: 118
      })
    })

    // Verify receipt modal is shown
    const finalState = usePOSStore.getState()
    expect(finalState.showReceiptModal).toBe(true)
    expect(finalState.lastSaleId).toBe('sale-1')
    expect(finalState.lastSaleNumber).toBe('SAT-001')

    // Verify cart is cleared after successful payment
    expect(finalState.cartItems).toHaveLength(0)
  })

  it('should handle multiple products in cart', async () => {
    const mockProduct2 = {
      ...mockProduct,
      id: 'product-2',
      name: 'Test Ürün 2',
      barcode: '0987654321',
      sale_price: 50
    }

    mockProductService.searchByBarcode
      .mockResolvedValueOnce({ success: true, data: mockProduct })
      .mockResolvedValueOnce({ success: true, data: mockProduct2 })

    render(<POSLayout />)

    const barcodeInput = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')

    // Add first product
    fireEvent.change(barcodeInput, { target: { value: '1234567890' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('1234567890')
    })

    // Add second product
    fireEvent.change(barcodeInput, { target: { value: '0987654321' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('0987654321')
    })

    // Verify both products are in cart
    const state = usePOSStore.getState()
    expect(state.cartItems).toHaveLength(2)
    expect(state.subtotal).toBe(150) // 100 + 50
    expect(state.totalAmount).toBe(177) // 150 + 18% tax
  })

  it('should handle payment failure gracefully', async () => {
    mockProcessPayment.mockRejectedValue(new Error('Payment failed'))

    render(<POSLayout />)

    // Add product to cart
    const barcodeInput = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.change(barcodeInput, { target: { value: '1234567890' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('1234567890')
    })

    // Set payment amount
    const paidAmountInput = screen.getByPlaceholderText('Ödenen tutar')
    fireEvent.change(paidAmountInput, { target: { value: '150' } })

    // Try to process payment
    const payButton = screen.getByText('Ödeme Al')
    fireEvent.click(payButton)

    // Wait for payment processing to fail
    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalled()
    })

    // Verify cart is not cleared on payment failure
    const state = usePOSStore.getState()
    expect(state.cartItems).toHaveLength(1)
    expect(state.showReceiptModal).toBe(false)
  })

  it('should handle out of stock products', async () => {
    mockProductService.searchByBarcode.mockResolvedValue({
      success: true,
      data: { ...mockProduct, stock_quantity: 0 }
    })
    mockProductService.isOutOfStock.mockReturnValue(true)

    render(<POSLayout />)

    const barcodeInput = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.change(barcodeInput, { target: { value: '1234567890' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter' })

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Test Ürün stokta yok')).toBeInTheDocument()
    })

    // Verify product is not added to cart
    const state = usePOSStore.getState()
    expect(state.cartItems).toHaveLength(0)
  })

  it('should handle credit payment with customer', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'Test Müşteri',
      phone: '5551234567',
      email: 'test@example.com',
      address: 'Test Adres',
      balance: 0,
      branch_id: 'test-branch-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    render(<POSLayout />)

    // Add product to cart
    const barcodeInput = screen.getByPlaceholderText('Barkod okutun veya ürün adı yazın...')
    fireEvent.change(barcodeInput, { target: { value: '1234567890' } })
    fireEvent.keyDown(barcodeInput, { key: 'Enter' })

    await waitFor(() => {
      expect(mockProductService.searchByBarcode).toHaveBeenCalledWith('1234567890')
    })

    // Select customer (this should automatically switch to credit payment)
    usePOSStore.getState().setSelectedCustomer(mockCustomer)

    // Verify payment type switched to credit
    const state = usePOSStore.getState()
    expect(state.selectedCustomer).toBe(mockCustomer)
    expect(state.paymentInfo.type).toBe('CREDIT')

    // Process credit payment
    const payButton = screen.getByText('Ödeme Al')
    fireEvent.click(payButton)

    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: mockCustomer,
          paymentInfo: expect.objectContaining({
            type: 'CREDIT'
          })
        })
      )
    })
  })
})