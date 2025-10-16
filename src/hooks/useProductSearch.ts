import { useState, useCallback, useEffect } from 'react'
import { Product, ProductFilter } from '@/types'
import { ProductService } from '@/services/productService'
import { usePOSStore } from '@/stores/posStore'

interface UseProductSearchOptions {
  autoSearch?: boolean
  debounceMs?: number
  limit?: number
}

interface UseProductSearchReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  categories: string[]
  
  // Actions
  searchProducts: (query: string) => Promise<void>
  searchByBarcode: (barcode: string) => Promise<Product | null>
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  addProductToCart: (product: Product, quantity?: number) => boolean
  
  // Filters
  applyFilter: (filter: ProductFilter) => Promise<void>
  loadCategories: () => Promise<void>
}

export const useProductSearch = (options: UseProductSearchOptions = {}): UseProductSearchReturn => {
  const {
    autoSearch = true,
    debounceMs = 300,
    limit = 20
  } = options

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const { addToCart } = usePOSStore()

  // Debounced search effect
  useEffect(() => {
    if (!autoSearch || !searchQuery.trim()) {
      if (searchQuery === '') {
        setProducts([])
      }
      return
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      searchProducts(searchQuery)
    }, debounceMs)

    setDebounceTimer(timer)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [searchQuery, autoSearch, debounceMs])

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductService.searchProducts(query.trim(), limit)
      
      if (result.success) {
        setProducts(result.data || [])
      } else {
        setError(result.error || 'Ürün arama sırasında hata oluştu')
        setProducts([])
      }
    } catch (err) {
      setError('Ürün arama sırasında hata oluştu')
      setProducts([])
      console.error('Product search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  const searchByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    if (!barcode.trim()) return null

    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductService.searchByBarcode(barcode.trim())
      
      if (result.success && result.data) {
        return result.data
      } else {
        setError(result.error || 'Ürün bulunamadı')
        return null
      }
    } catch (err) {
      setError('Ürün arama sırasında hata oluştu')
      console.error('Barcode search error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyFilter = useCallback(async (filter: ProductFilter) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await ProductService.getProducts(filter)
      
      if (result.success) {
        setProducts(result.data || [])
      } else {
        setError(result.error || 'Ürünler getirilirken hata oluştu')
        setProducts([])
      }
    } catch (err) {
      setError('Ürünler getirilirken hata oluştu')
      setProducts([])
      console.error('Product filter error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const result = await ProductService.getCategories()
      
      if (result.success) {
        setCategories(result.data || [])
      }
    } catch (err) {
      console.error('Categories load error:', err)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setProducts([])
    setError(null)
    
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      setDebounceTimer(null)
    }
  }, [debounceTimer])

  const addProductToCart = useCallback((product: Product, quantity = 1): boolean => {
    // Check stock availability
    if (ProductService.isOutOfStock(product)) {
      setError(`${product.name} stokta yok`)
      return false
    }

    if (!ProductService.checkStock(product, quantity)) {
      setError(`${product.name} için yeterli stok yok (Mevcut: ${product.stock_quantity})`)
      return false
    }

    // Add to cart
    addToCart(product, quantity)
    
    // Show low stock warning
    if (ProductService.isLowStock(product)) {
      console.warn(`Düşük stok uyarısı: ${product.name} (${product.stock_quantity} adet kaldı)`)
    }

    return true
  }, [addToCart])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    products,
    isLoading,
    error,
    searchQuery,
    categories,
    
    searchProducts,
    searchByBarcode,
    setSearchQuery,
    clearSearch,
    addProductToCart,
    
    applyFilter,
    loadCategories
  }
}