import { supabase } from '@/lib/supabase'
import type { ApiResponse } from '@/types'

export interface ProductCategory {
  id: string
  branch_id: string | null
  name: string
  parent_id: string | null
  description: string | null
  display_order: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  // Relations
  parent?: ProductCategory
  children?: ProductCategory[]
}

export interface ProductCategoryInsert {
  branch_id?: string | null
  name: string
  parent_id?: string | null
  description?: string | null
  display_order?: number | null
  is_active?: boolean | null
}

export interface ProductCategoryUpdate {
  name?: string
  parent_id?: string | null
  description?: string | null
  display_order?: number | null
  is_active?: boolean | null
}

export interface CategoryHierarchy {
  id: string
  name: string
  parent_id: string | null
  children: CategoryHierarchy[]
  level: number
  full_path: string
}

export class CategoryService {
  /**
   * Get all categories for current user's branch
   */
  static async getCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
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
   * Get categories with hierarchy structure
   */
  static async getCategoriesHierarchy(): Promise<ApiResponse<CategoryHierarchy[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      // Build hierarchy
      const categories = data || []
      const hierarchy = this.buildCategoryHierarchy(categories)

      return {
        data: hierarchy,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting category hierarchy:', error)
      return {
        data: [],
        error: 'Kategori hiyerarşisi getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get root categories (no parent)
   */
  static async getRootCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting root categories:', error)
      return {
        data: [],
        error: 'Ana kategoriler getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get subcategories of a parent category
   */
  static async getSubcategories(parentId: string): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting subcategories:', error)
      return {
        data: [],
        error: 'Alt kategoriler getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData: ProductCategoryInsert): Promise<ApiResponse<ProductCategory>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert(categoryData)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error creating category:', error)
      return {
        data: null,
        error: 'Kategori oluşturulurken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(id: string, categoryData: ProductCategoryUpdate): Promise<ApiResponse<ProductCategory>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update(categoryData)
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
      console.error('Error updating category:', error)
      return {
        data: null,
        error: 'Kategori güncellenirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      return {
        data: false,
        error: 'Kategori silinirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Check if category name exists
   */
  static async checkCategoryExists(name: string, parentId?: string | null, excludeId?: string): Promise<ApiResponse<boolean>> {
    try {
      let query = supabase
        .from('product_categories')
        .select('id')
        .eq('name', name)
        .eq('is_active', true)

      if (parentId) {
        query = query.eq('parent_id', parentId)
      } else {
        query = query.is('parent_id', null)
      }

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
      console.error('Error checking category:', error)
      return {
        data: false,
        error: 'Kategori kontrolü sırasında hata oluştu',
        success: false
      }
    }
  }

  /**
   * Build category hierarchy from flat array
   */
  private static buildCategoryHierarchy(categories: ProductCategory[]): CategoryHierarchy[] {
    const categoryMap = new Map<string, CategoryHierarchy>()
    const rootCategories: CategoryHierarchy[] = []

    // First pass: create all category objects
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_id,
        children: [],
        level: 0,
        full_path: cat.name
      })
    })

    // Second pass: build hierarchy and calculate levels
    categories.forEach(cat => {
      const categoryHierarchy = categoryMap.get(cat.id)!
      
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id)
        if (parent) {
          parent.children.push(categoryHierarchy)
          categoryHierarchy.level = parent.level + 1
          categoryHierarchy.full_path = `${parent.full_path} > ${cat.name}`
        }
      } else {
        rootCategories.push(categoryHierarchy)
      }
    })

    return rootCategories
  }

  /**
   * Get flattened category list for dropdowns
   */
  static async getFlatCategoryList(): Promise<ApiResponse<Array<{ id: string; name: string; full_path: string; level: number }>>> {
    try {
      const hierarchyResult = await this.getCategoriesHierarchy()
      if (!hierarchyResult.success || !hierarchyResult.data) {
        return {
          data: [],
          error: hierarchyResult.error,
          success: false
        }
      }

      const flatList: Array<{ id: string; name: string; full_path: string; level: number }> = []
      
      const flatten = (categories: CategoryHierarchy[]) => {
        categories.forEach(cat => {
          flatList.push({
            id: cat.id,
            name: cat.name,
            full_path: cat.full_path,
            level: cat.level
          })
          if (cat.children.length > 0) {
            flatten(cat.children)
          }
        })
      }

      flatten(hierarchyResult.data)

      return {
        data: flatList,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting flat category list:', error)
      return {
        data: [],
        error: 'Kategori listesi getirilirken hata oluştu',
        success: false
      }
    }
  }
}