# Requirements Document

## Introduction

Bu doküman, HesapOnda uygulamasının ürün yönetim ve satış sisteminin kapsamlı bir şekilde yeniden tasarlanması için gereksinimleri tanımlar. Sistem, detaylı ürün bilgileri girişi, toplu işlemler, Excel entegrasyonu, teknik özellikler yönetimi, gelişmiş KDV hesaplamaları, barkod bazlı satış işlemleri ve Turkcell e-Fatura entegrasyonu içeren profesyonel bir ürün ve satış yönetim deneyimi sunacaktır.

## Glossary

- **System**: HesapOnda uygulaması
- **Product**: Sistemde satışa sunulan ürün kaydı
- **Product Management Page**: Ürünlerin listelendiği, arandığı ve toplu işlemlerin yapıldığı ana sayfa
- **Product Form**: Ürün ekleme veya düzenleme sayfası (modal değil, tam sayfa)
- **VAT (KDV)**: Katma Değer Vergisi - Türkiye'de geçerli vergi oranları
- **VAT Rate**: Ürüne uygulanan KDV oranı (yüzde değeri)
- **VAT Included**: KDV dahil fiyat modu
- **VAT Excluded**: KDV hariç (matrah) fiyat modu
- **Barcode**: Ürün barkod numarası (zorunlu alan)
- **Category**: Ürün kategorisi (Telefon, Aksesuar, Tablet, Servis Parçası vb.)
- **Unit**: Ürün birimi (Adet, Kutu, Paket vb.)
- **Technical Specifications**: Ürünün teknik özellikleri (marka, model, renk, seri no, durum)
- **Product Condition**: Ürün durumu (Yeni, 2. El, Yenilenmiş, Demo)
- **Stock Tracking**: Stok takibi özelliği (açık/kapalı)
- **Serial Number**: Ürüne ait benzersiz seri numarası veya IMEI numarası
- **Serial Number Tracking**: Seri numarası bazlı stok takibi sistemi
- **Stock Item**: Bir ürüne ait seri numaralı stok kalemi
- **Serial Number Selection Modal**: Satış sırasında seri numarası seçimi için açılan dialog
- **Bulk Operation**: Toplu işlem (çoklu ürün seçimi ve işlem yapma)
- **Excel Import**: Excel dosyasından toplu ürün yükleme
- **Excel Export**: Ürünleri Excel dosyasına aktarma
- **Cart**: Satış sepeti
- **Sale**: Satış işlemi kaydı
- **Sales Page**: Yeni satış oluşturma, satış listesi ve iade/iptal işlemlerinin yapıldığı sayfalar
- **Customer**: Müşteri bilgileri (bireysel veya kurumsal)
- **Invoice**: Fatura (e-Fatura veya e-Arşiv)
- **E-Invoice (e-Fatura)**: Kurumsal müşterilere kesilen elektronik fatura
- **E-Archive (e-Arşiv)**: Bireysel müşterilere kesilen elektronik arşiv fatura
- **Turkcell e-Fatura API**: Turkcell'in e-Fatura entegrasyon servisi
- **Invoice Status**: Fatura durumu (pending, sent, error, cancelled)
- **Payment Type**: Ödeme türü (NAKIT, KREDI_KARTI, HAVALE, TAKSITLI)
- **Barcode Scanner**: Barkod okuyucu entegrasyonu
- **API Key**: Turkcell e-Fatura API'sine erişim için gerekli kimlik doğrulama anahtarı
- **API Environment**: API ortamı (Test veya Production)
- **Settings Page**: Sistem ayarlarının yapılandırıldığı sayfa
- **Database**: Supabase PostgreSQL veritabanı
- **User**: Sistemi kullanan işletme çalışanı

## Requirements

### Requirement 1

**User Story:** Ürün yöneticisi olarak, ürün yönetim sayfasında tüm ürünleri listeleyebilmek ve arayabilmek istiyorum, böylece ürünlere hızlıca erişebilirim.

#### Acceptance Criteria

1. THE System SHALL display a product management page with a searchable product list table
2. THE System SHALL include columns for product name, barcode, category, stock quantity, purchase price, sale price, and VAT rate in the table
3. WHEN User enters text in the search field, THE System SHALL filter products by name, barcode, or category in real-time
4. THE System SHALL display pagination controls when product count exceeds 50 items per page
5. THE System SHALL provide sorting functionality for each column in the table

### Requirement 2

**User Story:** Ürün yöneticisi olarak, ürün yönetim sayfasından yeni ürün ekleme sayfasına gidebilmek istiyorum, böylece modal yerine tam sayfa formunda ürün ekleyebilirim.

#### Acceptance Criteria

1. THE System SHALL display a "Yeni Ürün Ekle" button on the product management page
2. WHEN User clicks the "Yeni Ürün Ekle" button, THE System SHALL navigate to a dedicated product creation page
3. THE System SHALL NOT use a modal dialog for product creation
4. THE System SHALL display a breadcrumb navigation showing "Ürün Yönetimi > Yeni Ürün Ekle"
5. THE System SHALL provide a "Geri" button to return to the product management page

### Requirement 3

**User Story:** Ürün yöneticisi olarak, mevcut ürünü düzenlemek için ayrı bir düzenleme sayfasına gidebilmek istiyorum, böylece detaylı düzenleme yapabileyim.

#### Acceptance Criteria

1. THE System SHALL display an edit icon button for each product in the product list
2. WHEN User clicks the edit button, THE System SHALL navigate to a dedicated product edit page
3. THE System SHALL NOT use a modal dialog for product editing
4. THE System SHALL pre-populate all form fields with existing product data
5. THE System SHALL display a breadcrumb navigation showing "Ürün Yönetimi > Ürün Düzenle > [Ürün Adı]"

### Requirement 4

**User Story:** Ürün yöneticisi olarak, yeni ürün eklerken temel ürün bilgilerini girebilmek istiyorum, böylece ürünü sisteme kaydedebilirim.

#### Acceptance Criteria

1. THE System SHALL display a tabbed form with "Ürün Bilgileri" as the first tab
2. THE System SHALL require User to enter product name and barcode as mandatory fields
3. THE System SHALL provide a category dropdown with options including Telefon, Aksesuar, Tablet, and Servis Parçası
4. THE System SHALL provide a unit dropdown with options including Adet, Kutu, and Paket
5. THE System SHALL require User to select a VAT rate from 0%, 1%, 10%, or 20%
6. THE System SHALL allow User to enter purchase price and sale price as numeric values
7. THE System SHALL provide a "KDV Dahil/Hariç" switch toggle for price entry mode
8. THE System SHALL allow User to enter optional description text
9. THE System SHALL provide a "Stok Takibi" switch to enable or disable stock tracking
10. THE System SHALL display a "Kaydet" button to save the product

### Requirement 5

**User Story:** Ürün yöneticisi olarak, ürün eklerken KDV oranını seçebilmek ve özel oran girebilmek istiyorum, böylece farklı vergi oranlarına sahip ürünleri yönetebilirim.

#### Acceptance Criteria

1. THE System SHALL display VAT rate options as selectable buttons for 0%, 1%, 10%, and 20%
2. THE System SHALL provide a custom VAT rate input field for User-defined rates
3. WHEN User enters a custom VAT rate, THE System SHALL validate that the value is between 0 and 100
4. THE System SHALL mark VAT rate field as required with visual indicator
5. THE System SHALL default to 20% VAT rate when form loads

### Requirement 6

**User Story:** Ürün yöneticisi olarak, fiyat girerken KDV dahil veya hariç modunu seçebilmek istiyorum, böylece fiyatları istediğim formatta girebilirim.

#### Acceptance Criteria

1. THE System SHALL display a switch control labeled "KDV Dahil / KDV Hariç" above price fields
2. WHEN switch is in "KDV Dahil" position, THE System SHALL treat entered prices as VAT included
3. WHEN switch is in "KDV Hariç" position, THE System SHALL treat entered prices as VAT excluded
4. WHEN User enters a sale price, THE System SHALL automatically calculate and display the alternate price format
5. THE System SHALL display both "KDV Dahil Fiyat" and "KDV Hariç Fiyat" as read-only calculated fields
6. THE System SHALL recalculate prices in real-time when VAT rate or switch position changes

### Requirement 7

**User Story:** Ürün yöneticisi olarak, ürün eklerken teknik özellikleri girebilmek istiyorum, böylece ürün detaylarını tam olarak kaydedebilirim.

#### Acceptance Criteria

1. THE System SHALL display "Teknik Özellikler" as the second tab in the product form
2. THE System SHALL provide input fields for Marka, Model, and Seri Numarası
3. THE System SHALL provide a color selection dropdown or color picker for Renk field
4. THE System SHALL provide a dropdown for Ürün Durumu with options: Yeni, 2. El, Yenilenmiş, Demo
5. THE System SHALL allow User to save technical specifications independently with a "Kaydet" button
6. THE System SHALL persist technical specifications to the Database when saved

### Requirement 8

**User Story:** Ürün yöneticisi olarak, ürün listesinden tek bir ürünü silebilmek istiyorum, böylece artık kullanılmayan ürünleri sistemden kaldırabilirim.

#### Acceptance Criteria

1. THE System SHALL display a delete icon button for each product in the product list
2. WHEN User clicks the delete button, THE System SHALL display a confirmation dialog
3. THE System SHALL show product name in the confirmation dialog message
4. WHEN User confirms deletion, THE System SHALL remove the product from the Database
5. WHEN deletion completes, THE System SHALL refresh the product list and display a success message
6. WHEN User cancels deletion, THE System SHALL close the dialog without deleting

### Requirement 9

**User Story:** Ürün yöneticisi olarak, birden fazla ürünü aynı anda seçip silebilmek istiyorum, böylece toplu temizlik işlemlerini hızlı yapabilirim.

#### Acceptance Criteria

1. THE System SHALL display a checkbox in the first column of each product row
2. THE System SHALL display a "Tümünü Seç" checkbox in the table header
3. WHEN User selects one or more products, THE System SHALL display a "Toplu Sil" button
4. WHEN User clicks "Toplu Sil", THE System SHALL display a confirmation dialog showing the count of selected products
5. WHEN User confirms bulk deletion, THE System SHALL remove all selected products from the Database
6. THE System SHALL display a success message indicating the number of products deleted
7. WHEN bulk deletion completes, THE System SHALL clear selections and refresh the product list

### Requirement 10

**User Story:** Ürün yöneticisi olarak, Excel dosyasından toplu ürün yükleyebilmek istiyorum, böylece çok sayıda ürünü manuel girmek yerine hızlıca içe aktarabilirim.

#### Acceptance Criteria

1. THE System SHALL display an "Excel ile Toplu Yükle" button on the product management page
2. WHEN User clicks the button, THE System SHALL open a file selection dialog
3. THE System SHALL accept Excel files with extensions .xlsx and .xls
4. WHEN User selects a file, THE System SHALL validate the file format and column structure
5. THE System SHALL require columns: Ürün Adı, Barkod, Kategori, Birim, KDV Oranı, Alış Fiyatı, Satış Fiyatı
6. WHEN file validation succeeds, THE System SHALL import products and insert them into the Database
7. THE System SHALL display a progress indicator during import
8. WHEN import completes, THE System SHALL display a summary showing successful and failed imports
9. WHEN import fails, THE System SHALL display error messages with row numbers

### Requirement 11

**User Story:** Ürün yöneticisi olarak, ürün listesini Excel dosyasına aktarabilmek istiyorum, böylece ürün verilerini dışarıda analiz edebilir veya yedekleyebilirim.

#### Acceptance Criteria

1. THE System SHALL display an "Excel'e Aktar" button on the product management page
2. WHEN User clicks the button, THE System SHALL generate an Excel file with all products
3. THE System SHALL include columns: Ürün Adı, Barkod, Kategori, Birim, KDV Oranı, Alış Fiyatı, Satış Fiyatı, Stok Miktarı, Marka, Model, Renk, Seri No, Durum
4. THE System SHALL format numeric values with appropriate decimal places
5. THE System SHALL trigger a file download with filename format "urunler_YYYYMMDD_HHMMSS.xlsx"
6. WHEN export completes, THE System SHALL display a success message

### Requirement 12

**User Story:** Sistem yöneticisi olarak, ürün tablosuna teknik özellikler için yeni kolonlar eklenmesini istiyorum, böylece genişletilmiş ürün bilgileri saklanabilsin.

#### Acceptance Criteria

1. WHEN Database migration runs, THE System SHALL add columns: brand, model, color, serial_number, condition to products table
2. THE System SHALL set all new columns as nullable VARCHAR fields
3. THE System SHALL add a check constraint for condition column allowing only: Yeni, 2. El, Yenilenmiş, Demo
4. THE System SHALL create an index on brand and model columns for faster searching
5. THE System SHALL complete migration without affecting existing product data

### Requirement 13

**User Story:** Ürün yöneticisi olarak, form validasyonlarının anlaşılır olmasını istiyorum, böylece hataları kolayca düzeltebilirim.

#### Acceptance Criteria

1. WHEN User submits form with empty required fields, THE System SHALL display error messages below each field
2. THE System SHALL highlight invalid fields with red border color
3. WHEN User enters invalid barcode format, THE System SHALL display format requirements
4. WHEN User enters negative price values, THE System SHALL display "Fiyat pozitif olmalıdır" error
5. THE System SHALL prevent form submission until all validation errors are resolved
6. THE System SHALL display a summary error message at the top of the form listing all validation issues

### Requirement 14

**User Story:** Ürün yöneticisi olarak, form doldururken değişiklikleri kaydedip sayfada kalabilmek istiyorum, böylece benzer ürünleri arka arkaya ekleyebilirim.

#### Acceptance Criteria

1. THE System SHALL provide two save buttons: "Kaydet ve Kapat" and "Kaydet ve Yeni Ekle"
2. WHEN User clicks "Kaydet ve Kapat", THE System SHALL save the product and navigate to product management page
3. WHEN User clicks "Kaydet ve Yeni Ekle", THE System SHALL save the product and clear the form for new entry
4. WHEN save operation succeeds, THE System SHALL display a success toast notification
5. WHEN save operation fails, THE System SHALL display error details and keep form data intact

### Requirement 15

**User Story:** Ürün yöneticisi olarak, kategori ve birim değerlerini yönetebilmek istiyorum, böylece işletmeye özel seçenekler ekleyebilirim.

#### Acceptance Criteria

1. THE System SHALL allow User to add new category values from the category dropdown
2. THE System SHALL allow User to add new unit values from the unit dropdown
3. WHEN User types a new value not in the list, THE System SHALL display "Yeni ekle: [value]" option
4. WHEN User selects the "Yeni ekle" option, THE System SHALL add the value to the Database
5. THE System SHALL make newly added categories and units immediately available in dropdowns

### Requirement 16

**User Story:** Ürün yöneticisi olarak, bir ürüne birden fazla seri numarası ekleyebilmek istiyorum, böylece aynı üründen birden fazla stok kalemini seri numarası ile takip edebilirim.

#### Acceptance Criteria

1. THE System SHALL display a "Seri Numaraları" section in the product form
2. THE System SHALL provide an input field and "Ekle" button for adding serial numbers
3. WHEN User enters a serial number and clicks "Ekle", THE System SHALL add the serial number to the product's serial number list
4. THE System SHALL display all added serial numbers in a list with remove buttons
5. THE System SHALL validate that each serial number is unique within the product
6. WHEN User attempts to add a duplicate serial number, THE System SHALL display error message "Bu seri numarası zaten eklenmiş"
7. THE System SHALL allow User to remove serial numbers from the list before saving
8. WHEN User saves the product, THE System SHALL store all serial numbers in the Database linked to the product

### Requirement 17

**User Story:** Ürün yöneticisi olarak, ürün listesinde seri numarası bazlı stok miktarını görebilmek istiyorum, böylece kaç adet seri numaralı ürünüm olduğunu bilebilirim.

#### Acceptance Criteria

1. THE System SHALL display serial number count in the stock quantity column for products with serial number tracking
2. THE System SHALL show format "X adet (Y seri no)" where X is total quantity and Y is serial number count
3. WHEN User clicks on the stock quantity, THE System SHALL display a popover listing all serial numbers
4. THE System SHALL indicate sold serial numbers with strikethrough or different color
5. THE System SHALL show available serial numbers count separately from total count

### Requirement 18

**User Story:** Satış görevlisi olarak, seri numaralı bir ürünü sepete eklerken hangi seri numarasını sattığımı seçebilmek istiyorum, böylece doğru ürünü müşteriye teslim edebilirim.

#### Acceptance Criteria

1. WHEN User adds a product with serial numbers to Cart, THE System SHALL open a serial number selection modal
2. THE System SHALL display all available (unsold) serial numbers for the product in the modal
3. THE System SHALL show serial number, date added, and status for each item
4. THE System SHALL allow User to select one serial number from the list
5. WHEN User confirms selection, THE System SHALL add the product to Cart with the selected serial number
6. THE System SHALL mark the selected serial number as "reserved" until sale is completed or cart is cleared
7. WHEN User cancels the modal, THE System SHALL NOT add the product to Cart

### Requirement 19

**User Story:** Satış görevlisi olarak, seri numaralı ürün satışı tamamlandığında stoktan düşmesini istiyorum, böylece stok takibi doğru olsun.

#### Acceptance Criteria

1. WHEN User completes a sale containing products with serial numbers, THE System SHALL mark selected serial numbers as sold
2. THE System SHALL record the sale date and sale ID for each sold serial number
3. THE System SHALL decrease the available serial number count for the product
4. THE System SHALL NOT allow the same serial number to be sold again
5. WHEN sale is completed, THE System SHALL update product stock quantity to reflect remaining serial numbers

### Requirement 20

**User Story:** Sistem yöneticisi olarak, seri numaralarını ayrı bir tabloda saklamak istiyorum, böylece her seri numarasının geçmişini takip edebilirim.

#### Acceptance Criteria

1. WHEN Database migration runs, THE System SHALL create a product_serial_numbers table
2. THE System SHALL include columns: id, product_id, serial_number, status, added_date, sold_date, sale_id
3. THE System SHALL set status column with values: available, reserved, sold
4. THE System SHALL create a unique constraint on serial_number column
5. THE System SHALL create a foreign key relationship to products table
6. THE System SHALL create an index on product_id and status columns for faster queries

### Requirement 21

**User Story:** Ürün yöneticisi olarak, seri numarası takibini ürün bazında açıp kapatabilmek istiyorum, böylece sadece gerekli ürünlerde bu özelliği kullanabilirim.

#### Acceptance Criteria

1. THE System SHALL provide a "Seri Numarası Takibi" switch in the product form
2. WHEN switch is enabled, THE System SHALL display the serial numbers section
3. WHEN switch is disabled, THE System SHALL hide the serial numbers section
4. THE System SHALL use standard stock tracking when serial number tracking is disabled
5. WHEN User disables serial number tracking for a product with existing serial numbers, THE System SHALL display a warning message

### Requirement 22

**User Story:** Ürün yöneticisi olarak, toplu seri numarası ekleyebilmek istiyorum, böylece çok sayıda ürün geldiğinde hızlıca girebilirim.

#### Acceptance Criteria

1. THE System SHALL provide a "Toplu Ekle" button in the serial numbers section
2. WHEN User clicks "Toplu Ekle", THE System SHALL display a textarea for multiple serial numbers
3. THE System SHALL accept serial numbers separated by newlines or commas
4. WHEN User submits bulk serial numbers, THE System SHALL validate each serial number
5. THE System SHALL display validation results showing successful and failed additions
6. THE System SHALL add all valid serial numbers to the product
7. WHEN duplicate serial numbers are detected, THE System SHALL skip them and show warning message

## SALES MANAGEMENT REQUIREMENTS

### Requirement 23

**User Story:** Satış görevlisi olarak, yeni satış sayfasında müşteri bilgilerini girebilmek istiyorum, böylece fatura kesebilirim.

#### Acceptance Criteria

1. THE System SHALL display a new sales page with customer information section
2. THE System SHALL provide a customer type selector with options: Bireysel, Kurumsal
3. WHEN customer type is Bireysel, THE System SHALL require Ad Soyad and TC Kimlik No fields
4. WHEN customer type is Kurumsal, THE System SHALL require Ünvan, Vergi No, and Vergi Dairesi fields
5. THE System SHALL require email and address fields for both customer types
6. THE System SHALL provide optional phone number field
7. THE System SHALL validate TC Kimlik No as 11 digits
8. THE System SHALL validate Vergi No as 10 digits
9. THE System SHALL validate email format

### Requirement 24

**User Story:** Satış görevlisi olarak, barkod okutarak veya ürün ismi yazarak ürün ekleyebilmek istiyorum, böylece hızlı satış yapabilirim.

#### Acceptance Criteria

1. THE System SHALL display a product search input field with barcode scanner support
2. WHEN User scans a barcode, THE System SHALL search for the product in the Database
3. WHEN User types product name, THE System SHALL search products with name ILIKE filter
4. WHEN product is found, THE System SHALL automatically add it to the sales items table
5. THE System SHALL display sales items in a table with columns: Ürün Adı, Barkod, Miktar, Birim Fiyat, KDV (%), Toplam
6. THE System SHALL calculate item total as: miktar × birim_fiyat × (1 + kdv/100)
7. THE System SHALL allow User to modify quantity for each item
8. THE System SHALL recalculate totals in real-time when quantity changes

### Requirement 25

**User Story:** Satış görevlisi olarak, barkod okuttuğumda ürün bulunamazsa yeni ürün ekleyebilmek istiyorum, böylece satışa devam edebilirim.

#### Acceptance Criteria

1. WHEN product is not found by barcode, THE System SHALL display a "Ürün bulunamadı" modal
2. THE System SHALL show message "Bu barkoda ait ürün bulunamadı" in the modal
3. THE System SHALL provide a "Yeni Ürün Ekle" button in the modal
4. WHEN User clicks "Yeni Ürün Ekle", THE System SHALL open a product creation form
5. THE System SHALL pre-fill the barcode field with the scanned barcode
6. THE System SHALL require fields: Ürün Adı, Barkod, Birim Fiyat, KDV Oranı
7. THE System SHALL provide optional Kategori field
8. WHEN User saves the new product, THE System SHALL insert it into the Database
9. WHEN product creation succeeds, THE System SHALL automatically add the product to sales items table

### Requirement 26

**User Story:** Satış görevlisi olarak, fatura bilgilerini belirleyebilmek istiyorum, böylece doğru fatura tipinde kesebilirim.

#### Acceptance Criteria

1. THE System SHALL display invoice information section in the sales page
2. THE System SHALL provide invoice type selector with options: E_FATURA, E_ARSIV
3. THE System SHALL default invoice date to current date
4. THE System SHALL allow User to select invoice date from date picker
5. THE System SHALL default currency to TRY
6. THE System SHALL provide payment type selector with options: NAKIT, KREDI_KARTI, HAVALE, TAKSITLI
7. THE System SHALL provide optional note/description textarea
8. THE System SHALL require all invoice fields before submission

### Requirement 27

**User Story:** Satış görevlisi olarak, satış özetini görebilmek istiyorum, böylece toplam tutarı kontrol edebilirim.

#### Acceptance Criteria

1. THE System SHALL display a sales summary section with read-only fields
2. THE System SHALL calculate and display "Ara Toplam" as sum of all item subtotals (excluding VAT)
3. THE System SHALL calculate and display "Toplam KDV" as sum of all VAT amounts
4. THE System SHALL calculate and display "Genel Toplam" as Ara Toplam + Toplam KDV
5. THE System SHALL update summary calculations in real-time when items change
6. THE System SHALL format all amounts with 2 decimal places and TRY currency symbol

### Requirement 28

**User Story:** Satış görevlisi olarak, satışı tamamlayıp fatura kesebilmek istiyorum, böylece işlemi sonlandırabilirim.

#### Acceptance Criteria

1. THE System SHALL display a "Satışı Tamamla ve Fatura Kes" button
2. WHEN User clicks the button, THE System SHALL validate all required fields
3. WHEN validation fails, THE System SHALL display error messages for missing fields
4. WHEN validation succeeds, THE System SHALL create a sale record in the Database
5. THE System SHALL send invoice data to Turkcell e-Fatura API
6. THE System SHALL store invoice UUID and status returned from API
7. WHEN invoice creation succeeds, THE System SHALL display success message with invoice number
8. WHEN invoice creation fails, THE System SHALL display error message and keep form data
9. THE System SHALL navigate to sales list page after successful completion

### Requirement 29

**User Story:** Satış yöneticisi olarak, tüm satışları listeleyebilmek istiyorum, böylece satış geçmişini görebilirim.

#### Acceptance Criteria

1. THE System SHALL display a sales list page with a table of all sales
2. THE System SHALL include columns: Tarih, Müşteri, Fatura Tipi, Toplam, Durum, İşlem
3. THE System SHALL display invoice status with color coding: Gönderildi (green), Bekliyor (yellow), Hata (red), Taslak (gray)
4. THE System SHALL provide action buttons: Görüntüle, PDF İndir
5. THE System SHALL provide date range filter
6. THE System SHALL provide status filter with options: Tümü, Gönderildi, Bekliyor, İptal
7. THE System SHALL sort sales by date descending by default
8. THE System SHALL paginate results when count exceeds 50 items

### Requirement 30

**User Story:** Satış görevlisi olarak, satış detaylarını görüntüleyebilmek istiyorum, böylece fatura bilgilerini kontrol edebilirim.

#### Acceptance Criteria

1. WHEN User clicks "Görüntüle" button, THE System SHALL display sale details in a modal or separate page
2. THE System SHALL show customer information section
3. THE System SHALL show sales items table with all products
4. THE System SHALL show invoice information and totals
5. THE System SHALL show invoice status and UUID
6. THE System SHALL provide a "PDF İndir" button
7. WHEN User clicks "PDF İndir", THE System SHALL generate and download invoice PDF

### Requirement 31

**User Story:** Satış yöneticisi olarak, faturaları iptal edebilmek veya iade işlemi yapabilmek istiyorum, böylece hatalı satışları düzeltebilirim.

#### Acceptance Criteria

1. THE System SHALL display a returns/cancellations page
2. THE System SHALL list all sales with columns: Fatura No, Tarih, Müşteri, Tutar, Durum, İşlem
3. THE System SHALL provide "İade Et" button for completed sales
4. THE System SHALL provide "İptal Et" button for sent invoices
5. WHEN User clicks "İptal Et", THE System SHALL display confirmation dialog
6. WHEN User confirms cancellation, THE System SHALL send cancellation request to Turkcell e-Fatura API
7. WHEN cancellation succeeds, THE System SHALL update invoice status to "cancelled" in Database
8. WHEN User clicks "İade Et", THE System SHALL display return form with quantity selection
9. WHEN return is processed, THE System SHALL create a return invoice via Turkcell API

### Requirement 32

**User Story:** Sistem yöneticisi olarak, satış verilerini saklamak için veritabanı tablosu oluşturulmasını istiyorum, böylece satış kayıtları tutulabilsin.

#### Acceptance Criteria

1. WHEN Database migration runs, THE System SHALL create a sales table
2. THE System SHALL include columns: id, customer_name, vkn_tckn, tax_office, email, address, invoice_type, invoice_date, payment_type, total_vat_amount, total_amount, status, invoice_uuid, created_at
3. THE System SHALL set status column with check constraint: pending, sent, error, cancelled
4. THE System SHALL create a sale_items table with columns: id, sale_id, product_id, product_name, barcode, quantity, unit_price, vat_rate, total_amount
5. THE System SHALL create foreign key relationship between sale_items and sales tables
6. THE System SHALL create indexes on sales.status and sales.invoice_date for faster queries

### Requirement 33

**User Story:** Satış görevlisi olarak, Turkcell e-Fatura API ile entegrasyon yapılmasını istiyorum, böylece otomatik fatura kesebilirim.

#### Acceptance Criteria

1. THE System SHALL implement Turkcell e-Fatura API authentication
2. THE System SHALL obtain access token before invoice operations
3. THE System SHALL format invoice payload according to Turkcell API specifications
4. THE System SHALL send invoice data to /invoice endpoint
5. THE System SHALL handle API response and extract invoice UUID
6. THE System SHALL implement error handling for API failures
7. THE System SHALL retry failed requests up to 3 times with exponential backoff
8. THE System SHALL log all API requests and responses for debugging

### Requirement 34

**User Story:** Satış görevlisi olarak, seri numaralı ürün satarken hangi seri numarasını sattığımı seçebilmek istiyorum, böylece stok takibi doğru olsun.

#### Acceptance Criteria

1. WHEN User adds a product with serial number tracking to sales items, THE System SHALL check if serial numbers exist
2. WHEN serial numbers exist, THE System SHALL open serial number selection modal
3. THE System SHALL display only available (unsold) serial numbers in the modal
4. THE System SHALL require User to select a serial number before adding to cart
5. WHEN User selects a serial number, THE System SHALL mark it as reserved
6. WHEN sale is completed, THE System SHALL mark selected serial numbers as sold
7. WHEN sale is cancelled, THE System SHALL release reserved serial numbers

### Requirement 35

**User Story:** Satış görevlisi olarak, satış sırasında hataların anlaşılır şekilde gösterilmesini istiyorum, böylece sorunları hızlıca çözebilirim.

#### Acceptance Criteria

1. WHEN validation error occurs, THE System SHALL display toast notification with error message
2. WHEN API error occurs, THE System SHALL display user-friendly error message
3. WHEN network error occurs, THE System SHALL display "Bağlantı hatası" message
4. THE System SHALL highlight invalid form fields with red border
5. THE System SHALL display field-level error messages below each invalid field
6. THE System SHALL keep form data intact when errors occur
7. THE System SHALL allow User to correct errors and retry submission

### Requirement 36

**User Story:** Sistem yöneticisi olarak, Turkcell e-Fatura API bağlantı bilgilerini ayarlar sayfasından girebilmek istiyorum, böylece API entegrasyonunu yapılandırabilirim.

#### Acceptance Criteria

1. THE System SHALL display an e-Fatura API settings section in the settings page
2. THE System SHALL provide an API Key input field
3. THE System SHALL provide an environment selector with options: Test, Production
4. WHEN Test is selected, THE System SHALL use API URL: https://efaturaservicetest.isim360.com/v1
5. WHEN Production is selected, THE System SHALL use API URL: https://efaturaservice.turkcellesirket.com/v1
6. THE System SHALL mask API Key input field for security
7. THE System SHALL provide a "Bağlantıyı Test Et" button
8. WHEN User clicks test button, THE System SHALL verify API connection and display result
9. THE System SHALL save API settings to Database when User clicks save
10. THE System SHALL encrypt API Key before storing in Database

### Requirement 37

**User Story:** Sistem yöneticisi olarak, API ayarlarının doğru çalıştığını test edebilmek istiyorum, böylece entegrasyonun hazır olduğundan emin olabilirim.

#### Acceptance Criteria

1. WHEN User clicks "Bağlantıyı Test Et", THE System SHALL send a test request to Turkcell API
2. THE System SHALL use the configured API Key and environment
3. WHEN connection succeeds, THE System SHALL display success message with green checkmark
4. WHEN connection fails, THE System SHALL display error message with details
5. WHEN API Key is invalid, THE System SHALL display "API Key geçersiz" message
6. THE System SHALL log test results for debugging
7. THE System SHALL prevent saving invalid API configurations

### Requirement 38

**User Story:** Geliştirici olarak, Turkcell e-Fatura API swagger dokümanına uygun fatura payload'u oluşturulmasını istiyorum, böylece API ile uyumlu çalışabileyim.

#### Acceptance Criteria

1. THE System SHALL format invoice payload according to Turkcell OutboxUblBuilderModel schema
2. THE System SHALL include required fields: invoiceType, invoiceDate, currency, paymentType, customer details, line items
3. THE System SHALL map customer type to API format: Bireysel → TCKN, Kurumsal → VKN
4. THE System SHALL format line items with productName, quantity, unitPrice, vatRate, totalAmount
5. THE System SHALL calculate totals according to API specifications
6. THE System SHALL validate payload against swagger schema before sending
7. WHEN validation fails, THE System SHALL log validation errors

### Requirement 39

**User Story:** Sistem yöneticisi olarak, API ayarlarını veritabanında saklamak istiyorum, böylece uygulama yeniden başlatıldığında ayarlar korunabilsin.

#### Acceptance Criteria

1. WHEN Database migration runs, THE System SHALL create an api_settings table
2. THE System SHALL include columns: id, api_key_encrypted, environment, is_active, created_at, updated_at
3. THE System SHALL set environment column with check constraint: test, production
4. THE System SHALL store only one active API configuration at a time
5. THE System SHALL use AES-256 encryption for API Key storage
6. THE System SHALL create an index on is_active column

### Requirement 40

**User Story:** Satış görevlisi olarak, API ayarları yapılmadan fatura kesmeye çalıştığımda uyarı almak istiyorum, böylece eksik yapılandırmayı fark edebilirim.

#### Acceptance Criteria

1. WHEN User attempts to create invoice, THE System SHALL check if API settings exist
2. WHEN API settings are not configured, THE System SHALL display error message "e-Fatura API ayarları yapılmamış"
3. THE System SHALL provide a link to settings page in the error message
4. THE System SHALL prevent invoice creation until API is configured
5. WHEN API Key is expired or invalid, THE System SHALL display "API Key geçersiz veya süresi dolmuş" message
