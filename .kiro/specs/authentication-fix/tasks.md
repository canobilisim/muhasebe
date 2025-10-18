# Implementation Plan

- [x] 1. Diagnostic script oluştur ve sorunları tespit et
  - Supabase bağlantısını test eden script yaz (hem anon hem service role ile)
  - Environment variables kontrolü ekle (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_SERVICE_ROLE_KEY)
  - Database schema doğrulama ekle (tüm tabloları, trigger'ları, function'ları kontrol et)
  - User data verification ekle (auth.users ve users tablosu karşılaştırması)
  - RLS policy'leri test et (service role ile bypass, anon key ile enforcement)
  - Diagnostic rapor dosyası oluştur
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Database migration ve fix script'leri oluştur
  - [x] 2.1 Auth.users ve users tablosu senkronizasyon trigger'ı ekle
    - Yeni auth.users kaydı oluşturulduğunda otomatik users kaydı oluşturan trigger yaz
    - Trigger'ın branch_id ve diğer zorunlu alanları doğru set ettiğini doğrula
    - _Requirements: 3.2, 3.5_
  
  - [x] 2.2 Test kullanıcıları oluşturma script'i yaz
    - Admin, manager ve cashier test kullanıcıları için SQL script yaz
    - Her kullanıcı için hem auth.users hem de users kaydı oluştur
    - Şifreleri "123456" olarak ayarla
    - is_active = true olarak ayarla
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 2.3 Eksik veya hatalı kullanıcı kayıtlarını düzelten script yaz
    - auth.users'da olup users'da olmayan kayıtları tespit et
    - Eksik users kayıtlarını oluştur
    - is_active = false olan kullanıcıları tespit et ve raporla
    - branch_id null olan kullanıcıları tespit et ve raporla
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. AuthStore'u güçlendir ve hata yönetimini iyileştir
  - [x] 3.1 Detaylı console logging ekle
    - signIn fonksiyonuna structured logging ekle
    - initialize fonksiyonuna step-by-step logging ekle
    - Her auth işlemi için timestamp ve context bilgisi ekle
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 3.2 Error handling ve user-friendly mesajlar ekle
    - AuthErrorHandler class oluştur
    - Error kategorileri tanımla (Connection, Auth, Authorization, System)
    - Her kategori için Türkçe kullanıcı mesajları yaz
    - Development ortamı için detaylı developer mesajları ekle
    - _Requirements: 4.6_
  
  - [ ] 3.3 Connection status tracking ekle
    - connectionStatus state field'ı ekle
    - Supabase bağlantı durumunu izle
    - Bağlantı hatalarını yakala ve raporla
    - _Requirements: 1.1_
  
  - [ ] 3.4 Initialize retry logic ekle
    - Initialize timeout mekanizmasını iyileştir
    - Başarısız initialize denemelerini say
    - Maximum retry sayısı belirle
    - _Requirements: 7.5, 7.6_

- [ ] 4. LoginPage'i iyileştir ve hata gösterimini düzelt
  - Enhanced error display component ekle
  - Development ortamında developer details göster
  - Loading state'lerini iyileştir
  - Form validation mesajlarını Türkçeleştir
  - _Requirements: 4.1, 4.6_

- [x] 5. Auth debug panel oluştur (development only)
  - [x] 5.1 AuthDebugPanel component oluştur
    - Current auth state göster (isAuthenticated, user, profile)
    - Session bilgilerini göster
    - Connection status göster
    - Error history göster
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.2 Quick test actions ekle
    - Test login buttons (admin, manager, cashier)
    - Logout button
    - Clear error button
    - Re-initialize button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 5.3 Debug panel'i sadece development'ta göster
    - isDevelopment check ekle
    - Panel'i App.tsx'e conditional olarak ekle
    - Floating button ile aç/kapa
    - _Requirements: 5.1_

- [x] 6. Supabase yapılandırma dokümanı oluştur
  - Email Auth etkinleştirme adımları
  - Email confirmation devre dışı bırakma (development)
  - Site URL ve Redirect URLs yapılandırması
  - Test kullanıcı oluşturma adımları
  - Troubleshooting guide
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Diagnostic script'i çalıştır ve sorunları tespit et
  - Service role key'i .env dosyasına ekle
  - Script'i çalıştır
  - Oluşturulan raporu incele
  - Tespit edilen sorunları listele (veritabanı, kullanıcılar, RLS, trigger'lar)
  - Öncelikli düzeltmeleri belirle
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 8. Database migration'ları çalıştır ve doğrula
  - Migration script'ini Supabase'e uygula (service role ile)
  - Trigger'ların çalıştığını doğrula (test insert ile)
  - Test kullanıcılarının oluşturulduğunu doğrula (auth.users ve users tablolarında)
  - Her test kullanıcısı için şifre ile giriş testi yap
  - RLS policy'lerin doğru çalıştığını test et (anon key ile query)
  - Branch assignment'ların doğru olduğunu doğrula
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 9. Manuel test checklist'ini tamamla
  - [x] 9.1 Giriş akışı testleri
    - Admin kullanıcısı ile giriş yap
    - Manager kullanıcısı ile giriş yap
    - Cashier kullanıcısı ile giriş yap
    - Yanlış şifre ile hata testi
    - Olmayan email ile hata testi
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 9.2 Session persistence testleri
    - Giriş yap ve sayfayı yenile
    - Session'ın korunduğunu doğrula
    - Çıkış yap ve login'e yönlendirildiğini doğrula
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.3 Role-based access testleri
    - Admin olarak tüm sayfalara erişimi test et
    - Manager olarak Settings dışı sayfalara erişimi test et
    - Cashier olarak sadece POS, Cash, Dashboard erişimini test et
    - Yetkisiz sayfa erişiminde "Access Denied" gösterimini test et
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 9.4 Hata durumları testleri
    - Network hatası simüle et ve mesaj kontrolü yap
    - Inactive user ile giriş deneme testi
    - Session timeout simüle et
    - _Requirements: 4.6, 5.5_

- [-] 10. Production hazırlık kontrolleri
  - Email confirmation'ın production'da açık olduğunu doğrula
  - Debug panel'in production'da gizli olduğunu doğrula
  - Detailed error messages'ın production'da kapalı olduğunu doğrula
  - Site URL'lerin production domain'i içerdiğini doğrula
  - _Requirements: 2.1, 2.2, 2.3_
