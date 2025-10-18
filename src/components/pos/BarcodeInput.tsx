import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Search, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePOSStore } from '@/stores/posStore'
import { ProductService } from '@/services/productService'
import { Product } from '@/types'

interface BarcodeInputProps {
  onProductFound?: (product: Product) => void
  onError?: (error: string) => void
  className?: string
  autoFocus?: boolean
}

export const BarcodeInput: React.FC<BarcodeInputProps> = ({
  onProductFound,
  onError,
  className = '',
  autoFocus = false
}) => {
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSearchedBarcode, setLastSearchedBarcode] = useState('')
  
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    barcodeInput, 
    setBarcodeInput, 
    addToCart 
  } = usePOSStore()

  // Focus input on component mount and when error is cleared
  useEffect(() => {
    if (inputRef.current && !error) {
      inputRef.current.focus()
    }
  }, [error])

  // Auto-focus input every 5 seconds to ensure barcode scanner input is captured
  useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (barcode: string) => {
    if (!barcode.trim()) return

    // Prevent duplicate searches
    if (barcode === lastSearchedBarcode && isSearching) return

    setIsSearching(true)
    setError(null)
    setLastSearchedBarcode(barcode)

    try {
      const result = await ProductService.searchByBarcode(barcode.trim())
      
      if (result.success && result.data) {
        const product = result.data
        
        // Check stock availability
        if (ProductService.isOutOfStock(product)) {
          const errorMsg = `${product.name} stokta yok`
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Add to cart
        addToCart(product, 1)
        
        // Clear input
        setBarcodeInput('')
        setLastSearchedBarcode('')
        
        // Notify parent component
        onProductFound?.(product)
        
        // Show low stock warning
        if (ProductService.isLowStock(product)) {
          console.warn(`Düşük stok uyarısı: ${product.name} (${product.stock_quantity} adet kaldı)`)
        }
        
      } else {
        const errorMsg = result.error || 'Ürün bulunamadı'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (error) {
      const errorMsg = 'Ürün arama sırasında hata oluştu'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Barcode search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBarcodeInput(value)
    
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(barcodeInput)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setBarcodeInput('')
      setError(null)
      setLastSearchedBarcode('')
    }
  }

  const handleSearchClick = () => {
    handleSearch(barcodeInput)
  }

  const clearError = () => {
    setError(null)
    setLastSearchedBarcode('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Barkod okuyucu veya ürün ara..."
            value={barcodeInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className={cn('pl-10 pr-10', className)}
            disabled={isSearching}
            autoFocus={autoFocus}
          />
        </div>
        
        <Button
          onClick={handleSearchClick}
          disabled={isSearching || !barcodeInput.trim()}
          className="px-4"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-auto p-1 text-xs"
            >
              Tamam
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <div>• Enter: Ürün ara ve sepete ekle</div>
        <div>• Escape: Temizle</div>
        <div>• Barkod okuyucu otomatik olarak algılanır</div>
      </div>
    </div>
  )
}