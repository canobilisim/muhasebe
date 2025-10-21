# CustomerTransactionsTable Bileşeni

## Genel Bakış

`CustomerTransactionsTable` bileşeni, müşteri detay sayfasında satış ve ödeme işlemlerinin birleşik görünümünü sağlayan bir tablo bileşenidir. Satışlar ve ödemeler tek bir tabloda kronolojik sırayla gösterilir ve her işlem sonrası running balance (kümülatif bakiye) hesaplanır.

## Konum

- **Dosya**: `src/components/customers/CustomerTransactionsTable.tsx`
- **Export**: `src/components/customers/index.ts` üzerinden export edilir
- **Kullanım**: `CustomerDetailPage.tsx` bileşeninde kullanılır
- **Modül**: Müşteri Yönetimi (Customers)

## Özellikler

### Görsel Tasarım
- **Responsive Tablo**: ShadCN UI Table bileşeni ile responsive tasarım
- **Renkli Göstergeler**: Satış ve ödeme işlemleri için farklı renkler
- **İkonlu Badge'ler**: İşlem tipi göstergeleri (ShoppingCart, Wallet)
- **Hover Efekti**: Tıklanabilir satırlar için hover efekti
- **Arka Plan Renkleri**: Ödeme satırları için açık yeşil arka plan

### Veri Gösterimi

#### Tablo Sütunları

| Sütun | Genişlik | Açıklama |
|-------|----------|----------|
| Tarih | 120px | İşlem tarihi ve saati (GG.AA.YYYY SS:DD) |
| İşlem Tipi | 100px | Satış veya Ödeme badge'i |
| Açıklama | Esnek | İşlem açıklaması (satış/ödeme numarası) |
| Ödeme Tipi | 120px | Nakit, Kredi Kartı, Veresiye, Karma |
| Tutar | 120px | İşlem tutarı (sağa hizalı) |
| Bakiye | 120px | İşlem sonrası bakiye (sağa hizalı) |
| İşlemler | 60px | Silme butonu (sadece admin için) |

#### İşlem Tipleri

**Satış İşlemleri**:
- Mavi badge (ShoppingCart ikonu)
- Kırmızı tutar gösterimi (borç artışı)
- TrendingUp ikonu ile pozitif gösterim
- Tıklanınca SaleDetailModal açılır

**Ödeme İşlemleri**:
- Yeşil badge (Wallet ikonu)
- Yeşil tutar gösterimi (borç azalışı)
- TrendingDown ikonu ile negatif gösterim
- Açık yeşil arka plan
- Tıklanınca PaymentDetailModal açılır

### Running Balance (Kümülatif Bakiye)

Her işlem satırında, o işlem sonrası müşterinin güncel bakiyesi gösterilir:
- **Pozitif Bakiye**: Kırmızı renk (müşteri borçlu)
- **Sıfır/Negatif Bakiye**: Gri renk (borç yok)

Bakiye hesaplama:
```typescript
// Satış: Bakiye artar (borç artar)
runningBalance += sale.net_amount

// Ödeme: Bakiye azalır (borç azalır)
runningBalance -= payment.amount
```

### Silme İşlevi (Admin Only)

**Yetki Kontrolü**:
- `useAuth` hook'undan `isAdmin()` fonksiyonu kullanılır
- Sadece admin rolündeki kullanıcılar silme butonunu görür
- Silme butonu her satırın sonunda görünür

**Silme Butonu**:
- Çöp kutusu ikonu (Trash2)
- Kırmızı renk vurgusu
- Hover efekti (kırmızı arka plan)
- Satır tıklama olayını engellemek için `stopPropagation` kullanılır

**Callback Fonksiyonları**:
- `onDeleteSale`: Satış silme işlemi için
- `onDeletePayment`: Ödeme silme işlemi için

## Props Interface

```typescript
interface CustomerTransactionsTableProps {
  transactions: CustomerTransaction[]           // İşlem listesi
  onViewSaleDetail?: (transaction: CustomerTransaction) => void    // Satış detay görüntüleme
  onViewPaymentDetail?: (transaction: CustomerTransaction) => void // Ödeme detay görüntüleme
  onDeleteSale?: (transaction: CustomerTransaction) => void        // Satış silme (admin)
  onDeletePayment?: (transaction: CustomerTransaction) => void     // Ödeme silme (admin)
}
```

## Kullanılan Tipler

### CustomerTransaction
```typescript
interface CustomerTransaction {
  id: string                      // İşlem ID'si
  type: 'sale' | 'payment'       // İşlem tipi
  date: string | null            // İşlem tarihi
  amount: number                 // İşlem tutarı (satış: pozitif, ödeme: negatif)
  paymentType: string            // Ödeme tipi
  description: string            // İşlem açıklaması
  balance: number                // İşlem sonrası bakiye (running balance)
  sale?: SaleWithDetails         // Satış ise detayları
  payment?: CustomerPaymentWithDetails  // Ödeme ise detayları
}
```

## Kullanım Örneği

### CustomerDetailPage.tsx
```typescript
import { CustomerTransactionsTable } from '@/components/customers'
import { useAuth } from '@/hooks/useAuth'

const CustomerDetailPage = () => {
  const { isAdmin } = useAuth()
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([])
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<CustomerPaymentWithDetails | null>(null)

  const handleViewSaleDetail = (transaction: CustomerTransaction) => {
    if (transaction.sale) {
      setSelectedSale(transaction.sale)
    }
  }

  const handleViewPaymentDetail = (transaction: CustomerTransaction) => {
    if (transaction.payment) {
      setSelectedPayment(transaction.payment)
    }
  }

  const handleDeleteSale = async (transaction: CustomerTransaction) => {
    // Onay modalı göster
    // Satışı sil
    // Listeyi yenile
  }

  const handleDeletePayment = async (transaction: CustomerTransaction) => {
    // Onay modalı göster
    // Ödemeyi sil
    // Listeyi yenile
  }

  return (
    <>
      <CustomerTransactionsTable
        transactions={transactions}
        onViewSaleDetail={handleViewSaleDetail}
        onViewPaymentDetail={handleViewPaymentDetail}
        onDeleteSale={isAdmin() ? handleDeleteSale : undefined}
        onDeletePayment={isAdmin() ? handleDeletePayment : undefined}
      />

      <SaleDetailModal
        sale={selectedSale}
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
      />

      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </>
  )
}
```

## Yardımcı Fonksiyonlar

### formatCurrency
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(Math.abs(amount))
}
```
Türk Lirası formatında para birimi gösterimi. `Math.abs()` ile mutlak değer alınır.

### formatDate
```typescript
const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```
Türkçe tarih formatı (örn: "21.10.2024, 14:30").

### getPaymentTypeLabel
```typescript
const getPaymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cash: 'Nakit',
    pos: 'Kredi Kartı',
    credit: 'Veresiye',
    partial: 'Karma'
  }
  return labels[type] || type
}
```
Ödeme tipi etiketlerini Türkçe'ye çevirir.

## Kullanılan ShadCN UI Bileşenleri

- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` - Tablo yapısı
- `Badge` - İşlem tipi göstergeleri
- `Button` - Silme butonu

## Kullanılan İkonlar (Lucide React)

- `FileText` - Boş durum ikonu
- `ShoppingCart` - Satış badge ikonu
- `Wallet` - Ödeme badge ikonu
- `TrendingUp` - Satış tutar ikonu (borç artışı)
- `TrendingDown` - Ödeme tutar ikonu (borç azalışı)
- `Trash2` - Silme butonu ikonu

## Stil Özellikleri

### Tablo Stilleri
- `rounded-md border` - Yuvarlatılmış köşeler ve kenarlık
- `w-[120px]` - Sabit genişlik sütunlar
- `text-right` - Sağa hizalı sütunlar (tutar, bakiye)

### Satır Stilleri
- `cursor-pointer` - Tıklanabilir satırlar
- `hover:bg-gray-50` - Hover efekti
- `bg-green-50/30` - Ödeme satırları için açık yeşil arka plan

### Badge Stilleri
- `variant="default"` - Mavi satış badge'i
- `variant="outline"` - Yeşil ödeme badge'i
- `gap-1` - İkon ve metin arası boşluk

### Tutar Stilleri
- `text-red-600` - Satış tutarları (borç artışı)
- `text-green-600` - Ödeme tutarları (borç azalışı)
- `font-semibold` / `font-bold` - Kalın yazı

### Silme Butonu Stilleri
- `variant="ghost"` - Şeffaf arka plan
- `size="sm"` - Küçük boyut
- `h-8 w-8 p-0` - Sabit boyut, padding yok
- `text-red-600 hover:text-red-700 hover:bg-red-50` - Kırmızı renk vurgusu

## Erişilebilirlik

- Semantik HTML yapısı (table, thead, tbody)
- Tıklanabilir satırlar için cursor pointer
- Hover efektleri ile görsel geri bildirim
- İkonlar ile görsel zenginleştirme
- Renk kodlaması ile işlem tipi ayrımı

## Performans

- Conditional rendering (boş durum, admin butonu)
- Event propagation kontrolü (stopPropagation)
- Optimize edilmiş tablo render'ı
- Memoization kullanılmaz (stateless component)

## Güvenlik

### Rol Tabanlı Erişim Kontrolü (RBAC)

**Yetki Kontrolü**:
```typescript
import { useAuth } from '@/hooks/useAuth'

const { isAdmin } = useAuth()
const showDeleteButton = isAdmin()
```

**Önemli Notlar**:
- Silme butonları sadece admin rolündeki kullanıcılara gösterilir
- Frontend kontrolü güvenlik için yeterli değildir
- Backend'de de RLS (Row Level Security) politikaları ile kontrol yapılmalıdır
- Silme işlemleri Supabase RLS politikaları ile korunmalıdır

## Test Senaryoları

1. **Normal Görünüm**: Satış ve ödemeler karışık sırayla gösterilmeli
2. **Boş Durum**: İşlem yoksa "Henüz işlem yapılmamış" mesajı
3. **Running Balance**: Her satırda doğru bakiye hesaplanmalı
4. **Satış Tıklama**: SaleDetailModal açılmalı
5. **Ödeme Tıklama**: PaymentDetailModal açılmalı
6. **Admin Silme**: Admin kullanıcı silme butonlarını görmeli
7. **Cashier Görünümü**: Cashier kullanıcı silme butonlarını görmemeli
8. **Silme Butonu Tıklama**: Satır tıklama olayını tetiklememeli
9. **Tarih Filtreleme**: Tarih aralığı filtreleme çalışmalı
10. **Uzun Liste**: Scroll ile çok sayıda işlem gösterilmeli

## İlgili Bileşenler

### Aynı Modül (Customers)
- `CustomerDetailPage` - Ana sayfa ve state yönetimi
- `SaleDetailModal` - Satış detay modal'ı
- `PaymentDetailModal` - Ödeme detay modal'ı
- `CustomerSalesTable` - Sadece satış geçmişi tablosu

### UI Bileşenleri
- `ConfirmDialog` - Silme onay diyalogu
- `Table` - ShadCN UI tablo bileşenleri
- `Badge` - İşlem tipi göstergeleri
- `Button` - Silme butonu

## İlgili Servisler

- `CustomerService.getCustomerTransactions()` - Birleşik işlem listesi
- `SaleService.deleteSale()` - Satış silme (admin)
- `CustomerPaymentService.deletePayment()` - Ödeme silme (admin)

## İlgili Hooks

- `useAuth` - Kullanıcı rolü ve yetki kontrolü
  - `isAdmin()` - Admin kontrolü
  - `userRole` - Kullanıcı rolü

## Uygulama Durumu

✅ **İşlem Silme Özelliği Tamamlandı** (21 Ekim 2024)
- CustomerDetailPage'de işlem silme onay sistemi eklendi
- Admin kullanıcılar için güvenli satış ve ödeme silme
- ConfirmDialog bileşeni ile tutarlı UX deneyimi
- Silme işlemi sonrası otomatik veri yenileme

## Gelecek Geliştirmeler

1. **Toplu Silme**: Birden fazla işlemi aynı anda silme
2. **Filtreleme**: İşlem tipi, ödeme tipi, tarih aralığı filtreleri
3. **Sıralama**: Sütunlara göre sıralama
4. **Export**: Excel/PDF export
5. **Yazdırma**: İşlem geçmişini yazdırma
6. **Arama**: İşlem açıklamasında arama
7. **Sayfalama**: Çok sayıda işlem için pagination
8. **İşlem Düzenleme**: Satış ve ödeme düzenleme
9. **İşlem Detayları**: Inline detay görünümü
10. **Toplu İşlemler**: Seçili işlemler üzerinde toplu işlemler

## Hata Yönetimi

- Null/undefined kontrolleri (`date || null`)
- Varsayılan değerler (`balance || 0`)
- Optional chaining (`transaction.sale?.id`)
- Conditional rendering (`{showDeleteButton && ...}`)
- Event propagation kontrolü (`stopPropagation`)

## Bilinen Sorunlar

### Import Hatası (Düzeltilmesi Gerekiyor)

**Mevcut Kod**:
```typescript
import { isAdmin } from '@/lib/supabase'  // ❌ HATALI
```

**Doğru Kullanım**:
```typescript
import { useAuth } from '@/hooks/useAuth'

const CustomerTransactionsTable = ({ ... }) => {
  const { isAdmin } = useAuth()
  const showDeleteButton = isAdmin()
  // ...
}
```

**Açıklama**:
- `isAdmin` fonksiyonu `@/lib/supabase` modülünde export edilmiyor
- `useAuth` hook'u kullanılmalı
- Component içinde hook çağrılmalı (React kuralları)

## Dokümantasyon Güncellemeleri

- **Son Güncelleme**: 21 Ekim 2024
- **Versiyon**: 2.1.0
- **Durum**: Aktif kullanımda - İşlem silme özelliği tamamlandı
- **Bakım**: Düzenli güncelleme
- **Yeni Özellik**: CustomerDetailPage'de işlem silme onay sistemi eklendi

## İlgili Dokümantasyon

- `docs/CUSTOMER_DELETE_FEATURE.md` - Müşteri silme özelliği
- `docs/CUSTOMER_PAYMENTS_UPDATE.md` - Ödeme sistemi güncellemesi
- `docs/SALE_DETAIL_MODAL.md` - Satış detay modal dokümantasyonu
- `README.md` - Proje genel dokümantasyonu
