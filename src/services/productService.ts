import { supabase } from '@/lib/supabase'
import { Product, ProductFilter, ProductInsert, ProductUpdate, ApiResponse } from '@/types'

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ProductPaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class ProductService {
  /**
   * Search products by barcode
   */
  static async searchByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      // Use limit(1) instead of single() to avoid 406 errors
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .eq('is_active', true)
        .limit(1)

      if (error) {
        console.error('Error searching product by barcode:', error)
        return {
          data: null,
          error: 'Ürün arama sırasında hata oluştu',
          success: false
        }
      }

      // Check if any product found
      if (!data || data.length === 0) {
        return {
          data: null,
          error: 'Ürün bulunamadı',
          success: false
        }
      }

      return {
        data: data[0], // Return first product
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
   * Get products with filters (legacy - returns all)
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
        // Filter products where stock is less than critical level
        // Note: This is done client-side since Supabase doesn't support column comparison in filters
        const { data: allProducts } = await query
        if (allProducts) {
          const lowStockProducts = allProducts.filter(
            (p) => p.critical_stock_level !== null && p.stock_quantity < p.critical_stock_level
          )
          return {
            data: lowStockProducts,
            error: null,
            success: true,
          }
        }
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
   * Get products with pagination - backend handles all calculations
   */
  static async getProductsPaginated(
    filter: ProductFilter = {},
    pagination: ProductPaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const { page = 1, pageSize = 50, sortBy = 'name', sortOrder = 'asc' } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // First get total count with filters
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Apply filters to count query
      if (filter.category) {
        countQuery = countQuery.eq('category', filter.category)
      }
      if (filter.isActive !== undefined) {
        countQuery = countQuery.eq('is_active', filter.isActive)
      }
      if (filter.search) {
        countQuery = countQuery.or(`name.ilike.%${filter.search}%,barcode.ilike.%${filter.search}%`)
      }

      const { count, error: countError } = await countQuery

      if (countError) throw countError

      // Now get paginated data
      let dataQuery = supabase
        .from('products')
        .select('*')

      // Apply filters
      if (filter.category) {
        dataQuery = dataQuery.eq('category', filter.category)
      }
      if (filter.isActive !== undefined) {
        dataQuery = dataQuery.eq('is_active', filter.isActive)
      }
      if (filter.search) {
        dataQuery = dataQuery.or(`name.ilike.%${filter.search}%,barcode.ilike.%${filter.search}%`)
      }

      // Apply sorting and pagination
      const { data, error } = await dataQuery
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

      if (error) throw error

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / pageSize)

      return {
        data: {
          data: data || [],
          totalCount,
          page,
          pageSize,
          totalPages
        },
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting paginated products:', error)
      return {
        data: null,
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
   * Get product by ID with serial numbers
   */
  static async getProductWithSerialNumbers(id: string): Promise<ApiResponse<Product & { serialNumbers?: any[] }>> {
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (productError) throw productError

      // If product has serial number tracking, fetch serial numbers
      if (product.serial_number_tracking_enabled) {
        const { data: serialNumbers, error: serialError } = await supabase
          .from('product_serial_numbers')
          .select('*')
          .eq('product_id', id)
          .order('added_date', { ascending: false })

        if (serialError) {
          console.error('Error fetching serial numbers:', serialError)
        }

        return {
          data: { ...product, serialNumbers: serialNumbers || [] },
          error: null,
          success: true
        }
      }

      return {
        data: { ...product, serialNumbers: [] },
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting product with serial numbers:', error)
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
    return product.critical_stock_level !== null && product.stock_quantity <= product.critical_stock_level
  }

  /**
   * Check if product is out of stock
   */
  static isOutOfStock(product: Product): boolean {
    return product.stock_quantity <= 0
  }

  /**
   * Create a new product
   * Supports technical specifications: brand, model, color, condition
   * Supports serial number tracking flag
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
   * Supports technical specifications: brand, model, color, condition
   * Supports serial number tracking flag
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
   * Delete a product (hard delete with safety checks)
   */
  static async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      // First check if product is used in any sales
      const { data: salesCheck, error: salesError } = await supabase
        .from('sale_items')
        .select('id')
        .eq('product_id', id)
        .limit(1)

      if (salesError) throw salesError

      if (salesCheck && salesCheck.length > 0) {
        return {
          data: false,
          error: 'Bu ürün satışlarda kullanıldığı için silinemez. Bunun yerine pasife çekildi.',
          success: false
        }
      }

      // Check if product has serial numbers
      const { data: serialCheck, error: serialError } = await supabase
        .from('product_serial_numbers')
        .select('id')
        .eq('product_id', id)
        .limit(1)

      if (serialError) throw serialError

      if (serialCheck && serialCheck.length > 0) {
        // Delete serial numbers first
        const { error: deleteSerialError } = await supabase
          .from('product_serial_numbers')
          .delete()
          .eq('product_id', id)

        if (deleteSerialError) throw deleteSerialError
      }

      // Now delete the product
      const { error } = await supabase
        .from('products')
        .delete()
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
   * Soft delete a product (set is_active to false)
   */
  static async deactivateProduct(id: string): Promise<ApiResponse<boolean>> {
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
      console.error('Error deactivating product:', error)
      return {
        data: false,
        error: 'Ürün pasife çekilirken hata oluştu',
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
        const { data: updatedData, error: updateError} = await supabase
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            purchase_price: product.purchase_price,
            sale_price_1: (product as any).sale_price || (product as any).sale_price_1,
            stock_quantity: product.stock_quantity,
            critical_stock_level: product.critical_stock_level,
            brand: product.brand,
            model: product.model,
            color: product.color,
            serial_number: product.serial_number,
            condition: product.condition
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
        .not('critical_stock_level', 'is', null)
        .order('stock_quantity', { ascending: true })

      if (error) throw error

      // Filter client-side to compare stock_quantity with critical_stock_level
      const lowStockProducts = (data || []).filter(
        (product) => product.critical_stock_level !== null && product.stock_quantity < product.critical_stock_level
      )

      return {
        data: lowStockProducts,
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

  /**
   * Get fast sale products grouped by category
   */
  static async getFastSaleProducts(): Promise<ApiResponse<{
    categories: Array<{ id: string; name: string; display_order: number }>;
    products: Array<{
      id: string;
      barcode: string;
      name: string;
      sale_price_1: number;
      sale_price_2: number;
      category_id: string;
      category_name: string;
      fast_sale_order: number;
    }>;
  }>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: 'Kullanıcı oturumu bulunamadı', success: false };
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', userData.user.id)
        .single();

      if (!userProfile?.branch_id) {
        return { data: null, error: 'Kullanıcı şubesi bulunamadı', success: false };
      }

      // Get categories
      const { data: categories, error: catError } = await supabase
        .from('fast_sale_categories')
        .select('id, name, display_order')
        .eq('branch_id', userProfile.branch_id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      // Get products with category info
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`
          id,
          barcode,
          name,
          sale_price_1,
          sale_price_2,
          fast_sale_order,
          fast_sale_category_id,
          fast_sale_categories!inner (
            id,
            name
          )
        `)
        .eq('branch_id', userProfile.branch_id)
        .eq('is_active', true)
        .eq('show_in_fast_sale', true)
        .not('fast_sale_category_id', 'is', null)
        .order('fast_sale_order', { ascending: true });

      if (prodError) throw prodError;

      // Transform products data
      const transformedProducts = products?.map((p: any) => ({
        id: p.id,
        barcode: p.barcode,
        name: p.name,
        sale_price_1: p.sale_price_1 || 0,
        sale_price_2: p.sale_price_2 || p.sale_price_1 || 0,
        category_id: p.fast_sale_category_id,
        category_name: p.fast_sale_categories.name,
        fast_sale_order: p.fast_sale_order || 0,
      })) || [];

      return {
        data: {
          categories: categories || [],
          products: transformedProducts,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error getting fast sale products:', error);
      return {
        data: null,
        error: 'Hızlı satış ürünleri getirilirken hata oluştu',
        success: false,
      };
    }
  }

  /**
   * Kategorideki bir sonraki sıra numarasını al
   */
  static async getNextOrderNumber(categoryId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('fast_sale_order')
        .eq('fast_sale_category_id', categoryId)
        .eq('show_in_fast_sale', true)
        .order('fast_sale_order', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting next order number:', error);
        return 1;
      }

      return (data?.fast_sale_order || 0) + 1;
    } catch (error) {
      console.error('Error getting next order number:', error);
      return 1;
    }
  }

  /**
   * Sıra numarası değiştiğinde diğer ürünlerin sırasını güncelle
   */
  static async reorderProducts(
    categoryId: string,
    newOrder: number,
    productId?: string,
    oldOrder?: number
  ): Promise<void> {
    try {
      // Kategorideki tüm ürünleri al
      const { data: products, error } = await supabase
        .from('products')
        .select('id, fast_sale_order')
        .eq('fast_sale_category_id', categoryId)
        .eq('show_in_fast_sale', true)
        .order('fast_sale_order', { ascending: true });

      if (error) throw error;
      if (!products) return;

      const updates: Array<{ id: string; fast_sale_order: number }> = [];

      // Yeni ürün ekleme (oldOrder yok)
      if (!oldOrder || !productId) {
        // Yeni sıradan sonraki tüm ürünleri +1 kaydır
        products.forEach((product) => {
          const currentOrder = product.fast_sale_order || 0;
          if (currentOrder >= newOrder) {
            updates.push({
              id: product.id,
              fast_sale_order: currentOrder + 1,
            });
          }
        });
      } else {
        // Mevcut ürün sıra değiştirme
        products.forEach((product) => {
          if (product.id === productId) return; // Düzenlenen ürünü atla

          const currentOrder = product.fast_sale_order || 0;

          if (oldOrder < newOrder) {
            // Aşağı taşıma (örn: 2 → 4)
            // oldOrder ile newOrder arası ürünleri -1 kaydır
            if (currentOrder > oldOrder && currentOrder <= newOrder) {
              updates.push({
                id: product.id,
                fast_sale_order: currentOrder - 1,
              });
            }
          } else if (oldOrder > newOrder) {
            // Yukarı taşıma (örn: 4 → 2)
            // newOrder ile oldOrder arası ürünleri +1 kaydır
            if (currentOrder >= newOrder && currentOrder < oldOrder) {
              updates.push({
                id: product.id,
                fast_sale_order: currentOrder + 1,
              });
            }
          }
          // oldOrder === newOrder ise hiçbir şey yapma
        });
      }

      // Toplu güncelleme
      for (const update of updates) {
        await supabase
          .from('products')
          .update({ fast_sale_order: update.fast_sale_order })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error reordering products:', error);
    }
  }
}
