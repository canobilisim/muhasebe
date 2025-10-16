import { memo, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePOSStore } from '@/stores/posStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { formatCurrency } from '@/lib/utils'
import { 
  ProductSearch, 
  ProductSearchList, 
  BarcodeInput,
  PaymentSummary,
  QuickAmountButtons,
  PaymentTypeButtons,
  CustomerSelector,
  PaidAmountInput,
  ReceiptModal
} from '@/components/pos'
import { CartItemComponent } from './CartItem'
import { ShoppingCart, Trash2 } from 'lucide-react'

export const POSLayout = memo(() => {
  const { 
    cartItems, 
    totalAmount, 
    clearCart,
    removeFromCart,
    updateCartItemQuantity,
    processPayment,
    isProcessingPayment,
    showReceiptModal,
    hideReceipt,
    lastSaleId,
    lastSaleNumber
  } = usePOSStore()

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Memoize expensive calculations
  const cartItemsCount = useMemo(() => cartItems.length, [cartItems.length])
  const hasCartItems = useMemo(() => cartItems.length > 0, [cartItems.length])
  const canProcessPayment = useMemo(() => 
    cartItems.length > 0 && totalAmount > 0 && !isProcessingPayment,
    [cartItems.length, totalAmount, isProcessingPayment]
  )

  const handleProcessPayment = useCallback(async () => {
    try {
      await processPayment()
    } catch (error) {
      console.error('Payment failed:', error)
      // TODO: Show error toast notification
    }
  }, [processPayment])

  const handleClearCart = useCallback(() => {
    clearCart()
  }, [clearCart])

  const handleRemoveFromCart = useCallback((productId: string) => {
    removeFromCart(productId)
  }, [removeFromCart])

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    updateCartItemQuantity(productId, quantity)
  }, [updateCartItemQuantity])

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 h-full min-h-screen lg:min-h-0">
      {/* Left Panel - Product Search and Cart */}
      <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-2 lg:order-1">
        {/* Barcode Input */}
        <BarcodeInput />
        
        {/* Product Search */}
        <ProductSearch />
        
        {/* Product Search Results */}
        <ProductSearchList />
        
        {/* Shopping Cart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3 lg:py-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
              Sepet ({cartItemsCount} ürün)
            </CardTitle>
            {hasCartItems && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 h-8 lg:h-9 px-2 lg:px-3"
              >
                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                <span className="hidden sm:inline">Temizle</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            {!hasCartItems ? (
              <div className="text-center py-6 lg:py-8 text-gray-500">
                <ShoppingCart className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm lg:text-base">Sepet boş</p>
                <p className="text-xs lg:text-sm">Ürün eklemek için barkod okutun veya arama yapın</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {cartItems.map((item) => (
                  <CartItemComponent
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveFromCart}
                  />
                ))}
                
                {/* Cart Total */}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center text-base lg:text-lg font-bold">
                    <span>Toplam:</span>
                    <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Payment */}
      <div className="space-y-4 lg:space-y-6 order-1 lg:order-2 lg:sticky lg:top-4 lg:h-fit">
        {/* Customer Selection */}
        <CustomerSelector />

        {/* Payment Type Selection */}
        <PaymentTypeButtons />

        {/* Paid Amount Input */}
        <PaidAmountInput />

        {/* Quick Amount Buttons */}
        <QuickAmountButtons />

        {/* Payment Summary */}
        <PaymentSummary />

        {/* Process Payment Button */}
        <Button 
          className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold touch-manipulation sticky bottom-4 lg:static bg-primary shadow-lg lg:shadow-none"
          disabled={!canProcessPayment}
          onClick={handleProcessPayment}
        >
          {isProcessingPayment ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
        </Button>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && lastSaleId && lastSaleNumber && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={hideReceipt}
          saleId={lastSaleId}
          saleNumber={lastSaleNumber}
        />
      )}
    </div>
  )
})

POSLayout.displayName = 'POSLayout'