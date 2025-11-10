# İrsaliye Sistemi Dokümantasyonu

## Genel Bakış

HesapOnda uygulamasına entegre edilmiş modern, hızlı ve kullanıcı dostu irsaliye kesim sistemi. Bu sistem, kullanıcıların 30 saniyede irsaliye oluşturabilmesini hedefler.

## Özellikler

### ✅ Temel Özellikler
- **Hızlı İrsaliye Kesimi**: 30 saniyede tamamlanabilen süreç
- **Otomatik Fiş Numarası**: Sistem tarafından otomatik üretilen irsaliye numaraları
- **Barkod Desteği**: Ürün ekleme için barkod okutma özelliği
- **Stok Entegrasyonu**: Otomatik stok güncelleme (alış, satış, transfer)
- **PDF Çıktısı**: Tek tıkla profesyonel PDF oluşturma
- **Cari Entegrasyonu**: Müşteri ve tedarikçi bilgileri otomatik doldurma

### 🎯 İrsaliye Türleri
- **Satış İrsaliyesi**: Müşteriye mal sevkiyatı
- **Alış İrsaliyesi**: Tedarikçiden mal alımı
- **İade İrsaliyesi**: Mal iade işlemleri
- **Transfer İrsaliyesi**: Depolar arası transfer

### 📋 Durum Yönetimi
- **Taslak**: Henüz tamamlanmamış irsaliyeler
- **Tamamlandı**: Kesinleşmiş irsaliyeler
- **Faturalandı**: Faturaya dönüştürülmüş irsaliyeler

## Dosya Yapısı

```
src/modules/irsaliye/
├── index.tsx              # Ana irsaliye oluşturma sayfası
├── IrsaliyeList.tsx       # İrsaliye listesi sayfası
├── types/
│   └── irsaliye.ts        # İrsaliye tip tanımları
├── services/
│   └── irsaliyeService.ts # İrsaliye API servisleri
├── stores/
│   └── irsaliyeStore.ts   # Zustand state yönetimi
└── utils/
    └── pdfGenerator.ts    # PDF oluşturma utilities
```

## Veritabanı Yapısı

### İrsaliyeler Tablosu (`irsaliyeler`)
```sql
CREATE TABLE irsaliyeler (
    id BIGSERIAL PRIMARY KEY,
    irsaliye_no VARCHAR(50) NOT NULL UNIQUE,
    cari_id BIGINT NOT NULL,
    cari_turu VARCHAR(20) NOT NULL,
    irsaliye_turu VARCHAR(20) NOT NULL,
    irsaliye_tarihi DATE NOT NULL,
    sevk_tarihi DATE NOT NULL,
    sevk_yeri TEXT,
    durum VARCHAR(20) NOT NULL DEFAULT 'Taslak',
    toplam_miktar DECIMAL(15,3) DEFAULT 0,
    toplam_tutar DECIMAL(15,2) DEFAULT 0,
    pdf_url TEXT,
    aciklama TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### İrsaliye Ürünleri Tablosu (`irsaliye_urunleri`)
```sql
CREATE TABLE irsaliye_urunleri (
    id BIGSERIAL PRIMARY KEY,
    irsaliye_id BIGINT NOT NULL,
    urun_id BIGINT NOT NULL,
    urun_adi VARCHAR(255) NOT NULL,
    barkod VARCHAR(100),
    miktar DECIMAL(15,3) NOT NULL,
    birim VARCHAR(20) NOT NULL DEFAULT 'Adet',
    birim_fiyat DECIMAL(15,2) DEFAULT 0,
    tutar DECIMAL(15,2) DEFAULT 0,
    seri_no VARCHAR(100),
    aciklama TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Fonksiyonları

### RPC Fonksiyonları
- `update_product_stock(product_id, quantity_change)`: Stok güncelleme
- `generate_irsaliye_no()`: Otomatik irsaliye numarası üretme

### Trigger Fonksiyonları
- `update_irsaliye_totals()`: İrsaliye toplamlarını otomatik güncelleme
- `update_irsaliye_updated_at()`: Güncelleme tarihini otomatik ayarlama

## Kullanım Kılavuzu

### Yeni İrsaliye Oluşturma

1. **Cari Seçimi**
   - Cari türünü seçin (Müşteri/Tedarikçi)
   - Dropdown'dan cari seçin
   - Adres bilgileri otomatik doldurulur

2. **İrsaliye Bilgileri**
   - İrsaliye türünü seçin
   - Tarih bilgilerini kontrol edin
   - Sevk yerini düzenleyin

3. **Ürün Ekleme**
   - Barkod okutun veya ürün adı yazın
   - Miktar ve birim bilgilerini girin
   - Enter tuşu ile ürünü ekleyin

4. **Kaydetme**
   - F2 tuşu ile kaydedin
   - Ctrl+P ile PDF oluşturun
   - "Faturaya Dönüştür" ile fatura oluşturun

### Klavye Kısayolları

- **F2**: İrsaliyeyi kaydet
- **Ctrl+P**: PDF oluştur ve yazdır
- **Ctrl+F**: Ürün arama alanına odaklan
- **Enter**: Yeni ürün satırı ekle

## Stok Yönetimi

### Otomatik Stok Güncellemeleri

- **Satış İrsaliyesi**: Stok miktarı düşer (-miktar)
- **Alış İrsaliyesi**: Stok miktarı artar (+miktar)
- **İade İrsaliyesi**: 
  - Satış iadesi: Stok artar (+miktar)
  - Alış iadesi: Stok düşer (-miktar)
- **Transfer İrsaliyesi**: Kaynak depodan düşer, hedef depoya eklenir

### Stok Kontrolleri

- Satış irsaliyesinde yetersiz stok uyarısı
- Negatif stok kontrolü
- Kritik stok seviyesi bildirimleri

## PDF Oluşturma

### PDF İçeriği
- Firma logosu ve bilgileri
- İrsaliye numarası ve tarihleri
- Cari bilgileri (alıcı/verici)
- Ürün listesi tablosu
- Toplam bilgiler
- Teslim eden/alan imza alanları
- "Bu belge fatura yerine geçmez" uyarısı

### PDF Özellikleri
- Profesyonel tasarım
- Türkçe karakter desteği
- Otomatik sayfa numaralandırma
- QR kod desteği (opsiyonel)

## Güvenlik ve İzinler

### Rol Tabanlı Erişim
- **Admin**: Tüm işlemler
- **Manager**: İrsaliye oluşturma, düzenleme, listeleme
- **Cashier**: Sadece görüntüleme (opsiyonel)

### RLS (Row Level Security)
- Kullanıcı bazlı veri erişimi
- Şube bazlı veri izolasyonu
- Güvenli API erişimi

## Performans Optimizasyonları

### Veritabanı
- Uygun indeksler
- Trigger optimizasyonları
- Pagination desteği

### Frontend
- Lazy loading
- Virtual scrolling (büyük listeler için)
- Debounced search
- Optimistic updates

## Hata Yönetimi

### Yaygın Hatalar ve Çözümleri

1. **"Cari seçimi zorunludur"**
   - Çözüm: Dropdown'dan bir cari seçin

2. **"En az bir ürün eklemelisiniz"**
   - Çözüm: Ürün listesine en az bir ürün ekleyin

3. **"Yetersiz stok"**
   - Çözüm: Stok miktarını kontrol edin veya alış irsaliyesi oluşturun

4. **"Barkod bulunamadı"**
   - Çözüm: Ürün adını manuel olarak girin veya ürünü sisteme ekleyin

## Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] E-İrsaliye entegrasyonu
- [ ] Toplu irsaliye işlemleri
- [ ] İrsaliye şablonları
- [ ] Mobil uygulama desteği
- [ ] Gelişmiş raporlama
- [ ] Otomatik e-posta gönderimi
- [ ] Çoklu dil desteği

### Teknik İyileştirmeler
- [ ] Real-time güncellemeler (WebSocket)
- [ ] Offline çalışma desteği
- [ ] Gelişmiş cache stratejileri
- [ ] Mikroservis mimarisi

## Destek ve Sorun Giderme

### Log Dosyaları
- Browser console logları
- Supabase function logları
- Network request logları

### Debug Modu
```javascript
// Debug modunu aktifleştir
localStorage.setItem('debug', 'true');
```

### Yaygın Sorunlar
1. **PDF oluşturamıyor**: Browser popup blocker kontrolü
2. **Stok güncellenmiyor**: RPC function izinleri kontrolü
3. **Cari listesi boş**: Veritabanı bağlantısı kontrolü

## Katkıda Bulunma

### Geliştirme Ortamı Kurulumu
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Testleri çalıştır
npm run test

# Build oluştur
npm run build
```

### Kod Standartları
- TypeScript strict mode
- ESLint kuralları
- Prettier formatı
- Conventional commits

---

**Son Güncelleme**: 24 Ekim 2025
**Versiyon**: 1.0.0
**Geliştirici**: HesapOnda Ekibi