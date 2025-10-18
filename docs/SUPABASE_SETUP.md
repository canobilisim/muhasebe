# Supabase Yapılandırma Kılavuzu

Bu doküman, Cano Ön Muhasebe uygulaması için Supabase kimlik doğrulama sisteminin nasıl yapılandırılacağını açıklamaktadır.

## İçindekiler

1. [Email Authentication Etkinleştirme](#1-email-authentication-etkinleştirme)
2. [Email Confirmation Ayarları](#2-email-confirmation-ayarları)
3. [Site URL ve Redirect URLs Yapılandırması](#3-site-url-ve-redirect-urls-yapılandırması)
4. [Test Kullanıcıları Oluşturma](#4-test-kullanıcıları-oluşturma)
5. [Environment Variables Yapılandırması](#5-environment-variables-yapılandırması)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Email Authentication Etkinleştirme

### Adım 1.1: Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin
3. Sol menüden **Authentication** sekmesine tıklayın

### Adım 1.2: Email Provider'ı Etkinleştirme

1. **Providers** alt sekmesine gidin
2. **Email** provider'ını bulun
3. **Enable Email provider** toggle'ını açın (yeşil)
4. **Save** butonuna tıklayın

![Email Provider Etkinleştirme](https://supabase.com/docs/img/guides/auth/auth-providers-email.png)

### Doğrulama

Email authentication'ın etkin olduğunu doğrulamak için:

```bash
# Diagnostic script'i çalıştırın
npm run diagnose-auth
```

Raporda şu satırı görmelisiniz:
```
✓ Email authentication is enabled
```


---

## 2. Email Confirmation Ayarları

### Development Ortamı İçin (Önerilen)

Geliştirme ortamında email confirmation'ı devre dışı bırakmak, test sürecini hızlandırır.

### Adım 2.1: Email Confirmation'ı Devre Dışı Bırakma

1. **Authentication** > **Providers** > **Email** sekmesine gidin
2. **Confirm email** toggle'ını kapatın (gri)
3. **Save** butonuna tıklayın

### Adım 2.2: Email Templates (Opsiyonel)

Email confirmation açıksa, email template'lerini özelleştirebilirsiniz:

1. **Authentication** > **Email Templates** sekmesine gidin
2. **Confirm signup** template'ini seçin
3. Template'i Türkçe'ye çevirin (opsiyonel)
4. **Save** butonuna tıklayın

### Production Ortamı İçin

⚠️ **ÖNEMLİ**: Production ortamında email confirmation'ı **mutlaka açık** tutun!

1. **Confirm email** toggle'ını açın (yeşil)
2. Email template'lerini kontrol edin
3. SMTP ayarlarınızı doğrulayın

### Doğrulama

```typescript
// Test kullanıcısı oluşturma
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: '123456'
})

// Email confirmation kapalıysa, kullanıcı hemen giriş yapabilir
// Email confirmation açıksa, kullanıcı email'ini onaylamalıdır
```


---

## 3. Site URL ve Redirect URLs Yapılandırması

### Adım 3.1: Site URL Ayarlama

1. **Authentication** > **URL Configuration** sekmesine gidin
2. **Site URL** alanını bulun
3. Development için: `http://localhost:5173`
4. Production için: `https://yourdomain.com`
5. **Save** butonuna tıklayın

### Adım 3.2: Redirect URLs Ekleme

Redirect URLs, authentication sonrası yönlendirme yapılabilecek URL'leri tanımlar.

1. **Redirect URLs** bölümüne gidin
2. Aşağıdaki URL'leri ekleyin:

**Development:**
```
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:5173
```

**Production:**
```
https://yourdomain.com/**
https://yourdomain.com/auth/callback
https://yourdomain.com
```

3. Her URL'yi ekledikten sonra **Add URL** butonuna tıklayın
4. **Save** butonuna tıklayın

### Adım 3.3: Additional Redirect URLs (Opsiyonel)

Eğer birden fazla domain kullanıyorsanız (staging, preview, vb.):

```
https://staging.yourdomain.com/**
https://preview.yourdomain.com/**
```

### Wildcard Kullanımı

`**` wildcard'ı, tüm alt path'lere izin verir:
- `http://localhost:5173/**` → `/dashboard`, `/pos`, `/settings` vb. tüm path'ler

### Doğrulama

```bash
# Browser console'da test edin
console.log(window.location.origin)
// Çıktı: "http://localhost:5173"

# Bu origin, Redirect URLs listesinde olmalı
```


---

## 4. Test Kullanıcıları Oluşturma

### Yöntem 1: SQL Script ile (Önerilen)

Migration script'i kullanarak test kullanıcılarını otomatik oluşturun.

#### Adım 4.1: Migration Script'ini Çalıştırma

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. **New Query** butonuna tıklayın
3. `supabase/migrations/004_auth_fixes.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. **Run** butonuna tıklayın

#### Adım 4.2: Test Kullanıcılarını Doğrulama

```sql
-- Auth.users tablosunu kontrol edin
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'cashier@demo.com');

-- Users tablosunu kontrol edin
SELECT u.id, u.email, u.role, u.is_active, u.branch_id
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE au.email IN ('admin@demo.com', 'manager@demo.com', 'cashier@demo.com');
```

### Yöntem 2: TypeScript Script ile

Alternatif olarak, TypeScript script'i kullanabilirsiniz.

#### Adım 4.3: Script'i Çalıştırma

```bash
# Service role key'i .env dosyasına ekleyin
echo "VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" >> .env

# Script'i çalıştırın
npx tsx scripts/create-test-users.ts
```

### Yöntem 3: Manuel Oluşturma

Dashboard üzerinden manuel olarak kullanıcı oluşturabilirsiniz.

#### Adım 4.4: Manuel Kullanıcı Oluşturma

1. **Authentication** > **Users** sekmesine gidin
2. **Add user** butonuna tıklayın
3. Email ve şifre girin
4. **Create user** butonuna tıklayın
5. Kullanıcı oluşturulduktan sonra, `users` tablosuna profil ekleyin:

```sql
-- Admin kullanıcısı için profil oluşturma
INSERT INTO users (id, email, role, is_active, branch_id)
VALUES (
  'auth_user_id_buraya',  -- Auth.users'dan alınan ID
  'admin@demo.com',
  'admin',
  true,
  (SELECT id FROM branches LIMIT 1)  -- İlk branch'i seç
);
```

### Test Kullanıcı Bilgileri

Oluşturulan test kullanıcıları:

| Email | Şifre | Rol | Açıklama |
|-------|-------|-----|----------|
| admin@demo.com | 123456 | admin | Tüm yetkilere sahip |
| manager@demo.com | 123456 | manager | Settings hariç tüm sayfalara erişim |
| cashier@demo.com | 123456 | cashier | POS, Cash, Dashboard erişimi |


---

## 5. Environment Variables Yapılandırması

### Adım 5.1: Supabase Credentials'ları Alma

1. Supabase Dashboard'da **Settings** > **API** sekmesine gidin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (sadece backend/script'ler için)

### Adım 5.2: .env Dosyası Oluşturma

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env
```

### Adım 5.3: Environment Variables'ları Ayarlama

`.env` dosyasını düzenleyin:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (sadece script'ler için, production'da kullanmayın!)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Adım 5.4: Environment Variables'ları Doğrulama

```bash
# Diagnostic script ile doğrulayın
npm run diagnose-auth
```

Raporda şunları görmelisiniz:
```
✓ VITE_SUPABASE_URL is set
✓ VITE_SUPABASE_ANON_KEY is set
✓ Can connect to Supabase
```

### Güvenlik Notları

⚠️ **ÖNEMLİ**:
- `.env` dosyasını **asla** git'e commit etmeyin
- `.gitignore` dosyasında `.env` olduğundan emin olun
- `service_role` key'i **sadece** backend/script'lerde kullanın
- Production'da `service_role` key'i **asla** frontend'e expose etmeyin


---

## 6. Troubleshooting

### Sorun 1: "Invalid API key" Hatası

**Belirtiler:**
- Console'da "Invalid API key" hatası
- Supabase bağlantısı başarısız

**Çözüm:**
1. `.env` dosyasındaki `VITE_SUPABASE_ANON_KEY`'i kontrol edin
2. Supabase Dashboard'dan key'i yeniden kopyalayın
3. Key'in başında/sonunda boşluk olmadığından emin olun
4. Development server'ı yeniden başlatın: `npm run dev`

```bash
# Key'i test edin
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://xxxxx.supabase.co/rest/v1/
```

### Sorun 2: "Email not confirmed" Hatası

**Belirtiler:**
- Kullanıcı oluşturuldu ama giriş yapamıyor
- "Email not confirmed" mesajı

**Çözüm:**
1. **Authentication** > **Providers** > **Email** sekmesine gidin
2. **Confirm email** toggle'ını kapatın (development için)
3. Veya email'i manuel olarak onaylayın:

```sql
-- Email'i manuel olarak onayla
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

### Sorun 3: "User not found in users table" Hatası

**Belirtiler:**
- Auth başarılı ama profil çekilemiyor
- "User not found" hatası

**Çözüm:**
1. `auth.users` ve `users` tablosu senkronizasyonunu kontrol edin:

```sql
-- Senkronizasyon kontrolü
SELECT 
  au.id,
  au.email,
  CASE WHEN u.id IS NULL THEN 'Missing' ELSE 'OK' END as profile_status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id;
```

2. Eksik profilleri oluşturun:

```bash
# Fix script'ini çalıştırın
npx tsx scripts/fix-user-data.ts
```

### Sorun 4: "Access Denied" / RLS Policy Hatası

**Belirtiler:**
- Giriş başarılı ama veriler çekilemiyor
- "Row level security policy violation" hatası

**Çözüm:**
1. RLS policy'leri kontrol edin:

```sql
-- Users tablosu policy'lerini listele
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. Policy'lerin doğru tanımlandığından emin olun
3. Migration script'ini yeniden çalıştırın: `004_auth_fixes.sql`

### Sorun 5: "Invalid redirect URL" Hatası

**Belirtiler:**
- Giriş sonrası yönlendirme başarısız
- "Invalid redirect URL" hatası

**Çözüm:**
1. **Authentication** > **URL Configuration** sekmesine gidin
2. **Redirect URLs** listesini kontrol edin
3. Current origin'i ekleyin:

```javascript
// Browser console'da çalıştırın
console.log(window.location.origin)
// Bu URL, Redirect URLs listesinde olmalı
```


### Sorun 6: Session Persistence Sorunu

**Belirtiler:**
- Sayfa yenilendiğinde kullanıcı çıkış yapıyor
- Session korunmuyor

**Çözüm:**
1. Browser storage'ı kontrol edin:

```javascript
// Browser console'da
console.log(localStorage.getItem('supabase.auth.token'))
```

2. Storage type'ı kontrol edin (`src/lib/supabase.ts`):

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,  // veya window.sessionStorage
  }
})
```

3. Browser'ın localStorage'ı bloke etmediğinden emin olun

### Sorun 7: CORS Hatası

**Belirtiler:**
- "CORS policy" hatası
- Network request'ler başarısız

**Çözüm:**
1. Supabase URL'in doğru olduğundan emin olun
2. Site URL'in doğru yapılandırıldığından emin olun
3. Browser cache'ini temizleyin
4. Incognito/Private mode'da test edin

### Sorun 8: "Branch not found" Hatası

**Belirtiler:**
- Kullanıcı oluşturuldu ama branch_id null
- "Branch not found" hatası

**Çözüm:**
1. Branch'lerin oluşturulduğunu kontrol edin:

```sql
SELECT * FROM branches;
```

2. Kullanıcıya branch atayın:

```sql
UPDATE users 
SET branch_id = (SELECT id FROM branches LIMIT 1)
WHERE branch_id IS NULL;
```

### Sorun 9: Development Server Bağlantı Sorunu

**Belirtiler:**
- Localhost'a bağlanılamıyor
- "Connection refused" hatası

**Çözüm:**
1. Development server'ın çalıştığından emin olun:

```bash
npm run dev
```

2. Port'un doğru olduğundan emin olun (5173)
3. Başka bir process port'u kullanıyorsa, port'u değiştirin:

```bash
npm run dev -- --port 3000
```

### Sorun 10: TypeScript/Build Hataları

**Belirtiler:**
- Build başarısız
- Type error'ları

**Çözüm:**
1. Dependencies'leri yeniden yükleyin:

```bash
rm -rf node_modules package-lock.json
npm install
```

2. TypeScript cache'ini temizleyin:

```bash
rm -rf .vite
npm run build
```


---

## Diagnostic Tools

### 1. Auth Diagnostic Script

Sistemdeki sorunları otomatik tespit eden script:

```bash
npm run diagnose-auth
```

Bu script şunları kontrol eder:
- ✓ Environment variables
- ✓ Supabase bağlantısı
- ✓ Database schema
- ✓ User data senkronizasyonu
- ✓ RLS policies
- ✓ Triggers ve functions

### 2. Auth Debug Panel

Development ortamında auth durumunu görselleştiren panel:

1. Uygulamayı development mode'da çalıştırın: `npm run dev`
2. Sağ alt köşedeki "🔐 Auth Debug" butonuna tıklayın
3. Panel'de şunları görebilirsiniz:
   - Current auth state
   - User profile
   - Session info
   - Error history
   - Quick test actions

### 3. Browser DevTools

**Console Logging:**
```javascript
// Auth store'u inspect edin
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore.getState()
console.log('Auth State:', authStore)
```

**Network Tab:**
- Supabase API call'larını izleyin
- Request/response header'larını kontrol edin
- Error response'larını inceleyin

**Application Tab:**
- localStorage'da `supabase.auth.token` key'ini kontrol edin
- Session data'yı inspect edin

---

## Hızlı Başlangıç Checklist

Yeni bir Supabase projesi kuruyorsanız, bu checklist'i takip edin:

- [ ] 1. Supabase projesi oluştur
- [ ] 2. Email authentication'ı etkinleştir
- [ ] 3. Email confirmation'ı devre dışı bırak (development)
- [ ] 4. Site URL'i ayarla (`http://localhost:5173`)
- [ ] 5. Redirect URLs'leri ekle
- [ ] 6. Database migration'ları çalıştır (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_functions_triggers.sql`, `004_auth_fixes.sql`)
- [ ] 7. `.env` dosyasını oluştur ve credentials'ları ekle
- [ ] 8. Test kullanıcılarını oluştur (SQL script veya TypeScript script ile)
- [ ] 9. Diagnostic script'i çalıştır: `npm run diagnose-auth`
- [ ] 10. Development server'ı başlat: `npm run dev`
- [ ] 11. Test kullanıcısı ile giriş yap
- [ ] 12. Auth debug panel'i kontrol et

---

## Ek Kaynaklar

### Supabase Dokümantasyonu
- [Authentication Overview](https://supabase.com/docs/guides/auth)
- [Email Authentication](https://supabase.com/docs/guides/auth/auth-email)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

### Proje Dokümantasyonu
- `scripts/README.md` - Script'lerin kullanımı
- `supabase/migrations/004_auth_fixes_README.md` - Migration detayları
- `QUICK_FIX_GUIDE.md` - Hızlı düzeltme kılavuzu
- `DIAGNOSTIC_SUMMARY.md` - Diagnostic rapor örneği

### İletişim ve Destek

Sorun yaşıyorsanız:
1. Bu dokümandaki troubleshooting bölümünü kontrol edin
2. Diagnostic script'i çalıştırın
3. Auth debug panel'i inceleyin
4. Supabase Dashboard'daki logs'ları kontrol edin

---

**Son Güncelleme:** 16.10.2025  
**Versiyon:** 1.0.0
