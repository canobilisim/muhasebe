import { supabase } from '@/lib/supabase'
import { 
  Sale, 
  SaleInsert, 
  SaleItem, 
  SaleItemInsert, 
  CartItem, 
  PaymentInfo,
  Customer,
  CashMovementInsert
} from '@/types'
import { PaymentType, PaymentStatus, MovementType } from '@/types/enums'

export interface ProcessPaymentRequest {
  cartItems: CartItem[]
  paymentInfo: PaymentInfo
  customer?: Customer | null
  userId: string
  branchId: string
  subtotal: number
  totalDiscount: number
  taxAmount: number
  totalAmount: number
}

export interface ProcessPaymentResponse {
  success: boolean
  saleId?: string
  saleNumber?: string
  error?: string
}

/**
 * Process payment and create sale record with items
 */
export async function processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
  const { 
    cartItems, 
    paymentInfo, 
    customer, 
    userId, 
    branchId,
    subtotal,
    totalDiscount,
    taxAmount,
    totalAmount
  } = request

  try {
    // Start transaction by creating sale record
    const { data: saleNumber, error: saleNumberError } = await supabase
      .rpc('generate_sale_number', { branch_uuid: branchId })

    if (saleNumberError) {
      throw new Error(`Satış numarası oluşturulamadı: ${saleNumberError.message}`)
    }

    // Determine payment status
    const paymentStatus = 
      paymentInfo.type === PaymentType.CREDIT ? PaymentStatus.PENDING :
      paymentInfo.paidAmount >= totalAmount ? PaymentStatus.PAID : PaymentStatus.PENDING

    // Create sale record
    const saleData: SaleInsert = {
      branch_id: branchId,
      user_id: userId,
      customer_id: customer?.id || null,
      sale_number: saleNumber,
      total_amount: subtotal,
      discount_amount: totalDiscount,
      tax_amount: taxAmount,
      net_amount: totalAmount,
      payment_type: paymentInfo.type,
      payment_status: paymentStatus,
      paid_amount: paymentInfo.paidAmount,
      change_amount: paymentInfo.changeAmount,
      sale_date: new Date().toISOString()
    }

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert(saleData)
      .select()
      .single()

    if (saleError) {
      throw new Error(`Satış kaydı oluşturulamadı: ${saleError.message}`)
    }

    // Create sale items
    const saleItems: SaleItemInsert[] = cartItems.map(item => ({
      sale_id: sale.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount_amount: item.discountAmount,
      total_amount: item.totalAmount
    }))

    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (saleItemsError) {
      // Rollback sale if sale items creation fails
      await supabase.from('sales').delete().eq('id', sale.id)
      throw new Error(`Satış kalemleri oluşturulamadı: ${saleItemsError.message}`)
    }

    // Update product stock quantities
    for (const item of cartItems) {
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: item.product.stock_quantity - item.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product.id)

      if (stockError) {
        console.error(`Stok güncellenemedi - Ürün ID: ${item.product.id}`, stockError)
        // Don't fail the entire transaction for stock update errors
        // Log the error and continue
      }
    }

    // Create cash movement record for cash and POS payments
    if (paymentInfo.type === PaymentType.CASH || paymentInfo.type === PaymentType.POS) {
      const cashMovement: CashMovementInsert = {
        branch_id: branchId,
        user_id: userId,
        sale_id: sale.id,
        movement_type: MovementType.SALE,
        amount: paymentInfo.paidAmount,
        description: `Satış - ${saleNumber}`,
        reference_number: saleNumber,
        movement_date: new Date().toISOString()
      }

      const { error: cashMovementError } = await supabase
        .from('cash_movements')
        .insert(cashMovement)

      if (cashMovementError) {
        console.error('Kasa hareketi oluşturulamadı:', cashMovementError)
        // Don't fail the transaction for cash movement errors
      }
    }

    // Update customer balance for credit sales
    if (customer && paymentInfo.type === PaymentType.CREDIT) {
      const newBalance = customer.current_balance + totalAmount
      
      const { error: customerError } = await supabase
        .from('customers')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id)

      if (customerError) {
        console.error('Müşteri bakiyesi güncellenemedi:', customerError)
        // Don't fail the transaction for customer balance update errors
      }
    }

    return {
      success: true,
      saleId: sale.id,
      saleNumber: sale.sale_number
    }

  } catch (error) {
    console.error('Payment processing failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
    }
  }
}

/**
 * Get sale details with items for receipt generation
 */
export async function getSaleDetails(saleId: string) {
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(*),
      user:users(*),
      sale_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', saleId)
    .single()

  if (saleError) {
    throw new Error(`Satış detayları alınamadı: ${saleError.message}`)
  }

  return sale
}

/**
 * Get daily sales summary
 */
export async function getDailySalesSummary(branchId: string, date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .rpc('get_daily_sales_summary', { 
      branch_uuid: branchId, 
      target_date: targetDate 
    })

  if (error) {
    throw new Error(`Günlük satış özeti alınamadı: ${error.message}`)
  }

  return data?.[0] || {
    total_sales: 0,
    total_amount: 0,
    cash_sales: 0,
    pos_sales: 0,
    credit_sales: 0
  }
}