import { useState, useEffect } from 'react'
import { ProductService } from '@/services/productService'
import { Product, ProductFilter, ProductInsert, ProductUpdate } from '@/types'

export const useProducts = (initialFilter: ProductFilter = {}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ProductFilter>(initialFilter)

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await ProductService.getProducts(filter)
      if (response.success && response.data) {
        setProducts(response.data)
      } else {
        setError(response.error || 'Ürünler yüklenirken hata oluştu')
      }
    } catch (err) {
      setError('Ürünler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const createProduct = async (productData: ProductInsert) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await ProductService.createProduct(productData)
      if (response.success && response.data) {
        setProducts(prev => [...prev, response.data!])
        return { success: true, data: response.data }
      } else {
        setError(response.error || 'Ürün oluşturulurken hata oluştu')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'Ürün oluşturulurken hata oluştu'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProduct = async (id: string, productData: ProductUpdate) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await ProductService.updateProduct(id, productData)
      if (response.success && response.data) {
        setProducts(prev => 
          prev.map(product => 
            product.id === id ? response.data! : product
          )
        )
        return { success: true, data: response.data }
      } else {
        setError(response.error || 'Ürün güncellenirken hata oluştu')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'Ürün güncellenirken hata oluştu'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await ProductService.deleteProduct(id)
      if (response.success) {
        setProducts(prev => prev.filter(product => product.id !== id))
        return { success: true }
      } else {
        setError(response.error || 'Ürün silinirken hata oluştu')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'Ürün silinirken hata oluştu'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const checkBarcodeExists = async (barcode: string, excludeId?: string) => {
    try {
      const response = await ProductService.checkBarcodeExists(barcode, excludeId)
      return response
    } catch (err) {
      return { success: false, data: false, error: 'Barkod kontrolü sırasında hata oluştu' }
    }
  }

  const updateFilter = (newFilter: ProductFilter) => {
    setFilter(newFilter)
  }

  const bulkImportProducts = async (products: ProductInsert[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await ProductService.bulkImportProducts(products)
      if (response.success && response.data) {
        // Refresh the products list after import
        await fetchProducts()
        return { success: true, data: response.data }
      } else {
        setError(response.error || 'Toplu ürün içe aktarımı sırasında hata oluştu')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'Toplu ürün içe aktarımı sırasında hata oluştu'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const bulkUpdatePrices = async (updates: { id: string; data: ProductUpdate }[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await ProductService.bulkUpdatePrices(updates)
      if (response.success && response.data) {
        // Update the products in state
        setProducts(prev => {
          const updatedProducts = [...prev]
          response.data!.forEach(updatedProduct => {
            const index = updatedProducts.findIndex(p => p.id === updatedProduct.id)
            if (index !== -1) {
              updatedProducts[index] = updatedProduct
            }
          })
          return updatedProducts
        })
        return { success: true, data: response.data }
      } else {
        setError(response.error || 'Toplu fiyat güncelleme sırasında hata oluştu')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'Toplu fiyat güncelleme sırasında hata oluştu'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProducts = () => {
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [filter])

  return {
    products,
    isLoading,
    error,
    filter,
    createProduct,
    updateProduct,
    deleteProduct,
    checkBarcodeExists,
    bulkImportProducts,
    bulkUpdatePrices,
    updateFilter,
    refreshProducts
  }
}