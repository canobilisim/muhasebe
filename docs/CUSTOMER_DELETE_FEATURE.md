# Müşteri Silme Özelliği

## Genel Bakış

Müşteri detay sayfasında müşterileri kalıcı olarak silme özelliği eklenmiştir. Bu özellik, güvenli bir iki aşamalı onay sistemi ile çalışır ve kullanıcıyı olası veri kaybı konusunda bilgilendirir.

## Özellikler

### İki Aşamalı Onay Sistemi

1. **İlk Onay**: Müşteri silme işleminin başlatılması
   - Kullanıcı "Sil" butonuna tıklar
   - `ConfirmDialog` bileşeni ile onay istenir
   - Temel uyarı mesajı gösterilir

2. **İkinci Onay** (İşlem geçmişi varsa):
   - Müşteriye ait satış veya ödeme kaydı varsa
   - Ek bir onay diyalogu gösterilir
   - Tüm işlem kayıtlarının silineceği vurgulanır
   - Kullanıcı bilinçli bir şekilde onaylamalıdır

### Cascade Delete

Müşteri silindiğinde:
- Müşteriye ait tüm satış kayıtları (`sales` tablosu)
- Müşteriye ait tüm ödeme kayıtları (`customer_payments` tablosu)
- İlgili tüm satış kalemleri (`sale_items` tablosu)
- Otomatik olarak veritabanından silinir (CASCADE foreign key)

## Teknik Detaylar

### Kullanılan Bileşenler

#### ConfirmDialog
```typescript
<ConfirmDialog
  isOpen={boolean}
  onClose={() => void}
  onConfirm={() => void}
  title={string}
  description={string}
  confirmText={string}
  cancelText={string}
  variant="danger" | "warning" | "info"
  isLoading={boolean}
/>
```

**Özellikler**:
- Üç farklı varyant (danger, warning, info)
- Yükleme durumu gösterimi
- Özelleştirilebilir buton metinleri
- İkon desteği (AlertTriangle)
- Responsive tasarım

### State Yönetimi

```typescript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)
```

### İşlem Akışı

```typescript
// 1. Silme işlemini başlat
const handleDelete = () => {
  setShowDeleteConfirm(true)
}

// 2. İlk onay
const handleFirstDeleteConfirm = () => {
  setShowDeleteConfirm(false)
  const hasTransactions = transactions.length > 0
  if (hasTransactions) {
    setShowSecondDeleteConfirm(true)  // İkinci onay gerekli
  } else {
    performDelete()  // Direkt sil
  }
}

// 3. İkinci onay (işlem geçmişi varsa)
const handleSecondDeleteConfirm = () => {
  setShowSecondDeleteConfirm(false)
  performDelete()
}

// 4. Silme işlemini gerçekleştir
const performDelete = async () => {
  if (!customer) return
  
  setIsDeleting(true)
  try {
    await CustomerService.permanentlyDeleteCustomer(customer.id)
    navigate('/customers')  // Müşteri listesine yönlendir
  } catch (error) {
    console.error('Delete error:', error)
    alert('Müşteri silinirken bir hata oluştu')
  } finally {
    setIsDeleting(false)
  }
}
```

## API Kullanımı

### CustomerService.permanentlyDeleteCustomer()

```typescript
// Müşteriyi ve tüm ilişkili kayıtları kalıcı olarak sil
await CustomerService.permanentlyDeleteCustomer(customerId: string): Promise<void>
```

**Önemli Notlar**:
- Bu işlem geri alınamaz (hard delete)
- Cascade delete ile tüm ilişkili kayıtlar silinir
- Soft delete için `CustomerService.deleteCustomer()` kullanılmalıdır (is_active = false)

## Kullanıcı Deneyimi

### Görsel Öğeler

1. **Sil Butonu**:
   - Kırmızı renk vurgusu
   - Çöp kutusu ikonu
   - "Düzenle" butonunun yanında konumlandırılmış

2. **İlk Onay Diyalogu**:
   - Kırmızı uyarı ikonu
   - Açık ve net mesaj
   - "İptal" ve "Sil" butonları

3. **İkinci Onay Diyalogu** (işlem geçmişi varsa):
   - Daha vurgulu uyarı mesajı
   - İşlem sayısı bilgisi
   - "GERİ ALINAMAZ" vurgusu
   - "İptal" ve "Evet, Sil" butonları

### Mesajlar

**İlk Onay**:
```
Müşteri Sil
"{Müşteri Adı}" müşterisini kalıcı olarak silmek istediğinizden emin misiniz?
```

**İkinci Onay** (işlem geçmişi varsa):
```
Dikkat: İşlem Geçmişi Var
Bu müşteriye ait {X} adet işlem kaydı (satış ve ödeme) bulunmaktadır.

⚠️ UYARI: Tüm işlem kayıtları da silinecektir!

Bu işlem GERİ ALINAMAZ!
```

## Güvenlik ve Veri Bütünlüğü

### Kontroller

1. **Müşteri Varlık Kontrolü**: İşlem öncesi müşteri nesnesinin varlığı kontrol edilir
2. **İşlem Geçmişi Kontrolü**: Transactions array'i kontrol edilerek ek onay gereksinimi belirlenir
3. **Hata Yönetimi**: Try-catch bloğu ile hata durumları yakalanır
4. **Kullanıcı Bilgilendirmesi**: Hata durumunda kullanıcıya bilgi verilir

### Veritabanı Seviyesi

- Foreign key constraints ile veri bütünlüğü sağlanır
- CASCADE DELETE ile ilişkili kayıtlar otomatik silinir
- RLS (Row Level Security) politikaları ile yetki kontrolü yapılır

## Alternatif: Soft Delete

Müşteriyi kalıcı olarak silmek yerine pasif hale getirmek için:

```typescript
// Soft delete - müşteriyi pasif yap
await CustomerService.deleteCustomer(customerId)
// is_active = false olarak güncellenir
```

**Soft Delete Avantajları**:
- Veri kaybı olmaz
- İşlem geçmişi korunur
- Gerekirse müşteri tekrar aktif edilebilir
- Raporlama ve analiz için veriler kullanılabilir

## İlgili Dosyalar

### Bileşenler
- `src/pages/CustomerDetailPage.tsx` - Müşteri detay sayfası ve silme işlemi
- `src/components/ui/confirm-dialog.tsx` - Yeniden kullanılabilir onay diyalogu

### Servisler
- `src/services/customerService.ts` - Müşteri CRUD işlemleri
  - `deleteCustomer()` - Soft delete
  - `permanentlyDeleteCustomer()` - Hard delete (cascade)

### Tipler
- `src/types/index.ts` - Customer ve ilgili tip tanımları
- `src/types/database.ts` - Supabase veritabanı şeması

## Gelecek Geliştirmeler

1. **Silme Geçmişi**: Silinen müşterilerin log kaydı
2. **Geri Alma**: Belirli bir süre içinde silme işlemini geri alma
3. **Arşivleme**: Soft delete yerine arşivleme sistemi
4. **Toplu Silme**: Birden fazla müşteriyi aynı anda silme
5. **İzin Kontrolü**: Sadece admin rolünün silme yetkisi olması

## Test Senaryoları

1. **İşlem Geçmişi Olmayan Müşteri**:
   - Tek onay ile direkt silinmeli
   - Müşteri listesine yönlendirilmeli

2. **İşlem Geçmişi Olan Müşteri**:
   - İki aşamalı onay istenmeli
   - İşlem sayısı gösterilmeli
   - Tüm kayıtlar silinmeli

3. **Hata Durumu**:
   - Hata mesajı gösterilmeli
   - Kullanıcı sayfada kalmalı
   - Loading durumu temizlenmeli

4. **İptal İşlemi**:
   - Her iki onay aşamasında da iptal edilebilmeli
   - Hiçbir değişiklik yapılmamalı
   - Modal'lar kapanmalı
