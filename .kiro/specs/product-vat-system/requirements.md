# Requirements Document

## Introduction

Bu doküman, HesapOnda uygulamasının ürün yönetim sistemine KDV (Katma Değer Vergisi) özelliğinin eklenmesi için gereksinimleri tanımlar. Sistem, kullanıcıların ürün eklerken ve düzenlerken KDV oranı belirlemesine, KDV dahil/hariç fiyat girişi yapmasına ve satış işlemlerinde KDV hesaplamalarının otomatik yapılmasına olanak sağlayacaktır.

## Glossary

- **System**: HesapOnda uygulaması
- **Product**: Sistemde satışa sunulan ürün kaydı
- **VAT (KDV)**: Katma Değer Vergisi - Türkiye'de geçerli vergi oranları (%0, %1, %10, %20)
- **VAT Rate**: Ürüne uygulanan KDV oranı (yüzde değeri)
- **VAT Included Price**: KDV dahil fiyat
- **VAT Excluded Price**: KDV hariç (matrah) fiyat
- **Product Form**: Ürün ekleme veya düzenleme formu
- **Sale Price**: Ürünün satış fiyatı
- **Purchase Price**: Ürünün alış fiyatı
- **Database**: Supabase PostgreSQL veritabanı
- **User**: Sistemi kullanan işletme çalışanı

## Requirements

### Requirement 1

**User Story:** Ürün yöneticisi olarak, yeni ürün eklerken KDV oranını belirleyebilmek istiyorum, böylece ürünün doğru vergi oranıyla satılmasını sağlayabilirim.

#### Acceptance Criteria

1. WHEN User opens the product creation form, THE System SHALL display a VAT rate input field with default value of 20
2. THE System SHALL allow User to enter VAT rate values of 0, 1, 10, or 20 percent
3. WHEN User enters a VAT rate outside the allowed values, THE System SHALL display a validation error message
4. WHEN User submits the product form with a valid VAT rate, THE System SHALL save the VAT rate to the Database
5. THE System SHALL store VAT rate as a numeric field in the products table

### Requirement 2

**User Story:** Ürün yöneticisi olarak, mevcut ürünlerin KDV oranlarını düzenleyebilmek istiyorum, böylece vergi oranı değişikliklerini sisteme yansıtabilirim.

#### Acceptance Criteria

1. WHEN User opens the product edit form, THE System SHALL display the current VAT rate value
2. THE System SHALL allow User to modify the VAT rate to 0, 1, 10, or 20 percent
3. WHEN User changes the VAT rate and saves, THE System SHALL update the VAT rate in the Database
4. THE System SHALL preserve the original sale price when VAT rate is changed
5. WHEN User cancels the edit operation, THE System SHALL discard VAT rate changes

### Requirement 3

**User Story:** Ürün yöneticisi olarak, fiyat girerken KDV dahil veya hariç seçeneğini belirleyebilmek istiyorum, böylece fiyatları istediğim formatta girebilirim.

#### Acceptance Criteria

1. THE System SHALL display a "KDV Dahil" checkbox in the Product Form
2. WHEN User checks the "KDV Dahil" checkbox, THE System SHALL treat entered sale price as VAT included
3. WHEN User unchecks the "KDV Dahil" checkbox, THE System SHALL treat entered sale price as VAT excluded
4. WHEN "KDV Dahil" is checked and User enters a price, THE System SHALL calculate and display the VAT excluded price
5. WHEN "KDV Dahil" is unchecked and User enters a price, THE System SHALL calculate and display the VAT included price

### Requirement 4

**User Story:** Ürün yöneticisi olarak, fiyat girişi yaparken KDV hesaplamalarını otomatik görebilmek istiyorum, böylece manuel hesaplama yapmama gerek kalmasın.

#### Acceptance Criteria

1. WHEN User enters a sale price value, THE System SHALL automatically calculate VAT amount based on VAT rate
2. WHEN "KDV Dahil" is checked, THE System SHALL calculate VAT excluded price using formula: price / (1 + vat_rate/100)
3. WHEN "KDV Dahil" is unchecked, THE System SHALL calculate VAT included price using formula: price * (1 + vat_rate/100)
4. THE System SHALL display both VAT included and VAT excluded prices in real-time
5. THE System SHALL round calculated prices to 2 decimal places

### Requirement 5

**User Story:** Sistem yöneticisi olarak, mevcut ürünlere varsayılan KDV oranı atanmasını istiyorum, böylece geçmiş veriler tutarlı olsun.

#### Acceptance Criteria

1. WHEN Database migration runs, THE System SHALL add vat_rate column to products table
2. THE System SHALL set default VAT rate value to 20 for the vat_rate column
3. WHEN migration completes, THE System SHALL update all existing products with VAT rate of 20
4. THE System SHALL ensure vat_rate column is NOT NULL
5. THE System SHALL complete migration without data loss

### Requirement 6

**User Story:** Satış görevlisi olarak, satış işlemlerinde ürünlerin KDV bilgilerinin otomatik hesaplanmasını istiyorum, böylece fatura ve fiş doğru KDV içersin.

#### Acceptance Criteria

1. WHEN User adds a product to cart, THE System SHALL include VAT rate in cart item data
2. WHEN System calculates sale total, THE System SHALL compute total VAT amount from all items
3. THE System SHALL store VAT amount in the sales table for each transaction
4. WHEN User views sale details, THE System SHALL display VAT breakdown by rate
5. THE System SHALL ensure VAT calculations match product VAT rates at time of sale

### Requirement 7

**User Story:** Ürün yöneticisi olarak, ürün listesinde KDV oranlarını görebilmek istiyorum, böylece hangi ürünlerin hangi KDV oranına sahip olduğunu hızlıca görebilirim.

#### Acceptance Criteria

1. THE System SHALL display VAT rate column in the products list table
2. THE System SHALL format VAT rate as percentage with "%" symbol
3. WHEN User sorts by VAT rate column, THE System SHALL order products by VAT rate value
4. WHEN User filters products, THE System SHALL allow filtering by VAT rate
5. THE System SHALL display VAT rate in product detail views

### Requirement 8

**User Story:** Muhasebe sorumlusu olarak, satış raporlarında KDV tutarlarını görebilmek istiyorum, böylece vergi beyannamesi hazırlayabileyim.

#### Acceptance Criteria

1. WHEN User generates a sales report, THE System SHALL include total VAT amount
2. THE System SHALL group VAT amounts by VAT rate (0%, 1%, 10%, 20%)
3. THE System SHALL display VAT base amount (matrah) for each VAT rate
4. THE System SHALL calculate total VAT collected for the reporting period
5. WHEN User exports report, THE System SHALL include VAT breakdown in export file
