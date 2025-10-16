import { supabase } from '@/lib/supabase'

export interface DashboardKPIs {
  todaySales: {
    totalAmount: number
    totalCount: number
    cashAmount: number
    posAmount: number
    creditAmount: number
  }
  monthlySales: {
    totalAmount: number
    totalCount: number
  }
  cashSummary: {
    openingAmount: number
    currentAmount: number
    totalIncome: number
    totalExpense: number
  }
  lowStockProducts: number
  pendingPayments: number
}

export interface SalesChartData {
  date: string
  sales: number
  amount: number
}

export interface MonthlyChartData {
  month: string
  sales: number
  amount: number
}

export const dashboardService = {
  // Dashboard KPI'larını getir
  async getDashboardKPIs(branchId: string): Promise<DashboardKPIs> {
    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Bugünkü satışlar
    const { data: todaySalesData, error: todaySalesError } = await supabase
      .from('sales')
      .select('net_amount, payment_type')
      .eq('branch_id', branchId)
      .gte('sale_date', today)
      .lt('sale_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    if (todaySalesError) throw todaySalesError

    const todaySales = todaySalesData.reduce((acc, sale) => {
      acc.totalAmount += sale.net_amount
      acc.totalCount += 1
      
      switch (sale.payment_type) {
        case 'cash':
          acc.cashAmount += sale.net_amount
          break
        case 'pos':
          acc.posAmount += sale.net_amount
          break
        case 'credit':
          acc.creditAmount += sale.net_amount
          break
      }
      
      return acc
    }, {
      totalAmount: 0,
      totalCount: 0,
      cashAmount: 0,
      posAmount: 0,
      creditAmount: 0
    })

    // Aylık satışlar
    const { data: monthlySalesData, error: monthlySalesError } = await supabase
      .from('sales')
      .select('net_amount')
      .eq('branch_id', branchId)
      .gte('sale_date', currentMonth + '-01')
      .lt('sale_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0])

    if (monthlySalesError) throw monthlySalesError

    const monthlySales = monthlySalesData.reduce((acc, sale) => {
      acc.totalAmount += sale.net_amount
      acc.totalCount += 1
      return acc
    }, { totalAmount: 0, totalCount: 0 })

    // Kasa özeti
    const { data: cashMovementsData, error: cashMovementsError } = await supabase
      .from('cash_movements')
      .select('movement_type, amount')
      .eq('branch_id', branchId)
      .eq('movement_date', today)

    if (cashMovementsError) throw cashMovementsError

    const cashSummary = cashMovementsData.reduce((acc, movement) => {
      switch (movement.movement_type) {
        case 'opening':
          acc.openingAmount += movement.amount
          break
        case 'sale':
        case 'income':
          acc.totalIncome += movement.amount
          break
        case 'expense':
          acc.totalExpense += movement.amount
          break
      }
      return acc
    }, {
      openingAmount: 0,
      currentAmount: 0,
      totalIncome: 0,
      totalExpense: 0
    })

    cashSummary.currentAmount = cashSummary.openingAmount + cashSummary.totalIncome - cashSummary.totalExpense

    // Düşük stoklu ürünler
    const { data: lowStockData, error: lowStockError } = await supabase
      .from('products')
      .select('id')
      .eq('branch_id', branchId)
      .lt('stock_quantity', 10)
      .eq('is_active', true)

    if (lowStockError) throw lowStockError

    // Bekleyen ödemeler
    const { data: pendingPaymentsData, error: pendingPaymentsError } = await supabase
      .from('sales')
      .select('id')
      .eq('branch_id', branchId)
      .eq('payment_status', 'pending')

    if (pendingPaymentsError) throw pendingPaymentsError

    return {
      todaySales,
      monthlySales,
      cashSummary,
      lowStockProducts: lowStockData.length,
      pendingPayments: pendingPaymentsData.length
    }
  },

  // Son 7 günün satış grafiği verisi
  async getWeeklySalesChart(branchId: string): Promise<SalesChartData[]> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000) // 7 gün öncesi

    const { data, error } = await supabase
      .from('sales')
      .select('sale_date, net_amount')
      .eq('branch_id', branchId)
      .gte('sale_date', startDate.toISOString().split('T')[0])
      .lte('sale_date', endDate.toISOString().split('T')[0])

    if (error) throw error

    // Günlere göre grupla
    const salesByDate = data.reduce((acc, sale) => {
      const date = sale.sale_date.split('T')[0]
      if (!acc[date]) {
        acc[date] = { sales: 0, amount: 0 }
      }
      acc[date].sales += 1
      acc[date].amount += sale.net_amount
      return acc
    }, {} as Record<string, { sales: number; amount: number }>)

    // Son 7 günün verilerini oluştur
    const chartData: SalesChartData[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayData = salesByDate[dateStr] || { sales: 0, amount: 0 }
      
      chartData.push({
        date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        sales: dayData.sales,
        amount: dayData.amount
      })
    }

    return chartData
  },

  // Son 12 ayın satış grafiği verisi
  async getMonthlySalesChart(branchId: string): Promise<MonthlyChartData[]> {
    const endDate = new Date()
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1) // 12 ay öncesi

    const { data, error } = await supabase
      .from('sales')
      .select('sale_date, net_amount')
      .eq('branch_id', branchId)
      .gte('sale_date', startDate.toISOString().split('T')[0])
      .lte('sale_date', endDate.toISOString().split('T')[0])

    if (error) throw error

    // Aylara göre grupla
    const salesByMonth = data.reduce((acc, sale) => {
      const month = sale.sale_date.slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { sales: 0, amount: 0 }
      }
      acc[month].sales += 1
      acc[month].amount += sale.net_amount
      return acc
    }, {} as Record<string, { sales: number; amount: number }>)

    // Son 12 ayın verilerini oluştur
    const chartData: MonthlyChartData[] = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7)
      const monthData = salesByMonth[monthStr] || { sales: 0, amount: 0 }
      
      chartData.push({
        month: date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
        sales: monthData.sales,
        amount: monthData.amount
      })
    }

    return chartData
  }
}