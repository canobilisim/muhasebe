import { supabase } from '@/lib/supabase';
import { Irsaliye, IrsaliyeUrunu, CariInfo, UrunInfo } from '@/types/irsaliye';

export class IrsaliyeService {
  // İrsaliye kaydetme
  static async createIrsaliye(irsaliye: Omit<Irsaliye, 'id'>, urunler: Omit<IrsaliyeUrunu, 'id' | 'irsaliye_id'>[]): Promise<Irsaliye> {
    try {
      // İrsaliye kaydı
      const { data: irsaliyeData, error: irsaliyeError } = await supabase
        .from('irsaliyeler')
        .insert([irsaliye])
        .select()
        .single();

      if (irsaliyeError) throw irsaliyeError;

      // Ürün kayıtları
      if (urunler.length > 0) {
        const urunlerWithIrsaliyeId = urunler.map(urun => ({
          ...urun,
          irsaliye_id: irsaliyeData.id
        }));

        const { error: urunlerError } = await supabase
          .from('irsaliye_urunleri')
          .insert(urunlerWithIrsaliyeId);

        if (urunlerError) throw urunlerError;

        // Stok güncellemesi
        await this.updateStok(irsaliyeData.irsaliye_turu, urunler);
      }

      return irsaliyeData;
    } catch (error) {
      console.error('İrsaliye oluşturma hatası:', error);
      throw error;
    }
  }

  // Stok güncelleme
  static async updateStok(irsaliyeTuru: string, urunler: Omit<IrsaliyeUrunu, 'id' | 'irsaliye_id'>[]): Promise<void> {
    try {
      for (const urun of urunler) {
        let stokDegisimi = 0;
        
        switch (irsaliyeTuru) {
          case 'Satış':
          case 'İade': // Satış iadesi stok artırır
            stokDegisimi = irsaliyeTuru === 'Satış' ? -urun.miktar : urun.miktar;
            break;
          case 'Alış':
            stokDegisimi = urun.miktar;
            break;
          case 'Transfer':
            // Transfer işlemi için ayrı mantık gerekebilir
            break;
        }

        if (stokDegisimi !== 0) {
          const { error } = await supabase.rpc('update_product_stock', {
            product_id: urun.urun_id,
            quantity_change: stokDegisimi
          });

          if (error) throw error;
        }
      }
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      throw error;
    }
  }

  // Cari listesi getirme
  static async getCariList(tip?: 'Müşteri' | 'Tedarikçi'): Promise<CariInfo[]> {
    try {
      let query = supabase
        .from('cariler')
        .select('id, ad, adres, telefon, vergi_no, tip')
        .eq('aktif', true);

      if (tip) {
        query = query.eq('tip', tip);
      }

      const { data, error } = await query.order('ad');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Cari listesi getirme hatası:', error);
      throw error;
    }
  }

  // Ürün listesi getirme
  static async getUrunList(searchTerm?: string): Promise<UrunInfo[]> {
    try {
      let query = supabase
        .from('urunler')
        .select('id, ad, barkod, stok_miktari, birim, satis_fiyati')
        .eq('aktif', true);

      if (searchTerm) {
        query = query.or(`ad.ilike.%${searchTerm}%,barkod.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .order('ad')
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ürün listesi getirme hatası:', error);
      throw error;
    }
  }

  // Barkod ile ürün arama
  static async getUrunByBarkod(barkod: string): Promise<UrunInfo | null> {
    try {
      const { data, error } = await supabase
        .from('urunler')
        .select('id, ad, barkod, stok_miktari, birim, satis_fiyati')
        .eq('barkod', barkod)
        .eq('aktif', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Barkod arama hatası:', error);
      return null;
    }
  }

  // Son irsaliye numarasını getirme
  static async getNextIrsaliyeNo(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('irsaliyeler')
        .select('irsaliye_no')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNo = data[0].irsaliye_no;
        const match = lastNo.match(/IR-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `IR-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('İrsaliye numarası üretme hatası:', error);
      // Hata durumunda rastgele numara üret
      const randomNumber = Math.floor(Math.random() * 999999) + 1;
      return `IR-${randomNumber.toString().padStart(6, '0')}`;
    }
  }

  // İrsaliye listesi getirme
  static async getIrsaliyeList(limit = 50, offset = 0): Promise<Irsaliye[]> {
    try {
      const { data, error } = await supabase
        .from('irsaliyeler')
        .select(`
          *,
          cari:cariler(ad, tip)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İrsaliye listesi getirme hatası:', error);
      throw error;
    }
  }

  // İrsaliye detayı getirme
  static async getIrsaliyeById(id: number): Promise<{ irsaliye: Irsaliye; urunler: IrsaliyeUrunu[] } | null> {
    try {
      const { data: irsaliye, error: irsaliyeError } = await supabase
        .from('irsaliyeler')
        .select(`
          *,
          cari:cariler(ad, adres, telefon, vergi_no, tip)
        `)
        .eq('id', id)
        .single();

      if (irsaliyeError) throw irsaliyeError;

      const { data: urunler, error: urunlerError } = await supabase
        .from('irsaliye_urunleri')
        .select(`
          *,
          urun:urunler(ad, barkod)
        `)
        .eq('irsaliye_id', id);

      if (urunlerError) throw urunlerError;

      return {
        irsaliye,
        urunler: urunler || []
      };
    } catch (error) {
      console.error('İrsaliye detayı getirme hatası:', error);
      return null;
    }
  }

  // PDF oluşturma
  static async generatePDF(irsaliyeId: number): Promise<string> {
    try {
      // İrsaliye detaylarını al
      const irsaliyeData = await this.getIrsaliyeById(irsaliyeId);
      if (!irsaliyeData) {
        throw new Error('İrsaliye bulunamadı');
      }

      // PDF oluşturma işlemi için dinamik import
      const { generateIrsaliyePDF } = await import('@/utils/pdfGenerator');
      
      // Firma bilgilerini al (bu bilgiler ayarlardan gelecek)
      const firmaInfo = {
        ad: 'HesapOnda Muhasebe',
        adres: 'Örnek Mahallesi, Örnek Sokak No:1, İstanbul',
        telefon: '+90 212 555 0000',
        vergi_no: '1234567890'
      };

      const pdfData = {
        irsaliye: irsaliyeData.irsaliye,
        urunler: irsaliyeData.urunler,
        cari: (irsaliyeData.irsaliye as any).cari,
        firma: firmaInfo
      };

      const pdfDataUri = generateIrsaliyePDF(pdfData);
      
      // PDF'i blob olarak oluştur ve URL oluştur
      const response = await fetch(pdfDataUri);
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      
      // PDF URL'ini veritabanında güncelle
      const { error } = await supabase
        .from('irsaliyeler')
        .update({ pdf_url: `irsaliye_${irsaliyeId}_${Date.now()}.pdf` })
        .eq('id', irsaliyeId);

      if (error) throw error;

      return pdfUrl;
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      throw error;
    }
  }
}