import { supabase } from '@/lib/supabase';
import type { SaleInsert, SaleItemInsert } from '@/types';

export interface CreateSaleParams {
  customerId: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
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

      // Ödeme durumunu belirle
      const paymentStatus = params.paymentType === 'credit' || 
                           (params.paymentType === 'partial' && (params.creditAmount || 0) > 0)
        ? 'pending'
        : 'paid';

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
        payment_status: paymentStatus,
        paid_amount: params.paidAmount,
        change_amount: params.changeAmount,
        sale_date: new Date().toISOString(),
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (saleError) throw saleError;
      if (!sale) throw new Error('Satış kaydı oluşturulamadı');

      // Satış kalemlerini ekle
      const saleItems: SaleItemInsert[] = params.items.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_amount: item.unitPrice * item.quantity * item.discount,
        total_amount: item.unitPrice * item.quantity * (1 - item.discount),
      }));

      // Paralel işlemler - Hepsini aynı anda başlat
      const promises = [
        // Satış kalemlerini ekle
        supabase.from('sale_items').insert(saleItems).then(r => r.error ? Promise.reject(r.error) : r),
        // Kasa hareketlerini kaydet
        this.recordCashMovements(sale.id, params, userData.branch_id),
        // Stok güncellemelerini ekle
        this.updateStockBatch(params.items),
      ];

      // Müşteri bakiyesini güncelle (açık hesap varsa)
      if (params.customerId && params.creditAmount && params.creditAmount > 0) {
        promises.push(this.updateCustomerBalance(params.customerId, params.creditAmount));
      }

      // Tüm işlemleri paralel çalıştır
      await Promise.all(promises);

      return { success: true, sale };
    } catch (error) {
      console.error('Error creating sale:', error);
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
}
