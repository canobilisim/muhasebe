# Personel Yönetimi Sistemi

## Genel Bakış

Personel yönetimi modülü, işletmenin çalışanlarının bilgilerini, maaş ödemelerini ve avans takibini yönetmek için geliştirilmiştir.

## Veritabanı Yapısı

### 1. personnel (Personel Tablosu)

Personel temel bilgilerini içerir:

- **Kişisel Bilgiler**: Ad, soyad, TC kimlik, doğum tarihi, telefon, e-posta
- **İş Bilgileri**: Pozisyon, departman, işe başlama tarihi, işten ayrılma tarihi, aylık maaş
- **Adres Bilgileri**: İl, ilçe, adres
- **Banka Bilgileri**: Banka adı, IBAN
- **Durum**: Aktif/Pasif

### 2. personnel_salaries (Maaş Ödemeleri)

Personele yapılan maaş ödemelerini takip eder:

- **Dönem Bilgisi**: Ay ve yıl
- **Maaş Detayları**: Brüt maaş, prim, kesintiler, avans kesintisi, net tutar
- **Ödeme Bilgisi**: Ödeme tipi (nakit/banka), ödeme tarihi, ödeme numarası
- **Unique Constraint**: Aynı personele aynı dönem için birden fazla maaş ödemesi yapılamaz

### 3. personnel_advances (Avans Ödemeleri)

Personele verilen avansları takip eder:

- **Avans Bilgisi**: Tutar, kalan tutar, sebep
- **Ödeme Bilgisi**: Ödeme tipi, ödeme tarihi, avans numarası
- **Durum**: Geri ödenme durumu (is_paid_back)

## Özellikler

### Personel Yönetimi

1. **Personel Listesi** (`/personnel` veya `/personnel/list`)
   - Tüm personellerin listesi
   - Arama ve filtreleme
   - Özet istatistikler (toplam personel, toplam maaş, toplam avans)
   - Aktif/Pasif durum gösterimi

2. **Yeni Personel Ekleme** (`/personnel/new`)
   - Kişisel bilgiler formu
   - İş bilgileri
   - Adres bilgileri
   - Banka bilgileri
   - Form validasyonu (TC kimlik 11 haneli, e-posta formatı vb.)

3. **Personel Detay** (`/personnel/:id`)
   - Üç sekmeli görünüm:
     - **Genel Bilgiler**: Tüm personel bilgileri
     - **Maaş Ödemeleri**: Geçmiş maaş ödemeleri listesi
     - **Avans Ödemeleri**: Geçmiş avans ödemeleri listesi

### Maaş Yönetimi

1. **Maaş Ödeme Modalı**
   - Dönem seçimi (ay/yıl)
   - Brüt maaş (personelin kayıtlı maaşı otomatik gelir)
   - Prim/Ek ödemeler
   - Kesintiler (SGK, vergi vb.)
   - Avans kesintisi
   - Net tutar otomatik hesaplanır
   - Ödeme tipi seçimi (nakit/banka havalesi)
   - Otomatik ödeme numarası: `MAAS-YYYYMMDD-XXXXXX`

2. **Maaş Geçmişi**
   - Dönem bazlı listeleme (en yeni en üstte)
   - Detaylı ödeme bilgileri
   - Toplam ödeme istatistikleri
   - Son ödeme bilgisi
   - Ortalama ödeme hesabı

### Avans Yönetimi

1. **Avans Verme Modalı**
   - Avans tutarı
   - Ödeme tipi (nakit/banka havalesi)
   - Avans sebebi
   - Notlar
   - Otomatik avans numarası: `AVANS-YYYYMMDD-XXXXXX`
   - Kalan tutar başlangıçta verilen tutara eşit

2. **Avans Takibi**
   - Toplam verilen avans
   - Kalan borç
   - Ödenen tutar
   - Ödeme oranı (%)
   - Avans durumu (Ödendi/Devam Ediyor)

## API Servisleri

### personnelService.ts

```typescript
// Personel İşlemleri
getPersonnel(branchId: string): Promise<PersonnelWithStats[]>
getPersonnelById(id: string): Promise<Personnel>
createPersonnel(personnel: PersonnelInsert): Promise<Personnel>
updatePersonnel(id: string, personnel: PersonnelUpdate): Promise<Personnel>
deletePersonnel(id: string): Promise<void>

// Maaş İşlemleri
getPersonnelSalaries(personnelId: string): Promise<PersonnelSalary[]>
createSalaryPayment(salary: PersonnelSalaryInsert): Promise<PersonnelSalary>

// Avans İşlemleri
getPersonnelAdvances(personnelId: string): Promise<PersonnelAdvance[]>
createAdvancePayment(advance: PersonnelAdvanceInsert): Promise<PersonnelAdvance>
updateAdvance(id: string, remaining_amount: number): Promise<PersonnelAdvance>
```

## Güvenlik

### RLS (Row Level Security) Politikaları

Tüm tablolarda RLS aktif ve şube bazlı veri izolasyonu sağlanmıştır:

```sql
-- Kullanıcılar sadece kendi şubelerindeki personelleri görebilir
CREATE POLICY "Users can view personnel in their branch"
  ON personnel FOR SELECT
  USING (branch_id IN (SELECT branch_id FROM users WHERE id = auth.uid()));

-- Benzer politikalar INSERT, UPDATE, DELETE için de mevcuttur
```

### Yetkilendirme

- **Admin ve Manager**: Tüm personel işlemlerine erişim
- **Cashier**: Personel modülüne erişim yok

## Kullanım Senaryoları

### 1. Yeni Personel İşe Alımı

1. `/personnel/new` sayfasına git
2. Personel bilgilerini doldur
3. Kaydet
4. Personel otomatik olarak aktif durumda oluşturulur

### 2. Aylık Maaş Ödemesi

1. Personel detay sayfasına git
2. "Maaş Öde" butonuna tıkla
3. Dönem seçimi yap (ay/yıl)
4. Brüt maaş otomatik gelir, gerekirse düzenle
5. Prim, kesinti ve avans kesintisi ekle
6. Net tutar otomatik hesaplanır
7. Ödeme tipini seç ve kaydet
8. Sistem otomatik ödeme numarası oluşturur

### 3. Avans Verme

1. Personel detay sayfasına git
2. "Avans Ver" butonuna tıkla
3. Avans tutarını gir
4. Ödeme tipini seç
5. Sebep ve notları ekle
6. Kaydet
7. Sistem otomatik avans numarası oluşturur
8. Kalan tutar başlangıçta verilen tutara eşit olur

### 4. Avans Kesintisi

1. Maaş ödemesi yaparken "Avans Kesintisi" alanına tutar gir
2. Bu tutar net maaştan düşülür
3. İleride avans takibi için manuel güncelleme yapılabilir

## Önemli Notlar

1. **Unique Constraints**:
   - TC Kimlik numarası benzersiz olmalı
   - Aynı personele aynı dönem için birden fazla maaş ödemesi yapılamaz
   - Ödeme ve avans numaraları benzersizdir

2. **Otomatik Numaralandırma**:
   - Maaş ödemeleri: `MAAS-20241205-000001`
   - Avans ödemeleri: `AVANS-20241205-000001`
   - Format: `TIP-YYYYMMDD-SIRA`

3. **Hesaplamalar**:
   - Net Maaş = Brüt Maaş + Prim - Kesintiler - Avans Kesintisi
   - Ödeme Oranı = (Ödenen Avans / Toplam Avans) * 100

4. **Veri Bütünlüğü**:
   - Personel silindiğinde ilişkili maaş ve avans kayıtları da silinir (CASCADE)
   - Şube bazlı veri izolasyonu RLS ile sağlanır

## Gelecek Geliştirmeler

- [ ] Personel düzenleme sayfası
- [ ] Toplu maaş ödeme özelliği
- [ ] Avans geri ödeme takibi otomasyonu
- [ ] Personel performans değerlendirme
- [ ] İzin ve devamsızlık takibi
- [ ] Bordro raporu oluşturma
- [ ] E-posta ile maaş bordrosu gönderme
- [ ] Excel'e aktarma/içe aktarma
