# Müşteri Aktif/Pasif Durumu Özelliği

## Genel Bakış
Müşterilerin aktif veya pasif durumda işaretlenmesini sağlayan özellik eklendi. Pasif müşteriler ile açık hesap satış yapılamaz ve seçildiğinde kullanıcıya uyarı verilir.

## Özellikler

### 1. Müşteri Ekleme
- Yeni müşteri eklenirken otomatik olarak **aktif** durumda oluşturulur
- QuickCustomerModal ve CustomerForm her ikisi de yeni müşterileri aktif olarak kaydeder

### 2. Müşteri Düzenleme
- Müşteri düzenleme modalında (CustomerForm) aktif/pasif checkbox'ı bulunur
- Checkbox sadece düzenleme modunda görünür (yeni müşteri eklerken görünmez)
- Açıklama metni: "Pasif müşteriler hızlı satış ekranında seçildiğinde uyarı verilir ve açık hesap satış yapılamaz."

### 3. Müşteri Listesi
- CustomerTable'da müşteri durumu badge olarak gösterilir
- Aktif müşteriler: Yeşil "Aktif" badge
- Pasif müşteriler: Gri "Pasif" badge

### 4. Müşteri Detay Sayfası
- Müşteri detay sayfasında durum kartı bulunur
- Aktif/pasif durumu görsel olarak gösterilir

### 5. Hızlı Satış Ekranı

#### Müşteri Arama
- Müşteri arama sonuçlarında pasif müşteriler:
  - Gri arka plan ile vurgulanır
  - "Pasif" etiketi gösterilir
- Arama sonuçları aktif müşterileri önce gösterir

#### Müşteri Seçimi
Pasif bir müşteri seçildiğinde:
1. Özel bir onay modalı gösterilir
2. Modal içeriği:
   - Başlık: "Müşteri Pasif Durumda" (uyarı ikonu ile)
   - Müşteri adı vurgulanır
   - Sarı arka planlı uyarı kutusu: "Pasif müşteriler ile açık hesap (veresiye) satış yapılamaz"
   - İki seçenek açıklaması gösterilir
3. İki buton sunulur:
   - **Pasif Kalsın**: Müşteri pasif kalır ancak seçilir (açık hesap satış yapılamaz)
   - **Aktif Et** (yeşil): Müşteri otomatik olarak aktif edilir ve seçilir

#### Açık Hesap Satış Kontrolü
- Açık hesap (veresiye) satış yaparken pasif müşteri kontrolü yapılır
- Pasif müşteri ile açık hesap satış yapılamaz
- Hata mesajı: "Pasif müşteri ile açık hesap satış yapılamaz!"

## Teknik Detaylar

### Veritabanı
- `customers` tablosunda `is_active` kolonu zaten mevcut
- Tip: `boolean`
- Varsayılan değer: `true`

### Değiştirilen Dosyalar

1. **src/components/customers/CustomerForm.tsx**
   - Checkbox bileşeni eklendi
   - Form state'ine `is_active` eklendi
   - Sadece düzenleme modunda checkbox gösteriliyor

2. **src/pages/pos/FastSalePage.tsx**
   - `selectCustomer` fonksiyonu async yapıldı ve modal kontrolü eklendi
   - `handleInactiveCustomerConfirm` fonksiyonu eklendi (modal onay işlemi)
   - `completeCustomerSelection` fonksiyonu eklendi (müşteri seçimini tamamlama)
   - Pasif müşteri onay modalı eklendi (AlertTriangle ikonu ile)
   - Açık hesap satış kontrolüne pasif müşteri kontrolü eklendi
   - Müşteri dropdown'ında pasif müşteriler görsel olarak işaretlendi
   - Customer state'lerine `is_active` alanı eklendi
   - Modal state'leri eklendi: `showInactiveCustomerModal`, `pendingInactiveCustomer`

3. **src/services/customerService.ts**
   - `searchCustomers` fonksiyonu tüm müşterileri döndürüyor
   - Aktif müşteriler önce sıralanıyor

### Kullanılan Bileşenler
- `@/components/ui/checkbox`: Radix UI checkbox bileşeni
- `@/components/ui/badge`: Durum gösterimi için
- `@/components/ui/dialog`: Pasif müşteri onay modalı için
- `lucide-react/AlertTriangle`: Uyarı ikonu

## Kullanım Senaryoları

### Senaryo 1: Müşteri Pasife Çekme
1. Müşteri listesinden müşteriyi seç
2. Düzenle butonuna tıkla
3. "Müşteri Aktif" checkbox'ını kaldır
4. Kaydet

### Senaryo 2: Pasif Müşteri ile Satış
1. Hızlı satış ekranında pasif müşteri ara
2. Pasif müşteri "Pasif" etiketi ile gösterilir (gri arka plan)
3. Müşteriyi seç
4. Özel onay modalı açılır:
   - Uyarı ikonu ve başlık gösterilir
   - Açık hesap satış yapılamayacağı belirtilir
   - İki seçenek detaylı açıklanır
5. "Aktif Et" seçilirse müşteri aktif edilir ve seçilir
6. "Pasif Kalsın" seçilirse müşteri pasif kalır ancak seçilir

### Senaryo 3: Pasif Müşteri ile Açık Hesap
1. Pasif müşteri seçili
2. Açık hesap ödeme seçeneği seçilir
3. Hata mesajı gösterilir
4. Satış tamamlanamaz

## Test Edilmesi Gerekenler

- [ ] Yeni müşteri ekleme (otomatik aktif)
- [ ] Müşteri düzenleme (aktif/pasif değiştirme)
- [ ] Müşteri listesinde durum gösterimi
- [ ] Hızlı satış ekranında pasif müşteri arama
- [ ] Pasif müşteri seçimi ve aktif etme
- [ ] Pasif müşteri ile açık hesap satış engelleme
- [ ] Aktif müşteri ile normal satış akışı
