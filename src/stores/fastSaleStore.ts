import { create } from 'zustand';
import { ProductService } from '@/services/productService';

interface FastSaleCategory {
  id: string;
  name: string;
  display_order: number;
}

interface FastSaleProduct {
  id: string;
  barcode: string;
  name: string;
  sale_price_1: number;
  sale_price_2: number;
  category_id: string;
  category_name: string;
  fast_sale_order: number;
}

interface FastSaleStore {
  categories: FastSaleCategory[];
  products: FastSaleProduct[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useFastSaleStore = create<FastSaleStore>((set, get) => ({
  categories: [],
  products: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  loadData: async () => {
    // Eğer zaten yüklenmişse tekrar yükleme
    if (get().isLoaded && !get().error) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await ProductService.getFastSaleProducts();
      
      if (result.success && result.data) {
        set({
          categories: result.data.categories,
          products: result.data.products,
          isLoaded: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          error: result.error || 'Hızlı satış verileri yüklenemedi',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading fast sale data:', error);
      set({
        error: 'Hızlı satış verileri yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  refreshData: async () => {
    // Force refresh - cache'i temizle ve yeniden yükle
    set({ isLoaded: false });
    await get().loadData();
  },
}));
