import React from 'react'
import { Plus, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'
import { ProductService } from '@/services/productService'

interface ProductSearchListProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  onAddToCart: (product: Product) => void
  className?: string
}

export const ProductSearchList: React.FC<ProductSearchListProps> = ({
  products,
  isLoading,
  error,
  onAddToCart,
  className = ''
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const getStockStatus = (product: Product) => {
    if (ProductService.isOutOfStock(product)) {
      return { label: 'Stokta Yok', variant: 'destructive' as const, disabled: true }
    }
    if (ProductService.isLowStock(product)) {
      return { label: 'Düşük Stok', variant: 'warning' as const, disabled: false }
    }
    return { label: 'Stokta', variant: 'success' as const, disabled: false }
  }

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Ürün bulunamadı</p>
          <p className="text-sm text-gray-400 mt-1">
            Farklı bir arama terimi deneyin
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-2 max-h-96 overflow-y-auto ${className}`}>
      {products.map((product) => {
        const stockStatus = getStockStatus(product)
        
        return (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Barkod: {product.barcode}
                      </p>
                    </div>
                    <Badge 
                      variant={stockStatus.variant}
                      className="ml-2 shrink-0"
                    >
                      {stockStatus.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg text-green-600">
                        {formatPrice(product.sale_price)}
                      </span>
                      
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Stok: {product.stock_quantity} adet
                      </p>
                      {ProductService.isLowStock(product) && !ProductService.isOutOfStock(product) && (
                        <p className="text-xs text-orange-600">
                          Kritik seviye: {product.critical_stock_level}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => onAddToCart(product)}
                  disabled={stockStatus.disabled}
                  size="sm"
                  className="ml-4 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}