# Seri Numaralı Ürün Satış Sistemi

## Genel Bakış

Hızlı satış (POS) ekranına seri numaralı ürün satış akışı entegre edilmiştir. Sistem, seri numarası takibi gerektiren ürünlerin satışında otomatik olarak seri numarası seçim modalını açar ve seçilen seri numarasını satış kaydına ekler.

## Özellikler

### 1. Otomatik Seri Numarası Kontrolü

Ürün sepete eklenirken sistem otomatik olarak kontrol eder:
- Barkod okutma ile ürün ekleme
- Ürün arama ile ekleme
- Hızlı satış butonları ile ekleme
- Yeni ürün ekleme modalından ekleme

Eğer ürün `serial_number_tracking_enabled = true` ise, seri numarası seçim modalı açılır.

### 2. Seri Numarası Seçim Modalı

**Özellikler:**
- Ürüne ait tüm müsait (available) seri numaralarını listeler
- Arama/filtreleme özelliği (barkod okuyucu ile okutulabilir)
- Seçilen seri numarası vurgulanır
- Enter tuşu ile hızlı seçim
- ESC tuşu ile iptal

**Kullanım:**
1. Modal açıldığında arama inputu otomatik focus alır
2. Barkod okuyucu ile seri numarasını okutun VEYA listeden seçin
3. "Seç ve Sepete Ekle" butonuna tıklayın veya Enter'a basın

### 3. Sepet Yönetimi

**Seri Numaralı Ürünler:**
- Sepette ürün adının altında seri numarası gösterilir (küçük gri yazı)
- Miktar değiştirilemez (disabled input)
- Sepetten çıkarıldığında seri numarası otomatik serbest bırakılır

**Rezervasyon Sistemi:**
- Sepete eklenen seri numarası "reserved" durumuna geçer
- Başka kullanıcılar aynı seri numarasını seçemez
- Sepetten çıkarıldığında "available" durumuna döner

### 4. Satış Tamamlama

**Satış Kaydı:**
- Her satış kalemi için `serial_number_id` kaydedilir
- Satış başarılı olduğunda seri numaraları "sold" durumuna geçer
- `sold_date` ve `sale_id` bilgileri güncellenir

**Stok Yönetimi:**
- Seri numaralı ürünlerde stok otomatik azalır
- Satılan seri numaraları artık müsait listesinde görünmez

## Teknik Detaylar

### Veritabanı Yapısı

**products tablosu:**
```sql
serial_number_tracking_enabled: boolean
```

**product_serial_numbers tablosu:**
```sql
id: uuid (PK)
product_id: uuid (FK)
serial_number: text (UNIQUE)
status: text ('available', 'reserved', 'sold')
added_date: timestamp
sold_date: timestamp (nullable)
sale_id: uuid (nullable, FK)
```

**sale_items tablosu:**
```sql
serial_number_id: uuid (nullable, FK)
```

### Servisler

**SerialNumberService:**
- `getAvailableSerialNumbers(productId)` - Müsait seri numaralarını getirir
- `reserveSerialNumber(id)` - Seri numarasını rezerve eder
- `releaseSerialNumber(id)` - Rezervasyonu kaldırır
- `markSerialNumberAsSold(id, saleId)` - Satıldı olarak işaretler

**SaleService:**
- `createSale()` - Satış kaydı oluşturur (serialNumberId desteği eklendi)

### Bileşenler

**SerialNumberSelectionModal:**
- Lokasyon: `src/components/pos/SerialNumberSelectionModal.tsx`
- Props: `isOpen`, `onClose`, `onSelect`, `productId`, `productName`

**FastSalePage Güncellemeleri:**
- Seri numarası modal state yönetimi
- Otomatik seri numarası kontrolü
- Sepet görünümünde seri numarası gösterimi
- Miktar değiştirme engelleme

### Type Tanımları

**POSProduct (src/types/pos.ts):**
```typescript
interface Product {
  // ... mevcut alanlar
  serialNumberId?: string
  serialNumber?: string
  requiresSerialNumber?: boolean
}
```

**CreateSaleParams (src/services/saleService.ts):**
```typescript
items: Array<{
  productId: string | null
  serialNumberId?: string | null  // YENİ
  // ... diğer alanlar
}>
```

## Kullanım Senaryoları

### Senaryo 1: Barkod ile Seri Numaralı Ürün Satışı

1. Kullanıcı ürün barkodunu okutur
2. Sistem ürünün seri numaralı olduğunu tespit eder
3. Seri numarası seçim modalı açılır
4. Kullanıcı seri numarasını okutur veya listeden seçer
5. Ürün seri numarası ile birlikte sepete eklenir
6. Sepette seri numarası görüntülenir
7. Satış tamamlandığında seri numarası "sold" olarak işaretlenir

### Senaryo 2: Sepetten Seri Numaralı Ürün Çıkarma

1. Kullanıcı sepetteki seri numaralı ürünü siler
2. Sistem otomatik olarak seri numarasını serbest bırakır
3. Seri numarası tekrar "available" durumuna geçer
4. Başka satışlarda kullanılabilir hale gelir

### Senaryo 3: Hızlı Satış Butonları

1. Kullanıcı hızlı satış butonuna tıklar
2. Eğer ürün seri numaralı ise modal açılır
3. Seri numarası seçilir
4. Ürün sepete eklenir

## Hata Yönetimi

**Müsait Seri Numarası Yok:**
- Modal açıldığında uyarı gösterilir
- Kullanıcı modalı kapatabilir

**Seri Numarası Rezerve Edilemedi:**
- Hata mesajı gösterilir
- Ürün sepete eklenmez

**Miktar Değiştirme Denemesi:**
- "Seri numaralı ürünlerde miktar değiştirilemez!" uyarısı
- Input disabled durumda

## Test Senaryoları

1. ✅ Seri numaralı ürün barkod ile ekleme
2. ✅ Seri numaralı ürün arama ile ekleme
3. ✅ Hızlı satış butonu ile seri numaralı ürün ekleme
4. ✅ Seri numarası seçim modalı açılma/kapanma
5. ✅ Seri numarası arama/filtreleme
6. ✅ Sepette seri numarası görüntüleme
7. ✅ Sepetten çıkarma ve serbest bırakma
8. ✅ Miktar değiştirme engelleme
9. ✅ Satış tamamlama ve "sold" işaretleme
10. ✅ Müsait olmayan seri numarası kontrolü

## Ek Özellikler

### Ürün Düzenleme Sayfası
- Satılan seri numaraları listede **gizlenir**
- Sadece "Mevcut" ve "Rezerve" durumundaki seri numaraları gösterilir
- Satılan seri numaraları sayısı bilgi olarak gösterilir: "Satılan: X (gizli)"
- Bu sayede liste karmaşıklaşmaz ve yüzlerce satış yapıldığında yönetilebilir kalır

### Perakende Satışlar Sayfası
- Satış detayında seri numaraları gösterilir
- Ürün adının altında mavi renkli ve mono font ile: "SN: 123456789"
- Arama kutusunda seri numarası ile arama yapılabilir
- Placeholder: "Satış no, müşteri, ürün veya seri no ara..."

## Satış Silme İşlemi

Satış silindiğinde:
1. **Seri Numaraları Temizlenir:**
   - `sale_id` referansı NULL yapılır
   - `sold_date` NULL yapılır
   - `status` "available" olarak güncellenir
   - Seri numaraları tekrar satılabilir hale gelir

2. **Stoklar Geri Yüklenir:**
   - Ürün stokları artırılır

3. **Müşteri Bakiyesi Güncellenir:**
   - Açık hesap satışlarında borç azaltılır

4. **Kasa Hareketi Silinir:**
   - İlgili kasa hareketi kaldırılır

## Gelecek Geliştirmeler

- [ ] Seri numarası geçmişi görüntüleme (hangi müşteriye satıldı, ne zaman)
- [ ] Toplu seri numarası ekleme (satın alma)
- [ ] Seri numarası raporu
- [ ] Garanti takibi (seri numarası bazlı)
- [ ] İade işlemlerinde seri numarası yönetimi

## Notlar

- Seri numaralı ürünlerde her satış için ayrı seri numarası seçilmelidir
- Aynı seri numarası birden fazla kez satılamaz
- Seri numaraları benzersiz (unique) olmalıdır
- Rezerve edilmiş seri numaraları başka kullanıcılar tarafından görülemez
- Satılan seri numaraları ürün düzenleme sayfasında gizlenir (performans ve kullanılabilirlik için)
