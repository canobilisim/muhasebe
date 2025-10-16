import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductSearch } from './ProductSearch'
import { usePOSStore } from '@/stores/posStore'
import { Product } from '@/types'

export const POSTestComponent: React.FC = () => {
  const { cartItems, totalAmount } = usePOSStore()

  const handleProductAdded = (product: Product) => {
    console.log('Product added to cart:', product.name)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Product Search */}
      <ProductSearch onProductAdded={handleProductAdded} />
      
      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Sepet Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Sepet boş. Ürün eklemek için barkod okutun.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} x {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatPrice(item.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Toplam:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}