# İmplementasyon Planı

- [x] 1. Proje kurulumu ve temel yapılandırma
  - Vite + React + TypeScript projesi oluştur
  - TailwindCSS ve ShadCN UI kurulumu yap
  - Supabase client yapılandırması
  - Temel klasör yapısını oluştur
  - _Gereksinimler: Tüm modüller için temel altyapı_

- [x] 2. Veritabanı şeması ve Supabase kurulumu
  - [x] 2.1 Supabase projesi oluştur ve veritabanı tablolarını kur
    - Users, branches, products, customers, sales, sale_items, cash_movements tablolarını oluştur
    - Row Level Security (RLS) politikalarını uygula
    - Gerekli indeksleri ve foreign key'leri ekle
    - _Gereksinimler: 7.5, 7.6_

  - [x] 2.2 TypeScript tip tanımlarını oluştur
    - Database types dosyasını oluştur
    - Core interface'leri tanımla (User, Product, Sale, Customer)
    - Enum'ları tanımla (UserRole, PaymentType, PaymentStatus)
    - _Gereksinimler: Tüm modüller için veri tipleri_

- [x] 3. Authentication sistemi implementasyonu
  - [x] 3.1 Supabase Auth entegrasyonu
    - Auth store (Zustand) oluştur
    - Login/logout fonksiyonlarını implement et
    - useAuth hook'unu oluştur
    - _Gereksinimler: 6.1, 6.2_

  - [x] 3.2 Login sayfası ve korumalı rotalar
    - Login form bileşenini oluştur
    - PrivateRoute wrapper bileşenini implement et
    - Role-based access control ekle
    - _Gereksinimler: 6.3, 6.4, 6.5_

- [x] 4. Temel layout ve navigasyon
  - [x] 4.1 Ana layout bileşenlerini oluştur
    - Sidebar bileşenini implement et
    - Topbar bileşenini oluştur
    - MainContent wrapper'ını ekle
    - _Gereksinimler: Tüm sayfalarda ortak layout_

  - [x] 4.2 Router yapılandırması
    - React Router kurulumu ve route tanımları
    - Lazy loading ile sayfa bileşenlerini yükle
    - 404 ve error boundary sayfalarını ekle
    - _Gereksinimler: Tüm modüller için navigasyon_

- [x] 5. POS sistemi core bileşenleri
  - [x] 5.1 POS store ve state management
    - POS Zustand store'unu oluştur
    - Cart management fonksiyonlarını implement et
    - Payment summary hesaplama mantığını ekle
    - _Gereksinimler: 1.3, 1.7_

  - [x] 5.2 Barkod arama ve ürün ekleme
    - BarcodeInput bileşenini oluştur
    - Product search API fonksiyonunu implement et
    - Sepete ürün ekleme mantığını kodla
    - _Gereksinimler: 1.1, 1.2_

- [x] 6. POS ana ekran layout'u
  - [x] 6.1 Sol panel - ürün arama ve liste
    - [x] ProductSearch bileşenini oluştur
    - [x] ProductSearchList bileşenini implement et
    - [x] BarcodeInput bileşenini oluştur
    - [x] useProductSearch hook'unu implement et
    - [ ] CategoryTabs bileşenini implement et
    - [ ] ProductTable bileşenini kodla (Barkod, Ürün, Miktar, Fiyat, Tutar kolonları)
    - _Gereksinimler: 1.1, 1.2_

  - [x] 6.2 Sağ panel - ödeme ve müşteri bilgileri
    - PaymentSummary bileşenini oluştur (Ödenen, Tutar, Para Üstü)
    - QuickAmountButtons bileşenini implement et (20, 50, 100, 200, +10, -10)
    - PaymentTypeButtons bileşenini kodla (NAKİT, POS, AÇIK HESAP, PARÇALI)
    - _Gereksinimler: 1.4, 1.5_

- [x] 7. Ödeme işlemi ve fiş yazdırma
  - [x] 7.1 Ödeme işlemi mantığı
    - Payment processing fonksiyonunu implement et
    - Stok düşüş mantığını ekle
    - Sales ve sale_items tablolarına kayıt ekleme
    - _Gereksinimler: 1.5, 1.6_

  - [x] 7.2 Fiş yazdırma ve WhatsApp entegrasyonu
    - PDF fiş oluşturma fonksiyonunu implement et
    - Receipt modal bileşenini oluştur
    - WhatsApp gönderim seçeneğini ekle
    - _Gereksinimler: 1.6, 1.7_

- [x] 8. Klavye kısayolları ve UX iyileştirmeleri
  - [x] 8.1 Keyboard shortcuts implementasyonu
    - useKeyboardShortcuts hook'unu oluştur
    - F8 (Nakit), F9 (POS), F10 (Kredi) kısayollarını ekle
    - Enter ile barkod arama, Escape ile sepet temizleme
    - _Gereksinimler: 1.4_

  - [x] 8.2 POS ekranı responsive tasarım
    - Desktop-first responsive grid layout
    - Mobile için payment panel optimizasyonu
    - Touch-friendly button boyutları
    - _Gereksinimler: Tüm cihazlarda kullanılabilirlik_

- [x] 9. Müşteri yönetimi modülü
  - [x] 9.1 Müşteri listesi ve CRUD işlemleri
    - CustomersPage bileşenini oluştur
    - Customer list table bileşenini implement et
    - Add/Edit customer modal bileşenlerini kodla
    - _Gereksinimler: 2.1, 2.2_

  - [x] 9.2 Müşteri borç takibi ve raporlama
    - Customer balance hesaplama mantığını implement et
    - Vadesi yaklaşan tahsilatlar listesini oluştur
    - Excel/PDF export fonksiyonlarını ekle
    - _Gereksinimler: 2.3, 2.5_

- [x] 10. Stok yönetimi modülü
  - [x] 10.1 Ürün listesi ve CRUD işlemleri
    - StockPage bileşenini oluştur
    - Product list table bileşenini implement et
    - Add/Edit product modal bileşenlerini kodla
    - _Gereksinimler: 3.1, 3.2_

  - [x] 10.2 Stok uyarıları ve toplu işlemler
    - Kritik stok uyarı sistemi implement et
    - Excel import fonksiyonunu kodla
    - Bulk price update özelliğini ekle
    - _Gereksinimler: 3.1, 3.3, 3.4_

- [x] 11. Kasa yönetimi modülü
  - [x] 11.1 Kasa açılış/kapanış işlemleri
    - CashPage bileşenini oluştur
    - Daily cash opening/closing fonksiyonlarını implement et
    - Cash movements tracking sistemi
    - _Gereksinimler: 4.1, 4.2, 4.3_

  - [x] 11.2 Gelir/gider takibi ve raporlama
    - Income/expense entry form bileşenini oluştur
    - Daily cash report generation
    - POS device based reporting
    - _Gereksinimler: 4.4, 4.5, 4.6_

- [x] 12. Dashboard ve raporlama
  - [x] 12.1 Dashboard ana sayfa
    - Dashboard bileşenini oluştur
    - Günlük/aylık satış grafikleri (Recharts)
    - KPI kartları (net kâr, kasa özeti)
    - _Gereksinimler: 5.1, 5.2_

  - [x] 12.2 Detaylı raporlama sistemi
    - ReportsPage bileşenini implement et
    - Satış, müşteri, stok raporları
    - Tarih ve şube filtreleme
    - Excel/PDF export fonksiyonları
    - _Gereksinimler: 5.3, 5.4, 5.6_

- [x] 13. Sistem ayarları ve kullanıcı yönetimi
  - [x] 13.1 Firma bilgileri ve sistem ayarları
    - SettingsPage bileşenini oluştur
    - Company info form bileşenini implement et
    - Logo upload ve printer template ayarları
    - _Gereksinimler: 7.1, 7.2_

  - [x] 13.2 Kullanıcı rolleri ve şube yönetimi
    - User management interface
    - Role-based permission system
    - Branch (tenant) management
    - _Gereksinimler: 6.1, 6.2, 6.3, 7.5_

- [x] 14. Error handling ve toast notifications
  - [x] 14.1 Global error handling sistemi
    - ErrorBoundary bileşenini implement et
    - API error handler fonksiyonlarını oluştur
    - Toast notification sistemi kurulumu
    - _Gereksinimler: Tüm modüller için hata yönetimi_

  - [x] 14.2 Loading states ve UX iyileştirmeleri
    - Loading spinner bileşenlerini oluştur
    - Skeleton loading states ekle
    - Empty state bileşenlerini implement et
    - _Gereksinimler: Kullanıcı deneyimi optimizasyonu_

- [x] 15. Test implementasyonu
  - [x] 15.1 Unit testler
    - Utility functions için unit testler
    - Store actions için testler
    - Component unit testleri
    - _Gereksinimler: Kod kalitesi ve güvenilirlik_

  - [x] 15.2 Integration testler
    - POS satış akışı integration testleri
    - API call testleri
    - Form submission testleri
    - _Gereksinimler: End-to-end işlevsellik doğrulama_

- [x] 16. Performance optimizasyonu ve deployment hazırlığı
  - [x] 16.1 Performance optimizasyonları
    - Code splitting ve lazy loading
    - Memoization optimizasyonları
    - Bundle size analizi ve optimizasyon
    - _Gereksinimler: Hızlı ve responsive uygulama_

  - [x] 16.2 Production build ve deployment
    - Environment variables yapılandırması
    - Build optimizasyonu
    - Vercel/Netlify deployment hazırlığı
    - _Gereksinimler: Production ortamında çalışır uygulama_