# Authentication Fixes Migration (004)

Bu migration dosyası, kimlik doğrulama sistemindeki sorunları çözmek için gerekli database değişikliklerini içerir.

## İçerik

### 1. Auth.users → Users Senkronizasyon Trigger

**Function:** `handle_new_auth_user()`

Yeni bir kullanıcı Supabase Auth'a kaydolduğunda otomatik olarak `users` tablosuna profil kaydı oluşturur.

**Özellikler:**
- Varsayılan branch'e atar (ilk oluşturulan branch)
- Varsayılan rol: `cashier`
- Varsayılan durum: `is_active = true`
- Email veya metadata'dan full_name alır

**Trigger:** `on_auth_user_created`
- Tetikleme: `AFTER INSERT ON auth.users`
- Her yeni auth.users kaydı için çalışır

### 2. Eksik Profilleri Düzeltme Fonksiyonu

**Function:** `fix_missing_user_profiles()`

Mevcut auth.users kayıtları için eksik users profil kayıtlarını oluşturur.

**Kullanım:**
```sql
SELECT * FROM fix_missing_user_profiles();
```

**Döndürdüğü Değerler:**
- `fixed_user_id`: Düzeltilen kullanıcının ID'si
- `email`: Kullanıcının email adresi
- `status`: İşlem durumu (FIXED, ERROR, INFO)

**Ne Yapar:**
- auth.users'da olup users'da olmayan kayıtları bulur
- Her biri için users kaydı oluşturur
- Varsayılan branch ve cashier rolü atar
- Hataları yakalar ve raporlar

### 3. Kullanıcı Sorunlarını Tespit Etme

**Function:** `diagnose_user_issues()`

Kullanıcı verilerindeki potansiyel sorunları tespit eder.

**Kullanım:**
```sql
SELECT * FROM diagnose_user_issues();
```

**Kontrol Edilen Sorunlar:**
- `NO_BRANCH`: branch_id NULL olan kullanıcılar
- `INACTIVE`: is_active = false olan kullanıcılar
- `INVALID_BRANCH`: Var olmayan branch'e referans veren kullanıcılar
- `MISSING_PROFILE`: auth.users'da olup users'da olmayan kayıtlar

**Döndürdüğü Değerler:**
- `issue_type`: Sorun tipi
- `user_id`: Kullanıcı ID'si
- `email`: Email adresi
- `details`: Sorun detayları

### 4. Test Kullanıcıları Oluşturma (Kısmi)

**Function:** `create_test_users()`

Test kullanıcıları için users tablosunda profil kayıtları oluşturur.

**Not:** Bu fonksiyon sadece users tablosuna kayıt ekler. Gerçek auth.users kayıtları için `scripts/create-test-users.ts` script'ini kullanın.

**Kullanım:**
```sql
SELECT * FROM create_test_users();
```

## Migration'ı Uygulama

### Supabase Dashboard Üzerinden

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `004_auth_fixes.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. "Run" butonuna tıklayın

### Supabase CLI ile

```bash
supabase db push
```

## Migration Sonrası Adımlar

### 1. Trigger'ı Test Edin

Yeni bir kullanıcı oluşturun ve otomatik profil oluşturulduğunu kontrol edin:

```sql
-- Test kullanıcısı oluştur (Supabase Dashboard > Authentication)
-- Ardından kontrol et:
SELECT 
    au.id,
    au.email,
    u.id IS NOT NULL as has_profile,
    u.role,
    u.is_active
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'test@example.com';
```

### 2. Mevcut Sorunları Düzeltin

Eksik profilleri düzeltin:

```sql
SELECT * FROM fix_missing_user_profiles();
```

### 3. Sorunları Kontrol Edin

Kalan sorunları tespit edin:

```sql
SELECT * FROM diagnose_user_issues();
```

### 4. Test Kullanıcıları Oluşturun

TypeScript script'ini kullanın (önerilen):

```bash
npx tsx scripts/create-test-users.ts
```

Veya SQL fonksiyonunu kullanın (sadece profil oluşturur):

```sql
SELECT * FROM create_test_users();
```

## Rollback

Bu migration'ı geri almak için:

```sql
-- Trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fonksiyonları kaldır
DROP FUNCTION IF EXISTS handle_new_auth_user();
DROP FUNCTION IF EXISTS fix_missing_user_profiles();
DROP FUNCTION IF EXISTS diagnose_user_issues();
DROP FUNCTION IF EXISTS create_test_users();
```

**Uyarı:** Bu işlem sadece yeni eklenen trigger ve fonksiyonları kaldırır. Oluşturulan kullanıcı kayıtlarını silmez.

## Güvenlik Notları

- Trigger `SECURITY DEFINER` ile çalışır (RLS bypass)
- Sadece yeni kullanıcı oluşturulduğunda tetiklenir
- Mevcut kullanıcıları değiştirmez
- Branch yoksa hata verir (en az bir branch gerekli)

## Sorun Giderme

### "No branch available" Hatası

En az bir branch oluşturun:

```sql
INSERT INTO branches (name, address, phone)
VALUES ('Ana Şube', 'Test Adresi', '0555 555 5555');
```

### Trigger Çalışmıyor

Trigger'ın aktif olduğunu kontrol edin:

```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Fonksiyon Bulunamıyor

Fonksiyonun oluşturulduğunu kontrol edin:

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN (
    'handle_new_auth_user',
    'fix_missing_user_profiles',
    'diagnose_user_issues',
    'create_test_users'
);
```

## İlgili Dosyalar

- `scripts/create-test-users.ts` - Test kullanıcıları oluşturma script'i
- `scripts/fix-user-data.ts` - Kullanıcı verisi düzeltme script'i
- `scripts/diagnose-auth.ts` - Kimlik doğrulama tanılama script'i
