import { supabase } from '@/lib/supabase'
import type { Customer, Sale } from '@/types'

export interface CustomerBalanceInfo extends Customer {
  overdueAmount: number
  isOverdue: boolean
  lastPaymentDate: string | null
  totalPurchases: number
  averageTicket: number
  daysSinceLastPurchase: number
}

export interface OverduePayment {
  customer: Customer
  sale: Sale
  daysPastDue: number
  overdueAmount: number
}

export class CustomerBalanceService {
  // Get customers with detailed balance information
  static async getCustomersWithBalanceInfo(): Promise<CustomerBalanceInfo[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          sales (
            id,
            total_amount,
            payment_type,
            sale_date,
            created_at
          )
        `)
        .eq('is_active', true)
        .order('current_balance', { ascending: false })

      if (error) {
        throw new Error(`Müşteri bakiye bilgileri alınamadı: ${error.message}`)
      }

      return (data || []).map(customer => {
        const sales = customer.sales || []
        const totalPurchases = sales.length
        const totalAmount = sales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0)
        const averageTicket = totalPurchases > 0 ? totalAmount / totalPurchases : 0

        // Find last purchase date
        const lastSale = sales.sort((a: any, b: any) => 
          new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
        )[0]
        
        const lastPaymentDate = lastSale ? lastSale.sale_date : null
        const daysSinceLastPurchase = lastPaymentDate 
          ? Math.floor((Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        // Calculate overdue amount (assuming 30 days payment term)
        const overdueAmount = sales
          .filter((sale: any) => {
            const daysPastDue = Math.floor((Date.now() - new Date(sale.sale_date).getTime()) / (1000 * 60 * 60 * 24))
            return sale.payment_type === 'credit' && daysPastDue > 30
          })
          .reduce((sum: number, sale: any) => sum + sale.total_amount, 0)

        return {
          ...customer,
          overdueAmount,
          isOverdue: overdueAmount > 0,
          lastPaymentDate,
          totalPurchases,
          averageTicket,
          daysSinceLastPurchase,
          sales: undefined // Remove sales from response to keep it clean
        }
      })
    } catch (error) {
      console.error('Error fetching customer balance info:', error)
      throw error
    }
  }

  // Get overdue payments
  static async getOverduePayments(): Promise<OverduePayment[]> {
    try {
      const today = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (*)
        `)
        .eq('payment_type', 'credit')
        .not('customer_id', 'is', null)
        .not('due_date', 'is', null)
        .lt('due_date', today)

      if (error) {
        throw new Error(`Vadesi geçen ödemeler alınamadı: ${error.message}`)
      }

      const overduePayments: OverduePayment[] = []

      for (const sale of data || []) {
        if (sale.due_date && sale.customers) {
          const daysPastDue = Math.floor((Date.now() - new Date(sale.due_date).getTime()) / (1000 * 60 * 60 * 24))
          
          overduePayments.push({
            customer: sale.customers,
            sale,
            daysPastDue,
            overdueAmount: (sale.net_amount || 0) - (sale.paid_amount || 0)
          })
        }
      }

      return overduePayments.sort((a, b) => b.daysPastDue - a.daysPastDue)
    } catch (error) {
      console.error('Error fetching overdue payments:', error)
      throw error
    }
  }

  // Get customer payment history
  static async getCustomerPaymentHistory(customerId: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', customerId)
        .order('sale_date', { ascending: false })

      if (error) {
        throw new Error(`Müşteri ödeme geçmişi alınamadı: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching customer payment history:', error)
      throw error
    }
  }

  // Update customer balance after payment
  static async updateCustomerBalanceAfterPayment(
    customerId: string, 
    paymentAmount: number
  ): Promise<void> {
    try {
      // Get current customer balance
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('current_balance')
        .eq('id', customerId)
        .single()

      if (fetchError) {
        throw new Error(`Müşteri bilgisi alınamadı: ${fetchError.message}`)
      }

      // Update balance
      const newBalance = Math.max(0, customer.current_balance - paymentAmount)
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

      if (updateError) {
        throw new Error(`Müşteri bakiyesi güncellenemedi: ${updateError.message}`)
      }
    } catch (error) {
      console.error('Error updating customer balance:', error)
      throw error
    }
  }

  // Get customers approaching credit limit
  static async getCustomersNearCreditLimit(threshold = 0.8): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .gt('credit_limit', 0)
        .eq('is_active', true)

      if (error) {
        throw new Error(`Kredi limiti yaklaşan müşteriler alınamadı: ${error.message}`)
      }

      return (data || []).filter(customer => {
        const usageRatio = customer.current_balance / customer.credit_limit
        return usageRatio >= threshold
      })
    } catch (error) {
      console.error('Error fetching customers near credit limit:', error)
      throw error
    }
  }

  // Generate customer balance report data
  static async generateBalanceReportData() {
    try {
      const [customersWithBalance, overduePayments, nearCreditLimit] = await Promise.all([
        this.getCustomersWithBalanceInfo(),
        this.getOverduePayments(),
        this.getCustomersNearCreditLimit()
      ])

      const totalOutstanding = customersWithBalance.reduce((sum, customer) => sum + customer.current_balance, 0)
      const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.overdueAmount, 0)
      const customersWithDebt = customersWithBalance.filter(customer => customer.current_balance > 0).length

      return {
        summary: {
          totalOutstanding,
          totalOverdue,
          customersWithDebt,
          totalCustomers: customersWithBalance.length,
          averageDebt: customersWithDebt > 0 ? totalOutstanding / customersWithDebt : 0
        },
        customersWithBalance: customersWithBalance.filter(customer => customer.current_balance > 0),
        overduePayments,
        nearCreditLimit
      }
    } catch (error) {
      console.error('Error generating balance report:', error)
      throw error
    }
  }
}