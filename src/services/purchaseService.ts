import { supabase } from '@/lib/supabase'

export interface PurchaseItemInput {
  product_id?: string | null
  product_name: string
  barcode?: string | null
  quantity: number
  unit_price: number
  tax_rate?: number
  tax_amount?: number
  discount_amount?: number
  total_amount: number
  note?: string
}

export interface CreatePurchaseInput {
  supplier_id: string
  purchase_date: string
  invoice_number?: string
  payment_type: 'cash' | 'pos' | 'credit' | 'partial'
  due_date?: string
  notes?: string
  items: PurchaseItemInput[]
  subtotal: number
  tax_amount: number
  discount_amount?: number
  total_amount: number
  paid_amount?: number
  remaining_amount?: number
}

export interface PurchaseService {
  createPurchase: (input: CreatePurchaseInput, branchId: string, userId: string) => Promise<{
    success: boolean
    data?: any
    error?: string
  }>
}

export const PurchaseService = {
  /**
   * Yeni alış faturası oluşturur
   */
  async createPurchase(
    input: CreatePurchaseInput,
    branchId: string,
    userId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Generate purchase number
      const { data: purchaseNumberData, error: purchaseNumberError } = await supabase.rpc(
        'generate_purchase_number',
        { branch_uuid: branchId }
      )

      if (purchaseNumberError) {
        console.error('Purchase number generation error:', purchaseNumberError)
        return {
          success: false,
          error: 'Alış fatura numarası oluşturulamadı'
        }
      }

      const purchaseNumber = purchaseNumberData as string

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          purchase_number: purchaseNumber,
          supplier_id: input.supplier_id,
          branch_id: branchId,
          user_id: userId,
          purchase_date: input.purchase_date,
          invoice_number: input.invoice_number,
          payment_type: input.payment_type,
          due_date: input.due_date,
          notes: input.notes,
          subtotal: input.subtotal,
          tax_amount: input.tax_amount,
          discount_amount: input.discount_amount || 0,
          total_amount: input.total_amount,
          paid_amount: input.paid_amount || (input.payment_type === 'cash' || input.payment_type === 'pos' ? input.total_amount : 0),
          remaining_amount: input.remaining_amount || (input.payment_type === 'credit' ? input.total_amount : 0)
        })
        .select()
        .single()

      if (purchaseError) {
        console.error('Purchase creation error:', purchaseError)
        return {
          success: false,
          error: 'Alış faturası oluşturulamadı: ' + purchaseError.message
        }
      }

      // Create purchase items
      const purchaseItems = input.items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        product_name: item.product_name,
        barcode: item.barcode,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        discount_amount: item.discount_amount || 0,
        total_amount: item.total_amount,
        note: item.note
      }))

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems)

      if (itemsError) {
        console.error('Purchase items creation error:', itemsError)
        // Rollback: Delete the purchase
        await supabase.from('purchases').delete().eq('id', purchase.id)
        return {
          success: false,
          error: 'Alış fatura kalemleri oluşturulamadı'
        }
      }

      // Update product stock quantities
      for (const item of input.items) {
        if (item.product_id) {
          const { error: stockError } = await supabase.rpc(
            'increment_product_stock',
            {
              product_uuid: item.product_id,
              quantity: item.quantity
            }
          )

          if (stockError) {
            console.error('Stock update error:', stockError)
            // Continue with other items even if one fails
          }
        }
      }

      // Update supplier balance (increase debt)
      if (input.payment_type === 'credit' || input.remaining_amount && input.remaining_amount > 0) {
        const { error: balanceError } = await supabase.rpc(
          'update_supplier_balance',
          {
            supplier_uuid: input.supplier_id,
            amount_change: input.remaining_amount || input.total_amount
          }
        )

        if (balanceError) {
          console.error('Supplier balance update error:', balanceError)
          // Continue even if balance update fails
        }
      }

      return {
        success: true,
        data: purchase
      }
    } catch (error) {
      console.error('Create purchase error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
      }
    }
  },

  /**
   * Alış faturalarını listeler
   */
  async getPurchases(branchId: string, filters?: {
    supplierId?: string
    startDate?: string
    endDate?: string
    paymentType?: string
  }) {
    try {
      let query = supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers!purchases_supplier_id_fkey(*),
          user:users!purchases_user_id_fkey(*),
          purchase_items(*)
        `)
        .eq('branch_id', branchId)
        .order('purchase_date', { ascending: false })

      if (filters?.supplierId) {
        query = query.eq('supplier_id', filters.supplierId)
      }

      if (filters?.startDate) {
        query = query.gte('purchase_date', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('purchase_date', filters.endDate)
      }

      if (filters?.paymentType) {
        query = query.eq('payment_type', filters.paymentType)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      console.error('Get purchases error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Alış faturaları yüklenemedi'
      }
    }
  },

  /**
   * Alış faturası detayını getirir
   */
  async getPurchaseById(purchaseId: string) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers!purchases_supplier_id_fkey(*),
          user:users!purchases_user_id_fkey(*),
          purchase_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', purchaseId)
        .single()

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Get purchase error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Alış faturası yüklenemedi'
      }
    }
  }
}
