# Requirements Document

## Introduction

Cano Ön Muhasebe uygulamasında kullanıcılar giriş yapamamaktadır. Uygulama ve veritabanı kurulumu tamamlanmış, kullanıcılar oluşturulmuş ancak giriş işlemi başarısız olmaktadır. Bu özellik, mevcut kimlik doğrulama sistemindeki sorunları tespit edip düzeltmeyi ve uygulamayı tam çalışır hale getirmeyi amaçlamaktadır.

## Requirements

### Requirement 1: Kimlik Doğrulama Sorunlarının Tespiti

**User Story:** Bir geliştirici olarak, giriş yapamama sorununu çözmek için mevcut sistemdeki hataları tespit etmek istiyorum, böylece doğru düzeltmeleri yapabilirim.

#### Acceptance Criteria

1. WHEN kimlik doğrulama akışı incelendiğinde THEN sistem Supabase bağlantı ayarlarını doğrulamalıdır
2. WHEN .env dosyası kontrol edildiğinde THEN sistem VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerinin doğru formatda olduğunu doğrulamalıdır
3. WHEN veritabanı şeması incelendiğinde THEN sistem users tablosunun auth.users ile doğru ilişkilendirildiğini doğrulamalıdır
4. WHEN RLS politikaları kontrol edildiğinde THEN sistem kullanıcı giriş işlemi için gerekli izinlerin tanımlandığını doğrulamalıdır
5. WHEN authStore kodu incelendiğinde THEN sistem signIn fonksiyonunun hata yönetimini ve profil çekme işlemini doğrulamalıdır

### Requirement 2: Supabase Auth Yapılandırmasının Düzeltilmesi

**User Story:** Bir kullanıcı olarak, doğru yapılandırılmış bir kimlik doğrulama sistemi ile giriş yapabilmek istiyorum, böylece uygulamayı kullanabilirim.

#### Acceptance Criteria

1. WHEN Supabase projesi yapılandırıldığında THEN sistem Email Auth'un etkinleştirildiğini doğrulamalıdır
2. WHEN email onay ayarları kontrol edildiğinde THEN sistem geliştirme ortamı için email onayının devre dışı bırakıldığını doğrulamalıdır
3. WHEN site URL ayarları kontrol edildiğinde THEN sistem localhost:5173'ün izin verilen URL'ler listesinde olduğunu doğrulamalıdır
4. IF Supabase yapılandırması eksikse THEN sistem gerekli ayarları yapılandırma talimatları sağlamalıdır

### Requirement 3: Kullanıcı Verilerinin Doğrulanması

**User Story:** Bir sistem yöneticisi olarak, veritabanında kullanıcıların doğru şekilde oluşturulduğunu doğrulamak istiyorum, böylece giriş işleminin başarılı olmasını sağlayabilirim.

#### Acceptance Criteria

1. WHEN veritabanı sorgulandığında THEN sistem auth.users tablosunda kullanıcıların var olduğunu doğrulamalıdır
2. WHEN users tablosu sorgulandığında THEN sistem her auth.users kaydı için karşılık gelen bir users kaydının olduğunu doğrulamalıdır
3. WHEN kullanıcı rolleri kontrol edildiğinde THEN sistem her kullanıcının geçerli bir role (admin, manager, cashier) sahip olduğunu doğrulamalıdır
4. WHEN kullanıcı durumu kontrol edildiğinde THEN sistem kullanıcıların is_active değerinin true olduğunu doğrulamalıdır
5. WHEN branch ilişkileri kontrol edildiğinde THEN sistem her kullanıcının geçerli bir branch_id'ye sahip olduğunu doğrulamalıdır

### Requirement 4: Giriş Akışının Test Edilmesi

**User Story:** Bir geliştirici olarak, giriş akışının her adımını test etmek istiyorum, böylece hangi noktada hata oluştuğunu belirleyebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı giriş formunu doldurduğunda THEN sistem form validasyonunun çalıştığını doğrulamalıdır
2. WHEN signIn fonksiyonu çağrıldığında THEN sistem Supabase auth.signInWithPassword metodunun çağrıldığını doğrulamalıdır
3. WHEN Supabase auth başarılı olduğunda THEN sistem users tablosundan profil bilgilerini çekmelidir
4. WHEN profil bilgileri alındığında THEN sistem is_active kontrolü yapmalıdır
5. WHEN tüm kontroller başarılı olduğunda THEN sistem kullanıcıyı dashboard sayfasına yönlendirmelidir
6. IF herhangi bir adımda hata oluşursa THEN sistem anlamlı bir hata mesajı göstermelidir

### Requirement 5: Hata Ayıklama ve Loglama

**User Story:** Bir geliştirici olarak, giriş işlemi sırasında detaylı loglar görmek istiyorum, böylece sorunları hızlıca tespit edebilirim.

#### Acceptance Criteria

1. WHEN giriş işlemi başlatıldığında THEN sistem console'a "Login attempt started" mesajı yazmalıdır
2. WHEN Supabase auth yanıtı alındığında THEN sistem yanıtın başarı durumunu ve hata detaylarını loglamalıdır
3. WHEN profil sorgusu yapıldığında THEN sistem sorgu sonucunu ve olası hataları loglamalıdır
4. WHEN RLS politikaları devreye girdiğinde THEN sistem erişim kontrolü sonuçlarını loglamalıdır
5. IF hata oluşursa THEN sistem hata stack trace'ini ve ilgili context bilgilerini loglamalıdır

### Requirement 6: Test Kullanıcılarının Oluşturulması

**User Story:** Bir geliştirici olarak, test amaçlı kullanıcıların doğru şekilde oluşturulduğundan emin olmak istiyorum, böylece farklı roller ile giriş testi yapabilirim.

#### Acceptance Criteria

1. WHEN test kullanıcıları oluşturulduğunda THEN sistem admin@demo.com kullanıcısını admin rolü ile oluşturmalıdır
2. WHEN test kullanıcıları oluşturulduğunda THEN sistem manager@demo.com kullanıcısını manager rolü ile oluşturmalıdır
3. WHEN test kullanıcıları oluşturulduğunda THEN sistem cashier@demo.com kullanıcısını cashier rolü ile oluşturmalıdır
4. WHEN test kullanıcıları oluşturulduğunda THEN sistem her kullanıcı için şifreyi "123456" olarak ayarlamalıdır
5. WHEN test kullanıcıları oluşturulduğunda THEN sistem her kullanıcıyı bir branch'e atamalıdır
6. WHEN test kullanıcıları oluşturulduğunda THEN sistem her kullanıcının is_active değerini true olarak ayarlamalıdır

### Requirement 7: Uygulama Başlatma ve İlk Yükleme

**User Story:** Bir kullanıcı olarak, uygulamayı açtığımda hızlı ve sorunsuz bir şekilde giriş sayfasını görmek istiyorum, böylece giriş yapabilirim.

#### Acceptance Criteria

1. WHEN uygulama başlatıldığında THEN sistem authStore.initialize() fonksiyonunu çağırmalıdır
2. WHEN initialize çalıştığında THEN sistem mevcut session'ı kontrol etmelidir
3. IF session yoksa THEN sistem kullanıcıyı login sayfasına yönlendirmelidir
4. IF session varsa THEN sistem kullanıcı profilini yükleyip dashboard'a yönlendirmelidir
5. WHEN initialize timeout olursa THEN sistem kullanıcıyı login sayfasına yönlendirmelidir
6. WHEN initialize sırasında hata oluşursa THEN sistem kullanıcıyı login sayfasına yönlendirmelidir
