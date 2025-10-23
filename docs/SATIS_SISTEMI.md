# Satış Sistemi Dokümantasyonu

## 🎯 Genel Bakış

Hızlı satış ekranında 4 farklı ödeme yöntemi bulunmaktadır:
1. **Nakit** (F8) - Yeşil
2. **POS** (F9) - Mavi
3. **Açık Hesap** (F10) - Sarı
4. **Parçalı** - Mor (Yeni!)

## 💳 Ödeme Yöntemleri

### 1. Nakit Ödeme
- Tüm tutar nakit olarak alınır
- Kasa hareketine "Satış - Nakit" olarak kaydedilir
- Stok otomatik güncellenir

### 2. POS Ödeme
- Tüm tutar kredi kartı ile alınır
- Kasa hareketine "Satış - POS" olarak kaydedilir
- Stok otomatik güncellenir

### 3. Açık Hesap
- **Müşteri seçimi zorunludur!**
- Tüm tutar müşterinin hesabına borç olarak yazılır
- Müşterinin `current_balance` alanı güncellenir
- Ödeme durumu: `pending`
- Stok otomatik güncellenir

### 4. Parçalı Ödeme (YENİ!)
- Nakit, POS ve Açık Hesap kombinasyonu
- Modal açılır ve kullanıcı tutarları girer
- **Otomatik Hesaplama**: Nakit ve POS girildiğinde kalan tutar otomatik olarak Açık Hesap'a yazılır
- Açık hesap varsa müşteri seçimi zorunludur
- Her ödeme türü ayrı ayrı kaydedilir

## 🔄 Parçalı Ödeme Akışı

### Adım 1: Butona Tıklama
```
Kullanıcı "PARÇALI" butonuna tıklar
  ↓
Modal açılır
  ↓
Toplam tutar gösterilir
```

### Adım 2: Tutar Girişi
```
Nakit: 100 ₺ girilir
  ↓
POS: 50 ₺ girilir
  ↓
Açık Hesap: Otomatik hesaplanır (Toplam - Nakit - POS)
```

### Adım 3: Kayıt
```
Onayla butonuna tıklanır
  ↓
Satış kaydı oluşturulur
  ↓
Kasa hareketleri kaydedilir (Nakit + POS)
  ↓
Müşteri bakiyesi güncellenir (Açık Hesap varsa)
  ↓
Stok güncellenir
  ↓
Sepet temizlenir
```

## 📊 Veritabanı İşlemleri

### Sales Tablosu
```typescript
{
  sale_number: "202501201234",  // Otomatik oluşturulur
  customer_id: "uuid",           // Müşteri ID (opsiyonel)
  user_id: "uuid",               // Satışı yapan kullanıcı
  branch_id: "uuid",             // Şube ID
  total_amount: 1000,            // Brüt tutar
  discount_amount: 50,           // İndirim tutarı
  net_amount: 950,               // Net tutar
  payment_type: "partial",       // cash | pos | credit | partial
  payment_status: "pending",     // paid | pending | overdue
  paid_amount: 150,              // Ödenen tutar
  change_amount: 0,              // Para üstü
}
```

### Sale Items Tablosu
```typescript
{
  sale_id: "uuid",
  product_id: "uuid",
  quantity: 2,
  unit_price: 100,
  discount_amount: 10,
  total_amount: 190,
}
```

### Cash Movements Tablosu
```typescript
// Nakit ödeme varsa
{
  movement_type: "sale",
  amount: 100,
  description: "Satış - Nakit (3 ürün)",
  sale_id: "uuid",
}

// POS ödeme varsa
{
  movement_type: "sale",
  amount: 50,
  description: "Satış - POS (3 ürün)",
  sale_id: "uuid",
}
```

### Customers Tablosu
```typescript
// Açık hesap varsa
{
  current_balance: current_balance + credit_amount
}
```

## 🎨 Parçalı Ödeme Modal

### Görünüm
```
┌─────────────────────────────────┐
│      Parçalı Ödeme              │
├─────────────────────────────────┤
│  Toplam Tutar: 950.00 ₺         │
│                                  │
│  💵 Nakit                        │
│  [___________] ₺                 │
│                                  │
│  💳 POS                          │
│  [___________] ₺                 │
│                                  │
│  📄 Açık Hesap (Otomatik)       │
│  [___________] ₺ (disabled)      │
│                                  │
│  Toplam Ödeme: 950.00 ₺ ✓       │
│                                  │
│  [İptal]  [Onayla]              │
└─────────────────────────────────┘
```

### Özellikler
- ✅ Otomatik hesaplama
- ✅ Gerçek zamanlı doğrulama
- ✅ Görsel geri bildirim (yeşil/kırmızı)
- ✅ Disabled açık hesap alanı
- ✅ Responsive tasarım

## 🔐 Güvenlik ve Validasyon

### Kontroller
1. **Sepet Kontrolü**: Sepette ürün var mı?
2. **Müşteri Kontrolü**: Açık hesap varsa müşteri seçili mi?
3. **Tutar Kontrolü**: Toplam ödeme = Satış tutarı mı?
4. **Kullanıcı Kontrolü**: Oturum açık mı?
5. **Şube Kontrolü**: Kullanıcının şubesi var mı?

### Hata Mesajları
- "Sepette ürün yok!"
- "Açık hesap için müşteri seçmelisiniz!"
- "Toplam ödeme tutarı ile satış tutarı eşleşmiyor!"
- "Kullanıcı oturumu bulunamadı"
- "Şube bilgisi bulunamadı"

## 📝 Kullanım Örnekleri

### Örnek 1: Tam Nakit
```
Sepet: 3 ürün, 950 ₺
Ödeme: Nakit butonuna tıkla
Sonuç: 950 ₺ nakit olarak kaydedilir
```

### Örnek 2: Tam Açık Hesap
```
Sepet: 3 ürün, 950 ₺
Müşteri: Ahmet Yılmaz seçili
Ödeme: Açık Hesap butonuna tıkla
Sonuç: 950 ₺ müşterinin borcuna eklenir
```

### Örnek 3: Parçalı (Nakit + POS)
```
Sepet: 3 ürün, 950 ₺
Ödeme: Parçalı butonuna tıkla
Modal: Nakit 500 ₺, POS 450 ₺
Sonuç: 
  - 500 ₺ nakit
  - 450 ₺ POS
  - 0 ₺ açık hesap
```

### Örnek 4: Parçalı (Nakit + Açık Hesap)
```
Sepet: 3 ürün, 950 ₺
Müşteri: Mehmet Demir seçili
Ödeme: Parçalı butonuna tıkla
Modal: Nakit 200 ₺
Sonuç: 
  - 200 ₺ nakit
  - 0 ₺ POS
  - 750 ₺ açık hesap (otomatik)
```

### Örnek 5: Parçalı (Üçlü Kombinasyon)
```
Sepet: 3 ürün, 1000 ₺
Müşteri: Ayşe Kaya seçili
Ödeme: Parçalı butonuna tıkla
Modal: Nakit 300 ₺, POS 400 ₺
Sonuç: 
  - 300 ₺ nakit
  - 400 ₺ POS
  - 300 ₺ açık hesap (otomatik)
```

## 🚀 Performans

### Optimizasyonlar
- ✅ Tek transaction ile tüm işlemler
- ✅ Batch insert ile sale items
- ✅ Async/await ile non-blocking
- ✅ Loading state ile UX iyileştirmesi
- ✅ Otomatik sepet temizleme

### İşlem Süresi
- Ortalama: ~500ms
- Maksimum: ~1000ms (çok ürünlü satışlar)

## 🐛 Sorun Giderme

### Problem: "Müşteri seçmelisiniz" hatası
**Çözüm**: Açık hesap veya parçalı ödemede açık hesap varsa müşteri seçin

### Problem: Satış kaydedilmiyor
**Çözüm**: Console'u kontrol edin, hata mesajlarını inceleyin

### Problem: Stok güncellenmiyor
**Çözüm**: Ürünlerin `stock_quantity` alanı var mı kontrol edin

### Problem: Müşteri bakiyesi güncellenmiyor
**Çözüm**: Müşteri ID'si doğru mu kontrol edin

## 📚 İlgili Dosyalar

- `src/services/saleService.ts` - Satış servisi
- `src/components/pos/SplitPaymentModal.tsx` - Parçalı ödeme modalı
- `src/pages/pos/FastSalePage.tsx` - Ana satış ekranı
- `src/types/database.ts` - Veritabanı tipleri

## ✨ Gelecek İyileştirmeler

- [ ] Fiş yazdırma entegrasyonu
- [ ] Satış iptal/iade işlemleri
- [ ] Satış geçmişi görüntüleme
- [ ] Günlük satış raporu
- [ ] Müşteri borç takibi
- [ ] SMS/Email bildirim
- [ ] Barkod yazıcı desteği
