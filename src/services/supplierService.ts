import { supabase } from '@/lib/supabase'
import type { Supplier, SupplierInsert, SupplierUpdate, SupplierFilter, PaginatedSupplierResponse } from '@/types'

export class SupplierService {
  // Get all suppliers with filtering and pagination
  static async getSuppliers(
    filter: SupplierFilter = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedSupplierResponse> {
    try {
      let query = supabase
        .from('suppliers')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })

      // Apply filters
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,company_name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,email.ilike.%${filter.search}%`)
      }

      if (filter.isActive !== undefined) {
        query = query.eq('is_active', filter.isActive)
      }

      if (filter.hasBalance) {
        query = query.gt('current_balance', 0)
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Tedarikçi listesi alınamadı: ${error.message}`)
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    }
  }

  // Get supplier by ID
  static async getSupplierById(id: string): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(`Tedarikçi bulunamadı: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching supplier:', error)
      throw error
    }
  }

  // Create new supplier
  static async createSupplier(supplier: SupplierInsert): Promise<Supplier> {
    try {
      // Get current user's branch_id
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('Kullanıcı oturumu bulunamadı')
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', userData.user.id)
        .single()

      if (!userProfile?.branch_id) {
        throw new Error('Kullanıcı şubesi bulunamadı')
      }

      // Add branch_id to supplier data
      const supplierWithBranch = {
        ...supplier,
        branch_id: userProfile.branch_id,
      }

      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierWithBranch)
        .select()
        .single()

      if (error) {
        throw new Error(`Tedarikçi oluşturulamadı: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw error
    }
  }

  // Update supplier
  static async updateSupplier(id: string, updates: SupplierUpdate): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Tedarikçi güncellenemedi: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating supplier:', error)
      throw error
    }
  }

  // Delete supplier (hard delete - cascades to related records)
  static async deleteSupplier(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Tedarikçi silinemedi: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      throw error
    }
  }

  // Get suppliers with outstanding balance
  static async getSuppliersWithBalance(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .gt('current_balance', 0)
        .eq('is_active', true)
        .order('current_balance', { ascending: false })

      if (error) {
        throw new Error(`Borçlu tedarikçi listesi alınamadı: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching suppliers with balance:', error)
      throw error
    }
  }

  // Search suppliers by name or company
  static async searchSuppliers(query: string): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('is_active', { ascending: false })
        .order('name', { ascending: true })
        .limit(10)

      if (error) {
        throw new Error(`Tedarikçi araması yapılamadı: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error searching suppliers:', error)
      throw error
    }
  }

  // Update supplier balance
  static async updateSupplierBalance(id: string, amount: number): Promise<void> {
    try {
      // Mevcut bakiyeyi al
      const { data: supplier, error: fetchError } = await supabase
        .from('suppliers')
        .select('current_balance')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Yeni bakiyeyi hesapla ve güncelle
      const newBalance = (supplier.current_balance || 0) + amount
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ current_balance: newBalance })
        .eq('id', id)

      if (updateError) {
        throw new Error(`Tedarikçi bakiyesi güncellenemedi: ${updateError.message}`)
      }
    } catch (error) {
      console.error('Error updating supplier balance:', error)
      throw error
    }
  }

  // Get supplier purchases
  static async getSupplierPurchases(supplierId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items(
            *,
            product:products(*)
          ),
          user:users!purchases_user_id_fkey(*)
        `)
        .eq('supplier_id', supplierId)
        .order('purchase_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching supplier purchases:', error)
      throw error
    }
  }

  // Get supplier summary
  static async getSupplierSummary(supplierId: string): Promise<{
    totalPurchases: number
    totalAmount: number
    creditPurchases: number
    creditAmount: number
  }> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('total_amount, payment_type')
        .eq('supplier_id', supplierId)

      if (error) throw error

      const purchases = data || []
      const totalPurchases = purchases.length
      const totalAmount = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0)
      const creditPurchases = purchases.filter(p => p.payment_type === 'credit').length
      const creditAmount = purchases
        .filter(p => p.payment_type === 'credit')
        .reduce((sum, p) => sum + Number(p.total_amount), 0)

      return {
        totalPurchases,
        totalAmount,
        creditPurchases,
        creditAmount
      }
    } catch (error) {
      console.error('Error fetching supplier summary:', error)
      return {
        totalPurchases: 0,
        totalAmount: 0,
        creditPurchases: 0,
        creditAmount: 0
      }
    }
  }
}
