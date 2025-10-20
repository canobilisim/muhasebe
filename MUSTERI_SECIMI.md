# Müşteri Seçimi Sistemi

## Özellikler

Hızlı satış ekranına müşteri seçme ve takip sistemi eklendi.

## Yapılan Değişiklikler

### 1. Müşteri Arama
**Dosya:** `src/pages/pos/FastSalePage.tsx`

#### Özellikler:
- **Canlı Arama**: Kullanıcı yazarken otomatik arama yapılıyor
- **Minimum 2 Karakter**: Performans için minimum 2 karakter gerekli
- **Ad veya Telefon**: Hem ad hem telefon numarasıyla arama yapılabiliyor
- **Dropdown Sonuçlar**: Arama sonuçları dropdown'da gösteriliyor
- **Hızlı Seçim**: Müşteriye tıklayarak seçim yapılıyor

### 2. Müşteri Bilgileri Gösterimi

#### Dropdown'da Gösterilen Bilgiler:
- Müşteri adı (kalın yazı)
- Telefon numarası
- Mevcut borç (varsa kırmızı renkte)

#### Seçili Müşteri Kartı:
- Mavi arka planlı bilgi kartı
- Müşteri adı ve telefonu
- Mevcut borç bilgisi
- Temizle butonu

### 3. Müşteri Limiti ve Bakiye

#### Gösterilen Bilgiler:
- **Limit**: Müşterinin kredi limiti
- **Kalan**: Kullanılabilir kredi (Limit - Mevcut Borç)
- Gerçek zamanlı güncelleme

### 4. Sekme Bazlı Müşteri Yönetimi

Her sekme (Müşteri 1-5) için:
- Ayrı müşteri seçimi
- Ayrı limit ve bakiye takibi
- Sekme etiketi müşteri adıyla güncelleniyor

## Kullanım

### Müşteri Arama ve Seçme:
1. Müşteri arama kutusuna ad veya telefon yazın (min 2 karakter)
2. Dropdown'dan müşteri seçin
3. Müşteri bilgileri mavi kartta gösterilir
4. Sekme etiketi müşteri adıyla güncellenir

### Müşteri Temizleme:
1. "Temizle" butonuna tıklayın
2. Müşteri seçimi kaldırılır
3. Sekme etiketi varsayılan isme döner (Müşteri 1, 2, vb.)

### Limit ve Bakiye Kontrolü:
- Seçili müşterinin limit ve kalan bakiyesi alt kısımda gösterilir
- Borçlu müşteriler kırmızı renkte vurgulanır
- Açık hesap satışlarında limit kontrolü yapılabilir

## UI Bileşenleri

### Müşteri Arama Input'u
```tsx
<Input
  placeholder="Müşteri ara (ad veya telefon)..."
  value={customerSearchQuery}
  onChange={(e) => handleCustomerSearch(e.target.value)}
/>
```

### Müşteri Dropdown
- Otomatik açılma/kapanma
- Dışarı tıklandığında kapanıyor
- Loading spinner gösterimi
- Hover efekti

### Seçili Müşteri Kartı
- Mavi arka plan
- Müşteri bilgileri
- Borç gösterimi (varsa)
- Temizle butonu

## Backend Entegrasyonu

### CustomerService Kullanımı
**Dosya:** `src/services/customerService.ts`

#### Kullanılan Metodlar:
- `searchCustomers(query)`: Müşteri arama
  - Ad veya telefona göre arama
  - Maksimum 10 sonuç
  - Sadece aktif müşteriler

### Veri Yapısı:
```typescript
interface Customer {
  id: string
  name: string
  phone: string | null
  current_balance: number | null
  credit_limit: number | null
}
```

## State Yönetimi

### Müşteri State'leri:
```typescript
const [customers, setCustomers] = useState([])
const [customerSearchQuery, setCustomerSearchQuery] = useState('')
const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
const [selectedCustomers, setSelectedCustomers] = useState({
  'tab-1': null,
  'tab-2': null,
  'tab-3': null,
  'tab-4': null,
  'tab-5': null,
})
```

### POS State Güncellemeleri:
```typescript
setState(prev => ({
  ...prev,
  limit: customer.credit_limit || 0,
  remaining: (customer.credit_limit || 0) - (customer.current_balance || 0),
}))
```

## Fonksiyonlar

### handleCustomerSearch(query)
- Müşteri arama işlemi
- Minimum 2 karakter kontrolü
- Otomatik dropdown açma
- Loading state yönetimi

### selectCustomer(customer)
- Müşteri seçme işlemi
- State güncelleme
- Sekme etiketi güncelleme
- Limit ve bakiye hesaplama
- Toast mesajı gösterme

### clearCustomer()
- Müşteri seçimini temizleme
- State sıfırlama
- Sekme etiketini varsayılana döndürme
- Toast mesajı gösterme

## Kullanıcı Deneyimi

### ✅ Avantajlar:
- Hızlı müşteri arama
- Canlı arama sonuçları
- Görsel geri bildirim (mavi kart)
- Borç takibi
- Limit kontrolü
- Kolay temizleme
- Sekme bazlı yönetim

### 🎨 Tasarım:
- Responsive tasarım
- Mobil uyumlu
- Hover efektleri
- Loading göstergeleri
- Renk kodlaması (borç için kırmızı)
- Temiz ve modern arayüz

## Hızlı Müşteri Ekleme

### Özellikler:
- **+ Yeni Butonu**: Müşteri seçilmediğinde görünür
- **Hızlı Form**: Sadece gerekli alanlar
- **Otomatik Seçim**: Kaydedildiğinde müşteri otomatik seçilir
- **Validasyon**: Form doğrulama ve hata mesajları

### Form Alanları:
- **Müşteri Adı** (Zorunlu)
- **Telefon** (Opsiyonel, format kontrolü)
- **E-posta** (Opsiyonel, format kontrolü)
- **Adres** (Opsiyonel)
- **Kredi Limiti** (Opsiyonel, varsayılan 0)

### Kullanım:
1. Müşteri arama kutusunun yanındaki "+ Yeni" butonuna tıklayın
2. Müşteri bilgilerini girin
3. "Kaydet ve Seç" butonuna tıklayın
4. Müşteri otomatik olarak seçilir ve satışa hazır olur

## Gelecek İyileştirmeler

### Potansiyel Eklemeler:
1. ✅ **Hızlı Müşteri Ekleme**: Dropdown'dan yeni müşteri ekleme (TAMAMLANDI)
2. **Müşteri Detayları**: Müşteriye tıklayınca detaylı bilgi gösterme
3. **Favori Müşteriler**: Sık kullanılan müşterileri üstte gösterme
4. **Müşteri Geçmişi**: Önceki alışverişleri gösterme
5. **Limit Uyarısı**: Limit aşımında uyarı gösterme
6. **Otomatik Tamamlama**: Daha akıllı arama önerileri
7. **Barkod ile Müşteri**: Müşteri kartı barkodu okutma
8. **Müşteri Notları**: Özel notlar ekleme/görüntüleme

## Örnek Kullanım Senaryoları

### Senaryo 1: Normal Müşteri Seçimi
```
1. Kullanıcı "ahmet" yazar
2. Dropdown'da "Ahmet Yılmaz" görünür
3. Müşteriye tıklar
4. Mavi kartta müşteri bilgileri gösterilir
5. Satış işlemine devam edilir
```

### Senaryo 2: Borçlu Müşteri
```
1. Kullanıcı "555" yazar
2. Dropdown'da müşteri ve borç bilgisi görünür
3. Müşteri seçilir
4. Mavi kartta borç kırmızı renkte gösterilir
5. Limit ve kalan bakiye güncellenir
6. Açık hesap satışında limit kontrolü yapılır
```

### Senaryo 3: Çoklu Sekme Kullanımı
```
1. Sekme 1'de "Ahmet Yılmaz" seçilir
2. Sekme 2'ye geçilir
3. "Mehmet Demir" seçilir
4. Her sekme kendi müşterisini tutar
5. Sekmeler arası geçişte müşteri bilgileri korunur
```

### Senaryo 4: Müşteri Değiştirme
```
1. "Ahmet Yılmaz" seçili
2. "Temizle" butonuna tıklanır
3. Müşteri seçimi kaldırılır
4. Yeni müşteri aranır ve seçilir
5. Bilgiler güncellenir
```

### Senaryo 5: Hızlı Müşteri Ekleme
```
1. Müşteri arama kutusunun yanında "+ Yeni" butonu görünür
2. Butona tıklanır
3. Hızlı müşteri ekleme modalı açılır
4. Müşteri bilgileri girilir (Ad zorunlu)
5. "Kaydet ve Seç" butonuna tıklanır
6. Müşteri oluşturulur ve otomatik seçilir
7. Satışa devam edilir
```

## Notlar

- Müşteri arama minimum 2 karakter gerektirir
- Sadece aktif müşteriler aranır
- Maksimum 10 sonuç gösterilir
- Her sekme bağımsız müşteri tutabilir
- Dropdown dışarı tıklandığında otomatik kapanır
- Borç bilgisi kırmızı renkte vurgulanır
- Limit ve bakiye gerçek zamanlı güncellenir
