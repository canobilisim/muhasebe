# Design Document

## Overview

Bu doküman, HesapOnda uygulamasının gelişmiş ürün yönetimi ve satış sistemi için teknik tasarım detaylarını içerir. Sistem, React + Vite + TypeScript + Supabase teknoloji stack'i üzerine inşa edilecek ve Turkcell e-Fatura API entegrasyonu ile tam özellikli bir POS ve fatura yönetim çözümü sunacaktır.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Product    │  │    Sales     │  │   Settings   │      │
│  │  Management  │  │  Management  │  │     Page     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │   Supabase     │       │   Turkcell     │
        │   (Database)   │       │  e-Fatura API  │
        │   via MCP      │       │                │
        └────────────────┘       └────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite (rolldown variant)
- **Styling**: TailwindCSS + ShadCN UI components
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Form Management**: React Hook Form + Zod validation
- **Database**: Supabase PostgreSQL (accessed via Supabase MCP)
- **External API**: Turkcell e-Fatura API
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Barcode**: react-barcode-reader or similar

### Database Access Strategy

Tüm veritabanı işlemleri **Supabase MCP (Model Context Protocol)** kullanılarak yapılacaktır:
- Migration'lar: `apply_migration` tool
- Veri sorguları: `execute_sql` tool
- Tablo listeleme: `list_tables` tool
- TypeScript tip üretimi: `generate_typescript_types` tool

## Components and Interfaces

### Page Structure

**NOT:** Aşağıdaki sayfalar mevcut ve değiştirilmeyecek:
- Müşteriler (`/customers`)
- Hızlı Satış (`/pos2`)
- Kasa Yönetimi (`/cash`)
- Raporlar (`/reports`)

**Yeni/Güncellenecek Sayfalar:**

```
src/
├── pages/
│   ├── products/
│   │   ├── ProductManagePage.tsx          # MEVCUT - Güncellenecek (modal yerine sayfa yönlendirme)
│   │   ├── ProductCreatePage.tsx          # YENİ - Yeni ürün ekleme (3 sekmeli, tam sayfa)
│   │   ├── ProductEditPage.tsx            # YENİ - Ürün düzenleme (3 sekmeli, tam sayfa)
│   │   └── CategoriesPage.tsx             # MEVCUT - Değişmeyecek
│   ├── sales/
│   │   ├── NewSalePage.tsx                # YENİ - Yeni satış formu
│   │   ├── SalesListPage.tsx              # YENİ - Satış geçmişi
│   │   └── ReturnsPage.tsx                # YENİ - İade/İptal
│   └── settings/
│       └── SettingsPage.tsx               # MEVCUT - e-Fatura API ayarları sekmesi eklenecek
├── components/
│   ├── layout/
│   │   ├── Layout.tsx                     # MEVCUT - Ana layout wrapper
│   │   └── Sidebar.tsx                    # MEVCUT - Satış menüsü eklenecek
│   ├── products/
│   │   ├── ProductForm.tsx                # YENİ - 3 sekmeli form wrapper
│   │   ├── ProductInfoTab.tsx             # YENİ - Sekme 1: Ürün Bilgileri
│   │   ├── TechnicalSpecsTab.tsx          # YENİ - Sekme 2: Teknik Özellikler
│   │   ├── SerialNumberManager.tsx        # YENİ - Seri no yönetimi
│   │   ├── VatRateSelector.tsx            # YENİ - KDV oranı seçici
│   │   ├── PriceCalculator.tsx            # YENİ - KDV dahil/hariç hesaplama
│   │   └── ProductTable.tsx               # MEVCUT - Güncellenecek (seri no kolonu)
│   ├── sales/
│   │   ├── CustomerInfoForm.tsx           # YENİ - Müşteri bilgileri
│   │   ├── ProductSearchInput.tsx         # YENİ - Barkod/isim arama
│   │   ├── SalesItemsTable.tsx            # YENİ - Satış kalemleri tablosu
│   │   ├── InvoiceInfoForm.tsx            # YENİ - Fatura bilgileri
│   │   ├── SalesSummary.tsx               # YENİ - Özet (ara toplam, KDV, genel toplam)
│   │   ├── SerialNumberSelectionModal.tsx # YENİ - Seri no seçim modalı
│   │   └── ProductNotFoundModal.tsx       # YENİ - Ürün bulunamadı modalı
│   ├── settings/
│   │   └── ApiSettingsTab.tsx             # YENİ - API ayarları sekmesi
│   ├── stock/                             # MEVCUT - Değişmeyecek
│   │   ├── ProductModal.tsx               # MEVCUT - Kaldırılacak (sayfa olacak)
│   │   ├── ExcelImportModal.tsx           # MEVCUT - Korunacak
│   │   └── ...                            # Diğer mevcut componentler
│   └── ui/                                # MEVCUT - ShadCN UI components
│       └── ...                            # card, button, input, table, vb.
├── services/
│   ├── productService.ts                  # Ürün CRUD işlemleri
│   ├── salesService.ts                    # Satış işlemleri
│   ├── serialNumberService.ts             # Seri no işlemleri
│   ├── turkcellApiService.ts              # e-Fatura API client
│   ├── excelService.ts                    # Excel import/export
│   └── apiSettingsService.ts              # API ayarları
├── stores/
│   ├── productStore.ts                    # Ürün state
│   ├── salesStore.ts                      # Satış state
│   └── settingsStore.ts                   # Ayarlar state
├── types/
│   ├── product.ts                         # Ürün tipleri
│   ├── sales.ts                           # Satış tipleri
│   ├── invoice.ts                         # Fatura tipleri
│   └── api.ts                             # API response tipleri
└── utils/
    ├── vatCalculator.ts                   # KDV hesaplama fonksiyonları
    ├── encryption.ts                      # API Key şifreleme
    └── validators.ts                      # Validasyon fonksiyonları
```

### Key Components

#### 1. ProductForm (3 Sekmeli Yapı)

**Mevcut Tasarıma Uyum:**
- Layout component ile sarmalanacak
- Card component kullanılacak
- Mevcut button, input, select stilleri korunacak
- Breadcrumb navigation eklenecek

```typescript
interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

// Tabs: Ürün Bilgileri, Teknik Özellikler
// Her sekme kendi validation'ına sahip
// "Kaydet ve Kapat" / "Kaydet ve Yeni Ekle" butonları
// Mevcut CategoriesPage tasarımına benzer form yapısı
```

#### 2. SerialNumberManager

```typescript
interface SerialNumberManagerProps {
  productId?: string;
  serialNumbers: SerialNumber[];
  onAdd: (serialNumber: string) => void;
  onRemove: (id: string) => void;
  onBulkAdd: (serialNumbers: string[]) => void;
}

// Tek tek veya toplu seri no ekleme
// Duplicate kontrolü
// Satılan/mevcut durumu gösterimi
```

#### 3. ProductSearchInput

```typescript
interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  onProductNotFound: (barcode: string) => void;
  autoFocus?: boolean;
}

// Barkod scanner entegrasyonu
// Debounced search
// Dropdown sonuçlar
```

#### 4. SerialNumberSelectionModal

```typescript
interface SerialNumberSelectionModalProps {
  product: Product;
  availableSerialNumbers: SerialNumber[];
  onSelect: (serialNumber: SerialNumber) => void;
  onCancel: () => void;
}

// Sadece available seri noları göster
// Seçim sonrası reserve et
```

## Data Models

### Database Schema

#### products table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  barcode TEXT NOT NULL UNIQUE,
  category TEXT,
  unit TEXT DEFAULT 'Adet',
  vat_rate NUMERIC NOT NULL DEFAULT 20,
  purchase_price NUMERIC,
  sale_price NUMERIC,
  is_vat_included BOOLEAN DEFAULT false,
  description TEXT,
  stock_tracking_enabled BOOLEAN DEFAULT true,
  serial_number_tracking_enabled BOOLEAN DEFAULT false,
  
  -- Teknik Özellikler
  brand TEXT,
  model TEXT,
  color TEXT,
  serial_number TEXT, -- Ürün modeli seri no (opsiyonel)
  condition TEXT CHECK (condition IN ('Yeni', '2. El', 'Yenilenmiş', 'Demo')),
  
  -- Metadata
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_brand_model ON products(brand, model);
CREATE INDEX idx_products_category ON products(category);
```

#### product_serial_numbers table

```sql
CREATE TABLE product_serial_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  added_date TIMESTAMP DEFAULT NOW(),
  sold_date TIMESTAMP,
  sale_id UUID REFERENCES sales(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_serial_numbers_product ON product_serial_numbers(product_id);
CREATE INDEX idx_serial_numbers_status ON product_serial_numbers(product_id, status);
CREATE UNIQUE INDEX idx_serial_numbers_unique ON product_serial_numbers(serial_number);
```

#### sales table

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Müşteri Bilgileri
  customer_type TEXT NOT NULL CHECK (customer_type IN ('Bireysel', 'Kurumsal')),
  customer_name TEXT NOT NULL,
  vkn_tckn TEXT NOT NULL,
  tax_office TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  
  -- Fatura Bilgileri
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('E_FATURA', 'E_ARSIV')),
  invoice_date DATE NOT NULL,
  currency TEXT DEFAULT 'TRY',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('NAKIT', 'KREDI_KARTI', 'HAVALE', 'TAKSITLI')),
  note TEXT,
  
  -- Tutarlar
  subtotal NUMERIC NOT NULL,
  total_vat_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  
  -- API Bilgileri
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error', 'cancelled')),
  invoice_uuid TEXT,
  invoice_number TEXT,
  error_message TEXT,
  
  -- Metadata
  branch_id UUID REFERENCES branches(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_date ON sales(invoice_date);
CREATE INDEX idx_sales_invoice_uuid ON sales(invoice_uuid);
```

#### sale_items table

```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  serial_number_id UUID REFERENCES product_serial_numbers(id),
  
  -- Ürün Bilgileri (snapshot)
  product_name TEXT NOT NULL,
  barcode TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  vat_rate NUMERIC NOT NULL,
  vat_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
```

#### api_settings table

```sql
CREATE TABLE api_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_encrypted TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'production')),
  is_active BOOLEAN DEFAULT true,
  last_test_date TIMESTAMP,
  last_test_status TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_settings_active ON api_settings(is_active);
```

### TypeScript Interfaces

```typescript
// Product Types
interface Product {
  id: string;
  name: string;
  barcode: string;
  category?: string;
  unit: string;
  vatRate: number;
  purchasePrice?: number;
  salePrice?: number;
  isVatIncluded: boolean;
  description?: string;
  stockTrackingEnabled: boolean;
  serialNumberTrackingEnabled: boolean;
  
  // Teknik Özellikler
  brand?: string;
  model?: string;
  color?: string;
  serialNumber?: string;
  condition?: 'Yeni' | '2. El' | 'Yenilenmiş' | 'Demo';
  
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerialNumber {
  id: string;
  productId: string;
  serialNumber: string;
  status: 'available' | 'reserved' | 'sold';
  addedDate: string;
  soldDate?: string;
  saleId?: string;
}

// Sales Types
interface Sale {
  id: string;
  
  // Müşteri
  customerType: 'Bireysel' | 'Kurumsal';
  customerName: string;
  vknTckn: string;
  taxOffice?: string;
  email: string;
  phone?: string;
  address: string;
  
  // Fatura
  invoiceType: 'E_FATURA' | 'E_ARSIV';
  invoiceDate: string;
  currency: string;
  paymentType: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'TAKSITLI';
  note?: string;
  
  // Tutarlar
  subtotal: number;
  totalVatAmount: number;
  totalAmount: number;
  
  // API
  status: 'pending' | 'sent' | 'error' | 'cancelled';
  invoiceUuid?: string;
  invoiceNumber?: string;
  errorMessage?: string;
  
  branchId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SaleItem {
  id: string;
  saleId: string;
  productId?: string;
  serialNumberId?: string;
  
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

// API Types
interface ApiSettings {
  id: string;
  apiKeyEncrypted: string;
  environment: 'test' | 'production';
  isActive: boolean;
  lastTestDate?: string;
  lastTestStatus?: string;
}

interface TurkcellInvoicePayload {
  invoiceType: string;
  invoiceDate: string;
  currency: string;
  paymentType: string;
  customer: {
    type: string;
    name: string;
    identifier: string;
    taxOffice?: string;
    email: string;
    address: string;
  };
  lineItems: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    totalAmount: number;
  }>;
  totals: {
    subtotal: number;
    totalVat: number;
    grandTotal: number;
  };
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  field?: string;
}
```

### Error Handling Strategy

1. **Form Validation Errors**
   - Zod schema validation
   - Field-level error messages
   - Red border highlights
   - Prevent submission

2. **Database Errors**
   - Catch Supabase MCP errors
   - Log to console
   - Display user-friendly message
   - Retry mechanism for transient errors

3. **API Errors**
   - Axios interceptors
   - Parse Turkcell API error responses
   - Display specific error messages
   - Retry with exponential backoff (max 3 attempts)

4. **Network Errors**
   - Detect offline status
   - Display "Bağlantı hatası" message
   - Queue operations for retry
   - Show reconnection status

### Toast Notifications

```typescript
// Success
toast.success('Ürün başarıyla kaydedildi');

// Error
toast.error('Ürün kaydedilemedi: ' + error.message);

// Warning
toast.warning('API ayarları yapılmamış');

// Info
toast.info('Fatura gönderiliyor...');
```

## Testing Strategy

### Unit Tests

- **Utils**: VAT calculator, validators, encryption
- **Services**: Mock Supabase MCP responses
- **Components**: React Testing Library

### Integration Tests

- **Product Flow**: Create → Edit → Delete
- **Sales Flow**: Add items → Calculate → Submit
- **Serial Number Flow**: Add → Reserve → Sell

### E2E Tests (Optional)

- Complete sales process
- Excel import/export
- API integration

### Test Coverage Goals

- Utils: 90%+
- Services: 80%+
- Components: 70%+

## Security Considerations

### API Key Protection

```typescript
// Encryption using Web Crypto API
async function encryptApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  
  // Use AES-GCM encryption
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
```

### Input Sanitization

- Escape HTML in user inputs
- Validate barcode format
- Sanitize SQL inputs (handled by Supabase MCP)
- Validate file uploads (Excel)

### Authentication

- Use existing Supabase Auth
- Row Level Security (RLS) policies
- Branch-based data isolation

## Performance Optimization

### Database Queries

- Use indexes on frequently queried columns
- Pagination for large lists (50 items per page)
- Debounce search inputs (300ms)
- Cache category/unit lists

### Frontend Optimization

- Lazy load pages with React.lazy()
- Memoize expensive calculations (useMemo)
- Virtualize long lists (react-window)
- Optimize re-renders (React.memo)

### API Calls

- Batch operations where possible
- Cache API settings
- Retry failed requests
- Cancel pending requests on unmount

## Deployment Considerations

### Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_APP_VERSION=1.0.0
```

### Build Process

```bash
npm run build
# Output: dist/
```

### Database Migrations

All migrations will be applied using Supabase MCP:
```typescript
// Example migration
await applyMigration({
  name: 'add_serial_numbers_table',
  query: `CREATE TABLE product_serial_numbers (...)`
});
```

## Sidebar Navigation Updates

Mevcut Sidebar.tsx'e aşağıdaki menü öğesi eklenecek:

```typescript
{
  title: 'Satışlar',
  icon: Receipt, // lucide-react'tan import edilecek
  roles: ['admin', 'manager', 'cashier'],
  subItems: [
    {
      title: 'Yeni Satış',
      href: '/sales/new',
      icon: Plus
    },
    {
      title: 'Satış Listesi',
      href: '/sales/list',
      icon: List
    },
    {
      title: 'İade/İptal',
      href: '/sales/returns',
      icon: RotateCcw
    }
  ]
}
```

**Ürünler menüsü güncellemesi:**
- "Ürün Yönetimi" alt menüsü kaldırılacak
- "Ürün Listesi" href'i `/products/manage` olarak güncellenecek
- Yeni ürün ekleme ve düzenleme sayfa yönlendirmesi ile yapılacak

## Integration Points

### Turkcell e-Fatura API

**Base URLs:**
- Test: `https://efaturaservicetest.isim360.com/v1`
- Production: `https://efaturaservice.turkcellesirket.com/v1`

**Key Endpoints:**
- `POST /outboxinvoice/create` - Fatura oluştur
- `POST /invoice/cancel` - Fatura iptal
- `POST /invoice/return` - İade faturası
- `GET /outboxinvoice/{id}` - Fatura sorgula

**Authentication:**
```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
}
```

### Excel Import/Export

**Import Format:**
```
Ürün Adı | Barkod | Kategori | Birim | KDV Oranı | Alış Fiyatı | Satış Fiyatı
```

**Export Format:**
```
Ürün Adı | Barkod | Kategori | Birim | KDV Oranı | Alış Fiyatı | Satış Fiyatı | Stok | Marka | Model | Renk | Seri No | Durum
```

**Library:** xlsx or exceljs

## UI/UX Design Guidelines

### Mevcut Tasarıma Uyum

**Korunacak Tasarım Elemanları:**
- Layout component wrapper (tüm sayfalarda)
- Card component (başlık ve içerik için)
- Button variants (default, outline, ghost, destructive)
- Table component (liste görünümleri için)
- Dialog/Modal component (onay ve formlar için)
- Input, Select, Label components
- Toast notifications (react-hot-toast)
- Lucide React icons

**Sayfa Yapısı Standardı:**
```tsx
<Layout>
  <div className="space-y-6">
    {/* Başlık ve Aksiyon Butonları */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sayfa Başlığı</h1>
        <p className="text-gray-600 mt-1">Açıklama</p>
      </div>
      <div className="flex gap-2">
        {/* Aksiyon butonları */}
      </div>
    </div>

    {/* İçerik Card'ları */}
    <Card>
      <CardHeader>
        <CardTitle>...</CardTitle>
      </CardHeader>
      <CardContent>
        {/* İçerik */}
      </CardContent>
    </Card>
  </div>
</Layout>
```

### Color Palette

**Mevcut Renkler (Korunacak):**
```css
--primary: #3B82F6;      /* Blue-600 */
--success: #10B981;      /* Green-500 */
--error: #EF4444;        /* Red-500 */
--warning: #F59E0B;      /* Amber-500 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-600: #4B5563;
--gray-900: #111827;
```

### Typography

- Headings: font-semibold
- Body: font-normal
- Labels: font-medium text-sm

### Spacing

- Form fields: space-y-4
- Sections: space-y-6
- Page padding: p-6

### Responsive Design

- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast ratio > 4.5:1

## Migration Plan

### Phase 1: Database Setup
1. Create all tables using Supabase MCP
2. Set up indexes
3. Configure RLS policies

### Phase 2: Product Management
1. Product list page
2. Product create/edit pages
3. Serial number management
4. Excel import/export

### Phase 3: Sales Management
1. New sale page
2. Product search & barcode
3. Sales list
4. Returns page

### Phase 4: API Integration
1. API settings page
2. Turkcell API service
3. Invoice creation
4. Error handling

### Phase 5: Testing & Polish
1. Unit tests
2. Integration tests
3. Bug fixes
4. Performance optimization

## Monitoring and Logging

### Application Logs

```typescript
// Log structure
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  data?: any;
}

// Example
logger.error('turkcell-api', 'Invoice creation failed', {
  saleId: sale.id,
  error: error.message
});
```

### Metrics to Track

- Sales per day
- Invoice success rate
- API response times
- Error rates by type
- User actions (product created, sale completed)

### Error Reporting

- Console errors in development
- Sentry or similar in production (optional)
- Database error logs table
