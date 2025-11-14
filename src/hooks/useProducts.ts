import { useState, useEffect } from 'react'
import { ProductService } from '@/services/productService'
import { Product, ProductFilter, ProductInsert, ProductUpdate } from '@/types'
import { useFastSaleStore } from '@/stores/fastSaleStore'

export const useProducts = (initialFilter: ProductFilter = {}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ProductFilter>(initialFilter)
  const refreshFastSaleData = useFastSaleStore(state => state.refreshData)

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
        // Refresh fast sale cache if product is added to fast sale
        if (productData.show_in_fast_sale) {
          refreshFastSaleData()
        }
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
        // Refresh fast sale cache if product fast sale settings changed
        if (productData.show_in_fast_sale !== undefined || 
            productData.fast_sale_category_id !== undefined || 
            productData.fast_sale_order !== undefined ||
            productData.sale_price_1 !== undefined ||
            productData.sale_price_2 !== undefined) {
          refreshFastSaleData()
        }
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
        // Product was actually deleted, remove from list
        setProducts(prev => prev.filter(product => product.id !== id))
        // Refresh fast sale cache in case deleted product was in fast sale
        refreshFastSaleData()
        return { success: true }
      } else {
        // Product couldn't be deleted (probably used in sales), try to deactivate instead
        if (response.error?.includes('satışlarda kullanıldığı')) {
          const deactivateResponse = await ProductService.deactivateProduct(id)
          if (deactivateResponse.success) {
            // Update product in list to show as inactive
            setProducts(prev => prev.map(product => 
              product.id === id ? { ...product, is_active: false } : product
            ))
            return { success: true, message: 'Ürün satışlarda kullanıldığı için pasife çekildi.' }
          }
        }
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