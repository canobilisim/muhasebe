import { supabase } from '@/lib/supabase'
import { Product, ProductFilter, ProductInsert, ProductUpdate, ApiResponse } from '@/types'

export class ProductService {
  /**
   * Search products by barcode
   */
  static async searchByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: 'Ürün bulunamadı',
            success: false
          }
        }
        throw error
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error searching product by barcode:', error)
      return {
        data: null,
        error: 'Ürün arama sırasında hata oluştu',
        success: false
      }
    }
  }

  /**
   * Search products by name or barcode
   */
  static async searchProducts(query: string, limit = 10): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,barcode.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error searching products:', error)
      return {
        data: [],
        error: 'Ürün arama sırasında hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get products with filters
   */
  static async getProducts(filter: ProductFilter = {}): Promise<ApiResponse<Product[]>> {
    try {
      let query = supabase
        .from('products')
        .select('*')

      // Apply filters
      if (filter.category) {
        query = query.eq('category', filter.category)
      }

      if (filter.isActive !== undefined) {
        query = query.eq('is_active', filter.isActive)
      }

      if (filter.isLowStock) {
        query = query.lt('stock_quantity', supabase.raw('critical_stock_level'))
      }

      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,barcode.ilike.%${filter.search}%`)
      }

      const { data, error } = await query.order('name')

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting products:', error)
      return {
        data: [],
        error: 'Ürünler getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting product by ID:', error)
      return {
        data: null,
        error: 'Ürün getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get product categories
   */
  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
        .eq('is_active', true)

      if (error) throw error

      // Get unique categories
      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))] as string[]

      return {
        data: categories.sort(),
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting categories:', error)
      return {
        data: [],
        error: 'Kategoriler getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Check if product has sufficient stock
   */
  static checkStock(product: Product, requestedQuantity: number): boolean {
    return product.stock_quantity >= requestedQuantity
  }

  /**
   * Check if product is low stock
   */
  static isLowStock(product: Product): boolean {
    return product.stock_quantity <= product.critical_stock_level
  }

  /**
   * Check if product is out of stock
   */
  static isOutOfStock(product: Product): boolean {
    return product.stock_quantity <= 0
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: ProductInsert): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error creating product:', error)
      return {
        data: null,
        error: 'Ürün oluşturulurken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Update a product
   */
  static async updateProduct(id: string, productData: ProductUpdate): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        data: null,
        error: 'Ürün güncellenirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Delete a product (soft delete by setting is_active to false)
   */
  static async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      return {
        data: false,
        error: 'Ürün silinirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Check if barcode already exists
   */
  static async checkBarcodeExists(barcode: string, excludeId?: string): Promise<ApiResponse<boolean>> {
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('barcode', barcode)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: (data?.length || 0) > 0,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error checking barcode:', error)
      return {
        data: false,
        error: 'Barkod kontrolü sırasında hata oluştu',
        success: false
      }
    }
  }

  /**
   * Bulk import products from Excel/CSV
   */
  static async bulkImportProducts(products: ProductInsert[]): Promise<ApiResponse<Product[]>> {
    try {
      // Check for existing barcodes
      const barcodes = products.map(p => p.barcode)
      const { data: existingProducts, error: checkError } = await supabase
        .from('products')
        .select('barcode')
        .in('barcode', barcodes)

      if (checkError) throw checkError

      const existingBarcodes = new Set(existingProducts?.map(p => p.barcode) || [])
      
      // Separate new products and updates
      const newProducts = products.filter(p => !existingBarcodes.has(p.barcode))
      const updateProducts = products.filter(p => existingBarcodes.has(p.barcode))

      const results: Product[] = []

      // Insert new products
      if (newProducts.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from('products')
          .insert(newProducts)
          .select()

        if (insertError) throw insertError
        if (insertedData) results.push(...insertedData)
      }

      // Update existing products
      for (const product of updateProducts) {
        const { data: updatedData, error: updateError } = await supabase
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            purchase_price: product.purchase_price,
            sale_price: product.sale_price,
            stock_quantity: product.stock_quantity,
            critical_stock_level: product.critical_stock_level
          })
          .eq('barcode', product.barcode)
          .select()
          .single()

        if (updateError) throw updateError
        if (updatedData) results.push(updatedData)
      }

      return {
        data: results,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error bulk importing products:', error)
      return {
        data: [],
        error: 'Toplu ürün içe aktarımı sırasında hata oluştu',
        success: false
      }
    }
  }

  /**
   * Bulk update product prices
   */
  static async bulkUpdatePrices(updates: { id: string; data: ProductUpdate }[]): Promise<ApiResponse<Product[]>> {
    try {
      const results: Product[] = []

      // Process updates in batches to avoid overwhelming the database
      const batchSize = 10
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async ({ id, data }) => {
          const { data: updatedData, error } = await supabase
            .from('products')
            .update(data)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error
          return updatedData
        })

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      }

      return {
        data: results,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error bulk updating prices:', error)
      return {
        data: [],
        error: 'Toplu fiyat güncelleme sırasında hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get products with low stock alerts
   */
  static async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .lt('stock_quantity', supabase.raw('critical_stock_level'))
        .order('stock_quantity', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting low stock products:', error)
      return {
        data: [],
        error: 'Düşük stoklu ürünler getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get out of stock products
   */
  static async getOutOfStockProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .lte('stock_quantity', 0)
        .order('name')

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting out of stock products:', error)
      return {
        data: [],
        error: 'Tükenen ürünler getirilirken hata oluştu',
        success: false
      }
    }
  }
}