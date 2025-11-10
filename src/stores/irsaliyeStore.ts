import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Irsaliye, IrsaliyeUrunu, CariInfo, UrunInfo, IrsaliyeFormData } from '@/types/irsaliye';
import { IrsaliyeService } from '@/services/irsaliyeService';

interface IrsaliyeState {
  // State
  irsaliyeList: Irsaliye[];
  currentIrsaliye: Irsaliye | null;
  currentUrunler: IrsaliyeUrunu[];
  cariList: CariInfo[];
  urunList: UrunInfo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Cari işlemleri
  loadCariList: (tip?: 'Müşteri' | 'Tedarikçi') => Promise<void>;
  
  // Ürün işlemleri
  loadUrunList: (searchTerm?: string) => Promise<void>;
  searchUrunByBarkod: (barkod: string) => Promise<UrunInfo | null>;
  
  // İrsaliye işlemleri
  createIrsaliye: (formData: IrsaliyeFormData) => Promise<Irsaliye>;
  loadIrsaliyeList: (limit?: number, offset?: number) => Promise<void>;
  loadIrsaliyeById: (id: number) => Promise<void>;
  generateNextIrsaliyeNo: () => Promise<string>;
  generatePDF: (irsaliyeId: number) => Promise<string>;
  
  // Form helpers
  resetForm: () => void;
  clearError: () => void;
}

export const useIrsaliyeStore = create<IrsaliyeState>()(
  devtools(
    (set) => ({
      // Initial state
      irsaliyeList: [],
      currentIrsaliye: null,
      currentUrunler: [],
      cariList: [],
      urunList: [],
      isLoading: false,
      error: null,

      // Basic actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Cari işlemleri
      loadCariList: async (tip) => {
        set({ isLoading: true, error: null });
        try {
          const cariList = await IrsaliyeService.getCariList(tip);
          set({ cariList });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Cari listesi yüklenirken hata oluştu' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Ürün işlemleri
      loadUrunList: async (searchTerm) => {
        set({ isLoading: true, error: null });
        try {
          const urunList = await IrsaliyeService.getUrunList(searchTerm);
          set({ urunList });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Ürün listesi yüklenirken hata oluştu' });
        } finally {
          set({ isLoading: false });
        }
      },

      searchUrunByBarkod: async (barkod) => {
        try {
          return await IrsaliyeService.getUrunByBarkod(barkod);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Barkod arama hatası' });
          return null;
        }
      },

      // İrsaliye işlemleri
      createIrsaliye: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          // Form verilerini API formatına dönüştür
          const irsaliye: Omit<Irsaliye, 'id'> = {
            irsaliye_no: formData.irsaliye_no,
            cari_id: formData.cari_id!,
            cari_turu: formData.cari_turu,
            irsaliye_turu: formData.irsaliye_turu,
            irsaliye_tarihi: formData.irsaliye_tarihi,
            sevk_tarihi: formData.sevk_tarihi,
            sevk_yeri: formData.sevk_yeri,
            durum: formData.durum,
            toplam_miktar: formData.urunler.reduce((sum, urun) => sum + urun.miktar, 0),
            toplam_tutar: formData.urunler.reduce((sum, urun) => sum + (urun.tutar || 0), 0),
            aciklama: formData.aciklama
          };

          const urunler = formData.urunler.map(urun => ({
            urun_id: urun.urun_id!,
            urun_adi: urun.urun_adi,
            barkod: urun.barkod,
            miktar: urun.miktar,
            birim: urun.birim,
            birim_fiyat: urun.birim_fiyat,
            tutar: urun.tutar,
            seri_no: urun.seri_no,
            aciklama: urun.aciklama
          }));

          const createdIrsaliye = await IrsaliyeService.createIrsaliye(irsaliye, urunler);
          
          // Listeyi güncelle
          set(state => ({
            irsaliyeList: [createdIrsaliye, ...state.irsaliyeList],
            currentIrsaliye: createdIrsaliye
          }));

          return createdIrsaliye;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'İrsaliye oluşturulurken hata oluştu';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadIrsaliyeList: async (limit = 50, offset = 0) => {
        set({ isLoading: true, error: null });
        try {
          const irsaliyeList = await IrsaliyeService.getIrsaliyeList(limit, offset);
          set({ irsaliyeList });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'İrsaliye listesi yüklenirken hata oluştu' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadIrsaliyeById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const result = await IrsaliyeService.getIrsaliyeById(id);
          if (result) {
            set({
              currentIrsaliye: result.irsaliye,
              currentUrunler: result.urunler
            });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'İrsaliye detayı yüklenirken hata oluştu' });
        } finally {
          set({ isLoading: false });
        }
      },

      generateNextIrsaliyeNo: async () => {
        try {
          return await IrsaliyeService.getNextIrsaliyeNo();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'İrsaliye numarası üretilirken hata oluştu' });
          throw error;
        }
      },

      generatePDF: async (irsaliyeId) => {
        set({ isLoading: true, error: null });
        try {
          const pdfUrl = await IrsaliyeService.generatePDF(irsaliyeId);
          return pdfUrl;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'PDF oluşturulurken hata oluştu';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetForm: () => {
        set({
          currentIrsaliye: null,
          currentUrunler: [],
          error: null
        });
      }
    }),
    {
      name: 'irsaliye-store'
    }
  )
);