import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { usePOSStore } from '@/stores/posStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { formatCurrency } from '@/lib/utils'
import { 
  ProductSearch, 
  BarcodeInput,
  ReceiptModal
} from '@/components/pos'
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-gray-800 text-white p-2">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">POS Sistemi</div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              Ayarlar
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              Yardım
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Products */}
        <div className="w-3/4 flex flex-col border-r">
          {/* Barcode Input */}
          <div className="p-2 border-b">
            <BarcodeInput 
              onProductFound={(product) => updateCartItemQuantity(product.id, 1)}
              className="w-full"
              autoFocus
            />
          </div>
          
          {/* Product List */}
          <div className="flex-1 overflow-auto p-2">
            <ProductSearch />
          </div>
          
          {/* Cart Summary */}
          <div className="border-t p-2 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="font-medium">
                Toplam: <span className="text-green-600">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearCart}
                  disabled={!hasCartItems}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Temizle
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!canProcessPayment}
                  onClick={handleProcessPayment}
                >
                  Öde
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-1/4 flex flex-col border-l">
          <div className="p-2 border-b font-medium flex justify-between items-center">
            <span>Sepet ({cartItemsCount})</span>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {!hasCartItems ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Sepet boş</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(item.product.sale_price)} x {item.quantity}</div>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="h-6 w-6 p-0"
                    >
                      -
                    </Button>
                    <span className="mx-2 w-6 text-center">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      +
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Payment Actions */}
          <div className="p-2 border-t space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10">
                Müşteri Seç
              </Button>
              <Button variant="outline" size="sm" className="h-10">
                İndirim Uygula
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-1">
              <Button variant="outline" size="sm" className="h-10">%5</Button>
              <Button variant="outline" size="sm" className="h-10">%10</Button>
              <Button variant="outline" size="sm" className="h-10">%15</Button>
              <Button variant="outline" size="sm" className="h-10">%20</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="sm" className="h-10">Nakit</Button>
              <Button variant="outline" size="sm" className="h-10">Kredi Kartı</Button>
              <Button variant="outline" size="sm" className="h-10">Havale</Button>
            </div>
          </div>
        </div>
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