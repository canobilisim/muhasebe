// Müstasil Fişi için tip tanımları

export interface MustasilItem {
    id: string;
    urun_adi: string;
    miktar: number;
    birim: string;
    birim_fiyat: number;
    stopaj_orani: number;
    brut_tutar: number;
    stopaj_tutari: number;
    net_odenecek: number;
}

export interface MustasilData {
    mustasil_adi: string;
    tc_no: string;
    adres: string;
    iban?: string;
}

export interface MustasilFis {
    id?: number;
    mustasil_adi: string;
    tc_no: string;
    adres: string;
    iban?: string;
    urun_listesi: MustasilItem[];
    brut_tutar: number;
    stopaj_tutar: number;
    net_tutar: number;
    odeme_turu: string;
    odeme_tarihi?: string;
    fis_tarihi: string;
    aciklama?: string;
    pdf_url?: string;
    fis_no?: string;
    branch_id: string;
    created_by: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateMustasilFisInput {
    mustasil_adi: string;
    tc_no: string;
    adres: string;
    iban?: string;
    urun_listesi: MustasilItem[];
    brut_tutar: number;
    stopaj_tutar: number;
    net_tutar: number;
    odeme_turu: string;
    odeme_tarihi?: string;
    fis_tarihi: string;
    aciklama?: string;
    branch_id: string;
    created_by: string;
}

// Birim seçenekleri
export const BIRIM_OPTIONS = ['Kg', 'Litre', 'Ton', 'Adet'] as const;
export type BirimType = typeof BIRIM_OPTIONS[number];

// Stopaj oranı seçenekleri
export const STOPAJ_OPTIONS = [2, 4, 8] as const;
export type StopajType = typeof STOPAJ_OPTIONS[number];

// Ödeme türü seçenekleri
export const PAYMENT_TYPE_OPTIONS = ['Nakit', 'Banka', 'Havale', 'Çek'] as const;
export type PaymentType = typeof PAYMENT_TYPE_OPTIONS[number];