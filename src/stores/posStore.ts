import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CartItem, PaymentInfo, Product, Customer } from '@/types'
import { PaymentType } from '@/types/enums'
import { processPayment } from '@/services/salesService'
import { useAuthStore } from './authStore'

interface POSState {
  // Cart state
  cartItems: CartItem[]
  selectedCustomer: Customer | null
  
  // Payment state
  paymentInfo: PaymentInfo
  
  // UI state
  isProcessingPayment: boolean
  barcodeInput: string
  showReceiptModal: boolean
  
  // Sale state
  lastSaleId?: string
  lastSaleNumber?: string
  
  // Calculated values
  subtotal: number
  totalDiscount: number
  taxAmount: number
  totalAmount: number
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartItemQuantity: (productId: string, quantity: number) => void
  updateCartItemDiscount: (productId: string, discountAmount: number) => void
  clearCart: () => void
  
  // Customer actions
  setSelectedCustomer: (customer: Customer | null) => void
  
  // Payment actions
  setPaymentType: (type: PaymentType) => void
  setPaidAmount: (amount: number) => void
  processPayment: () => Promise<boolean>
  
  // Barcode actions
  setBarcodeInput: (barcode: string) => void
  
  // Receipt actions
  showReceipt: () => void
  hideReceipt: () => void
  
  // Utility actions
  calculateTotals: () => void
  resetPOS: () => void
}

const TAX_RATE = 0.18 // 18% KDV

export const usePOSStore = create<POSState>()(
  devtools(
    (set, get) => ({
      // Initial state
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
      lastSaleId: undefined,
      lastSaleNumber: undefined,
      subtotal: 0,
      totalDiscount: 0,
      taxAmount: 0,
      totalAmount: 0,

      // Cart actions
      addToCart: (product: Product, quantity = 1) => {
        const state = get()
        const existingItemIndex = state.cartItems.findIndex(
          item => item.product.id === product.id
        )

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...state.cartItems]
          const existingItem = updatedItems[existingItemIndex]
          const newQuantity = existingItem.quantity + quantity
          
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            totalAmount: newQuantity * existingItem.unitPrice - existingItem.discountAmount
          }
          
          set({ cartItems: updatedItems })
        } else {
          // Add new item
          const newItem: CartItem = {
            product,
            quantity,
            unitPrice: product.sale_price,
            discountAmount: 0,
            totalAmount: quantity * product.sale_price
          }
          
          set({ cartItems: [...state.cartItems, newItem] })
        }
        
        get().calculateTotals()
      },

      removeFromCart: (productId: string) => {
        const state = get()
        const updatedItems = state.cartItems.filter(
          item => item.product.id !== productId
        )
        set({ cartItems: updatedItems })
        get().calculateTotals()
      },

      updateCartItemQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        const state = get()
        const updatedItems = state.cartItems.map(item => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity,
              totalAmount: quantity * item.unitPrice - item.discountAmount
            }
          }
          return item
        })
        
        set({ cartItems: updatedItems })
        get().calculateTotals()
      },

      updateCartItemDiscount: (productId: string, discountAmount: number) => {
        const state = get()
        const updatedItems = state.cartItems.map(item => {
          if (item.product.id === productId) {
            const maxDiscount = item.quantity * item.unitPrice
            const validDiscount = Math.min(Math.max(0, discountAmount), maxDiscount)
            
            return {
              ...item,
              discountAmount: validDiscount,
              totalAmount: item.quantity * item.unitPrice - validDiscount
            }
          }
          return item
        })
        
        set({ cartItems: updatedItems })
        get().calculateTotals()
      },

      clearCart: () => {
        set({ 
          cartItems: [],
          subtotal: 0,
          totalDiscount: 0,
          taxAmount: 0,
          totalAmount: 0
        })
      },

      // Customer actions
      setSelectedCustomer: (customer: Customer | null) => {
        set({ selectedCustomer: customer })
        
        // If customer is selected and payment type is cash, switch to credit
        if (customer && get().paymentInfo.type === PaymentType.CASH) {
          set(state => ({
            paymentInfo: {
              ...state.paymentInfo,
              type: PaymentType.CREDIT
            }
          }))
        }
      },

      // Payment actions
      setPaymentType: (type: PaymentType) => {
        const state = get()
        set({
          paymentInfo: {
            ...state.paymentInfo,
            type,
            // Reset paid amount when changing payment type
            paidAmount: type === PaymentType.CREDIT ? state.totalAmount : 0,
            changeAmount: 0
          }
        })
      },

      setPaidAmount: (amount: number) => {
        const state = get()
        const changeAmount = Math.max(0, amount - state.totalAmount)
        
        set({
          paymentInfo: {
            ...state.paymentInfo,
            paidAmount: amount,
            changeAmount
          }
        })
      },

      processPayment: async () => {
        const state = get()
        
        if (state.cartItems.length === 0) {
          return false
        }
        
        if (state.paymentInfo.type !== PaymentType.CREDIT && 
            state.paymentInfo.paidAmount < state.totalAmount) {
          return false
        }
        
        set({ isProcessingPayment: true })
        
        try {
          // Get current user and branch info
          const authState = useAuthStore.getState()
          const user = authState.user
          const branchId = user?.branch_id
          
          if (!user || !branchId) {
            throw new Error('Kullanıcı bilgileri bulunamadı')
          }

          // Process payment using sales service
          const result = await processPayment({
            cartItems: state.cartItems,
            paymentInfo: state.paymentInfo,
            customer: state.selectedCustomer,
            userId: user.id,
            branchId: branchId,
            subtotal: state.subtotal,
            totalDiscount: state.totalDiscount,
            taxAmount: state.taxAmount,
            totalAmount: state.totalAmount
          })

          if (!result.success) {
            throw new Error(result.error || 'Ödeme işlemi başarısız')
          }

          // Store sale info for receipt generation
          set({ 
            lastSaleId: result.saleId,
            lastSaleNumber: result.saleNumber,
            showReceiptModal: true
          })
          
          // Reset POS after successful payment (but keep receipt info)
          get().resetPOS()
          
          return true
        } catch (error) {
          console.error('Payment processing failed:', error)
          throw error
        } finally {
          set({ isProcessingPayment: false })
        }
      },

      // Barcode actions
      setBarcodeInput: (barcode: string) => {
        set({ barcodeInput: barcode })
      },

      // Receipt actions
      showReceipt: () => {
        set({ showReceiptModal: true })
      },

      hideReceipt: () => {
        set({ showReceiptModal: false })
      },

      // Utility actions
      calculateTotals: () => {
        const state = get()
        
        const subtotal = state.cartItems.reduce(
          (sum, item) => sum + (item.quantity * item.unitPrice), 
          0
        )
        
        const totalDiscount = state.cartItems.reduce(
          (sum, item) => sum + item.discountAmount, 
          0
        )
        
        const netAmount = subtotal - totalDiscount
        const taxAmount = netAmount * TAX_RATE
        const totalAmount = netAmount + taxAmount
        
        set({
          subtotal,
          totalDiscount,
          taxAmount,
          totalAmount
        })
        
        // Update change amount if paid amount is set
        if (state.paymentInfo.paidAmount > 0) {
          const changeAmount = Math.max(0, state.paymentInfo.paidAmount - totalAmount)
          set(prevState => ({
            paymentInfo: {
              ...prevState.paymentInfo,
              changeAmount
            }
          }))
        }
      },

      resetPOS: () => {
        set({
          cartItems: [],
          selectedCustomer: null,
          paymentInfo: {
            type: PaymentType.CASH,
            paidAmount: 0,
            changeAmount: 0,
          },
          barcodeInput: '',
          // Keep sale info for receipt generation
          subtotal: 0,
          totalDiscount: 0,
          taxAmount: 0,
          totalAmount: 0
        })
      }
    }),
    {
      name: 'pos-store'
    }
  )
)