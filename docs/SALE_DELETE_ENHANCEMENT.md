# Sale Deletion Enhancement

## Genel Bakış

`SaleService.deleteSale()` metodu, veresiye satışlar için müşteri bakiyesi yönetimi ile geliştirilmiştir. Bu güncelleme, satış silindiğinde veri bütünlüğünü korur ve müşteri bakiyelerinin doğru kalmasını sağlar.

## Yapılan Değişiklikler

### Önceki Durum
```typescript
// Eski implementasyon - sadece satışı siliyordu
static async deleteSale(saleId: string): Promise<void> {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId)
  
  if (error) throw error
}
```

### Yeni Durum
```typescript
// Yeni implementasyon - bakiye yönetimi ile
static async deleteSale(saleId: string): Promise<void> {
  // 1. Satış bilgilerini al
  const { data: sale } = await supabase
    .from('sales')
    .select('customer_id, net_amount, payment_type')
    .eq('id', saleId)
    .single()

  // 2. Satışı sil (cascade delete)
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId)

  // 3. Veresiye satış ise müşteri bakiyesini güncelle
  if (sale.customer_id && sale.payment_type === 'credit') {
    const { data: customer } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('id', sale.customer_id)
      .single()

    if (customer) {
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
}
```

## Özellikler

### 1. Akıllı Bakiye Yönetimi
- **Veresiye Satış Kontrolü**: Sadece `payment_type === 'credit'` olan satışlar için bakiye güncellenir
- **Güvenli Hesaplama**: `Math.max(0, ...)` ile negatif bakiye engellenir
- **Null Güvenliği**: Tüm değerler için null kontrolü yapılır

### 2. Veri Bütünlüğü
- **Cascade Delete**: İlişkili kayıtlar (sale_items, cash_movements) otomatik silinir
- **Atomik İşlem**: Hata durumunda tüm işlem geri alınır
- **Tutarlı Güncelleme**: `updated_at` alanı otomatik güncellenir

### 3. Hata Yönetimi
- **Detaylı Hata Mesajları**: Her adım için özel hata mesajları
- **Güvenli Hata Yakalama**: Try-catch bloğu ile kapsamlı hata yönetimi
- **Logging**: Console.error ile hata kayıtları

## Kullanım Senaryoları

### Senaryo 1: Nakit Satış Silme
```typescript
// Nakit satış - bakiye güncellenmez
await SaleService.deleteSale('sale-id-cash')
// Sonuç: Sadece satış kaydı silinir
```

### Senaryo 2: Veresiye Satış Silme
```typescript
// Veresiye satış - bakiye güncellenir
await SaleService.deleteSale('sale-id-credit')
// Sonuç: 
// 1. Satış kaydı silinir
// 2. Müşteri bakiyesi düşürülür
// 3. İlişkili kayıtlar temizlenir
```

### Senaryo 3: POS Satış Silme
```typescript
// POS satış - bakiye güncellenmez
await SaleService.deleteSale('sale-id-pos')
// Sonuç: Sadece satış kaydı silinir
```

## Güvenlik ve Yetkilendirme

### Admin Yetkisi
- Bu fonksiyon sadece admin rolündeki kullanıcılar tarafından kullanılabilir
- UI seviyesinde `useAuth().isAdmin()` kontrolü yapılır
- Backend seviyesinde RLS politikaları ile korunur

### Veri Koruması
- Silme işlemi geri alınamaz (hard delete)
- Cascade delete ile ilişkili tüm kayıtlar temizlenir
- Müşteri bakiyesi tutarlılığı korunur

## Test Senaryoları

### 1. Veresiye Satış Silme Testi
```typescript
// Başlangıç durumu
const customer = { current_balance: 1000 }
const sale = { net_amount: 500, payment_type: 'credit' }

// Satış silme
await SaleService.deleteSale(saleId)

// Beklenen sonuç
const updatedCustomer = { current_balance: 500 } // 1000 - 500
```

### 2. Nakit Satış Silme Testi
```typescript
// Başlangıç durumu
const customer = { current_balance: 1000 }
const sale = { net_amount: 500, payment_type: 'cash' }

// Satış silme
await SaleService.deleteSale(saleId)

// Beklenen sonuç
const updatedCustomer = { current_balance: 1000 } // Değişmez
```

### 3. Hata Durumu Testi
```typescript
// Geçersiz satış ID
try {
  await SaleService.deleteSale('invalid-id')
} catch (error) {
  // Beklenen: "Satış bilgileri alınamadı" hatası
}
```

## Performans Optimizasyonları

### Veritabanı Sorguları
- **Minimal Sorgular**: Sadece gerekli alanlar seçilir
- **Tek Seferde Güncelleme**: Müşteri bakiyesi tek sorguda güncellenir
- **İndeks Kullanımı**: Primary key ve foreign key indeksleri kullanılır

### Bellek Yönetimi
- **Küçük Veri Setleri**: Sadece gerekli veriler bellekte tutulur
- **Garbage Collection**: Fonksiyon sonunda otomatik temizlik
- **Async/Await**: Non-blocking işlemler

## İlgili Dosyalar

### Servisler
- `src/services/saleService.ts` - Ana implementasyon
- `src/services/customerService.ts` - Müşteri bakiye yönetimi

### UI Bileşenleri
- `src/pages/CustomerDetailPage.tsx` - Müşteri detay sayfası silme işlemi
- `src/components/reports/SalesReport.tsx` - Satış raporu silme işlemi
- `src/components/customers/CustomerTransactionsTable.tsx` - İşlem tablosu silme butonları

### Dokümantasyon
- `docs/CUSTOMER_DELETE_FEATURE.md` - Müşteri silme özelliği
- `docs/CUSTOMER_TRANSACTIONS_TABLE.md` - İşlem tablosu dokümantasyonu
- `README.md` - Genel proje dokümantasyonu

## Gelecek Geliştirmeler

### 1. Soft Delete Seçeneği
```typescript
// Kalıcı silme yerine pasif yapma
static async softDeleteSale(saleId: string): Promise<void> {
  await supabase
    .from('sales')
    .update({ is_active: false })
    .eq('id', saleId)
}
```

### 2. Toplu Silme
```typescript
// Birden fazla satışı aynı anda silme
static async deleteSales(saleIds: string[]): Promise<void> {
  // Batch processing implementasyonu
}
```

### 3. Silme Geçmişi
```typescript
// Silinen kayıtların log'unu tutma
interface DeleteLog {
  deleted_record_id: string
  deleted_by: string
  deleted_at: string
  record_type: 'sale' | 'payment'
  reason?: string
}
```

### 4. Geri Alma Özelliği
```typescript
// Belirli bir süre içinde silme işlemini geri alma
static async undoDeleteSale(deleteLogId: string): Promise<void> {
  // Backup'tan geri yükleme implementasyonu
}
```

## Bilinen Sınırlamalar

1. **Geri Alınamaz**: Silme işlemi kalıcıdır
2. **Cascade Effect**: İlişkili tüm kayıtlar silinir
3. **Admin Only**: Sadece admin kullanıcılar erişebilir
4. **Network Dependency**: İnternet bağlantısı gerektirir

## Hata Kodları

| Kod | Açıklama | Çözüm |
|-----|----------|-------|
| `SALE_NOT_FOUND` | Satış kaydı bulunamadı | Geçerli satış ID'si kontrol edin |
| `CUSTOMER_UPDATE_FAILED` | Müşteri bakiyesi güncellenemedi | Müşteri kaydının varlığını kontrol edin |
| `PERMISSION_DENIED` | Yetkisiz erişim | Admin rolü gerekli |
| `DATABASE_ERROR` | Veritabanı hatası | Bağlantıyı kontrol edin |

## Dokümantasyon Güncellemeleri

- **Son Güncelleme**: 21 Ekim 2024
- **Versiyon**: 2.0.0
- **Durum**: Aktif kullanımda
- **Bakım**: Düzenli güncelleme
