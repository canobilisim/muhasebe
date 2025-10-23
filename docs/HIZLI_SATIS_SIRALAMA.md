# Hızlı Satış Otomatik Sıralama Sistemi

## 🎯 Özellik

Hızlı satış kategorisine ürün eklerken otomatik sıra numarası atanır ve sıra değiştirildiğinde diğer ürünlerin sırası otomatik güncellenir.

## 📋 Nasıl Çalışır?

### 1. Yeni Ürün Ekleme

```
Kullanıcı:
1. "Hızlı satışta göster" checkbox'ını işaretler
2. Kategori seçer (örn: "ANA")

Sistem:
✅ Otomatik olarak kategorideki son sıra + 1 atar
✅ Örnek: Kategoride 3 ürün varsa → Yeni ürün sıra 4 olur
```

### 2. Sıra Değiştirme

```
Mevcut Durum:
1 - Cips
2 - Kola
3 - Çikolata
4 - Fanta

Kullanıcı Çikolatayı 2'ye alır:

Yeni Durum:
1 - Cips
2 - Çikolata  ← Buraya taşındı
3 - Kola      ← Otomatik 3 oldu
4 - Fanta     ← Otomatik 4 oldu
```

## 🔄 Otomatik Güncelleme Mantığı

### Algoritma

```typescript
// Yeni sıra: 2
// Etkilenen ürünler: Sırası >= 2 olan tüm ürünler

Kola (sıra 2) → 3'e çık
Çikolata (sıra 3) → 2'ye gel
Fanta (sıra 4) → 4'te kal (değişmez)
```

### Kod Akışı

```typescript
1. Kategorideki tüm ürünleri al
2. Yeni sıradan büyük/eşit olanları bul
3. Her birinin sırasını +1 artır
4. Yeni ürünü istenen sıraya yerleştir
```

## 💻 Teknik Detaylar

### Database Alanları

```sql
products table:
- show_in_fast_sale: boolean
- fast_sale_category_id: uuid
- fast_sale_order: integer (1-99)
```

### Servis Fonksiyonları

#### getNextOrderNumber()
```typescript
// Kategorideki bir sonraki sıra numarasını al
const nextOrder = await ProductService.getNextOrderNumber(categoryId);
// Örnek: Kategoride 5 ürün varsa → 6 döner
```

#### reorderProducts()
```typescript
// Sıra değiştiğinde diğer ürünleri güncelle
await ProductService.reorderProducts(
  categoryId,    // Hangi kategori
  newOrder,      // Yeni sıra numarası
  productId      // Düzenlenen ürün (opsiyonel)
);
```

## 🎨 Kullanıcı Arayüzü

### Ürün Ekleme Formu

```
┌─────────────────────────────────────┐
│ Hızlı Satış Ayarları                │
├─────────────────────────────────────┤
│ ☑ Hızlı satışta göster              │
│                                      │
│ Kategori: [ANA ▼]                   │
│ Sıra: [4] (Otomatik atandı)         │
│                                      │
│ 💡 Yeni ürün için otomatik sıra     │
│    atanmıştır                        │
└─────────────────────────────────────┘
```

### Sıra Değiştirme

```
Kullanıcı sıra numarasını değiştirir:
[2] → [5]

Sistem otomatik olarak:
- 2-4 arası ürünleri 1 sıra yukarı kaydırır
- Yeni ürünü 5. sıraya yerleştirir
```

## 📊 Örnek Senaryolar

### Senaryo 1: İlk Ürün
```
Kategori: ANA (boş)
Yeni ürün: Cips

Sonuç:
1 - Cips (otomatik sıra 1)
```

### Senaryo 2: Araya Ekleme
```
Mevcut:
1 - Cips
2 - Kola
3 - Fanta

Yeni ürün: Çikolata (sıra 2 seçildi)

Sonuç:
1 - Cips
2 - Çikolata  ← Yeni ürün
3 - Kola      ← Otomatik kaydı
4 - Fanta     ← Otomatik kaydı
```

### Senaryo 3: Sona Ekleme
```
Mevcut:
1 - Cips
2 - Kola

Yeni ürün: Fanta (otomatik sıra 3)

Sonuç:
1 - Cips
2 - Kola
3 - Fanta  ← Otomatik sıra
```

### Senaryo 4: Sıra Değiştirme
```
Mevcut:
1 - Cips
2 - Kola
3 - Çikolata
4 - Fanta

Çikolatayı 1'e taşı:

Sonuç:
1 - Çikolata  ← Buraya taşındı
2 - Cips      ← Otomatik kaydı
3 - Kola      ← Otomatik kaydı
4 - Fanta     ← Değişmedi
```

## 🔧 Kod Örnekleri

### Yeni Ürün Eklerken

```typescript
// ProductForm.tsx
useEffect(() => {
  if (formData.show_in_fast_sale && formData.fast_sale_category_id && !product) {
    // Otomatik sıra numarası al
    loadNextOrderNumber(formData.fast_sale_category_id);
  }
}, [formData.fast_sale_category_id, formData.show_in_fast_sale]);
```

### Form Submit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Sıralamayı güncelle
  if (formData.show_in_fast_sale && formData.fast_sale_category_id) {
    await ProductService.reorderProducts(
      formData.fast_sale_category_id,
      formData.fast_sale_order,
      product?.id
    );
  }
  
  // Ürünü kaydet
  await onSubmit(formData);
};
```

## ✅ Avantajlar

1. **Otomatik**: Kullanıcı sıra numarası düşünmek zorunda değil
2. **Tutarlı**: Sıra numaraları her zaman ardışık
3. **Esnek**: İsterse manuel sıra değiştirebilir
4. **Güvenli**: Çakışma olmaz, her ürün benzersiz sıraya sahip

## 🐛 Sorun Giderme

### Problem: Sıra numarası atanmıyor
**Çözüm**: Kategori seçili mi kontrol edin

### Problem: Sıralar karışık
**Çözüm**: Ürünü düzenleyip kaydedin, otomatik düzelir

### Problem: Aynı sırada iki ürün
**Çözüm**: Sistem bunu otomatik önler, ama olursa ürünleri tek tek düzenleyin

## 📝 Notlar

- Sıra numaraları 1-99 arası olmalıdır
- Her kategori kendi sıralamasına sahiptir
- Ürün silindiğinde sıralar otomatik kapanmaz (boşluk kalır)
- Checkbox kaldırıldığında sıra numarası sıfırlanmaz

## 🚀 Gelecek İyileştirmeler

- [ ] Drag & drop ile sıralama
- [ ] Toplu sıralama düzenleme
- [ ] Silinen ürün sonrası otomatik sıra kapatma
- [ ] Sıralama önizlemesi
- [ ] Kategori değiştiğinde sıra sıfırlama seçeneği
