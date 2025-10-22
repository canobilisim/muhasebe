# Authentication Scripts

Bu klasör, HesapOnda uygulamasının kimlik doğrulama sistemini yönetmek için çeşitli scriptler içerir.

## Mevcut Scriptler

1. **diagnose-auth.ts** - Kimlik doğrulama sorunlarını tespit eder
2. **create-test-users.ts** - Test kullanıcıları oluşturur
3. **fix-user-data.ts** - Kullanıcı verisi sorunlarını düzeltir

---

## 1. Authentication Diagnostic Script (diagnose-auth.ts)

### Genel Bakış

Kimlik doğrulama sorunlarını tespit etmek için kapsamlı bir tanılama aracıdır.

## Kullanım

### Ön Gereksinimler

1. `.env` dosyasında aşağıdaki değişkenlerin tanımlı olması gerekir:
   - `VITE_SUPABASE_URL` (zorunlu)
   - `VITE_SUPABASE_ANON_KEY` (zorunlu)
   - `VITE_SUPABASE_SERVICE_ROLE_KEY` (önerilen - tam tanılama için gerekli)

2. Bağımlılıkların yüklü olması:
```bash
npm install
```

### Script'i Çalıştırma

```bash
npm run diagnose:auth
```

## Ne Kontrol Eder?

### 1. Environment Variables
- Supabase URL'in tanımlı olup olmadığı
- Anon key'in mevcut olup olmadığı
- Service role key'in mevcut olup olmadığı

### 2. Bağlantı Testleri
- Anon key ile Supabase'e bağlantı
- Service role key ile Supabase'e bağlantı

### 3. Database Schema Doğrulama
- Tüm tabloların varlığı ve kayıt sayıları:
  - branches
  - users
  - products
  - customers
  - sales
  - sale_items
  - cash_movements
- Database function'larının varlığı:
  - get_user_branch_id
  - is_admin
  - generate_sale_number
  - get_low_stock_products
  - get_daily_sales_summary
- Trigger'ların varlığı (auth.users → users sync)

### 4. Kullanıcı Verisi Doğrulama
- auth.users tablosundaki kullanıcı sayısı
- users tablosundaki kullanıcı sayısı
- İki tablo arasındaki eşleşme kontrolü
- Her kullanıcı için:
  - Profile kaydının varlığı
  - is_active durumu
  - branch_id ataması
  - role bilgisi

### 5. RLS Policy Testleri
- Service role ile RLS bypass kontrolü
- Anon key ile RLS enforcement kontrolü

## Çıktılar

Script iki rapor dosyası oluşturur:

### 1. auth-diagnostic-report.txt
İnsan tarafından okunabilir, detaylı rapor

### 2. auth-diagnostic-report.json
Programatik erişim için JSON formatında rapor

## Rapor İçeriği

Her rapor şunları içerir:

- **Environment Variables**: Yapılandırma durumu
- **Bağlantı Durumu**: Her key ile bağlantı test sonuçları
- **Database Schema**: Tablo, function ve trigger durumları
- **Kullanıcı Verileri**: Detaylı kullanıcı bilgileri ve eşleşme durumu
- **RLS Policy Testleri**: Güvenlik politikası test sonuçları
- **Tespit Edilen Sorunlar**: Bulunan tüm sorunların listesi
- **Öneriler**: Sorunları çözmek için öneriler

## Örnek Çıktı

```
🔍 Kimlik Doğrulama Tanılama Başlatılıyor...

📋 1. Environment Variables Kontrolü
✅ VITE_SUPABASE_URL: https://xxx.supabase.co
✅ VITE_SUPABASE_ANON_KEY: [MEVCUT]
✅ VITE_SUPABASE_SERVICE_ROLE_KEY: [MEVCUT]

🔌 2. Supabase Bağlantı Testleri
✅ Anon key ile bağlantı başarılı
✅ Service role key ile bağlantı başarılı

...

============================================================
📊 ÖZET
============================================================
Toplam Sorun: 2
Toplam Öneri: 3
```

## Sorun Giderme

### "VITE_SUPABASE_URL tanımlı değil"
`.env` dosyasını oluşturun ve Supabase URL'inizi ekleyin:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### "Invalid API key"
Anon key'inizin doğru olduğundan emin olun. Supabase dashboard'dan kopyalayın.

### "Service role key yok"
Service role key opsiyoneldir ancak tam tanılama için önerilir. Sadece development ortamında kullanın ve asla git'e commit etmeyin.

## Güvenlik Notları

⚠️ **ÖNEMLİ**: Service role key'i asla production ortamında kullanmayın veya git'e commit etmeyin. Bu key tüm RLS politikalarını bypass eder ve sadece diagnostic/development amaçlı kullanılmalıdır.

`.gitignore` dosyanızda `.env` dosyasının ignore edildiğinden emin olun.


---

## 2. Create Test Users Script (create-test-users.ts)

### Genel Bakış

Test amaçlı kullanıcılar oluşturur. Her rol için (admin, manager, cashier) birer test kullanıcısı oluşturur.

### Kullanım

#### Ön Gereksinimler

1. `.env` dosyasında aşağıdaki değişkenlerin tanımlı olması gerekir:
   - `VITE_SUPABASE_URL` (zorunlu)
   - `VITE_SUPABASE_SERVICE_ROLE_KEY` (zorunlu)

2. En az bir branch'in veritabanında mevcut olması (yoksa otomatik oluşturulur)

#### Script'i Çalıştırma

```bash
npm run create:test-users
```

veya doğrudan:

```bash
npx tsx scripts/create-test-users.ts
```

### Ne Yapar?

1. **Branch Kontrolü**: Varsayılan branch'i bulur veya oluşturur
2. **Test Kullanıcıları Oluşturur**:
   - `admin@demo.com` - Admin rolü
   - `manager@demo.com` - Manager rolü
   - `cashier@demo.com` - Cashier rolü
3. **Her kullanıcı için**:
   - auth.users kaydı oluşturur (Supabase Auth)
   - users tablosuna profil kaydı oluşturur
   - Şifreyi "123456" olarak ayarlar
   - Email'i otomatik onaylar (email_confirm: true)
   - is_active = true olarak ayarlar
   - Varsayılan branch'e atar

### Oluşturulan Test Kullanıcıları

| Email | Şifre | Rol | Açıklama |
|-------|-------|-----|----------|
| admin@demo.com | 123456 | admin | Tüm yetkilere sahip |
| manager@demo.com | 123456 | manager | Yönetici yetkileri (Settings hariç) |
| cashier@demo.com | 123456 | cashier | Temel POS yetkileri |

### Örnek Çıktı

```
🚀 Creating test users for HesapOnda

============================================================
📦 Using existing branch: Ana Şube

👤 Creating user: admin@demo.com
   ✅ Auth user created (ID: xxx-xxx-xxx)
   ✅ User profile created (Role: admin)
   ✅ User admin@demo.com is ready to use

...

============================================================
📊 Summary:
============================================================
✅ Successfully created/updated: 3 users
   - admin@demo.com (admin)
   - manager@demo.com (manager)
   - cashier@demo.com (cashier)

📝 Test Credentials:
   Email: admin@demo.com / manager@demo.com / cashier@demo.com
   Password: 123456

✨ Test users are ready to use!
```

### Notlar

- Script mevcut kullanıcıları günceller (silip yeniden oluşturmaz)
- Kullanıcı zaten varsa sadece şifre ve profil bilgileri güncellenir
- Email otomatik onaylanır (development için)

---

## 3. Fix User Data Script (fix-user-data.ts)

### Genel Bakış

Kullanıcı verilerindeki sorunları tespit edip düzeltir. auth.users ve users tablosu arasındaki tutarsızlıkları giderir.

### Kullanım

#### Ön Gereksinimler

1. `.env` dosyasında aşağıdaki değişkenlerin tanımlı olması gerekir:
   - `VITE_SUPABASE_URL` (zorunlu)
   - `VITE_SUPABASE_SERVICE_ROLE_KEY` (zorunlu)

2. En az bir branch'in veritabanında mevcut olması

#### Script'i Çalıştırma

```bash
npx tsx scripts/fix-user-data.ts
```

### Ne Kontrol Eder?

1. **MISSING_PROFILE**: auth.users'da olup users'da olmayan kayıtlar
2. **NO_BRANCH**: branch_id değeri null olan kullanıcılar
3. **INACTIVE**: is_active = false olan kullanıcılar
4. **INVALID_BRANCH**: Var olmayan bir branch'e referans veren kullanıcılar

### Ne Düzeltir?

| Sorun Tipi | Düzeltme |
|------------|----------|
| MISSING_PROFILE | Eksik users kaydını oluşturur (varsayılan: cashier rolü) |
| NO_BRANCH | Varsayılan branch'i atar |
| INACTIVE | Raporlar (manuel inceleme gerektirir, otomatik aktif etmez) |
| INVALID_BRANCH | Geçerli varsayılan branch'i atar |

### Örnek Çıktı

```
🔧 User Data Fix Script
============================================================

📦 Using default branch: Ana Şube (xxx-xxx-xxx)

🔍 Checking for auth.users without users profiles...
🔍 Checking for users without branch assignment...
🔍 Checking for inactive users...
🔍 Checking for users with invalid branch references...

📋 Issues Found:
============================================================
   MISSING_PROFILE: 2 user(s)
   NO_BRANCH: 1 user(s)

🔧 Fixing Issues:
============================================================
   🔧 Creating missing profile for user1@example.com...
   ✅ Profile created for user1@example.com
   🔧 Assigning branch to user2@example.com...
   ✅ Branch assigned to user2@example.com

============================================================
📊 Summary:
============================================================
✅ Fixed: 3 issue(s)
ℹ️  Inactive users (manual review needed): 0

✨ User data fix complete!
```

### Güvenlik ve Dikkat Edilmesi Gerekenler

- Script inactive kullanıcıları otomatik olarak aktif etmez (kasıtlı olabilir)
- Tüm düzeltmeler varsayılan branch'e atama yapar
- Eksik profiller varsayılan olarak "cashier" rolü ile oluşturulur
- Manuel inceleme gerektiren durumlar raporlanır

---

## Genel Kullanım Akışı

### İlk Kurulum

1. **Diagnostic çalıştır** - Sorunları tespit et:
   ```bash
   npm run diagnose:auth
   ```

2. **Test kullanıcıları oluştur**:
   ```bash
   npm run create:test-users
   ```

3. **Kullanıcı verilerini düzelt** (gerekirse):
   ```bash
   npx tsx scripts/fix-user-data.ts
   ```

4. **Tekrar diagnostic çalıştır** - Sorunların çözüldüğünü doğrula:
   ```bash
   npm run diagnose:auth
   ```

### Sorun Giderme Akışı

Giriş yapamıyorsanız:

1. Diagnostic raporu inceleyin
2. Tespit edilen sorunlara göre ilgili script'i çalıştırın
3. Test kullanıcıları ile giriş deneyin
4. Hala sorun varsa raporu detaylı inceleyin

---

## Güvenlik Notları

⚠️ **ÖNEMLİ**: 

- Service role key'i **asla production ortamında kullanmayın**
- Service role key'i **asla git'e commit etmeyin**
- Bu key tüm RLS politikalarını bypass eder
- Sadece development ve diagnostic amaçlı kullanın
- `.gitignore` dosyanızda `.env` dosyasının ignore edildiğinden emin olun

## Sorun Giderme

### "VITE_SUPABASE_SERVICE_ROLE_KEY tanımlı değil"

Service role key'i Supabase dashboard'dan alın:
1. Supabase projenize gidin
2. Settings > API
3. "service_role" key'i kopyalayın
4. `.env` dosyanıza ekleyin:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### "No branch available"

En az bir branch oluşturun:
```sql
INSERT INTO branches (name, address, phone)
VALUES ('Ana Şube', 'Test Adresi', '0555 555 5555');
```

Veya `create-test-users.ts` script'i otomatik olarak bir branch oluşturacaktır.

### "Invalid API key"

- URL ve key'lerin doğru olduğundan emin olun
- Key'lerde boşluk veya satır sonu karakteri olmadığını kontrol edin
- Supabase dashboard'dan yeni key kopyalayın
