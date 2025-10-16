import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePOSStore } from '../posStore'
import { PaymentType } from '@/types/enums'
import type { Product, Customer } from '@/types'

// Mock the auth store
vi.mock('../authStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: {
        id: 'test-user-id',
        branch_id: 'test-branch-id'
      }
    })
  }
}))

// Mock the sales service
vi.mock('@/services/salesService', () => ({
  processPayment: vi.fn().mockResolvedValue({
    success: true,
    saleId: 'test-sale-id',
    saleNumber: 'SAT-001'
  })
}))

describe('POSStore', () => {
  const mockProduct: Product = {
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

  const mockCustomer: Customer = {
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

  beforeEach(() => {
    // Reset store state before each test
    usePOSStore.setState({
      cartItems: [],
      selectedCustomer: null,
      paymentInfo: {
        type: PaymentType.CASH,
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
  })

  describe('Cart Management', () => {
    it('should add product to cart', () => {
      const { addToCart, cartItems } = usePOSStore.getState()
      
      addToCart(mockProduct, 2)
      
      const state = usePOSStore.getState()
      expect(state.cartItems).toHaveLength(1)
      expect(state.cartItems[0].product.id).toBe(mockProduct.id)
      expect(state.cartItems[0].quantity).toBe(2)
      expect(state.cartItems[0].totalAmount).toBe(200)
    })

    it('should update quantity when adding existing product', () => {
      const { addToCart } = usePOSStore.getState()
      
      addToCart(mockProduct, 1)
      addToCart(mockProduct, 2)
      
      const state = usePOSStore.getState()
      expect(state.cartItems).toHaveLength(1)
      expect(state.cartItems[0].quantity).toBe(3)
      expect(state.cartItems[0].totalAmount).toBe(300)
    })

    it('should remove product from cart', () => {
      const { addToCart, removeFromCart } = usePOSStore.getState()
      
      addToCart(mockProduct, 1)
      removeFromCart(mockProduct.id)
      
      const state = usePOSStore.getState()
      expect(state.cartItems).toHaveLength(0)
    })

    it('should update cart item quantity', () => {
      const { addToCart, updateCartItemQuantity } = usePOSStore.getState()
      
      addToCart(mockProduct, 1)
      updateCartItemQuantity(mockProduct.id, 5)
      
      const state = usePOSStore.getState()
      expect(state.cartItems[0].quantity).toBe(5)
      expect(state.cartItems[0].totalAmount).toBe(500)
    })

    it('should remove item when quantity is set to 0', () => {
      const { addToCart, updateCartItemQuantity } = usePOSStore.getState()
      
      addToCart(mockProduct, 1)
      updateCartItemQuantity(mockProduct.id, 0)
      
      const state = usePOSStore.getState()
      expect(state.cartItems).toHaveLength(0)
    })

    it('should update cart item discount', () => {
      const { addToCart, updateCartItemDiscount } = usePOSStore.getState()
      
      addToCart(mockProduct, 2) // 200 TL total
      updateCartItemDiscount(mockProduct.id, 20) // 20 TL discount
      
      const state = usePOSStore.getState()
      expect(state.cartItems[0].discountAmount).toBe(20)
      expect(state.cartItems[0].totalAmount).toBe(180)
    })

    it('should not allow discount greater than item total', () => {
      const { addToCart, updateCartItemDiscount } = usePOSStore.getState()
      
      addToCart(mockProduct, 1) // 100 TL total
      updateCartItemDiscount(mockProduct.id, 150) // Try to discount 150 TL
      
      const state = usePOSStore.getState()
      expect(state.cartItems[0].discountAmount).toBe(100) // Should be capped at 100
      expect(state.cartItems[0].totalAmount).toBe(0)
    })

    it('should clear cart', () => {
      const { addToCart, clearCart } = usePOSStore.getState()
      
      addToCart(mockProduct, 1)
      clearCart()
      
      const state = usePOSStore.getState()
      expect(state.cartItems).toHaveLength(0)
      expect(state.totalAmount).toBe(0)
    })
  })

  describe('Customer Management', () => {
    it('should set selected customer', () => {
      const { setSelectedCustomer } = usePOSStore.getState()
      
      setSelectedCustomer(mockCustomer)
      
      const state = usePOSStore.getState()
      expect(state.selectedCustomer).toBe(mockCustomer)
    })

    it('should switch to credit payment when customer is selected', () => {
      const { setSelectedCustomer } = usePOSStore.getState()
      
      setSelectedCustomer(mockCustomer)
      
      const state = usePOSStore.getState()
      expect(state.paymentInfo.type).toBe(PaymentType.CREDIT)
    })
  })

  describe('Payment Management', () => {
    it('should set payment type', () => {
      const { setPaymentType } = usePOSStore.getState()
      
      setPaymentType(PaymentType.CARD)
      
      const state = usePOSStore.getState()
      expect(state.paymentInfo.type).toBe(PaymentType.CARD)
    })

    it('should set paid amount and calculate change', () => {
      const { addToCart, setPaidAmount } = usePOSStore.getState()
      
      addToCart(mockProduct, 1) // 118 TL with tax
      setPaidAmount(150)
      
      const state = usePOSStore.getState()
      expect(state.paymentInfo.paidAmount).toBe(150)
      expect(state.paymentInfo.changeAmount).toBe(32) // 150 - 118
    })

    it('should not have negative change', () => {
      const { addToCart, setPaidAmount } = usePOSStore.getState()
      
      addToCart(mockProduct, 1) // 118 TL with tax
      setPaidAmount(100) // Less than total
      
      const state = usePOSStore.getState()
      expect(state.paymentInfo.changeAmount).toBe(0)
    })
  })

  describe('Totals Calculation', () => {
    it('should calculate totals correctly', () => {
      const { addToCart } = usePOSStore.getState()
      
      addToCart(mockProduct, 2) // 200 TL subtotal
      
      const state = usePOSStore.getState()
      expect(state.subtotal).toBe(200)
      expect(state.totalDiscount).toBe(0)
      expect(state.taxAmount).toBe(36) // 18% of 200
      expect(state.totalAmount).toBe(236) // 200 + 36
    })

    it('should calculate totals with discount', () => {
      const { addToCart, updateCartItemDiscount } = usePOSStore.getState()
      
      addToCart(mockProduct, 2) // 200 TL subtotal
      updateCartItemDiscount(mockProduct.id, 20) // 20 TL discount
      
      const state = usePOSStore.getState()
      expect(state.subtotal).toBe(200)
      expect(state.totalDiscount).toBe(20)
      expect(state.taxAmount).toBe(32.4) // 18% of (200-20)
      expect(state.totalAmount).toBe(212.4) // 180 + 32.4
    })
  })

  describe('Barcode Input', () => {
    it('should set barcode input', () => {
      const { setBarcodeInput } = usePOSStore.getState()
      
      setBarcodeInput('1234567890')
      
      const state = usePOSStore.getState()
      expect(state.barcodeInput).toBe('1234567890')
    })
  })

  describe('Receipt Modal', () => {
    it('should show receipt modal', () => {
      const { showReceipt } = usePOSStore.getState()
      
      showReceipt()
      
      const state = usePOSStore.getState()
      expect(state.showReceiptModal).toBe(true)
    })

    it('should hide receipt modal', () => {
      const { showReceipt, hideReceipt } = usePOSStore.getState()
      
      showReceipt()
      hideReceipt()
      
      const state = usePOSStore.getState()
      expect(state.showReceiptModal).toBe(false)
    })
  })
})