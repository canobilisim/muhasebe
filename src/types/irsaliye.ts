export interface Irsaliye {
  id?: number;
  irsaliye_no: string;
  cari_id: number;
  cari_turu: string;
  irsaliye_turu: string;
  irsaliye_tarihi: string;
  sevk_tarihi: string;
  sevk_yeri: string | null;
  durum: string;
  toplam_miktar: number;
  toplam_tutar: number;
  pdf_url?: string | null;
  aciklama?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IrsaliyeUrunu {
  id?: number;
  irsaliye_id: number;
  urun_id: number;
  urun_adi: string;
  barkod?: string | null;
  miktar: number;
  birim: string;
  birim_fiyat?: number | null;
  tutar?: number | null;
  seri_no?: string | null;
  aciklama?: string | null;
  created_at?: string | null;
}

export interface IrsaliyeFormData {
  cari_turu: string;
  cari_id: number | null;
  irsaliye_turu: string;
  irsaliye_no: string;
  irsaliye_tarihi: string;
  sevk_tarihi: string;
  sevk_yeri: string;
  durum: string;
  aciklama: string;
  urunler: IrsaliyeUrunuForm[];
}

export interface IrsaliyeUrunuForm {
  urun_id: number | null;
  urun_adi: string;
  barkod: string;
  miktar: number;
  birim: string;
  birim_fiyat: number;
  tutar: number;
  seri_no: string;
  aciklama: string;
}

export interface CariInfo {
  id: number;
  ad: string;
  adres: string | null;
  telefon: string | null;
  vergi_no: string | null;
  tip: string;
}

export interface UrunInfo {
  id: number;
  ad: string;
  barkod: string | null;
  stok_miktari: number;
  birim: string | null;
  satis_fiyati: number | null;
}