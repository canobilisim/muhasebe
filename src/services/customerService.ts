import { supabase } from '@/lib/supabase'
import type { Customer, CustomerInsert, CustomerUpdate, CustomerFilter, PaginatedResponse } from '@/types'

export class CustomerService {
  // Get all customers with filtering and pagination
  static async getCustomers(
    filter: CustomerFilter = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Customer>> {
    try {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })

      // Apply filters
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,email.ilike.%${filter.search}%`)
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
        throw new Error(`Müşteri listesi alınamadı: ${error.message}`)
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(`Müşteri bulunamadı: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  }

  // Create new customer
  static async createCustomer(customer: CustomerInsert): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()

      if (error) {
        throw new Error(`Müşteri oluşturulamadı: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Update customer
  static async updateCustomer(id: string, updates: CustomerUpdate): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Müşteri güncellenemedi: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  // Delete customer (soft delete by setting is_active to false)
  static async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        throw new Error(`Müşteri silinemedi: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  // Get customers with outstanding balance
  static async getCustomersWithBalance(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .gt('current_balance', 0)
        .eq('is_active', true)
        .order('current_balance', { ascending: false })

      if (error) {
        throw new Error(`Borçlu müşteri listesi alınamadı: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching customers with balance:', error)
      throw error
    }
  }

  // Search customers by name or phone
  static async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(10)

      if (error) {
        throw new Error(`Müşteri araması yapılamadı: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error searching customers:', error)
      throw error
    }
  }

  // Update customer balance
  static async updateCustomerBalance(id: string, amount: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_customer_balance', {
        customer_id: id,
        amount_change: amount
      })

      if (error) {
        throw new Error(`Müşteri bakiyesi güncellenemedi: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating customer balance:', error)
      throw error
    }
  }
}