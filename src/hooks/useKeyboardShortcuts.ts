import { useEffect } from 'react'
import { usePOSStore } from '@/stores/posStore'
import { PaymentType } from '@/types/enums'

/**
 * Custom hook for handling keyboard shortcuts in the POS system
 * 
 * Keyboard shortcuts:
 * - F8: Set payment type to CASH (Nakit)
 * - F9: Set payment type to POS (Kredi Kartı)
 * - F10: Set payment type to CREDIT (Açık Hesap) - requires customer selection
 * - F11: Set payment type to PARTIAL (Parçalı)
 * - Enter: Focus barcode input for product search
 * - Escape: Clear cart
 */
export const useKeyboardShortcuts = () => {
  const { 
    setPaymentType, 
    clearCart, 
    selectedCustomer,
    cartItems,
    setBarcodeInput 
  } = usePOSStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when user is typing in input fields
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true'

      // Allow Enter and Escape even in input fields for specific functionality
      if (isInputField && !['Enter', 'Escape'].includes(event.key)) {
        return
      }

      // Prevent default behavior for function keys
      if (event.key.startsWith('F') && event.key.length <= 3) {
        event.preventDefault()
      }

      switch (event.key) {
        case 'F8':
          // Set payment type to CASH
          setPaymentType(PaymentType.CASH)
          break

        case 'F9':
          // Set payment type to POS
          setPaymentType(PaymentType.POS)
          break

        case 'F10':
          // Set payment type to CREDIT (only if customer is selected)
          if (selectedCustomer) {
            setPaymentType(PaymentType.CREDIT)
          } else {
            // Show a visual indication that customer selection is required
            console.warn('Açık hesap için müşteri seçimi gereklidir')
            // TODO: Show toast notification
          }
          break

        case 'F11':
          // Set payment type to PARTIAL
          setPaymentType(PaymentType.PARTIAL)
          break

        case 'Enter':
          // Focus barcode input if not already focused
          if (!isInputField) {
            event.preventDefault()
            const barcodeInput = document.querySelector('input[placeholder*="Barkod"]') as HTMLInputElement
            if (barcodeInput) {
              barcodeInput.focus()
            }
          }
          break

        case 'Escape':
          // Clear cart if not in input field, or clear input if in barcode input
          if (isInputField) {
            const barcodeInput = document.querySelector('input[placeholder*="Barkod"]') as HTMLInputElement
            if (target === barcodeInput) {
              setBarcodeInput('')
            }
          } else {
            event.preventDefault()
            if (cartItems.length > 0) {
              clearCart()
            }
          }
          break

        default:
          break
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [setPaymentType, clearCart, selectedCustomer, cartItems, setBarcodeInput])

  // Return nothing - this is a side-effect only hook
  return null
}