import { supabase } from '@/lib/supabase'

export interface SalesReportData {
  id: string
  sale_number: string
  sale_date: string
  customer_name?: string
  total_amount: number
  discount_amount: number
  net_amount: number
  payment_type: string
  user_name: string
}

export interface CustomerReportData {
  id: string
  name: string
  phone?: string
  email?: string
  current_balance: number
  total_purchases: number
  last_purchase_date?: string
  created_at: string
}

export interface StockReportData {
  id: string
  name: string
  barcode?: string
  category?: string
  stock_quantity: number
  unit_price: number
  cost_price: number
  total_value: number
  is_active: boolean
}

export interface ReportFilters {
  startDate?: string
  endDate?: string
  branchId?: string
  customerId?: string
  paymentType?: string
  paymentStatus?: string
  category?: string
  isActive?: boolean
}

export const reportsService = {
  // Satış raporu
  async getSalesReport(filters: ReportFilters = {}): Promise<SalesReportData[]> {
    let query = supabase
      .from('sales')
      .select(`
        id,
        sale_number,
        sale_date,
        total_amount,
        discount_amount,
        net_amount,
        payment_type,
        customer:customers(name),
        user:users(full_name)
      `)
      .order('sale_date', { ascending: false })

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId)
    }

    if (filters.startDate) {
      // Başlangıç tarihinin başlangıcı (00:00:00)
      query = query.gte('sale_date', `${filters.startDate}T00:00:00`)
    }

    if (filters.endDate) {
      // Bitiş tarihinin sonu (23:59:59)
      query = query.lte('sale_date', `${filters.endDate}T23:59:59`)
    }

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId)
    }

    if (filters.paymentType) {
      query = query.eq('payment_type', filters.paymentType)
    }



    const { data, error } = await query

    if (error) throw error

    return data.map(sale => ({
      id: sale.id,
      sale_number: sale.sale_number,
      sale_date: sale.sale_date,
      customer_name: sale.customer?.name,
      total_amount: sale.total_amount,
      discount_amount: sale.discount_amount,
      net_amount: sale.net_amount,
      payment_type: sale.payment_type,
      user_name: sale.user?.full_name || 'Bilinmiyor'
    }))
  },

  // Müşteri raporu
  async getCustomersReport(filters: ReportFilters = {}): Promise<CustomerReportData[]> {
    let query = supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        email,
        current_balance,
        created_at,
        sales(net_amount, sale_date)
      `)
      .order('name', { ascending: true })

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(customer => {
      const totalPurchases = customer.sales.reduce((sum, sale) => sum + sale.net_amount, 0)
      const lastPurchaseDate = customer.sales.length > 0
        ? customer.sales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())[0].sale_date
        : undefined

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        current_balance: customer.current_balance,
        total_purchases: totalPurchases,
        last_purchase_date: lastPurchaseDate,
        created_at: customer.created_at
      }
    })
  },

  // Stok raporu
  async getStockReport(filters: ReportFilters = {}): Promise<StockReportData[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(product => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      stock_quantity: product.stock_quantity,
      unit_price: product.unit_price,
      cost_price: product.cost_price || 0,
      total_value: product.stock_quantity * (product.cost_price || product.unit_price),
      is_active: product.is_active
    }))
  },

  // Satış özeti raporu
  async getSalesSummaryReport(filters: ReportFilters = {}) {
    let query = supabase
      .from('sales')
      .select('net_amount, payment_type, sale_date')

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId)
    }

    if (filters.startDate) {
      // Başlangıç tarihinin başlangıcı (00:00:00)
      query = query.gte('sale_date', `${filters.startDate}T00:00:00`)
    }

    if (filters.endDate) {
      // Bitiş tarihinin sonu (23:59:59)
      query = query.lte('sale_date', `${filters.endDate}T23:59:59`)
    }

    const { data, error } = await query

    if (error) throw error

    const summary = data.reduce((acc, sale) => {
      acc.totalSales += 1
      acc.totalAmount += sale.net_amount

      switch (sale.payment_type) {
        case 'cash':
          acc.cashSales += sale.net_amount
          break
        case 'pos':
          acc.posSales += sale.net_amount
          break
        case 'credit':
          acc.creditSales += sale.net_amount
          break
      }

      return acc
    }, {
      totalSales: 0,
      totalAmount: 0,
      cashSales: 0,
      posSales: 0,
      creditSales: 0
    })

    return summary
  },

  // Günlük satış raporu
  async getDailySalesReport(date: string, branchId?: string) {
    let query = supabase
      .from('sales')
      .select(`
        id,
        sale_number,
        sale_date,
        net_amount,
        payment_type,
        customer:customers(name),
        user:users(full_name),
        sale_items(
          quantity,
          unit_price,
          total_amount,
          product:products(name)
        )
      `)
      .gte('sale_date', date)
      .lt('sale_date', new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('sale_date', { ascending: false })

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query

    if (error) throw error

    return data
  },

  // Excel export için veri hazırlama
  prepareExcelData(data: any[], type: 'sales' | 'customers' | 'stock') {
    switch (type) {
      case 'sales':
        return data.map(item => ({
          'Satış No': item.sale_number,
          'Tarih': new Date(item.sale_date).toLocaleDateString('tr-TR'),
          'Müşteri': item.customer_name || 'Perakende',
          'Tutar': item.total_amount,
          'İndirim': item.discount_amount,
          'Net Tutar': item.net_amount,
          'Ödeme Tipi': item.payment_type === 'cash' ? 'Nakit' :
            item.payment_type === 'pos' ? 'POS' : 'Açık Hesap',
          'Kullanıcı': item.user_name
        }))

      case 'customers':
        return data.map(item => ({
          'Müşteri Adı': item.name,
          'Telefon': item.phone || '',
          'E-posta': item.email || '',
          'Bakiye': item.current_balance,
          'Toplam Alışveriş': item.total_purchases,
          'Son Alışveriş': item.last_purchase_date ?
            new Date(item.last_purchase_date).toLocaleDateString('tr-TR') : '',
          'Kayıt Tarihi': new Date(item.created_at).toLocaleDateString('tr-TR')
        }))

      case 'stock':
        return data.map(item => ({
          'Ürün Adı': item.name,
          'Barkod': item.barcode || '',
          'Kategori': item.category || '',
          'Stok Miktarı': item.stock_quantity,
          'Birim Fiyat': item.unit_price,
          'Maliyet': item.cost_price,
          'Toplam Değer': item.total_value,
          'Durum': item.is_active ? 'Aktif' : 'Pasif'
        }))

      default:
        return data
    }
  }
}