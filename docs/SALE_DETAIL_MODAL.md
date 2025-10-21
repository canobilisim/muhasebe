# SaleDetailModal Bileşeni (Customers)

## Genel Bakış

`SaleDetailModal` bileşeni, müşteri detay sayfasında satış işlemlerinin detaylı bilgilerini görüntülemek için kullanılan bir modal diyalog bileşenidir.

> **Not**: Bu bileşen `src/components/customers/` klasöründe bulunur. Raporlama modülünde benzer isimli ancak farklı özelliklere sahip başka bir `SaleDetailModal` bileşeni (`src/components/reports/SaleDetailModal.tsx`) bulunmaktadır.

## Konum

- **Dosya**: `src/components/customers/SaleDetailModal.tsx`
- **Export**: `src/components/customers/index.ts` üzerinden export edilir
- **Kullanım**: `CustomerDetailPage.tsx` ve `CustomerTransactionsTable.tsx` bileşenlerinde kullanılır
- **Modül**: Müşteri Yönetimi (Customers)

## Özellikler

### Görsel Tasarım
- **Responsive**: Maksimum genişlik 4xl (max-w-4xl)
- **Scroll Desteği**: Maksimum yükseklik %90 viewport (max-h-[90vh])
- **İkonlu Başlıklar**: Lucide React ikonları ile görsel zenginleştirme
- **Renkli Kartlar**: Gri arka plan (bg-gray-50) ile bölüm ayrımı

### Veri Gösterimi

#### 1. Satış Bilgileri
- **Satış Numarası**: Modal başlığında gösterilir
- **Tarih**: Satış tarihi ve saati (Türkçe format)
- **Müşteri**: Müşteri adı (varsa)
- **Ödeme Tipi**: Nakit, Kredi Kartı, Veresiye, Karma

#### 2. Ürün Listesi Tablosu
Satışa ait tüm ürünler detaylı tablo formatında gösterilir:

| Sütun | Açıklama |
|-------|----------|
| Ürün | Ürün adı ve barkod bilgisi |
| Miktar | Satılan miktar (ortalanmış) |
| Birim Fiyat | Ürün birim fiyatı (₺) |
| İndirim | İndirim tutarı (varsa, kırmızı) |
| Toplam | Satır toplamı (kalın) |

**Özel Durumlar**:
- Muhtelif ürünler için `item.note` gösterilir
- Barkod bilgisi küçük gri metin olarak alt satırda
- İndirim yoksa "-" gösterilir

#### 3. Satış Özeti
Sağ alt köşede özet bilgiler:
- **Ara Toplam**: Toplam tutar (indirim öncesi)
- **İndirim**: Toplam indirim tutarı (varsa, kırmızı)
- **Net Toplam**: Ödenecek tutar (kalın, büyük font)
- **Ödenen**: Müşterinin ödediği tutar (varsa)
- **Para Üstü**: Verilen para üstü (varsa)

#### 4. Satış Notları
Satışa ait notlar varsa ayrı bir bölümde gösterilir.

## Props Interface

```typescript
interface SaleDetailModalProps {
  sale: SaleWithDetails        // Satış detayları (items, customer, user dahil)
  isOpen: boolean              // Modal açık/kapalı durumu
  onClose: () => void          // Modal kapatma callback'i
}
```

## Kullanılan Tipler

### SaleWithDetails
```typescript
interface SaleWithDetails extends Sale {
  items?: SaleItem[]           // Satış kalemleri
  customer?: Customer          // Müşteri bilgileri
  user?: User                  // Satışı yapan kullanıcı
}
```

### SaleItem
```typescript
interface SaleItem {
  id: string
  product_id?: string | null
  product?: Product            // Ürün bilgileri (name, barcode)
  quantity: number
  unit_price: number
  discount_amount?: number | null
  total_amount: number
  note?: string | null         // Muhtelif ürün notu
  is_miscellaneous?: boolean
}
```

## Kullanım Örneği

### CustomerDetailPage.tsx
```typescript
import { SaleDetailModal } from '@/components/customers'

const CustomerDetailPage = () => {
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null)

  const handleViewSaleDetail = (transaction: CustomerTransaction) => {
    if (transaction.sale) {
      setSelectedSale(transaction.sale)
    }
  }

  return (
    <>
      <CustomerTransactionsTable
        transactions={transactions}
        onViewSaleDetail={handleViewSaleDetail}
      />

      <SaleDetailModal
        sale={selectedSale}
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </>
  )
}
```

### CustomerTransactionsTable.tsx
```typescript
<TableRow 
  onClick={() => {
    if (transaction.type === 'sale' && onViewSaleDetail) {
      onViewSaleDetail(transaction)
    }
  }}
>
  {/* Satır içeriği */}
</TableRow>
```

## Yardımcı Fonksiyonlar

### formatCurrency
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount)
}
```
Türk Lirası formatında para birimi gösterimi.

### formatDate
```typescript
const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```
Türkçe tarih formatı (örn: "21 Ekim 2024, 14:30").

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

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` - Modal yapısı
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` - Ürün listesi tablosu

## Kullanılan İkonlar (Lucide React)

- `FileText` - Modal başlığı
- `Calendar` - Tarih bilgisi
- `User` - Müşteri bilgisi
- `CreditCard` - Ödeme tipi

## Stil Özellikleri

### Modal Boyutları
- `max-w-4xl` - Maksimum genişlik (büyük ekranlar için)
- `max-h-[90vh]` - Maksimum yükseklik (viewport'un %90'ı)
- `overflow-y-auto` - Dikey scroll desteği

### Bölüm Stilleri
- `space-y-6` - Bölümler arası 1.5rem boşluk
- `bg-gray-50` - Açık gri arka plan (bilgi kartları)
- `rounded-lg` - Yuvarlatılmış köşeler
- `border-t` - Üst kenarlık (özet bölümü)

### Metin Stilleri
- `text-xs` - Küçük etiketler
- `text-sm` - Normal metin
- `text-lg` - Büyük başlıklar
- `text-2xl` - Çok büyük başlıklar (net toplam)
- `font-medium` - Orta kalınlık
- `font-semibold` - Yarı kalın
- `font-bold` - Kalın

### Renk Paleti
- `text-gray-600` - Etiketler
- `text-gray-500` - İkincil bilgiler
- `text-red-600` - İndirim tutarları
- `text-green-600` - Pozitif değerler

## Erişilebilirlik

- Modal kapatma için `onClose` callback'i
- Klavye navigasyonu (ESC tuşu ile kapatma)
- Semantik HTML yapısı
- ARIA etiketleri (Dialog bileşeni tarafından sağlanır)

## Performans

- Memoization kullanılmaz (stateless component)
- Sadece gerekli veriler render edilir
- Conditional rendering (notlar, indirimler)
- Optimize edilmiş tablo render'ı

## Test Senaryoları

1. **Normal Satış**: Ürünlü, müşterili, tam ödeme
2. **Muhtelif Ürün**: Not içeren muhtelif ürün satışı
3. **İndirimli Satış**: İndirim tutarı olan satış
4. **Veresiye Satış**: Ödeme yapılmamış satış
5. **Karma Ödeme**: Nakit + POS karışık ödeme
6. **Uzun Ürün Listesi**: Scroll testi için çok ürünlü satış
7. **Notlu Satış**: Satış notu içeren işlem

## İlgili Bileşenler

### Aynı Modül (Customers)
- `CustomerTransactionsTable` - Satış listesi ve tıklama eventi
- `CustomerDetailPage` - Ana sayfa ve state yönetimi
- `SaleEditModal` - Satış düzenleme modal'ı
- `PaymentDetailModal` - Ödeme detay modal'ı

### Diğer Modüller
- `src/components/reports/SaleDetailModal.tsx` - Raporlama modülü için satış detay modal'ı (farklı özellikler: düzenleme, silme, güncelleme)

## İlgili Servisler

- `SaleService.getSaleById()` - Satış detaylarını getir
- `SaleService.getCustomerSales()` - Müşteri satışlarını getir

## Gelecek Geliştirmeler

1. **Yazdırma**: Satış detayını PDF olarak yazdırma
2. **WhatsApp**: Satış detayını WhatsApp ile gönderme
3. **E-posta**: Satış detayını e-posta ile gönderme
4. **İade**: Satış iadesi başlatma butonu
5. **Düzenleme**: Modal içinden satış düzenleme
6. **Kopyalama**: Satış bilgilerini kopyalama
7. **Favori**: Sık kullanılan satışları favorilere ekleme

## Hata Yönetimi

- Null/undefined kontrolleri (`sale.items?.map`)
- Varsayılan değerler (`|| 0`, `|| '-'`)
- Optional chaining (`sale.customer?.name`)
- Conditional rendering (`{sale.notes && ...}`)

## Dokümantasyon Güncellemeleri

- **Son Güncelleme**: 21 Ekim 2024
- **Versiyon**: 1.0.0
- **Durum**: Aktif kullanımda
- **Bakım**: Düzenli güncelleme
