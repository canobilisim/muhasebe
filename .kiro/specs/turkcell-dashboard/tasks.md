# Implementation Plan

- [x] 1. Database ve temel yapı kurulumu
  - Supabase'de turkcell_transactions ve turkcell_targets tablolarını oluştur
  - Database migration scriptleri hazırla
  - Tablo yapılarını test et
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 2. Turkcell veri modelleri ve tipleri
  - src/types/turkcell.ts dosyasını oluştur
  - TurkcellTransaction, TurkcellTarget ve store interface'lerini tanımla
  - Database response tiplerini ekle
  - _Requirements: 3.1, 3.2_

- [x] 3. Turkcell API servisi
  - src/services/turkcellService.ts dosyasını oluştur
  - getDailyTransactions, getMonthlyTarget, setMonthlyTarget fonksiyonlarını implement et
  - Error handling ve branch isolation ekle
  - _Requirements: 3.1, 3.2, 3.4, 7.3_

- [x] 4. Turkcell Zustand store
  - src/stores/turkcellStore.ts dosyasını oluştur
  - State management (totalToday, monthlyTarget, monthlyProgress) implement et
  - Actions (fetchDailyTransactions, updateMonthlyTarget, calculateProgress) ekle
  - Loading ve error state yönetimi
  - _Requirements: 1.5, 2.2, 4.1, 7.3_

- [x] 5. Turkcell custom hook
  - src/hooks/useTurkcell.ts dosyasını oluştur
  - Store'u wrap eden hook implement et
  - Component'ler için kolay kullanım sağla
  - _Requirements: 4.1, 4.2_

- [x] 6. Günlük işlem KPI kartı
  - src/components/dashboard/TurkcellDailyCard.tsx oluştur
  - Mevcut KPICard bileşenini extend et
  - Smartphone ikonu ve merkezi hizalama ekle
  - Loading ve error state handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3_

- [x] 7. Aylık hedef progress kartı
  - src/components/dashboard/TurkcellMonthlyCard.tsx oluştur
  - Progress bar component'i implement et
  - Target ikonu ve sol hizalama
  - Yüzde hesaplama ve görüntüleme
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3_

- [x] 8. Dashboard entegrasyonu
  - src/pages/DashboardPage.tsx'i güncelle
  - Turkcell KPI kartlarını mevcut grid'e ekle
  - 4 kolonluk grid'de 2 kolon genişliğinde yerleştir
  - Responsive tasarım kontrolü
  - _Requirements: 1.1, 2.1, 4.3, 5.5_

- [x] 9. Sidebar navigasyon güncellemesi
  - src/components/layout/Sidebar.tsx'i güncelle
  - "Operatör İşlemleri" menü öğesini ekle
  - Role-based access control (admin, manager)
  - Aktif sayfa durumu gösterimi
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 10. Operatör işlemleri sayfası
  - src/pages/OperatorOperationsPage.tsx oluştur
  - Layout bileşeni ile tutarlı tasarım
  - Hedef ayarları formu için container
  - Routing konfigürasyonu
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 11. Hedef ayarları formu
  - TargetSettingsForm component'i implement et
  - Mevcut hedefi gösterme ve yeni hedef girişi
  - Form validasyonu (pozitif sayı kontrolü)
  - Kaydet butonu ve success/error mesajları
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12. Component export güncellemeleri
  - src/components/dashboard/index.ts güncelle
  - Yeni Turkcell component'lerini export et
  - Import path'leri düzenle
  - _Requirements: 1.1, 2.1_

- [ ] 13. Routing konfigürasyonu
  - App.tsx veya router konfigürasyonunu güncelle
  - /operator-operations route'unu ekle
  - PrivateRoute ile koruma
  - _Requirements: 6.2_

- [x] 14. Error handling ve loading states
  - Tüm component'lerde error boundary ekle
  - Loading spinner'ları implement et
  - User-friendly error mesajları
  - Fallback değerleri (0) ayarla
  - _Requirements: 3.5, 4.2, 4.4_

- [x] 15. Unit testler
  - TurkcellStore için test suite
  - TurkcellService API testleri
  - Form validation testleri
  - _Requirements: 3.5, 7.4_

- [x] 16. Component testleri
  - TurkcellDailyCard render testleri
  - TurkcellMonthlyCard progress hesaplama testleri
  - TargetSettingsForm interaction testleri
  - _Requirements: 1.1, 2.1, 7.1_

- [ ]* 17. Integration testleri
  - Dashboard KPI entegrasyonu
  - Sidebar navigation testi
  - Store'dan component'e veri akışı
  - _Requirements: 4.1, 6.1_