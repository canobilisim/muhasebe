# Implementation Plan

Bu görev listesi, gelişmiş ürün yönetimi ve satış sistemi özelliklerinin adım adım implementasyonunu içerir. Her görev, bir önceki göreve dayanır ve kod entegrasyonu sağlanarak ilerler.

## Database Setup

- [x] 1. Veritabanı tablolarını oluştur









  - Supabase MCP kullanarak migration'ları uygula
  - products tablosuna yeni kolonlar ekle (brand, model, color, serial_number, condition, serial_number_tracking_enabled)
  - product_serial_numbers tablosunu oluştur
  - sales tablosunu oluştur
  - sale_items tablosunu oluştur
  - api_settings tablosunu oluştur
  - Gerekli indexleri ve foreign key'leri ekle
  - _Requirements: 12, 20, 32, 39_

- [x] 1.1 TypeScript tiplerini güncelle


  - Supabase MCP generate_typescript_types tool kullan
  - src/types/product.ts dosyasını güncelle
  - src/types/sales.ts dosyasını oluştur
  - src/types/invoice.ts dosyasını oluştur
  - SerialNumber, Sale, SaleItem, ApiSettings interface'lerini ekle
  - _Requirements: 12, 20, 32, 39_

## Product Management - Core Features

- [x] 2. Ürün servislerini güncelle






  - src/services/productService.ts dosyasını güncelle
  - Teknik özellikler alanlarını ekle (brand, model, color, condition)
  - Seri numarası takibi flag'ini ekle
  - _Requirements: 7, 21_

- [x] 2.1 Seri numarası servisini oluştur


  - src/services/serialNumberService.ts dosyasını oluştur
  - addSerialNumber fonksiyonunu implement et
  - bulkAddSerialNumbers fonksiyonunu implement et
  - removeSerialNumber fonksiyonunu implement et
  - getAvailableSerialNumbers fonksiyonunu implement et
  - reserveSerialNumber fonksiyonunu implement et
  - markSerialNumberAsSold fonksiyonunu implement et
  - Duplicate kontrolü ekle
  - _Requirements: 16, 17, 18, 19, 20_

## Product Management - UI Components
-

- [x] 3. KDV hesaplama componentlerini oluştur







  - src/components/products/VatRateSelector.tsx oluştur
  - Standart oranlar (0%, 1%, 10%, 20%) için butonlar ekle
  - Özel oran girişi için input ekle
  - Validasyon ekle (0-100 arası)
  - _Requirements: 5_

- [x] 3.1 Fiyat hesaplama componentini oluştur


  - src/components/products/PriceCalculator.tsx oluştur
  - KDV Dahil/Hariç switch ekle
  - Otomatik hesaplama logic'i ekle
  - Real-time güncelleme ekle
  - İki fiyatı da göster (dahil ve hariç)
  - _Requirements: 6_

- [x] 3.2 Seri numarası yönetim componentini oluştur


  - src/components/products/SerialNumberManager.tsx oluştur
  - Seri numarası listesi gösterimi
  - Tek tek ekleme input ve butonu
  - Toplu ekleme butonu ve textarea
  - Silme butonları
  - Duplicate kontrolü ve hata mesajları
  - Satılan/mevcut durumu gösterimi
  - _Requirements: 16, 17, 22_

## Product Management - Form Pages


- [x] 4. Ürün form sekmelerini oluştur

  - src/components/products/ProductInfoTab.tsx oluştur
  - Ürün adı, barkod, kategori, birim alanları
  - VatRateSelector componentini entegre et
  - PriceCalculator componentini entegre et
  - Alış/satış fiyatı alanları
  - Açıklama textarea
  - Stok takibi switch
  - Seri numarası takibi switch
  - React Hook Form + Zod validation
  - _Requirements: 4, 5, 6, 21_

- [x] 4.1 Teknik özellikler sekmesini oluştur


  - src/components/products/TechnicalSpecsTab.tsx oluştur
  - Marka, model, renk, seri numarası alanları
  - Ürün durumu dropdown (Yeni, 2. El, Yenilenmiş, Demo)
  - React Hook Form + Zod validation
  - _Requirements: 7_

- [x] 4.2 3 sekmeli form wrapper'ı oluştur


  - src/components/products/ProductForm.tsx oluştur
  - Tab navigation ekle (Ürün Bilgileri, Teknik Özellikler)
  - ProductInfoTab ve TechnicalSpecsTab'i entegre et
  - SerialNumberManager'ı entegre et (seri no takibi açıksa)
  - Form state yönetimi
  - "Kaydet ve Kapat" butonu
  - "Kaydet ve Yeni Ekle" butonu
  - _Requirements: 4, 7, 14, 16_

## Product Management - Pages

- [x] 5. Ürün oluşturma sayfasını oluştur



  - src/pages/products/ProductCreatePage.tsx oluştur
  - Layout component ile sarmala
  - Breadcrumb navigation ekle
  - ProductForm componentini entegre et (mode: 'create')
  - Form submit handler
  - Success/error toast notifications
  - "Kaydet ve Kapat" → /products/manage yönlendirmesi
  - "Kaydet ve Yeni Ekle" → formu temizle
  - _Requirements: 2, 4, 14_

- [x] 5.1 Ürün düzenleme sayfasını oluştur


  - src/pages/products/ProductEditPage.tsx oluştur
  - Layout component ile sarmala
  - Breadcrumb navigation ekle (ürün adı ile)
  - URL'den ürün ID'sini al
  - Mevcut ürün verisini yükle
  - ProductForm componentini entegre et (mode: 'edit')
  - Form submit handler
  - Success/error toast notifications
  - Kaydet sonrası /products/manage yönlendirmesi
  - _Requirements: 3, 4, 14_

- [x] 5.2 Ürün yönetim sayfasını güncelle


  - src/pages/products/ProductManagePage.tsx güncelle
  - ProductModal'ı kaldır
  - "Yeni Ürün" butonunu /products/create yönlendirmesine çevir
  - Edit butonunu /products/edit/:id yönlendirmesine çevir
  - ProductTable'a seri numarası kolonu ekle
  - Seri numarası sayısını göster
  - _Requirements: 1, 2, 3, 17_

## Product Management - Bulk Operations



- [x] 6. Excel import/export özelliklerini güncelle







  - Mevcut ExcelImportModal'ı güncelle
  - Yeni kolonları ekle (brand, model, color, serial_number, condition)
  - Excel export fonksiyonunu güncelle
  - Tüm kolonları içeren export
  - _Requirements: 10, 11_

- [x] 6.1 Toplu silme özelliğini ekle


  - ProductTable'a checkbox kolonları ekle
  - "Tümünü Seç" checkbox ekle
  - Seçili ürünleri state'te tut
  - "Toplu Sil" butonu ekle (seçim varsa göster)
  - Onay dialogu ekle (seçili ürün sayısı ile)
  - Toplu silme API çağrısı
  - _Requirements: 9_


## Sales Management - Services

-


- [x] 7. Satış servislerini oluştur







  - src/services/salesService.ts oluştur
  - createSale fonksiyonunu implement et
  - getSales fonksiyonunu implement et (filtreleme ile)
  - getSaleById fonksiyonunu implement et
  - cancelSale fonksiyonunu implement et
  - Supabase MCP execute_sql kullan
  - _Requirements: 28, 29, 30, 31_

- [x] 7.1 Turkcell e-Fatura API servisini oluştur


  - src/services/turkcellApiService.ts oluştur
  - API settings'i veritabanından oku
  - API Key decrypt fonksiyonu
  - createInvoice fonksiyonunu implement et
  - cancelInvoice fonksiyonunu implement et
  - createReturnInvoice fonksiyonunu implement et
  - Swagger dokümanına uygun payload formatı
  - Error handling ve retry logic (max 3)
  - _Requirements: 33, 38_

- [x] 7.2 API ayarları servisini oluştur


  - src/services/apiSettingsService.ts oluştur
  - getApiSettings fonksiyonunu implement et
  - saveApiSettings fonksiyonunu implement et
  - testApiConnection fonksiyonunu implement et
  - API Key encryption/decrypt
ion fonksiyonları
  - _Requirements: 36, 37, 39_





## Sales Management - UI Components

- [x] 8. Müşteri bilgileri formunu oluştur







  - src/components/sales/CustomerInfoForm.tsx oluştur
  - Müşteri tipi selector (Bireysel/Kurumsal)
  - Bireysel: Ad Soyad, TC Kimlik No
  - Kurumsal: Ünvan, Vergi No, Vergi Dairesi
  - E-posta, telefon, adres alanları
  - Conditional rendering (müşteri tipine göre)
  - React Hook Form + Zod validation
  - TC Kimlik No validation (11 digit)
  - Vergi No validation (10 digit)
  - _Requirements: 23_

- [x] 8.1 Ürün arama componentini oluştur


  - src/components/sales/ProductSearchInput.tsx oluştur
  - Barkod scanner entegrasyonu (react-barcode-reader)
  - Text input (barkod veya isim)
  - Debounced search (300ms)
  - Dropdown sonuçlar
  - Ürün seçimi callback
  - Ürün bulunamadı callback
  - _Requirements: 24, 25_

- [x] 8.2 Ürün bulunamadı modalını oluştur


  - src/components/sales/ProductNotFoundModal.tsx oluştur
  - "Ürün bulunamadı" mesajı
  - Barkod bilgisini göster
  - "Yeni Ürün Ekle" butonu
  - Mini ürün formu (ürün adı, barkod, fiyat, KDV, kategori)
  - Form submit → ürün oluştur → sepete ekle
  - _Requirements: 25_

- [x] 8.3 Satış kalemleri tablosunu oluştur


  - src/components/sales/SalesItemsTable.tsx oluştur
  - Kolonlar: Ürün Adı, Barkod, Miktar, Birim Fiyat, KDV (%), Toplam
  - Miktar input (editable)
  - Silme butonu
  - Otomatik toplam hesaplama (miktar × fiyat × (1+KDV/100))
  - Real-time güncelleme
  - _Requirements: 24_

- [x] 8.4 Fatura bilgileri formunu oluştur


  - src/components/sales/InvoiceInfoForm.tsx oluştur
  - Fatura tipi selector (E_FATURA/E_ARSIV)
  - Fatura tarihi date picker (default: bugün)
  - Para birimi (default: TRY)
  - Ödeme türü selector (NAKIT, KREDI_KARTI, HAVALE, TAKSITLI)
  - Not/açıklama textarea
  - _Requirements: 26_

- [x] 8.5 Satış özeti componentini oluştur


  - src/components/sales/SalesSummary.tsx oluştur
  - Ara Toplam (readonly)
  - Toplam KDV (readonly)
  - Genel Toplam (readonly)
  - Real-time hesaplama
  - 2 decimal format
  - TRY currency symbol
  - _Requirements: 27_

- [x] 8.6 Seri numarası seçim modalını oluştur


  - src/components/sales/SerialNumberSelectionModal.tsx oluştur
  - Sadece available seri numaralarını listele
  - Seri no, eklenme tarihi, durum göster
  - Radio button s
election
  - Onay ve iptal butonları
  - Seçim callback



  - _Requirements: 18, 34_

## Sales Management - Pages

-

- [x] 9. Yeni satış sayfasını oluştur





  - src/pages/sales/NewSalePage.tsx oluştur
  - Layout component ile sarmala
  - 4 bölüm: Müşteri Bilgileri, Satış Kalemleri, Fatura Bilgileri, Özet
  - CustomerInfoForm componentini entegre et
  - ProductSearchInput componentini entegre et
  - SalesItemsTable componentini entegre et
  - InvoiceInfoForm componentini entegre et
  - SalesSummary componentini entegre et
  - "Satışı Tamamla ve Fatura Kes" butonu
  - Form validation (tüm required alanlar)
  - Seri numaralı ürün ekleme akışı (modal aç)
  - Submit handler (satış + fatura oluştur)
  - Success → /sales/list yönlendirmesi
  - _Requirements: 23, 24, 25, 26, 27, 28, 34_

- [x] 9.1 Satış listesi sayfasını oluştur


  - src/pages/sales/SalesListPage.tsx oluştur
  - Layout component ile sarmala
  - Table: Tarih, Müşteri, Fatura Tipi, Toplam, Durum, İşlem
  - Durum renkleri (Gönderildi: green, Bekliyor: yellow, Hata: red, Taslak: gray)
  - Tarih aralığı filtresi
  - Durum filtresi
  - Pagination (50 item/page)
  - Görüntüle butonu → detay modalı
  - PDF İndir butonu
  - _Requirements: 29, 30_


- [x] 9.2 İade/İptal sayfasını oluştur

  - src/pages/sales/ReturnsPage.tsx oluştur
  - Layout component ile sarmala
  - Table: Fatura No, Tarih, Müşteri, Tutar, Durum, İşlem

  - "İade Et" butonu
  - "İptal Et" butonu
  - Onay dialogları


  - API çağrıları (Turkcell)


  - Success/error notifications

  - _Requirements: 31_

## Settings - API Configuration

- [x] 10. API ayarları sekmesini oluştur







  - src/components/settings/ApiSettingsTab.tsx oluştur
  - API Key input (masked)
  - Ortam selector (Test/Production)
  - Test URL gösterimi (readonly)
  - Production URL gösterimi (readonly)
  - "Bağlantıyı Test Et" butonu
  - Test sonucu gösterimi (success/error)
  - "Kaydet" butonu
  - API Key encryption

  - _Requirements: 36, 37_




- [x] 10.1 Ayarlar sayfasını güncelle


  - src/pages/settings/
SettingsPage.tsx güncelle (veya oluştur)
  - Tab navigation ekle
  - ApiSettingsTab'i entegre et
  - Mevcut ayarları yükle
  - Save handler
  - _Requirements: 36, 37, 40_

## Navigation Updates

- [x] 11. Sidebar menüsünü güncelle









  - src/components/layout/Sidebar.tsx güncelle
  - "Satışlar" menü öğesi ekle (Receipt icon)
  - Alt menüler: Yeni Satış, Satış Listesi, İade/İptal
  - "Ürünler" menüsünü güncelle
  - "Ürün Listesi" href'ini /products/manage yap
  - "Ürün Yönetimi" alt menüsünü kaldır
  - _Requirements: 1, 2, 3, 23, 29, 31_




- [x] 11.1 Route'ları ekle



  - src/App.tsx veya router config güncelle
  - /products/create route ekle
  - /products/edit/:id route ekle
  - /sales/new route ekle
  - /sales/list route ekle
  - /sales/returns route ekle
  - _Requirements: 2, 3, 23, 29, 31_

## Error Handling & Validation
-

- [x] 12. Form validasyonlarını implement et









  - Zod schema'ları oluşt
ur
  - Field-level error mes
sages
  - Red border highlights
  - Form submission prevention
  - _Requirements: 13, 35_


- [x] 12.1 API error handling'i implement et


  - Axios interceptors ekle


  - Turkcell API error parsing
  - User-friendly error messages
  - Retry logic (exponential backoff)
  - Network error detection

  - Toast notifications
  - _Requirements: 33, 35, 40_



## Testing & Polish



- [x] 13. Unit testler yaz









- [ ] 13. Unit testler yaz
  - VAT calculator testleri
  - Validation fonksiyon testleri
  - Encryption/decryption testleri
  - Service mock testleri
  - _Requirements: Tüm gereksinimler_




- [ ] 13.1 Integration testler yaz
  - Ürün oluşturma flow testi
  - Seri numarası fl

ow testi
  - Satış flow testi

  - _Requirements: Tüm gereksinimle
r_
- [x] 14. Final polish ve bug fixes



- [ ] 14. Final polish ve bug fixes




  - UI/UX iyileştirmeleri
  - Performance optimizasyonları
  - Accessibility kontrolleri
  - Browser compatibility testleri
  - _Requirements: Tüm gereksinimler_
