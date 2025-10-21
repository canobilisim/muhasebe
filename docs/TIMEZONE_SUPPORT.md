# Timezone Support (Saat Dilimi Desteği)

## Genel Bakış

Uygulama, kullanıcıların yerel saat dilimlerini otomatik olarak algılayıp datetime-local input alanlarında doğru tarih/saat gösterimi sağlar.

## Özellikler

### getLocalDateTimeString() Yardımcı Fonksiyonu

**Konum**: `src/pages/CustomerDetailPage.tsx`

```typescript
const getLocalDateTimeString = () => {
    const now = new Date()
    // Timezone offset'ini hesapla ve yerel saate çevir
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    return localDate.toISOString().slice(0, 16)
}
```

### Nasıl Çalışır

1. **Mevcut Zaman**: `new Date()` ile UTC zamanı alır
2. **Offset Hesaplama**: `getTimezoneOffset()` ile kullanıcının saat dilimi farkını dakika cinsinden alır
3. **Yerel Saat Dönüşümü**: Offset'i milisaniyeye çevirerek UTC zamanından çıkarır
4. **Format Dönüşümü**: ISO string formatına çevirip `datetime-local` input için uygun hale getirir

### Kullanım Alanları

#### Müşteri Detay Sayfası - Ödeme Modal
```typescript
// Modal açıldığında otomatik güncel tarih/saat doldurma
useEffect(() => {
    if (showPaymentModal) {
        setPaymentDate(new Date().toISOString().slice(0, 16))
    }
}, [showPaymentModal])

// Ödeme Al butonuna tıklandığında
const handlePaymentButtonClick = () => {
    setShowPaymentModal(true)
    setPaymentDate(getLocalDateTimeString()) // Yerel saat ile doldur
}
```

## Teknik Detaylar

### Timezone Offset Hesaplama

```typescript
// Örnek: Türkiye (UTC+3) için
const now = new Date() // UTC zaman
const offset = now.getTimezoneOffset() // -180 (dakika, negatif çünkü UTC'den ileri)
const localTime = new Date(now.getTime() - (offset * 60000)) // UTC + 3 saat
```

### Format Dönüşümü

```typescript
// ISO string: "2024-10-21T14:30:00.000Z"
// datetime-local format: "2024-10-21T14:30"
return localDate.toISOString().slice(0, 16)
```

## Avantajlar

1. **Otomatik Algılama**: Kullanıcının sistem saat dilimi otomatik algılanır
2. **Doğru Gösterim**: Yerel saat diliminde tarih/saat gösterilir
3. **Kullanıcı Deneyimi**: Manuel tarih girişi gerekliliği azalır
4. **Tutarlılık**: Tüm datetime-local input'larda aynı davranış

## Gelecek Geliştirmeler

### 1. Global Utility Fonksiyonu
```typescript
// src/utils/dateUtils.ts
export const getLocalDateTimeString = () => {
    const now = new Date()
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    return localDate.toISOString().slice(0, 16)
}
```

### 2. Custom Hook
```typescript
// src/hooks/useLocalDateTime.ts
export const useLocalDateTime = () => {
    const [localDateTime, setLocalDateTime] = useState(getLocalDateTimeString())
    
    const refreshDateTime = () => {
        setLocalDateTime(getLocalDateTimeString())
    }
    
    return { localDateTime, refreshDateTime }
}
```

### 3. Timezone Seçimi
```typescript
// Kullanıcının manuel saat dilimi seçimi
interface TimezoneSettings {
    timezone: string // 'Europe/Istanbul', 'America/New_York', etc.
    autoDetect: boolean
}
```

## İlgili Dosyalar

- `src/pages/CustomerDetailPage.tsx` - Ana implementasyon
- `src/pages/pos/FastSalePage.tsx` - Benzer kullanım alanları
- `README.md` - Genel dokümantasyon

## Test Senaryoları

1. **Farklı Saat Dilimleri**: UTC+3, UTC-5, UTC+0 gibi farklı saat dilimlerinde test
2. **Yaz Saati Uygulaması**: DST geçişlerinde doğru çalışma
3. **Gece Yarısı Geçişi**: Gün değişiminde doğru tarih gösterimi
4. **Mobil Cihazlar**: Farklı cihazlarda timezone algılama

## Bilinen Sınırlamalar

1. **Browser Dependency**: Tarayıcının timezone API'sine bağımlı
2. **Manual Override**: Kullanıcı manuel saat dilimi değiştiremez
3. **Server Sync**: Sunucu saati ile senkronizasyon kontrolü yok

## Dokümantasyon Güncellemeleri

- **Son Güncelleme**: 21 Ekim 2024
- **Versiyon**: 1.0.0
- **Durum**: Aktif kullanımda
- **Bakım**: Düzenli güncelleme
