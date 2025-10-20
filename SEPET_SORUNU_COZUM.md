# Sepet Karışma Sorunu - Çözüm

## 🐛 Sorun

Hızlı satış ekranında:
- Müşteri 1'e ürün ekleniyor
- Müşteri 2'ye geçildiğinde Müşteri 1'in ürünleri görünüyor
- Müşteri 3'e geçildiğinde yine aynı ürünler görünüyor
- Toplam tutarlar değişiyor ama sepet içeriği değişmiyor

## 🔍 Kök Neden

### 1. State Mutation (Ana Sorun)
```typescript
// ❌ YANLIŞ - Array mutation
const updatedCarts = [...prev.carts];
updatedCarts[activeCartIndex].lines.push(product);
```

**Problem**: Shallow copy yapıldığında, `lines` array'i hala aynı referansı gösteriyor. Bu yüzden tüm sepetler aynı `lines` array'ini paylaşıyor!

```typescript
// Shallow copy sonrası:
carts[0].lines === carts[1].lines === carts[2].lines // true! 😱
```

### 2. React Re-render Sorunu
React, state değişikliklerini referans karşılaştırması ile algılar. Eğer array referansı değişmezse, React değişikliği görmez.

## ✅ Çözüm

### 1. Deep Copy ile Immutable Update
```typescript
// ✅ DOĞRU - Immutable update
const updatedCarts = prev.carts.map((cart, index) => {
  if (index !== activeCartIndex) {
    return cart; // Diğer sepetler değişmez
  }
  
  // Aktif sepetin lines array'ini kopyala
  const updatedLines = [...cart.lines];
  updatedLines.push(product);
  
  // Yeni cart objesi döndür
  return {
    ...cart,
    lines: updatedLines
  };
});
```

**Sonuç**: Her sepet kendi `lines` array'ine sahip!
```typescript
carts[0].lines !== carts[1].lines !== carts[2].lines // true! ✅
```

### 2. Memoization ile Performans
```typescript
// ✅ useMemo ile activeCart hesaplama
const activeCart = useMemo(() => {
  return state.carts.find(
    cart => cart.tabId === state.activeCustomerTab
  ) || state.carts[0];
}, [state.activeCustomerTab, state.carts]);
```

**Fayda**: 
- Gereksiz hesaplamalar önlenir
- React doğru zamanda re-render yapar
- Dependency array sayesinde sadece gerektiğinde güncellenir

## 📊 Önce vs Sonra

### Önce (Hatalı)
```
Müşteri 1'e ürün ekle
  ↓
carts[0].lines.push(product) // Mutation!
  ↓
carts[0].lines === carts[1].lines === carts[2].lines
  ↓
Tüm sepetler aynı ürünleri gösterir 😱
```

### Sonra (Doğru)
```
Müşteri 1'e ürün ekle
  ↓
carts = carts.map(...) // Immutable!
  ↓
carts[0].lines !== carts[1].lines !== carts[2].lines
  ↓
Her sepet kendi ürünlerini gösterir ✅
```

## 🎯 Uygulanan Değişiklikler

### 1. addToCart Fonksiyonu
```typescript
// Önce
const updatedCarts = [...prev.carts];
updatedCarts[activeCartIndex].lines.push(product);

// Sonra
const updatedCarts = prev.carts.map((cart, index) => {
  if (index !== activeCartIndex) return cart;
  
  const updatedLines = [...cart.lines];
  updatedLines.push(product);
  
  return { ...cart, lines: updatedLines };
});
```

### 2. removeFromCart Fonksiyonu
```typescript
// Önce
const updatedCarts = [...prev.carts];
updatedCarts[activeCartIndex].lines = 
  updatedCarts[activeCartIndex].lines.filter(...);

// Sonra
const updatedCarts = prev.carts.map((cart, index) => {
  if (index !== activeCartIndex) return cart;
  
  const updatedLines = cart.lines.filter(...);
  
  return { ...cart, lines: updatedLines };
});
```

### 3. activeCart Hesaplama
```typescript
// Önce
const activeCart = state.carts.find(...) || state.carts[0];

// Sonra
const activeCart = useMemo(() => {
  return state.carts.find(...) || state.carts[0];
}, [state.activeCustomerTab, state.carts]);
```

## 🧪 Test Senaryosu

1. **Müşteri 1'e ürün ekle**
   - Console: "Cart updated: { activeTab: 'tab-1', items: 1 }"
   - Sepet: 1 ürün görünür

2. **Müşteri 2'ye geç**
   - Console: "Switching to tab: tab-2"
   - Console: "Active cart recalculated: { items: 0 }"
   - Sepet: Boş görünür ✅

3. **Müşteri 2'ye ürün ekle**
   - Console: "Cart updated: { activeTab: 'tab-2', items: 1 }"
   - Sepet: 1 ürün görünür

4. **Müşteri 1'e geri dön**
   - Console: "Switching to tab: tab-1"
   - Console: "Active cart recalculated: { items: 1 }"
   - Sepet: İlk eklenen ürün görünür ✅

## 💡 React Best Practices

### Immutability Kuralları
1. ✅ Spread operator kullan: `[...array]`, `{...object}`
2. ✅ Array metodları: `map`, `filter`, `reduce`
3. ❌ Mutation yapma: `push`, `splice`, `sort`
4. ❌ Direkt atama: `obj.prop = value`

### State Update Patterns
```typescript
// ✅ DOĞRU
setState(prev => ({
  ...prev,
  array: prev.array.map(item => 
    item.id === id ? { ...item, updated: true } : item
  )
}));

// ❌ YANLIŞ
setState(prev => {
  prev.array[0].updated = true; // Mutation!
  return prev;
});
```

## 🎉 Sonuç

Artık her müşteri sekmesi tamamen bağımsız çalışıyor:
- ✅ Her sepet kendi ürünlerini tutuyor
- ✅ Sekmeler arası geçiş sorunsuz
- ✅ React doğru zamanda re-render yapıyor
- ✅ Performans optimize edildi (useMemo)
- ✅ Kod daha maintainable ve bug-free

## 📚 Öğrenilen Dersler

1. **Shallow Copy Tehlikesi**: Spread operator sadece ilk seviyeyi kopyalar
2. **Immutability Önemi**: React state'i asla mutate etmeyin
3. **Memoization Faydası**: Gereksiz hesaplamaları önler
4. **Debug Logging**: Console.log ile sorunları tespit edin
5. **React DevTools**: State değişikliklerini görselleştirin
