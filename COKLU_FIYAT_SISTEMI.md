# Çoklu Fiyat Sistemi Güncellemesi

## Yapılan Değişiklikler

### 1. Veritabanı Değişiklikleri

#### Products Tablosuna Eklenen Kolonlar:
- `sale_price_1` (NUMERIC): Satış fiyatı seviye 1 (zorunlu, varsayılan fiyat)
- `sale_price_2` (NUMERIC): Satış fiyatı seviye 2 (opsiyonel)
- `sale_price_3` (NUMERIC): Satış fiyatı seviye 3 (opsiyonel)

#### Otomatik Fiyat Doldurma Trigger'ı
Ürün eklenirken veya güncellenirken:
- Eğer `sale_price_2` boş veya 0 ise → `sale_price_1` kopyalanır
- Eğer `sale_price_3` boş veya 0 ise → `sale_price_1` kopyalanır
- Geriye dönük uyumluluk için `sale_price` da `sale_price_1` ile güncellenir

### 2. Ürün Formu Güncellemeleri

#### ProductForm Değişiklikleri:
- **Fiyat 1 (Zorunlu)**: Mutlaka girilmesi gereken ana fiyat
- **Fiyat 2 (Opsiyonel)**: Boş bırakılırsa Fiyat 1 kullanılır
- **Fiyat 3 (Opsiyonel)**: Boş bırakılırsa Fiyat 1 kullanılır

#### Otomatik Doldurma Özelliği:
Fiyat 1 girildiğinde, eğer Fiyat 2 ve Fiyat 3 boşsa otomatik olarak Fiyat 1 değeri kopyalanır.

**Konum:** `src/components/stock/ProductForm.tsx`

### 3. Hızlı Satış Ekranı Güncellemeleri

#### Fiyat Listesi Seçimi:
Hızlı satış ekranının üst kısmında bulunan dropdown ile fiyat listesi seçilebilir:
- **Fiyat 1**: Varsayılan fiyat listesi
- **Fiyat 2**: İkinci fiyat listesi
- **Fiyat 3**: Üçüncü fiyat listesi

#### Dinamik Fiyatlandırma:
- Seçilen fiyat listesine göre ürünlerin fiyatları otomatik değişir
- Barkod okutulduğunda seçili fiyat listesine göre ürün sepete eklenir
- Hızlı satış butonlarında gösterilen fiyatlar seçili listeye göre güncellenir
- Ürün arama sonuçlarında seçili fiyat gösterilir

**Konum:** `src/pages/pos/FastSalePage.tsx`

### 4. Servis Güncellemeleri

#### ProductService:
- `getFastSaleProducts()`: Artık 3 fiyat seviyesini de döndürüyor
- Fiyat bilgileri kategorilere göre gruplandırılmış şekilde geliyor

**Konum:** `src/services/productService.ts`

### 5. Tip Tanımlamaları

#### Güncellenmiş Tipler:
- `Product`: `sale_price_1`, `sale_price_2`, `sale_price_3` alanları eklendi
- `ProductInsert`: Yeni fiyat alanları eklendi
- `ProductUpdate`: Yeni fiyat alanları eklendi

**Konum:** `src/types/database.ts`

## Kullanım Senaryoları

### Senaryo 1: Tek Fiyat Kullanımı
```
Fiyat 1: 100 ₺ (zorunlu)
Fiyat 2: Boş → Otomatik 100 ₺
Fiyat 3: Boş → Otomatik 100 ₺
```

### Senaryo 2: Farklı Fiyatlar
```
Fiyat 1: 100 ₺ (Perakende)
Fiyat 2: 90 ₺ (Toptan)
Fiyat 3: 85 ₺ (VIP Müşteri)
```

### Senaryo 3: İki Fiyat Kullanımı
```
Fiyat 1: 100 ₺ (Normal)
Fiyat 2: 80 ₺ (İndirimli)
Fiyat 3: Boş → Otomatik 100 ₺
```

## Kullanım Adımları

### Ürün Ekleme/Düzenleme:
1. Stok Yönetimi > Ürünler sayfasına gidin
2. Yeni ürün ekleyin veya mevcut ürünü düzenleyin
3. **Fiyat 1** alanını doldurun (zorunlu)
4. İsterseniz **Fiyat 2** ve **Fiyat 3** alanlarını doldurun
5. Boş bırakılan fiyatlar otomatik olarak Fiyat 1 değerini alır
6. Kaydedin

### Hızlı Satış Kullanımı:
1. POS > Hızlı Satış sayfasına gidin
2. Üstteki dropdown'dan fiyat listesi seçin (Fiyat 1, Fiyat 2, Fiyat 3)
3. Barkod okutun veya ürün seçin
4. Ürün seçili fiyat listesine göre sepete eklenir
5. Fiyat listesini değiştirdiğinizde, yeni eklenen ürünler yeni fiyattan eklenir

## Önemli Notlar

- **Fiyat 1 zorunludur**: Ürün eklerken mutlaka girilmelidir
- **Otomatik doldurma**: Boş fiyatlar otomatik olarak Fiyat 1 değerini alır
- **Dinamik fiyatlandırma**: Fiyat listesi değiştirildiğinde tüm gösterilen fiyatlar güncellenir
- **Sepetteki ürünler**: Fiyat listesi değiştirildiğinde sepetteki ürünlerin fiyatları değişmez
- **Geriye dönük uyumluluk**: Eski `sale_price` alanı hala kullanılabilir

## Veritabanı Migration

Migration dosyası: `add_multiple_price_levels_to_products`

Migration otomatik olarak:
- Yeni fiyat kolonlarını ekler
- Mevcut `sale_price` değerlerini `sale_price_1`'e kopyalar
- Otomatik fiyat doldurma trigger'ını oluşturur
- Geriye dönük uyumluluk için `sale_price` kolonunu günceller

## Avantajlar

✅ Farklı müşteri grupları için farklı fiyatlar
✅ Toptan ve perakende fiyat ayrımı
✅ İndirimli fiyat listeleri
✅ VIP müşteri fiyatları
✅ Tek fiyat kullanımında otomatik doldurma
✅ Kolay fiyat listesi değiştirme
✅ Geriye dönük uyumluluk
