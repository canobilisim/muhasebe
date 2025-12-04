import { supabase } from '@/lib/supabase'
import type { Sale, SaleWithDetails } from '@/types/sales'

export interface RetailSalesFilter {
    search?: string
    startDate?: string
    endDate?: string
    paymentMethod?: string
    minAmount?: number
    maxAmount?: number
}

export interface RetailSalesSummary {
    totalSales: number
    totalAmount: number
    averageAmount: number
    totalItems: number
    cashSales: number
    posSales: number
}

/**
 * Perakende satışları getir (POS satışları)
 */
export async function getRetailSales(
    branchId: string,
    filter?: RetailSalesFilter
): Promise<SaleWithDetails[]> {
    try {
        // Önce tüm satışları çek (filtreleme için)
        let query = supabase
            .from('sales')
            .select(`
                *,
                customer:customers(*),
                user:users!sales_user_id_fkey(*),
                sale_items(
                  *,
                  product:products(*)
                )
            `)
            .eq('branch_id', branchId)

        // Tarih filtreleri
        if (filter?.startDate) {
            query = query.gte('sale_date', filter.startDate)
        }

        if (filter?.endDate) {
            query = query.lte('sale_date', filter.endDate)
        }

        // Ödeme yöntemi filtresi
        if (filter?.paymentMethod) {
            query = query.eq('payment_type', filter.paymentMethod as any)
        }

        // Tutar filtreleri
        if (filter?.minAmount) {
            query = query.gte('total_amount', filter.minAmount)
        }

        if (filter?.maxAmount) {
            query = query.lte('total_amount', filter.maxAmount)
        }

        query = query.order('sale_date', { ascending: false })

        const { data, error } = await query

        if (error) {
            throw new Error(`Perakende satışlar alınamadı: ${error.message}`)
        }

        let results = (data || []) as any as SaleWithDetails[]

        // Arama filtresi (satış no, müşteri adı, ürün adı)
        if (filter?.search && filter.search.trim()) {
            const searchTerm = filter.search.toLowerCase().trim()
            results = results.filter((sale: any) => {
                const saleNumber = (sale.sale_number || '').toLowerCase()
                // Müşteri adını hem customer_name hem de customer.name'den kontrol et
                const customerName = (sale.customer_name || sale.customer?.name || '').toLowerCase()
                
                // Ürün adlarında ara
                const hasMatchingProduct = (sale.sale_items || []).some((item: any) => {
                    const productName = (item.product?.name || item.product_name || '').toLowerCase()
                    return productName.includes(searchTerm)
                })
                
                return saleNumber.includes(searchTerm) || 
                       customerName.includes(searchTerm) || 
                       hasMatchingProduct
            })
        }

        return results
    } catch (error) {
        console.error('Error fetching retail sales:', error)
        throw error
    }
}

/**
 * Perakende satış özeti getir
 */
export async function getRetailSalesSummary(
    branchId: string,
    startDate?: string,
    endDate?: string
): Promise<RetailSalesSummary> {
    try {
        let query = supabase
            .from('sales')
            .select(`
        total_amount,
        payment_type,
        sale_items(quantity)
      `)
            .eq('branch_id', branchId)

        if (startDate) {
            query = query.gte('sale_date', startDate)
        }

        if (endDate) {
            query = query.lte('sale_date', endDate)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`Satış özeti alınamadı: ${error.message}`)
        }

        const sales = data || []
        const totalSales = sales.length
        const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
        const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0
        const totalItems = sales.reduce((sum: number, sale: any) => {
            const items = sale.sale_items || []
            return sum + items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0)
        }, 0)
        const cashSales = sales.filter(s => String(s.payment_type) === 'cash').length
        const posSales = sales.filter(s => String(s.payment_type) === 'pos').length

        return {
            totalSales,
            totalAmount,
            averageAmount,
            totalItems,
            cashSales,
            posSales
        }
    } catch (error) {
        console.error('Error fetching retail sales summary:', error)
        throw error
    }
}

/**
 * Perakende satış detayı getir
 */
export async function getRetailSaleById(saleId: string): Promise<SaleWithDetails | null> {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select(`
        *,
        customer:customers(*),
        user:users!sales_user_id_fkey(*),
        sale_items(
          *,
          product:products(*)
        )
      `)
            .eq('id', saleId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw new Error(`Satış detayı alınamadı: ${error.message}`)
        }

        return data as any as SaleWithDetails
    } catch (error) {
        console.error('Error fetching retail sale by ID:', error)
        throw error
    }
}

/**
 * Perakende satışı sil
 */
export async function deleteRetailSale(saleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Önce satış detaylarını al
        const sale = await getRetailSaleById(saleId)

        if (!sale) {
            throw new Error('Satış bulunamadı')
        }

        // Stokları geri yükle
        const items = sale.sale_items || sale.items || []
        if (items.length > 0) {
            for (const item of items) {
                if (item.product_id && item.product) {
                    const { error: stockError } = await supabase
                        .from('products')
                        .update({
                            stock_quantity: item.product.stock_quantity + item.quantity,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', item.product_id)

                    if (stockError) {
                        console.error(`Stok geri yüklenemedi - Ürün ID: ${item.product_id}`, stockError)
                    }
                }
            }
        }

        // Müşteri bakiyesini güncelle (eğer açık hesap satışıysa)
        if (sale.customer_id && sale.payment_type === 'credit') {
            // Get current balance first
            const { data: customer } = await supabase
                .from('customers')
                .select('current_balance')
                .eq('id', sale.customer_id)
                .single()

            if (customer) {
                const newBalance = Number(customer.current_balance) - Number(sale.total_amount)
                const { error: customerError } = await supabase
                    .from('customers')
                    .update({
                        current_balance: newBalance,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', sale.customer_id)

                if (customerError) {
                    console.error('Müşteri bakiyesi güncellenemedi:', customerError)
                }
            }
        }

        // Satış kalemlerini sil
        const { error: itemsError } = await supabase
            .from('sale_items')
            .delete()
            .eq('sale_id', saleId)

        if (itemsError) {
            throw new Error(`Satış kalemleri silinemedi: ${itemsError.message}`)
        }

        // Kasa hareketini sil (eğer varsa)
        try {
            await supabase
                .from('cash_movements' as any)
                .delete()
                .eq('sale_id', saleId)
        } catch (cashError) {
            console.error('Kasa hareketi silinemedi:', cashError)
        }

        // Satışı sil
        const { error: saleError } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId)

        if (saleError) {
            throw new Error(`Satış silinemedi: ${saleError.message}`)
        }

        return { success: true }
    } catch (error) {
        console.error('Error deleting retail sale:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
        }
    }
}

/**
 * Perakende satışı güncelle
 */
export async function updateRetailSale(
    saleId: string,
    updates: Partial<Sale>
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('sales')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', saleId)

        if (error) {
            throw new Error(`Satış güncellenemedi: ${error.message}`)
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating retail sale:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
        }
    }
}
