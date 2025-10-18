import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ProductSearchList } from './ProductSearchList'
import { useProductSearch } from '@/hooks/useProductSearch'
import { Product } from '@/types'

interface ProductSearchProps {
  onProductAdded?: (product: Product) => void
  className?: string
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductAdded,
  className = ''
}) => {
  const {
    products,
    isLoading,
    error,
    addProductToCart
  } = useProductSearch({
    autoSearch: true,
    debounceMs: 300,
    limit: 10
  })

  const handleProductAddedFromList = (product: Product) => {
    const success = addProductToCart(product, 1)
    if (success) {
      onProductAdded?.(product)
    }
  }

  return (
    <div className={className}>
      <Card className="border-0 shadow-none">
        <CardContent className="p-2">
          <div className="space-y-4">
            <ProductSearchList
              products={products}
              isLoading={isLoading}
              error={error}
              onAddToCart={handleProductAddedFromList}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}