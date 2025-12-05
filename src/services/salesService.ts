import { supabase } from '@/lib/supabase'
import {
  type Sale,
  type SaleInsert,
  type SaleItemInsert,
  type CartItem,
  type PaymentInfo,
  type Customer,
  type CashMovementInsert
} from '@/types'
import {
  type CreateSaleInput,
  type SaleFilter,
  type SaleWithDetails,
  type InvoiceStatus
} from '@/types/sales'
import { PaymentType, MovementType } from '@/types/enums'
import { turkcellApiService } from './turkcellApiService'
import { SerialNumberService } from './serialNumberService'

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
      user:users!sales_user_id_fkey(*),
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

/**
 * Create sale with e-invoice integration
 * Requirements: 28, 29, 30, 31
 */
export async function createSale(
  input: CreateSaleInput,
  branchId: string,
  userId: string
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  try {
    // Validate input
    if (!input.items || input.items.length === 0) {
      throw new Error('En az bir ürün gereklidir')
    }

    if (!input.customer.customer_name) {
      throw new Error('Müşteri adı gereklidir')
    }

    if (!input.customer.vkn_tckn) {
      throw new Error('Müşteri kimlik numarası gereklidir')
    }

    // Generate sale number
    const { data: saleNumber, error: saleNumberError } = await supabase
      .rpc('generate_sale_number', { branch_uuid: branchId })

    if (saleNumberError) {
      throw new Error(`Satış numarası oluşturulamadı: ${saleNumberError.message}`)
    }

    // Create sale record with invoice info
    const saleData: any = {
      branch_id: branchId,
      user_id: userId,
      created_by: userId,
      sale_number: saleNumber,

      // Customer info
      customer_type: input.customer.customer_type,
      customer_name: input.customer.customer_name,
      vkn_tckn: input.customer.vkn_tckn,
      tax_office: input.customer.tax_office,
      email: input.customer.email,
      phone: input.customer.phone,
      address: input.customer.address,

      // Invoice info
      invoice_type: input.invoice.invoice_type,
      invoice_date: input.invoice.invoice_date,
      currency: input.invoice.currency,
      payment_type: input.invoice.payment_type,
      note: input.invoice.note,

      // Amounts
      subtotal: input.subtotal,
      total_vat_amount: input.total_vat_amount,
      total_amount: input.total_amount,

      // Status
      status: 'pending' as InvoiceStatus,

      sale_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    const saleItems = input.items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      serial_number_id: item.serial_number_id,
      product_name: item.product_name,
      barcode: item.barcode,
      quantity: item.quantity,
      unit_price: item.unit_price,
      vat_rate: item.vat_rate,
      vat_amount: item.vat_amount,
      total_amount: item.total_amount,
      discount_amount: item.discount_amount || 0,
      note: item.note,
      is_miscellaneous: item.is_miscellaneous || false,
      created_at: new Date().toISOString()
    }))

    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (saleItemsError) {
      // Rollback sale if sale items creation fails
      await supabase.from('sales').delete().eq('id', sale.id)
      throw new Error(`Satış kalemleri oluşturulamadı: ${saleItemsError.message}`)
    }

    // Mark serial numbers as sold
    for (const item of input.items) {
      if (item.serial_number_id) {
        try {
          await SerialNumberService.markSerialNumberAsSold(
            item.serial_number_id,
            sale.id
          )
        } catch (error) {
          console.error('Seri numarası güncellenemedi:', error)
          // Don't fail the transaction for serial number errors
        }
      }
    }

    // Update product stock quantities
    for (const item of input.items) {
      if (item.product_id) {
        try {
          // Get current stock
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single()

          if (product) {
            await supabase
              .from('products')
              .update({
                stock_quantity: product.stock_quantity - item.quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.product_id)
          }
        } catch (error) {
          console.error(`Stok güncellenemedi - Ürün ID: ${item.product_id}`, error)
          // Don't fail the transaction for stock update errors
        }
      }
    }

    // Note: Invoice creation is now optional and can be done separately
    // Sale is created with 'pending' status, invoice can be created later from sales list

    return {
      success: true,
      saleId: sale.id
    }
  } catch (error) {
    console.error('Sale creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
    }
  }
}

/**
 * Get sales with filtering
 * Requirements: 29
 */
export async function getSales(
  branchId: string,
  filter?: SaleFilter
): Promise<Sale[]> {
  try {
    let query = supabase
      .from('sales')
      .select('*')
      .eq('branch_id', branchId)
      .order('invoice_date', { ascending: false })

    // Apply filters
    if (filter) {
      if (filter.start_date) {
        query = query.gte('invoice_date', filter.start_date)
      }

      if (filter.end_date) {
        query = query.lte('invoice_date', filter.end_date)
      }

      if (filter.status) {
        query = query.eq('status', filter.status)
      }

      if (filter.invoice_type) {
        query = query.eq('invoice_type', filter.invoice_type)
      }

      if (filter.customer_id) {
        query = query.eq('customer_id', filter.customer_id)
      }

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id)
      }

      if (filter.search) {
        query = query.or(
          `customer_name.ilike.%${filter.search}%,invoice_number.ilike.%${filter.search}%,sale_number.ilike.%${filter.search}%`
        )
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Satışlar alınamadı: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching sales:', error)
    throw error
  }
}

/**
 * Get sale by ID with details
 * Requirements: 30
 */
export async function getSaleById(saleId: string): Promise<SaleWithDetails | null> {
  try {
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          product:products (*),
          serial_number:product_serial_numbers (*)
        ),
        customer:customers (*),
        user:users (*),
        created_by_user:users!sales_created_by_fkey (*)
      `)
      .eq('id', saleId)
      .single()

    if (saleError) {
      if (saleError.code === 'PGRST116') {
        return null
      }
      throw new Error(`Satış detayları alınamadı: ${saleError.message}`)
    }

    return sale as any
  } catch (error) {
    console.error('Error fetching sale by ID:', error)
    throw error
  }
}

/**
 * Create e-invoice for an existing sale
 * Requirements: 28, 29
 */
export async function createInvoiceForSale(saleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get sale details
    const sale = await getSaleById(saleId)

    if (!sale) {
      throw new Error('Satış bulunamadı')
    }

    if (sale.status === 'sent') {
      throw new Error('Bu satış için zaten fatura kesilmiş')
    }

    if (sale.status === 'cancelled') {
      throw new Error('İptal edilmiş satış için fatura kesilemez')
    }

    // Create invoice via Turkcell API
    const invoiceResult = await turkcellApiService.createInvoice({
      customer: {
        customer_type: sale.customer_type,
        customer_name: sale.customer_name,
        vkn_tckn: sale.vkn_tckn,
        tax_office: sale.tax_office,
        email: sale.email,
        phone: sale.phone,
        address: sale.address,
      },
      items: sale.items?.map(item => ({
        product_id: item.product_id,
        serial_number_id: item.serial_number_id,
        product_name: item.product_name,
        barcode: item.barcode,
        quantity: item.quantity,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate,
        vat_amount: item.vat_amount,
        total_amount: item.total_amount,
        discount_amount: item.discount_amount,
        note: item.note,
        is_miscellaneous: item.is_miscellaneous,
      })) || [],
      invoiceType: sale.invoice_type,
      invoiceDate: sale.invoice_date,
      currency: sale.currency,
      paymentType: sale.payment_type,
      subtotal: sale.subtotal,
      totalVatAmount: sale.total_vat_amount,
      totalAmount: sale.total_amount,
      note: sale.note
    })

    // Update sale with invoice result
    if (invoiceResult.success) {
      await supabase
        .from('sales')
        .update({
          status: 'sent' as InvoiceStatus,
          invoice_uuid: invoiceResult.invoiceUuid,
          invoice_number: invoiceResult.invoiceNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId)

      return { success: true }
    } else {
      await supabase
        .from('sales')
        .update({
          status: 'error' as InvoiceStatus,
          error_message: invoiceResult.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId)

      throw new Error(invoiceResult.error || 'Fatura oluşturulamadı')
    }
  } catch (error) {
    console.error('Invoice creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
    }
  }
}

/**
 * Cancel sale and invoice
 * Requirements: 31
 */
export async function cancelSale(saleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get sale details
    const sale = await getSaleById(saleId)

    if (!sale) {
      throw new Error('Satış bulunamadı')
    }

    if (sale.status === 'cancelled') {
      throw new Error('Satış zaten iptal edilmiş')
    }

    // Cancel invoice via Turkcell API if it was sent
    if (sale.status === 'sent' && sale.invoice_uuid) {
      const cancelResult = await turkcellApiService.cancelInvoice(sale.invoice_uuid)

      if (!cancelResult.success) {
        throw new Error(`Fatura iptal edilemedi: ${cancelResult.error}`)
      }
    }

    // Update sale status
    const { error: updateError } = await supabase
      .from('sales')
      .update({
        status: 'cancelled' as InvoiceStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', saleId)

    if (updateError) {
      throw new Error(`Satış durumu güncellenemedi: ${updateError.message}`)
    }

    // Release serial numbers
    if (sale.items) {
      for (const item of sale.items) {
        if (item.serial_number_id) {
          try {
            await SerialNumberService.releaseSerialNumber(item.serial_number_id)
          } catch (error) {
            console.error('Seri numarası serbest bırakılamadı:', error)
            // Don't fail the transaction for serial number errors
          }
        }
      }
    }

    // Restore product stock quantities
    if (sale.items) {
      for (const item of sale.items) {
        if (item.product_id) {
          try {
            // Get current stock
            const { data: product } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single()

            if (product) {
              await supabase
                .from('products')
                .update({
                  stock_quantity: product.stock_quantity + item.quantity,
                  updated_at: new Date().toISOString()
                })
                .eq('id', item.product_id)
            }
          } catch (error) {
            console.error(`Stok geri yüklenemedi - Ürün ID: ${item.product_id}`, error)
            // Don't fail the transaction for stock update errors
          }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Sale cancellation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
    }
  }
}
