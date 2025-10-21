import { supabase } from '@/lib/supabase'
import type { CustomerPayment, CustomerPaymentInsert, CustomerPaymentWithDetails } from '@/types'

export class CustomerPaymentService {
  // Ödeme kaydı oluştur
  static async createPayment(payment: Omit<CustomerPaymentInsert, 'branch_id' | 'user_id' | 'payment_number'>): Promise<CustomerPayment> {
    try {
      // Kullanıcı bilgilerini al
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

      // Ödeme kaydını oluştur (payment_number otomatik oluşturulur)
      const { data, error } = await supabase
        .from('customer_payments')
        .insert({
          ...payment,
          branch_id: userProfile.branch_id,
          user_id: userData.user.id
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Ödeme kaydedilemedi: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  }

  // Müşterinin ödemelerini getir
  static async getCustomerPayments(customerId: string): Promise<CustomerPaymentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('customer_payments')
        .select(`
          *,
          customer:customers(*),
          user:users(*)
        `)
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false })

      if (error) {
        throw new Error(`Ödemeler alınamadı: ${error.message}`)
      }

      return (data || []) as CustomerPaymentWithDetails[]
    } catch (error) {
      console.error('Error fetching customer payments:', error)
      throw error
    }
  }

  // Ödeme sil
  static async deletePayment(id: string): Promise<void> {
    try {
      // Önce ödeme bilgilerini al (müşteri bakiyesini güncellemek için)
      const { data: payment, error: fetchError } = await supabase
        .from('customer_payments')
        .select('customer_id, amount')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(`Ödeme bilgileri alınamadı: ${fetchError.message}`)
      }

      // Ödemeyi sil
      const { error } = await supabase
        .from('customer_payments')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Ödeme silinemedi: ${error.message}`)
      }

      // Müşteri bakiyesini güncelle (ödeme silindi, bakiyeye ekle)
      if (payment.customer_id) {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('current_balance')
          .eq('id', payment.customer_id)
          .single()

        if (!customerError && customer) {
          // Ödeme silindi, bakiyeye geri ekle
          const newBalance = (customer.current_balance || 0) + (payment.amount || 0)
          
          await supabase
            .from('customers')
            .update({ 
              current_balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.customer_id)
        }
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  }
}
