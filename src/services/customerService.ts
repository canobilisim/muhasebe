import { supabase } from '@/lib/supabase'
import type { Customer, CustomerInsert, CustomerUpdate, CustomerFilter, PaginatedResponse } from '@/types'

export interface CustomerStats {
  totalCount: number
  activeCount: number
  totalBalance: number
  customersWithDebt: number
}

export class CustomerService {
  // Get customer statistics (lightweight query)
  static async getCustomerStats(): Promise<CustomerStats> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('is_active, current_balance')

      if (error) throw new Error(`İstatistikler alınamadı: ${error.message}`)

      const customers = data || []
      return {
        totalCount: customers.length,
        activeCount: customers.filter(c => c.is_active).length,
        totalBalance: customers.reduce((sum, c) => sum + (c.current_balance || 0), 0),
        customersWithDebt: customers.filter(c => (c.current_balance || 0) > 0).length
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      return { totalCount: 0, activeCount: 0, totalBalance: 0, customersWithDebt: 0 }
    }
  }

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

      // Add branch_id to customer data
      const customerWithBranch = {
        ...customer,
        branch_id: userProfile.branch_id,
      }

      const { data, error } = await supabase
        .from('customers')
        .insert(customerWithBranch)
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

  // Delete customer (hard delete - cascades to sales and payments)
  static async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
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
        .order('is_active', { ascending: false }) // Aktif müşteriler önce
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
      // Mevcut bakiyeyi al
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('current_balance')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Yeni bakiyeyi hesapla ve güncelle
      const newBalance = (customer.current_balance || 0) + amount
      const { error: updateError } = await supabase
        .from('customers')
        .update({ current_balance: newBalance })
        .eq('id', id)

      if (updateError) {
        throw new Error(`Müşteri bakiyesi güncellenemedi: ${updateError.message}`)
      }
    } catch (error) {
      console.error('Error updating customer balance:', error)
      throw error
    }
  }

  // Müşteri bakiyesini yeniden hesapla (tüm işlemlerden)
  static async recalculateCustomerBalance(customerId: string): Promise<void> {
    try {
      // Tüm veresiye satışları topla
      const { data: creditSales, error: salesError } = await supabase
        .from('sales')
        .select('net_amount')
        .eq('customer_id', customerId)
        .eq('payment_type', 'credit')

      if (salesError) throw salesError

      // Tüm ödemeleri topla
      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('amount')
        .eq('customer_id', customerId)

      if (paymentsError) throw paymentsError

      // Bakiyeyi hesapla: toplam veresiye satışlar - toplam ödemeler
      const totalCreditSales = (creditSales || []).reduce((sum, sale) => sum + (sale.net_amount || 0), 0)
      const totalPayments = (payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0)
      const calculatedBalance = Math.max(0, totalCreditSales - totalPayments)

      // Bakiyeyi güncelle
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          current_balance: calculatedBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

      if (updateError) {
        throw new Error(`Müşteri bakiyesi güncellenemedi: ${updateError.message}`)
      }
    } catch (error) {
      console.error('Error recalculating customer balance:', error)
      throw error
    }
  }

  // Müşterinin tüm işlemlerini getir (satışlar + ödemeler birleşik)
  static async getCustomerTransactions(customerId: string): Promise<any[]> {
    try {
      // Satışları getir
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          items:sale_items(
            *,
            product:products(*)
          ),
          user:users!sales_user_id_fkey(*)
        `)
        .eq('customer_id', customerId)
        .order('sale_date', { ascending: false })

      if (salesError) throw salesError

      // Ödemeleri getir
      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select(`
          *,
          user:users!customer_payments_user_id_fkey(*)
        `)
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false })

      if (paymentsError) throw paymentsError

      // Birleştir ve sırala
      const transactions = [
        ...(sales || []).map(sale => ({
          id: sale.id,
          type: 'sale' as const,
          date: sale.sale_date,
          amount: sale.net_amount, // Tüm satışları göster
          paymentType: sale.payment_type,
          description: `Satış No: ${sale.sale_number}`,
          sale
        })),
        ...(payments || []).map(payment => ({
          id: payment.id,
          type: 'payment' as const,
          date: payment.payment_date,
          amount: payment.amount, // Ödemeleri pozitif göster
          paymentType: payment.payment_type,
          description: `Ödeme No: ${payment.payment_number || 'Bilinmiyor'}`,
          payment
        }))
      ].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })

      // Bakiye hesapla (running balance) - sadece veresiye satışlar ve ödemeler
      let runningBalance = 0
      const transactionsWithBalance = transactions.reverse().map(t => {
        // Sadece veresiye satışlar bakiyeyi artırır, ödemeler azaltır
        if (t.type === 'sale' && t.paymentType === 'credit') {
          runningBalance += t.amount
        } else if (t.type === 'payment') {
          runningBalance -= t.amount
        }
        return { ...t, balance: runningBalance }
      }).reverse()

      return transactionsWithBalance
    } catch (error) {
      console.error('Error fetching customer transactions:', error)
      throw error
    }
  }
}