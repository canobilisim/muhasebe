# Çoklu Sepet Sistemi - Test Kılavuzu

## 🎯 Sistem Açıklaması

Hızlı satış ekranında 5 ayrı müşteri sekmesi bulunmaktadır. Her sekme **bağımsız bir sepet** olarak çalışır ve eklenen ürünler birbirine karışmaz.

## 📋 Test Senaryosu

### Adım 1: İlk Müşteri (Müşteri 1)
1. "Müşteri 1" sekmesinde olduğunuzdan emin olun
2. Barkod okutarak veya ürün seçerek sepete ürün ekleyin
3. Örnek: 3 farklı ürün ekleyin

### Adım 2: İkinci Müşteri (Müşteri 2)
1. "Müşteri 2" sekmesine tıklayın
2. Sepet boş olmalı (Müşteri 1'in ürünleri görünmemeli)
3. Farklı ürünler ekleyin
4. Örnek: 2 farklı ürün ekleyin

### Adım 3: Üçüncü Müşteri (Müşteri 3)
1. "Müşteri 3" sekmesine tıklayın
2. Sepet boş olmalı
3. Başka ürünler ekleyin

### Adım 4: Geri Dönüş Testi
1. "Müşteri 1" sekmesine geri dönün
2. İlk eklediğiniz 3 ürün hala orada olmalı
3. "Müşteri 2" sekmesine geçin
4. 2 ürün hala orada olmalı

### Adım 5: Ürün Ekleme/Çıkarma
1. Her sekmede ayrı ayrı:
   - Ürün ekleyin
   - Ürün silin
   - Miktar değiştirin
2. Diğer sekmelere geçip kontrol edin
3. Her sepet kendi ürünlerini korumalı

## 🔍 Kontrol Noktaları

### ✅ Doğru Çalışma
- Her sekme kendi sepetini gösteriyor
- Sekme değiştirince ürünler kaybolmuyor
- Bir sekmeye eklenen ürün diğer sekmelerde görünmüyor
- Her sepet için toplam tutarlar ayrı hesaplanıyor

### ❌ Hatalı Durumlar
- Sekme değiştirince ürünler kayboluyor
- Bir sekmeye eklenen ürün diğer sekmelerde de görünüyor
- Sepetler birbirine karışıyor
- Toplam tutarlar yanlış hesaplanıyor

## 🐛 Debug Logları

Tarayıcı konsolunda (F12) şu logları göreceksiniz:

### Ürün Eklendiğinde
```
Cart updated: {
  activeTab: "tab-1",
  cartIndex: 0,
  itemsCount: 3,
  allCarts: [
    { tabId: "tab-1", items: 3 },
    { tabId: "tab-2", items: 0 },
    ...
  ]
}
```

### Sekme Değiştirildiğinde
```
Switching to tab: tab-2
New cart items: 2
Active cart changed: {
  tabId: "tab-2",
  label: "Müşteri 2",
  itemsCount: 2,
  items: [...]
}
```

## 🎨 Görsel Kontrol

Her sekme için:
- **Sepet Tablosu**: Sadece o sekmenin ürünlerini gösterir
- **Toplam Tutar**: Sadece o sekmenin toplamını gösterir
- **Müşteri Bilgisi**: Her sekme için ayrı müşteri seçilebilir

## 💡 Kullanım Senaryoları

### Senaryo 1: Sıralı Satış
1. Müşteri 1 gelir, ürünlerini eklersiniz
2. Ödeme yapmadan Müşteri 2 gelir
3. Müşteri 2 sekmesine geçip onun ürünlerini eklersiniz
4. Müşteri 1'e geri dönüp ödemesini alırsınız
5. Müşteri 2'ye geçip ödemesini alırsınız

### Senaryo 2: Karşılaştırma
1. Müşteri farklı ürün kombinasyonları görmek istiyor
2. Her sekmede farklı kombinasyon oluşturursunuz
3. Müşteri sekmeler arasında geçiş yaparak fiyatları karşılaştırır
4. Beğendiği kombinasyonu seçer

### Senaryo 3: Bekleyen Satışlar
1. Birden fazla müşteri aynı anda gelir
2. Her müşteri için ayrı sekme kullanırsınız
3. Ürünleri toplarken diğer müşteriler bekler
4. Sırayla ödemeleri alırsınız

## 🔧 Teknik Detaylar

### State Yapısı
```typescript
state.carts = [
  { tabId: 'tab-1', customerLabel: 'Müşteri 1', lines: [...] },
  { tabId: 'tab-2', customerLabel: 'Müşteri 2', lines: [...] },
  { tabId: 'tab-3', customerLabel: 'Müşteri 3', lines: [...] },
  { tabId: 'tab-4', customerLabel: 'Müşteri 4', lines: [...] },
  { tabId: 'tab-5', customerLabel: 'Müşteri 5', lines: [...] },
]
```

### Aktif Sepet (Memoized)
```typescript
const activeCart = useMemo(() => {
  return state.carts.find(
    cart => cart.tabId === state.activeCustomerTab
  ) || state.carts[0];
}, [state.activeCustomerTab, state.carts]);
```

### Ürün Ekleme (Immutable)
```typescript
// Deep copy ile mutation önlenir
const updatedCarts = prev.carts.map((cart, index) => {
  if (index !== activeCartIndex) {
    return cart; // Diğer sepetler değişmez
  }
  
  // Sadece aktif sepetin lines array'i kopyalanır
  const updatedLines = [...cart.lines];
  updatedLines.push(product);
  
  return { ...cart, lines: updatedLines };
});
```

### Yapılan İyileştirmeler

#### 1. Immutable State Updates
- ❌ **Önce**: `updatedCarts[index].lines.push(product)` (Mutation)
- ✅ **Sonra**: `updatedCarts = carts.map(...)` (Immutable)

#### 2. Memoization
- ❌ **Önce**: Her render'da `activeCart` yeniden hesaplanıyor
- ✅ **Sonra**: `useMemo` ile sadece gerektiğinde hesaplanıyor

#### 3. Deep Copy
- ❌ **Önce**: Shallow copy ile nested array'ler paylaşılıyor
- ✅ **Sonra**: Her cart ve lines array'i ayrı kopyalanıyor

## 📝 Sorun Giderme

### Problem: Sepetler karışıyor
**Çözüm**: Console loglarını kontrol edin, `activeTab` değeri doğru mu?

### Problem: Ürünler kayboluyor
**Çözüm**: State güncellemesi doğru yapılıyor mu? `updatedCarts` array'i spread operator ile kopyalanıyor mu?

### Problem: Toplam tutarlar yanlış
**Çözüm**: Her sepet için `calculateCartTotals` çağrılıyor mu?

## ✨ Beklenen Sonuç

Her müşteri sekmesi tamamen bağımsız çalışmalı ve kullanıcı rahatlıkla:
- Birden fazla müşteriyle aynı anda ilgilenebilmeli
- Sekmeler arası geçiş yapabilmeli
- Her sepeti ayrı ayrı yönetebilmeli
- Karışıklık olmadan ödeme alabilmeli
