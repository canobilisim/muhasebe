import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarcodeInput } from './BarcodeInput'
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
  const [showManualSearch, setShowManualSearch] = useState(false)
  
  const {
    products,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    clearSearch,
    addProductToCart
  } = useProductSearch({
    autoSearch: true,
    debounceMs: 300,
    limit: 10
  })

  const handleProductFound = (product: Product) => {
    onProductAdded?.(product)
  }

  const handleProductAddedFromList = (product: Product) => {
    const success = addProductToCart(product, 1)
    if (success) {
      onProductAdded?.(product)
    }
  }

  const handleManualSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const toggleManualSearch = () => {
    setShowManualSearch(!showManualSearch)
    if (showManualSearch) {
      clearSearch()
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ürün Arama</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleManualSearch}
            className="text-xs"
          >
            {showManualSearch ? (
              <>
                <X className="h-3 w-3 mr-1" />
                Barkod Modu
              </>
            ) : (
              <>
                <Search className="h-3 w-3 mr-1" />
                Manuel Arama
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!showManualSearch ? (
          // Barcode input mode
          <BarcodeInput
            onProductFound={handleProductFound}
            onError={(error) => console.error('Barcode error:', error)}
          />
        ) : (
          // Manual search mode
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Ürün adı veya barkod ile arama yapın..."
                value={searchQuery}
                onChange={handleManualSearchChange}
                className="pl-10"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {(searchQuery || isLoading || error) && (
              <ProductSearchList
                products={products}
                isLoading={isLoading}
                error={error}
                onAddToCart={handleProductAddedFromList}
              />
            )}
          </div>
        )}
        
        {!showManualSearch && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">Barkod Okuyucu Modu:</div>
            <div>• Barkodu okutun veya manuel olarak yazın</div>
            <div>• Enter tuşu ile ürünü sepete ekleyin</div>
            <div>• Manuel arama için yukarıdaki butonu kullanın</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}