# Müstasil Fişi (Makbuzu) Kullanım Kılavuzu

## Genel Bakış

Müstasil Fişi, vergiden muaf üreticilerden (çiftçiler, hayvancılar vb.) alınan ürünlerin kaydını tutmak için kullanılan bir belgedir. Bu sistem stopaj hesaplaması yapar ve net ödeme tutarını belirler.

## Özellikler

### ✅ Tamamlanan Özellikler

- **Müstasil Bilgileri Girişi**: Ad soyad, T.C. kimlik no, adres, IBAN
- **Ürün Listesi Yönetimi**: Dinamik ürün ekleme/çıkarma
- **Otomatik Hesaplamalar**: Brüt tutar, stopaj tutarı, net ödenecek
- **Stopaj Oranları**: %2, %4, %8 seçenekleri
- **Birim Seçenekleri**: Kg, Litre, Ton, Adet
- **Ödeme Türleri**: Nakit, Banka, Havale, Çek
- **Form Validasyonu**: T.C. kimlik no kontrolü, zorunlu alanlar
- **Responsive Tasarım**: Alış faturası ile aynı görsel düzen

### 🚧 Geliştirme Aşamasında

- **Veritabanı Entegrasyonu**: Supabase migration bekliyor
- **PDF Oluşturma**: Makbuz PDF çıktısı
- **Müstasil Fişi Listesi**: Kayıtlı fişlerin listelenmesi
- **Arama ve Filtreleme**: Fiş arama özellikleri

## Kullanım

### 1. Müstasil Fişi Oluşturma

1. Sol menüden **"Müstasil Fişi"** → **"Yeni Müstasil Fişi"** seçin
2. **Müstasil Bilgileri** bölümünü doldurun:
   - Ad Soyad (zorunlu)
   - T.C. Kimlik No (11 hane, zorunlu)
   - Adres (zorunlu)
   - IBAN (opsiyonel)

### 2. Ürün Ekleme

1. **Ürün ve Hizmetler** bölümündeki formu kullanın:
   - Ürün adı girin
   - Miktar belirleyin
   - Birim seçin (Kg, Litre, Ton, Adet)
   - Birim fiyat girin
   - Stopaj oranı seçin (%2, %4, %8)
2. **"Ekle"** butonuna tıklayın
3. Ürün tablosunda görüntülenen ürünleri düzenleyebilir veya silebilirsiniz

### 3. Fiş Bilgileri

Sağ panelde:
- Para birimi seçin
- Fiş tarihi belirleyin (zorunlu)
- Ödeme tarihi belirleyin (opsiyonel)
- Ödeme türü seçin
- Makbuz notu ekleyin (opsiyonel)

### 4. Kaydetme

**"Müstasil Fişini Kaydet"** butonuna tıklayarak fişi kaydedin.

## Hesaplama Mantığı

### Stopaj Hesaplaması
```
Brüt Tutar = Miktar × Birim Fiyat
Stopaj Tutarı = (Brüt Tutar × Stopaj Oranı) / 100
Net Ödenecek = Brüt Tutar - Stopaj Tutarı
```

### Stopaj Oranları
- **%2**: Tarım ürünleri
- **%4**: Hayvancılık ürünleri  
- **%8**: Diğer ürünler

### Toplam Hesaplamaları
- **Brüt Toplam**: Tüm ürünlerin brüt tutarlarının toplamı
- **Stopaj Toplam**: Tüm ürünlerin stopaj tutarlarının toplamı
- **Net Ödenecek**: Brüt toplam - Stopaj toplam

## Teknik Detaylar

### Dosya Yapısı
```
src/
├── modules/mustasil-fis/
│   └── index.tsx              # Ana müstasil fişi sayfası
├── types/
│   └── mustasilFis.ts         # Tip tanımları
├── services/
│   └── mustasilFisService.ts  # API servisleri
└── components/layout/
    └── Sidebar.tsx            # Menü entegrasyonu
```

### Veritabanı Şeması
```sql
-- Müstasil fişi tablosu
CREATE TABLE mustasil_fis (
    id BIGSERIAL PRIMARY KEY,
    fis_no VARCHAR(50) NOT NULL UNIQUE,
    mustasil_adi VARCHAR(255) NOT NULL,
    tc_no VARCHAR(11) NOT NULL,
    adres TEXT NOT NULL,
    iban VARCHAR(34),
    urun_listesi JSONB NOT NULL,
    brut_tutar DECIMAL(15,2) NOT NULL,
    stopaj_tutar DECIMAL(15,2) NOT NULL,
    net_tutar DECIMAL(15,2) NOT NULL,
    odeme_turu VARCHAR(50) NOT NULL,
    odeme_tarihi DATE,
    fis_tarihi DATE NOT NULL,
    aciklama TEXT,
    pdf_url VARCHAR(500),
    branch_id UUID NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Migration Çalıştırma
```bash
# Supabase migration dosyası hazır
supabase/migrations/009_mustasil_fis_table.sql

# Migration'ı çalıştırmak için:
supabase db push
```

## Gelecek Geliştirmeler

### Kısa Vadeli
- [ ] Supabase migration çalıştırma
- [ ] Gerçek veritabanı entegrasyonu
- [ ] PDF makbuz oluşturma
- [ ] Müstasil fişi listesi sayfası

### Orta Vadeli
- [ ] Müstasil fişi düzenleme
- [ ] Toplu işlemler
- [ ] Excel export/import
- [ ] Gelişmiş arama ve filtreleme

### Uzun Vadeli
- [ ] E-imza entegrasyonu
- [ ] Otomatik vergi beyannamesi hazırlama
- [ ] Müstasil raporları
- [ ] Mobil uygulama desteği

## Sorun Giderme

### Yaygın Hatalar

1. **"T.C. Kimlik No 11 hane olmalıdır"**
   - T.C. kimlik numarasının tam 11 hane olduğundan emin olun

2. **"En az bir ürün eklemelisiniz"**
   - Kaydetmeden önce en az bir ürün eklemeniz gerekir

3. **"Miktar ve birim fiyat sıfırdan büyük olmalıdır"**
   - Ürün eklerken miktar ve fiyat değerlerini kontrol edin

### Destek

Sorunlarınız için:
- GitHub Issues açın
- Geliştirici ekibiyle iletişime geçin
- Dokümantasyonu kontrol edin

## Lisans

Bu özellik HesapOnda uygulamasının bir parçasıdır ve aynı lisans koşulları altındadır.