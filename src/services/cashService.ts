import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type CashMovement = Database['public']['Tables']['cash_movements']['Row']
type CashMovementInsert = Database['public']['Tables']['cash_movements']['Insert']

export interface DailyCashSummary {
  opening_amount: number
  closing_amount: number
  total_sales: number
  total_income: number
  total_expense: number
  cash_difference: number
  movement_count: number
}

export interface CashMovementWithDetails extends CashMovement {
  user_name?: string
  sale_number?: string
}

export const cashService = {
  // Günlük kasa açılışı
  async openDailyCash(amount: number, description?: string): Promise<CashMovement> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: 'opening',
        amount,
        description: description || 'Günlük kasa açılışı',
        movement_date: new Date().toISOString().split('T')[0],
        user_id: user.user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Günlük kasa kapanışı
  async closeDailyCash(amount: number, description?: string): Promise<CashMovement> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: 'closing',
        amount,
        description: description || 'Günlük kasa kapanışı',
        movement_date: new Date().toISOString().split('T')[0],
        user_id: user.user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Gelir kaydı
  async addIncome(amount: number, description: string, referenceNumber?: string): Promise<CashMovement> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: 'income',
        amount,
        description,
        reference_number: referenceNumber,
        movement_date: new Date().toISOString().split('T')[0],
        user_id: user.user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Gider kaydı
  async addExpense(amount: number, description: string, referenceNumber?: string): Promise<CashMovement> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: 'expense',
        amount,
        description,
        reference_number: referenceNumber,
        movement_date: new Date().toISOString().split('T')[0],
        user_id: user.user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Günlük kasa hareketlerini getir
  async getDailyCashMovements(date?: string): Promise<CashMovementWithDetails[]> {
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('cash_movements')
      .select(`
        *,
        users!inner(full_name),
        sales(sale_number)
      `)
      .eq('movement_date', targetDate)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      ...item,
      user_name: item.users?.full_name,
      sale_number: item.sales?.sale_number
    }))
  },

  // Günlük kasa özeti
  async getDailyCashSummary(date?: string): Promise<DailyCashSummary> {
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('cash_movements')
      .select('movement_type, amount')
      .eq('movement_date', targetDate)

    if (error) throw error

    const summary = data.reduce((acc, movement) => {
      switch (movement.movement_type) {
        case 'opening':
          acc.opening_amount += movement.amount
          break
        case 'closing':
          acc.closing_amount += movement.amount
          break
        case 'sale':
          acc.total_sales += movement.amount
          break
        case 'income':
          acc.total_income += movement.amount
          break
        case 'expense':
          acc.total_expense += movement.amount
          break
      }
      acc.movement_count++
      return acc
    }, {
      opening_amount: 0,
      closing_amount: 0,
      total_sales: 0,
      total_income: 0,
      total_expense: 0,
      cash_difference: 0,
      movement_count: 0
    })

    // Kasa farkını hesapla
    summary.cash_difference = summary.opening_amount + summary.total_sales + summary.total_income - summary.total_expense - summary.closing_amount

    return summary
  },

  // Tarih aralığında kasa hareketleri
  async getCashMovementsByDateRange(startDate: string, endDate: string): Promise<CashMovementWithDetails[]> {
    const { data, error } = await supabase
      .from('cash_movements')
      .select(`
        *,
        users!inner(full_name),
        sales(sale_number)
      `)
      .gte('movement_date', startDate)
      .lte('movement_date', endDate)
      .order('movement_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      ...item,
      user_name: item.users?.full_name,
      sale_number: item.sales?.sale_number
    }))
  },

  // Kasa açılış kontrolü
  async checkDailyCashOpening(date?: string): Promise<boolean> {
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('cash_movements')
      .select('id')
      .eq('movement_type', 'opening')
      .eq('movement_date', targetDate)
      .limit(1)

    if (error) throw error
    return data.length > 0
  },

  // Kasa kapanış kontrolü
  async checkDailyCashClosing(date?: string): Promise<boolean> {
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('cash_movements')
      .select('id')
      .eq('movement_type', 'closing')
      .eq('movement_date', targetDate)
      .limit(1)

    if (error) throw error
    return data.length > 0
  }
}