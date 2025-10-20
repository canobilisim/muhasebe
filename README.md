# Cano Ön Muhasebe

Modern web teknolojileri kullanılarak geliştirilmiş kapsamlı POS ve muhasebe uygulaması.

## Teknolojiler

- **Frontend**: React 19 + TypeScript + Vite (rolldown-vite variant)
- **Styling**: TailwindCSS + ShadCN UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
  - Persistent session management with localStorage
  - Auto-refresh token support
  - Session detection from URL
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Form Management**: React Hook Form + Zod
- **Development**: ESLint with React-specific rules
- **AI Integration**: Model Context Protocol (MCP) with Supabase MCP server

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd cano-on-muhasebe
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

> **Not**: Proje Zustand, Supabase, React Router DOM, React Hook Form, Zod ve ShadCN UI bileşenlerini kullanır. Tüm bağımlılıklar package.json dosyasında tanımlanmıştır.

3. Environment variables dosyasını oluşturun:
```bash
cp .env.example .env
```

4. `.env` dosyasını Supabase bilgilerinizle güncelleyin:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── ui/             # ShadCN UI bileşenleri
│   ├── layout/         # Layout bileşenleri
│   ├── pos/            # POS sistemi bileşenleri
│   ├── customers/      # Müşteri yönetimi bileşenleri
│   ├── stock/          # Stok yönetimi bileşenleri
│   └── cash/           # Kasa yönetimi bileşenleri
├── pages/              # Sayfa bileşenleri
├── hooks/              # Custom React hooks
├── stores/             # Zustand store'ları
├── services/           # API servisleri
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
└── lib/                # Kütüphane yapılandırmaları
```

### Sistem Mimarisi

**State Management (Zustand)**
- `posStore.ts`: Sepet yönetimi, ödeme bilgileri, hesaplamalar
- `authStore.ts`: Kullanıcı kimlik doğrulama ve yetkilendirme

**Modül Bileşenleri**
- **POS**: `BarcodeInput`, `ProductSearch`, `PaymentTypeButtons`, `ReceiptModal`
- **Müşteriler**: `CustomerTable`, `CustomerForm`, `CustomerBalanceReport`, `OverduePayments`
- **Stok**: `ProductTable`, `ProductForm`, `StockFilters`, `DeleteProductDialog`
- **Kasa**: `CashSummary`, `CashMovementsTable`, `IncomeExpenseModal`, `DailyCashReport`

**Servisler**
- `dashboardService.ts`: Dashboard KPI'ları ve satış analitiği
- `productService.ts`: Ürün CRUD işlemleri ve stok kontrolü
- `customerService.ts`: Müşteri yönetimi ve borç takibi
- `cashService.ts`: Kasa işlemleri ve raporlama
- `salesService.ts`: Satış işlemleri ve fiş oluşturma
- `receiptService.ts`: PDF fiş oluşturma ve WhatsApp entegrasyonu

**Hooks**
- `useProductSearch.ts`: Ürün arama ve filtreleme mantığı
- `useCustomers.ts`: Müşteri yönetimi state ve işlemleri
- `useProducts.ts`: Stok yönetimi state ve işlemleri
- `useCash.ts`: Kasa yönetimi state ve işlemleri
- `useKeyboardShortcuts.ts`: Klavye kısayolları yönetimi
- `useAuth.ts`: Authentication state ve yardımcı fonksiyonlar

**Type System**
- `types/index.ts`: Ana tip tanımları ve interface'ler
- `types/database.ts`: Supabase veritabanı tipleri
- `types/enums.ts`: Enum tanımları (UserRole, PaymentType, vb.)
- `types/guards.ts`: Type guard fonksiyonları ve validasyonlar
- `types/pos.ts`: POS hızlı satış sayfası için özel tipler
- `types/turkcell.ts`: Turkcell işlemleri ve hedef takibi tipleri
- Full TypeScript desteği ile compile-time tip güvenliği

## Özellikler

- 🏪 **POS Sistemi**: Hızlı satış işlemleri ve barkod okuma
- 👥 **Müşteri Yönetimi**: Müşteri bilgileri ve borç takibi
- 📦 **Stok Yönetimi**: Ürün stokları ve kritik stok uyarıları
- 💰 **Kasa Yönetimi**: Günlük kasa hareketleri ve raporlama
- 📊 **Dashboard**: Gerçek zamanlı KPI'lar, satış analitiği ve trend grafikleri
- ⚙️ **Sistem Ayarları**: Firma bilgileri ve kullanıcı yönetimi
- 🏢 **Multi-tenant**: Şube bazlı veri izolasyonu
- 🤖 **AI Entegrasyonu**: Kiro AI asistanı ile MCP protokolü üzerinden Supabase entegrasyonu

## Mevcut Durum

### ✅ Tamamlanan Özellikler
- **Proje Kurulumu**: Vite + React + TypeScript + TailwindCSS + ShadCN UI
- **Veritabanı Şeması**: Supabase PostgreSQL tabloları ve RLS politikaları
- **Authentication Sistemi**: 
  - Supabase Auth entegrasyonu ve rol tabanlı erişim
  - Persistent session management (localStorage)
  - Otomatik token yenileme
  - URL'den session algılama
- **Layout Sistemi**: Sidebar, Topbar, MainContent bileşenleri
- **Router Yapılandırması**: React Router DOM ile korumalı rotalar
- **Rol Tabanlı Erişim**: Admin, Manager, Cashier rolleri ve yetki kontrolü
- **POS Sistemi**: 
  - Zustand tabanlı POS state management
  - Sepet yönetimi (ekleme, çıkarma, miktar güncelleme)
  - Barkod okuma ve ürün arama
  - Otomatik fiyat hesaplama (KDV dahil)
  - Stok kontrolü ve uyarıları
  - Ödeme işlemleri (Nakit, POS, Kredi, Parçalı)
  - Fiş yazdırma ve WhatsApp entegrasyonu
  - Klavye kısayolları (F8, F9, F10)
  - Responsive tasarım ve touch-friendly arayüz
- **Müşteri Yönetimi**: 
  - CRUD işlemleri ve müşteri listesi
  - Borç takibi ve bakiye hesaplama
  - Vadesi yaklaşan tahsilatlar
  - Excel/PDF export fonksiyonları
- **Stok Yönetimi**: 
  - Ürün listesi ve CRUD işlemleri
  - Stok kontrolü ve kritik stok uyarıları
  - Kategori bazlı filtreleme
- **Kasa Yönetimi**: 
  - Günlük kasa açılış/kapanış işlemleri
  - Gelir/gider takibi
  - Kasa hareketleri raporlama
  - POS cihaz bazlı raporlama
- **Dashboard Sistemi**: 
  - Günlük satış KPI'ları (toplam, adet, ödeme türü bazlı)
  - Aylık satış özeti ve karşılaştırma
  - Gerçek zamanlı kasa durumu ve günlük özet
  - Düşük stoklu ürün sayısı ve uyarıları
  - Bekleyen ödeme takibi
  - Son 7 günlük satış trend grafiği
  - Son 12 aylık satış performans analizi
  - Şube bazlı veri filtreleme

- **Dashboard Sistemi**: 
  - Günlük ve aylık satış KPI'ları
  - Ödeme türü bazlı satış analizi (Nakit, POS, Kredi)
  - Kasa özeti ve günlük kasa durumu
  - Düşük stoklu ürün uyarıları
  - Bekleyen ödeme takibi
  - Son 7 günlük satış grafiği
  - Son 12 aylık satış trend analizi

### 🚧 Geliştirme Aşamasında
- **Stok Yönetimi**: Excel import ve toplu fiyat güncelleme
- **Raporlama Sistemi**: Detaylı satış, müşteri ve stok raporları
- **Sistem Ayarları**: Firma bilgileri ve kullanıcı yönetimi

### Demo Hesapları
Uygulama test edilebilir demo hesapları içerir:
- **Admin**: admin@demo.com / 123456
- **Manager**: manager@demo.com / 123456
- **Cashier**: cashier@demo.com / 123456

### Geliştirme Araçları
- **AuthDebug Component**: Authentication durumunu görselleştiren debug bileşeni
  - Zustand auth store durumu
  - Supabase session bilgileri
  - LocalStorage auth verileri
  - Yenileme ve temizleme butonları
  - Kullanım: `<AuthDebug />` bileşenini geliştirme ortamında sayfaya ekleyin

## POS Sistemi Özellikleri

### POS Sistemi Özellikleri
- **Barkod Okuma**: Otomatik barkod algılama ve ürün bulma
- **Manuel Arama**: Ürün adı veya barkod ile arama
- **Sepet Yönetimi**: Ürün ekleme, çıkarma, miktar güncelleme
- **Stok Kontrolü**: Gerçek zamanlı stok kontrolü ve uyarıları
- **Fiyat Hesaplama**: Otomatik KDV hesaplama (%18)
- **İndirim Sistemi**: Ürün bazlı indirim uygulama
- **Ödeme Türleri**: Nakit, POS, Kredi, Parçalı ödeme
- **Fiş Yazdırma**: PDF oluşturma ve WhatsApp gönderimi

### Müşteri Yönetimi Özellikleri
- **Müşteri Listesi**: Arama, filtreleme ve sayfalama
- **CRUD İşlemleri**: Müşteri ekleme, düzenleme, silme
- **Borç Takibi**: Güncel bakiye ve ödeme geçmişi
- **Vadeli Satışlar**: Kredi limiti kontrolü
- **Raporlama**: Excel/PDF export, vadesi yaklaşan tahsilatlar

### Stok Yönetimi Özellikleri
- **Ürün Listesi**: Kategori bazlı filtreleme ve arama
- **Stok Kontrolü**: Kritik stok seviyesi uyarıları
- **Fiyat Yönetimi**: Alış/satış fiyatı takibi
- **Barkod Sistemi**: Otomatik barkod üretimi ve kontrolü

### Kasa Yönetimi Özellikleri
- **Günlük Kasa**: Açılış/kapanış işlemleri
- **Gelir/Gider**: Kasa hareketleri takibi
- **Raporlama**: Günlük kasa raporu ve özet
- **POS Entegrasyonu**: Satış bazlı otomatik kasa güncellemesi

### Klavye Kısayolları
- **F8**: Nakit ödeme
- **F9**: POS ödeme
- **F10**: Kredi ödeme
- **Enter**: Barkod arama ve sepete ekleme
- **Escape**: Arama alanını temizleme

### Teknik Özellikler
- **Debounced Search**: 300ms gecikme ile optimize edilmiş arama
- **Error Handling**: Kapsamlı hata yönetimi ve kullanıcı bildirimleri
- **Type Safety**: Full TypeScript desteği
- **Real-time Updates**: Supabase ile gerçek zamanlı veri senkronizasyonu
- **Responsive Design**: Desktop ve mobile uyumlu tasarım
- **Multi-tenant**: Şube bazlı veri izolasyonu
- **Analytics Engine**: Gerçek zamanlı KPI hesaplama ve trend analizi
- **Data Aggregation**: Optimize edilmiş veri toplama ve gruplama işlemleri
- **AI Integration**: MCP protokolü ile Kiro AI asistanı entegrasyonu

## API Yapısı

### DashboardService
```typescript
// Dashboard KPI'larını getir
dashboardService.getDashboardKPIs(branchId: string): Promise<DashboardKPIs>

// Son 7 günün satış grafiği
dashboardService.getWeeklySalesChart(branchId: string): Promise<SalesChartData[]>

// Son 12 ayın satış grafiği
dashboardService.getMonthlySalesChart(branchId: string): Promise<MonthlyChartData[]>

// KPI veri yapısı
interface DashboardKPIs {
  todaySales: { totalAmount, totalCount, cashAmount, posAmount, creditAmount }
  monthlySales: { totalAmount, totalCount }
  cashSummary: { openingAmount, currentAmount, totalIncome, totalExpense }
  lowStockProducts: number
  pendingPayments: number
}
```

### ProductService
```typescript
// Barkod ile ürün arama
ProductService.searchByBarcode(barcode: string): Promise<ApiResponse<Product>>

// İsim/barkod ile ürün arama
ProductService.searchProducts(query: string, limit?: number): Promise<ApiResponse<Product[]>>

// Filtreleme ile ürün listesi
ProductService.getProducts(filter: ProductFilter): Promise<ApiResponse<Product[]>>

// Stok kontrol yardımcıları
ProductService.checkStock(product: Product, quantity: number): boolean
ProductService.isLowStock(product: Product): boolean
ProductService.isOutOfStock(product: Product): boolean
```

### CustomerService
```typescript
// Müşteri CRUD işlemleri
CustomerService.getCustomers(filter?: CustomerFilter): Promise<ApiResponse<Customer[]>>
CustomerService.createCustomer(customer: CustomerInsert): Promise<ApiResponse<Customer>>
CustomerService.updateCustomer(id: string, customer: CustomerUpdate): Promise<ApiResponse<Customer>>

// Borç takibi
CustomerService.getCustomerBalance(customerId: string): Promise<ApiResponse<CustomerBalance>>
CustomerService.getOverduePayments(): Promise<ApiResponse<OverduePayment[]>>
```

### CashService
```typescript
// Kasa işlemleri
CashService.openCash(amount: number): Promise<ApiResponse<CashMovement>>
CashService.closeCash(amount: number): Promise<ApiResponse<CashMovement>>
CashService.addIncomeExpense(movement: CashMovementInsert): Promise<ApiResponse<CashMovement>>

// Raporlama
CashService.getDailyCashReport(date: string): Promise<ApiResponse<DailyCashReport>>
CashService.getCashMovements(filter: CashFilter): Promise<ApiResponse<CashMovement[]>>
```

### POS Store Actions
```typescript
// Sepet işlemleri
addToCart(product: Product, quantity?: number): void
removeFromCart(productId: string): void
updateCartItemQuantity(productId: string, quantity: number): void
updateCartItemDiscount(productId: string, discountAmount: number): void

// Ödeme işlemleri
setPaymentType(type: PaymentType): void
setPaidAmount(amount: number): void
processPayment(): Promise<boolean>
```

### POS Fast Sale Types
```typescript
// POS tipleri types/pos.ts'den export edilir ve types/index.ts üzerinden erişilebilir
import type { POSProduct, POSCart, POSState } from '@/types'

// Hızlı satış sayfası için özel tip tanımları
interface POSProduct {
  id: string
  barcode: string
  name: string
  unitPrice: number
  qty: number
  discount: number
  currency: string
  vatRate: number
  category: string
  lineTotal?: number
}

interface POSCart {
  tabId: string
  customerLabel: string
  lines: POSProduct[]
  gross: number
  discountTotal: number
  net: number
}

interface POSState {
  activePriceList: string
  activeCustomerTab: string
  discountValue: number
  discountType: string
  currency: string
  paid: number
  total: number
  net: number
  change: number
  limit: number
  remaining: number
  carts: POSCart[]
  catalog: POSProduct[]
  categories: string[]
  quickAmounts: number[]
  quickAdjustments: number[]
  selectedCategory: string
  now: string
}
```

## MCP (Model Context Protocol) Entegrasyonu

Proje, Kiro AI asistanı ile entegrasyon için Model Context Protocol (MCP) desteği içerir.

### Yapılandırma

MCP sunucuları `.kiro/settings/mcp.json` dosyasında yapılandırılır:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=your_project_ref",
      "headers": {
        "Authorization": "Bearer your_supabase_service_role_key",
        "X-Supabase-Access-Token": "your_service_role_key_here"
      },
      "disabled": false,
      "autoApprove": [],
      "disabledTools": []
    }
  }
}
```

#### Yapılandırma Parametreleri

- **type**: MCP sunucu tipi (`http` veya `stdio`)
- **url**: Supabase MCP sunucu URL'i (proje referansı ile)
- **headers**: HTTP başlıkları
  - `Authorization`: Bearer token ile kimlik doğrulama
  - `X-Supabase-Access-Token`: Ek Supabase erişim anahtarı (service role key)
- **disabled**: Sunucuyu devre dışı bırakmak için `true` yapın
- **autoApprove**: Otomatik onaylanacak araç isimleri listesi
- **disabledTools**: Devre dışı bırakılacak araç isimleri listesi

### Supabase MCP Server

- **Protokol**: HTTP tabanlı MCP sunucusu
- **Amaç**: Kiro AI asistanının Supabase veritabanı ile doğrudan etkileşim kurmasını sağlar
- **Özellikler**: 
  - Veritabanı sorgulama ve veri analizi
  - Tablo yapısı inceleme
  - Performans metrikleri
  - Otomatik raporlama desteği
- **Güvenlik**: 
  - Çift katmanlı kimlik doğrulama (Bearer token + Access token)
  - Proje referansı ile sınırlı erişim
  - Authorization ve X-Supabase-Access-Token header'ları ile güvenli API erişimi
- **Bağlantı**: HTTPS üzerinden güvenli iletişim

### Kullanım

MCP entegrasyonu sayesinde Kiro AI asistanı:
- Satış verilerini analiz edebilir
- Stok durumu raporları oluşturabilir
- Müşteri davranış analizleri yapabilir
- Performans önerilerinde bulunabilir
- Veritabanı optimizasyonu önerebilir

## Geliştirme

```bash
# Geliştirme sunucusu
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint
```

## Veritabanı Kurulumu

Detaylı veritabanı kurulum talimatları için `supabase/README.md` dosyasına bakın.

## Sorun Giderme

### TypeScript Hataları
- Eğer Zustand import hataları alıyorsanız: `npm install zustand`
- Button component variant hataları için ShadCN UI bileşenlerinin doğru kurulduğundan emin olun
- Path alias (@/) çalışmıyorsa `vite.config.ts` dosyasındaki yapılandırmayı kontrol edin

### POS Sistemi
- **Barkod Okuyucu Çalışmıyor**: Input alanının odakta olduğundan emin olun
- **Ürün Bulunamıyor**: Supabase bağlantısını ve ürün verilerini kontrol edin
- **Stok Uyarıları**: `critical_stock_level` değerlerinin doğru ayarlandığından emin olun
- **Sepet Hesaplamaları**: KDV oranının (%18) doğru uygulandığını kontrol edin

### Geliştirme Ortamı
- VS Code kullanıyorsanız, TypeScript auto-closing tags devre dışı bırakılmıştır
- ESLint kuralları React 19 ve TypeScript için optimize edilmiştır
- POS test bileşeni `/pos` sayfasında mevcuttur

### MCP Entegrasyonu
- **MCP Sunucu Bağlantısı**: `.kiro/settings/mcp.json` dosyasındaki yapılandırmayı kontrol edin
- **HTTP MCP Server**: Supabase MCP sunucusu HTTP protokolü üzerinden çalışır
- **Kimlik Doğrulama**: Çift katmanlı doğrulama (Authorization + X-Supabase-Access-Token header'ları)
- **Supabase MCP**: Proje referansının (`project_ref`) ve her iki service role key'in doğru olduğundan emin olun
- **Sunucu Durumu**: `disabled: false` ile sunucunun aktif olduğunu kontrol edin
- **Araç Yönetimi**: `autoApprove` ve `disabledTools` dizileri ile araç erişimini yönetin
- **Kiro AI Erişimi**: MCP sunucusunun aktif olduğunu Kiro feature panelinden kontrol edin
- **Bağlantı Sorunları**: MCP sunucuları otomatik olarak yeniden bağlanır, manuel yeniden bağlantı için Kiro MCP Server view'ını kullanın

## Proje Yönetimi

- **Görev Takibi**: `.kiro/specs/cano-on-muhasebe/tasks.md`
- **Teknik Rehber**: `.kiro/steering/tech.md`
- **Proje Yapısı**: `.kiro/steering/structure.md`
- **MCP Yapılandırması**: `.kiro/settings/mcp.json`

## Lisans

Bu proje özel lisans altındadır.