# Hızlı Satış Sistemi Güncellemesi

## Yapılan Değişiklikler

### 1. Veritabanı Değişiklikleri

#### Yeni Tablo: `fast_sale_categories`
Hızlı satış ekranında gösterilecek kategorileri yönetmek için yeni bir tablo oluşturuldu.

**Kolonlar:**
- `id` (UUID): Benzersiz kimlik
- `branch_id` (UUID): Şube referansı
- `name` (VARCHAR): Kategori adı
- `display_order` (INTEGER): Görüntüleme sırası
- `is_active` (BOOLEAN): Aktif/pasif durumu
- `created_at`, `updated_at`: Zaman damgaları

**Varsayılan Kategoriler:**
- ANA
- AKSESUAR
- TAMİR
- TELEFON
- 2. EL

#### Products Tablosuna Eklenen Kolonlar:
- `show_in_fast_sale` (BOOLEAN): Ürünün hızlı satışta gösterilip gösterilmeyeceği
- `fast_sale_category_id` (UUID): Hangi kategoride gösterileceği
- `fast_sale_order` (INTEGER): Kategorideki görüntüleme sırası (1-99)

#### Otomatik Sıra Düzenleme Trigger'ı
Bir ürünün hızlı satış sırası değiştirildiğinde, aynı kategorideki diğer ürünlerin sıraları otomatik olarak güncellenir.

**Örnek:**
- Kategori: AKSESUAR
- Mevcut ürünler: Sıra 1, 2, 3, 4, 5
- Yeni ürün sıra 3 olarak ekleniyor
- Sonuç: Eski 3 → 4, Eski 4 → 5, Eski 5 → 6

### 2. Yeni Servisler

#### `FastSaleCategoryService`
Hızlı satış kategorilerini yönetmek için servis:
- `getAll()`: Tüm kategorileri getir
- `getById(id)`: ID'ye göre kategori getir
- `create(category)`: Yeni kategori oluştur
- `update(id, updates)`: Kategori güncelle
- `delete(id)`: Kategori sil

#### `ProductService` Güncellemeleri
- `getFastSaleProducts()`: Hızlı satış için kategorilere göre gruplandırılmış ürünleri getir

### 3. UI Bileşenleri

#### `FastSaleCategoryManager` (Yeni)
Ayarlar sayfasında hızlı satış kategorilerini yönetmek için bileşen:
- Kategori listeleme
- Yeni kategori ekleme
- Kategori düzenleme
- Kategori silme
- Sıra düzenleme

**Konum:** `src/components/settings/FastSaleCategoryManager.tsx`

#### `ProductForm` Güncellemeleri
Ürün formuna hızlı satış ayarları eklendi:
- "Hızlı satışta göster" checkbox'ı
- Hızlı satış kategorisi seçimi (dropdown)
- Sıra numarası girişi (1-99)
- Validasyon kuralları

**Konum:** `src/components/stock/ProductForm.tsx`

#### `FastSalePage` Güncellemeleri
Hızlı satış sayfası artık veritabanından veri çekiyor:
- Örnek ürünler kaldırıldı
- Kategoriler dinamik olarak yükleniyor
- Ürünler veritabanından çekiliyor
- Kategoriye göre filtreleme
- Sıraya göre listeleme

**Konum:** `src/pages/pos/FastSalePage.tsx`

### 4. Tip Tanımlamaları

#### Yeni Tipler:
- `FastSaleCategory`: Hızlı satış kategorisi tipi
- `FastSaleCategoryInsert`: Kategori ekleme tipi
- `FastSaleCategoryUpdate`: Kategori güncelleme tipi
- `ProductWithFastSale`: Hızlı satış bilgisi içeren ürün tipi
- `FastSaleProduct`: Hızlı satış için optimize edilmiş ürün tipi

#### Güncellenmiş Tipler:
- `ProductForm`: Hızlı satış alanları eklendi
- `FastSaleCategoryForm`: Kategori form tipi

**Konum:** `src/types/index.ts`, `src/types/database.ts`

### 5. Ayarlar Sayfası Güncellemesi

`SettingsPage` bileşenine `FastSaleCategoryManager` eklendi.
- Sadece admin ve manager rolündeki kullanıcılar görebilir
- Kategorileri yönetme yetkisi

**Konum:** `src/pages/SettingsPage.tsx`

## Kullanım

### Hızlı Satış Kategorisi Ekleme

1. Ayarlar sayfasına gidin
2. "Hızlı Satış Kategorileri" kartını bulun
3. "Yeni Kategori" butonuna tıklayın
4. Kategori adını ve sırasını girin
5. "Oluştur" butonuna tıklayın

### Ürünü Hızlı Satışa Ekleme

1. Stok Yönetimi > Ürünler sayfasına gidin
2. Yeni ürün ekleyin veya mevcut ürünü düzenleyin
3. "Hızlı Satış Ayarları" bölümünde:
   - "Hızlı satışta göster" checkbox'ını işaretleyin
   - Kategori seçin
   - Sıra numarası girin (1-99)
4. Kaydedin

### Hızlı Satış Kullanımı

1. POS > Hızlı Satış sayfasına gidin
2. Üstteki kategorilerden birini seçin
3. Sağ taraftaki ürün listesinden ürüne tıklayın
4. Ürün sepete eklenir

## Önemli Notlar

- Hızlı satış kategorileri şubeye özgüdür
- Sıra numaraları otomatik olarak düzenlenir
- Bir kategori silindiğinde, o kategorideki ürünlerin `fast_sale_category_id` değeri NULL olur
- Ürün hızlı satıştan kaldırılmak istenirse, "Hızlı satışta göster" checkbox'ı kaldırılmalıdır

## Veritabanı Migration

Migration dosyası: `add_fast_sale_categories_and_product_fields`

Migration otomatik olarak:
- `fast_sale_categories` tablosunu oluşturur
- `products` tablosuna gerekli kolonları ekler
- Varsayılan kategorileri ekler
- RLS politikalarını ayarlar
- Trigger'ları oluşturur
- Index'leri ekler

## Güvenlik

- RLS (Row Level Security) politikaları aktif
- Kullanıcılar sadece kendi şubelerinin kategorilerini görebilir
- Kategori ekleme/düzenleme/silme sadece admin ve manager rollerine açık
- Ürün ekleme/düzenleme mevcut yetkilendirme kurallarına tabidir
