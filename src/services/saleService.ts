import { supabase } from '@/lib/supabase';
import type { SaleInsert, SaleItemInsert } from '@/types';

export interface CreateSaleParams {
  customerId: string | null;
  items: Array<{
    productId: string | null;
    serialNumberId?: string | null;
    quantity: number;
    unitPrice: number;
    discount: number;
    note?: string;
    isMiscellaneous?: boolean;
  }>;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentType: 'cash' | 'pos' | 'credit' | 'partial';
  paidAmount: number;
  changeAmount: number;
  cashAmount?: number;
  posAmount?: number;
  creditAmount?: number;
  notes?: string;
  dueDate?: string | null;
}

export class SaleService {
  /**
   * Yeni satış kaydı oluşturur (Optimize edilmiş)
   */
  static async createSale(params: CreateSaleParams) {
    try {
      // Kullanıcı ve şube bilgisini al
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { data: userData } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', user.id)
        .single();

      if (!userData?.branch_id) throw new Error('Şube bilgisi bulunamadı');

      // Satış numarası oluştur (basitleştirilmiş)
      const saleNumber = this.generateQuickSaleNumber();

      // Satış kaydını oluştur
      const saleData: SaleInsert = {
        sale_number: saleNumber,
        customer_id: params.customerId,
        user_id: user.id,
        branch_id: userData.branch_id,
        total_amount: params.totalAmount,
        discount_amount: params.discountAmount,
        net_amount: params.netAmount,
        payment_type: params.paymentType,
        paid_amount: params.paidAmount,
        change_amount: params.changeAmount,
        sale_date: new Date().toISOString(),
        due_date: params.dueDate || null,
        notes: params.notes || null,
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (saleError) throw saleError;
      if (!sale) throw new Error('Satış kaydı oluşturulamadı');

      // Satış kalemlerini ekle (ÖNCE bu yapılmalı - RLS politikası için)
      const saleItems: SaleItemInsert[] = params.items.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        serial_number_id: item.serialNumberId || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_amount: item.unitPrice * item.quantity * item.discount,
        total_amount: item.unitPrice * item.quantity * (1 - item.discount),
        note: item.note || null,
        is_miscellaneous: item.isMiscellaneous || false,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Sale items error:', itemsError);
        throw itemsError;
      }

      // NOT: Aşağıdaki işlemler trigger'lar tarafından otomatik yapılıyor:
      // - Stok güncellemesi: trigger_update_product_stock (sale_items INSERT)
      // - Müşteri bakiyesi: trigger_update_customer_balance (sales INSERT)
      // - Kasa hareketleri: trigger_create_sale_cash_movement (sales INSERT)
      // Bu yüzden manuel güncelleme yapmıyoruz

      return { success: true, data: sale };
    } catch (error) {
      console.error('Error creating sale:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
      throw error;
    }
  }

  /**
   * Hızlı satış numarası oluşturur (timestamp bazlı)
   */
  private static generateQuickSaleNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-6); // Son 6 hane
    return `${dateStr}${timeStr}`;
  }

  /**
   * Müşteriye ait satışları getirir
   */
  static async getCustomerSales(customerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          items:sale_items(
            *,
            product:products(*)
          ),
          customer:customers(*),
          user:users!sales_user_id_fkey(*)
        `)
        .eq('customer_id', customerId)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer sales:', error);
      throw error;
    }
  }

  /**
   * Satış detayını getirir
   */
  static async getSaleById(saleId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          items:sale_items(
            *,
            product:products(*)
          ),
          customer:customers(*),
          user:users!sales_user_id_fkey(*)
        `)
        .eq('id', saleId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  /**
   * Toplu stok güncelleme (Optimize edilmiş - Paralel)
   */
  private static async updateStockBatch(items: Array<{ productId: string; quantity: number }>) {
    // Tüm ürünlerin stok güncellemelerini paralel yap
    const updates = items.map(async (item) => {
      // Mevcut stoğu al ve güncelle (tek sorguda)
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (product) {
        return supabase
          .from('products')
          .update({ 
            stock_quantity: Math.max(0, (product.stock_quantity || 0) - item.quantity),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.productId);
      }
    });
    
    await Promise.all(updates);
  }

  /**
   * Müşteri bakiyesini günceller (Optimize edilmiş)
   */
  private static async updateCustomerBalance(customerId: string, creditAmount: number) {
    const { data: customer } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('id', customerId)
      .single();

    if (customer) {
      await supabase
        .from('customers')
        .update({ 
          current_balance: (customer.current_balance || 0) + creditAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);
    }
  }

  /**
   * Kasa hareketlerini kaydeder
   */
  private static async recordCashMovements(
    saleId: string,
    params: CreateSaleParams,
    branchId: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const movements = [];

    // Nakit ödeme varsa
    if (params.cashAmount && params.cashAmount > 0) {
      movements.push({
        branch_id: branchId,
        user_id: user.id,
        movement_type: 'sale' as const,
        amount: params.cashAmount,
        description: `Satış - Nakit (${params.items.length} ürün)`,
        sale_id: saleId,
      });
    }

    // POS ödeme varsa
    if (params.posAmount && params.posAmount > 0) {
      movements.push({
        branch_id: branchId,
        user_id: user.id,
        movement_type: 'sale' as const,
        amount: params.posAmount,
        description: `Satış - POS (${params.items.length} ürün)`,
        sale_id: saleId,
      });
    }

    if (movements.length > 0) {
      await supabase.from('cash_movements').insert(movements);
    }
  }

  /**
   * Satış kaydını sil (admin only)
   */
  static async deleteSale(saleId: string): Promise<void> {
    try {
      // Önce satış bilgilerini al (müşteri bakiyesini güncellemek için)
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('customer_id, net_amount, payment_type')
        .eq('id', saleId)
        .single()

      if (fetchError) {
        throw new Error(`Satış bilgileri alınamadı: ${fetchError.message}`)
      }

      // Satışı sil
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId)

      if (error) {
        throw new Error(`Satış silinemedi: ${error.message}`)
      }

      // Eğer veresiye satış ise müşteri bakiyesini güncelle
      if (sale.customer_id && sale.payment_type === 'credit') {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('current_balance')
          .eq('id', sale.customer_id)
          .single()

        if (!customerError && customer) {
          // Satış silindi, bakiyeden düş
          const newBalance = Math.max(0, (customer.current_balance || 0) - (sale.net_amount || 0))
          
          await supabase
            .from('customers')
            .update({ 
              current_balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', sale.customer_id)
        }
      }
    } catch (error) {
      console.error('Error deleting sale:', error)
      throw error
    }
  }
}
