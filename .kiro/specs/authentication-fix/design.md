# Design Document

## Overview

Bu tasarım, HesapOnda uygulamasındaki giriş yapamama sorununu çözmek için kapsamlı bir yaklaşım sunmaktadır. Sorun analizi, mevcut sistemin incelenmesi ve adım adım düzeltme stratejisi içermektedir.

### Tespit Edilen Potansiyel Sorunlar

1. **Supabase Yapılandırma Sorunları**
   - Email authentication etkin olmayabilir
   - Email confirmation zorunlu olabilir (geliştirme için sorun)
   - Site URL ve redirect URL'ler yanlış yapılandırılmış olabilir
   - ANON key yanlış veya eksik olabilir

2. **Veritabanı Senkronizasyon Sorunları**
   - auth.users tablosunda kullanıcı var ama users tablosunda yok
   - users tablosunda branch_id null veya geçersiz
   - users tablosunda is_active = false
   - RLS politikaları profil çekmeyi engelliyor

3. **Kod Seviyesi Sorunlar**
   - authStore initialize çağrılmıyor veya timeout oluyor
   - Session persistence sorunları
   - Error handling eksik veya yetersiz

## Architecture

### Çözüm Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    Diagnostic Phase                          │
│  1. Environment Check                                        │
│  2. Supabase Connection Test                                 │
│  3. Database Schema Validation                               │
│  4. User Data Verification                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Fix Phase                                 │
│  1. Supabase Configuration                                   │
│  2. Database Fixes (Triggers, Users)                         │
│  3. Code Improvements (Logging, Error Handling)              │
│  4. Test User Creation                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Verification Phase                        │
│  1. Login Flow Test                                          │
│  2. Role-based Access Test                                   │
│  3. Session Persistence Test                                 │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Diagnostic Script

**Purpose:** Sistemdeki sorunları tespit etmek için kapsamlı bir diagnostic script oluşturulacak.

**Location:** `scripts/diagnose-auth.ts`

**Functionality:**
- Environment variables kontrolü
- Supabase bağlantı testi
- Database schema doğrulama
- User data verification
- RLS policy kontrolü

**Output:** Detaylı bir rapor dosyası (`auth-diagnostic-report.txt`)

### 2. Database Migration/Fix Script

**Purpose:** Veritabanı seviyesindeki sorunları düzeltmek için SQL script.

**Location:** `supabase/migrations/004_auth_fixes.sql`

**Functionality:**
- auth.users ve users tablosu senkronizasyonu için trigger
- Eksik kullanıcı kayıtlarını düzeltme
- Test kullanıcıları oluşturma
- RLS policy düzeltmeleri

### 3. Enhanced Auth Store

**Purpose:** Mevcut authStore'u daha iyi hata yönetimi ve loglama ile güçlendirmek.

**Changes to:** `src/stores/authStore.ts`

**Improvements:**
- Detaylı console logging
- Better error messages
- Retry logic for initialize
- Connection status tracking

### 4. Auth Debug Component

**Purpose:** Geliştirme ortamında auth durumunu görselleştirmek.

**Location:** `src/components/debug/AuthDebugPanel.tsx`

**Features:**
- Current auth state display
- Session information
- User profile data
- Quick test actions (login, logout)
- Error display

### 5. Setup Documentation

**Purpose:** Supabase yapılandırma adımlarını dokümante etmek.

**Location:** `docs/SUPABASE_SETUP.md`

**Content:**
- Email Auth etkinleştirme
- Email confirmation devre dışı bırakma
- Site URL yapılandırması
- Test kullanıcı oluşturma
- Troubleshooting guide

## Data Models

### Auth Flow Data Structure

```typescript
interface AuthDiagnostic {
  timestamp: string
  environment: {
    supabaseUrl: string
    hasAnonKey: boolean
    nodeEnv: string
  }
  connection: {
    canConnect: boolean
    error?: string
  }
  database: {
    authUsersCount: number
    usersCount: number
    branchesCount: number
    mismatchedUsers: string[]
  }
  users: Array<{
    id: string
    email: string
    hasProfile: boolean
    isActive: boolean
    hasBranch: boolean
    role: string
  }>
  issues: string[]
  recommendations: string[]
}
```

### Enhanced Auth State

```typescript
interface EnhancedAuthState extends AuthState {
  // Existing fields...
  
  // New diagnostic fields
  connectionStatus: 'connected' | 'disconnected' | 'checking'
  lastError: {
    message: string
    timestamp: string
    context: string
  } | null
  initializeAttempts: number
  debugMode: boolean
}
```

## Error Handling

### Error Categories

1. **Connection Errors**
   - Supabase URL yanlış
   - Network problemi
   - CORS hatası

2. **Authentication Errors**
   - Invalid credentials
   - Email not confirmed
   - User not found
   - User inactive

3. **Authorization Errors**
   - No profile found
   - RLS policy denial
   - Missing branch assignment

4. **System Errors**
   - Database timeout
   - Session expired
   - Unexpected errors

### Error Handling Strategy

```typescript
// Centralized error handler
class AuthErrorHandler {
  static handle(error: unknown, context: string): AuthError {
    // Log to console with context
    console.error(`[Auth Error - ${context}]`, error)
    
    // Categorize error
    const category = this.categorize(error)
    
    // Generate user-friendly message
    const message = this.getUserMessage(category, error)
    
    // Generate developer message
    const devMessage = this.getDevMessage(error)
    
    return {
      category,
      message,
      devMessage,
      timestamp: new Date().toISOString(),
      context
    }
  }
  
  static categorize(error: unknown): ErrorCategory {
    // Implementation...
  }
  
  static getUserMessage(category: ErrorCategory, error: unknown): string {
    // Turkish user-friendly messages
  }
  
  static getDevMessage(error: unknown): string {
    // Detailed technical message
  }
}
```

### Error Display

```typescript
// Enhanced error display in LoginPage
{error && (
  <Alert variant="destructive">
    <AlertDescription>
      <div className="space-y-2">
        <p className="font-medium">{error.message}</p>
        {isDevelopment && error.devMessage && (
          <details className="text-xs">
            <summary>Geliştirici Detayları</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded">
              {error.devMessage}
            </pre>
          </details>
        )}
      </div>
    </AlertDescription>
  </Alert>
)}
```

## Testing Strategy

### 1. Diagnostic Testing

**Objective:** Sistemdeki sorunları tespit etmek

**Steps:**
1. Diagnostic script'i çalıştır
2. Raporu incele
3. Tespit edilen sorunları listele
4. Öncelik sırasına koy

### 2. Unit Testing

**Test Cases:**
- authStore.signIn() with valid credentials
- authStore.signIn() with invalid credentials
- authStore.initialize() with existing session
- authStore.initialize() without session
- Profile fetching after successful auth
- RLS policy enforcement

### 3. Integration Testing

**Test Scenarios:**
1. **Başarılı Giriş Akışı**
   - Form doldur
   - Submit
   - Auth başarılı
   - Profil çekildi
   - Dashboard'a yönlendirildi

2. **Başarısız Giriş Akışı**
   - Yanlış şifre
   - Hata mesajı gösterildi
   - Form temizlenmedi (email kaldı)

3. **Session Persistence**
   - Giriş yap
   - Sayfayı yenile
   - Hala giriş yapılmış olmalı

4. **Role-based Access**
   - Cashier olarak giriş yap
   - Settings sayfasına git
   - Access denied gösterilmeli

### 4. Manual Testing Checklist

```markdown
## Giriş Testi

- [ ] Admin kullanıcısı ile giriş yapılabiliyor
- [ ] Manager kullanıcısı ile giriş yapılabiliyor
- [ ] Cashier kullanıcısı ile giriş yapılabiliyor
- [ ] Yanlış şifre ile hata mesajı gösteriliyor
- [ ] Olmayan email ile hata mesajı gösteriliyor
- [ ] Giriş sonrası dashboard'a yönlendiriliyor
- [ ] Sayfa yenilendiğinde session korunuyor
- [ ] Çıkış yapıldığında login sayfasına yönlendiriliyor

## Rol Bazlı Erişim Testi

- [ ] Admin tüm sayfalara erişebiliyor
- [ ] Manager, Settings dışındaki sayfalara erişebiliyor
- [ ] Cashier sadece POS, Cash ve Dashboard'a erişebiliyor
- [ ] Yetkisiz sayfaya gidildiğinde "Access Denied" gösteriliyor

## Hata Durumları

- [ ] Network hatası durumunda anlamlı mesaj gösteriliyor
- [ ] Supabase bağlantı hatası durumunda mesaj gösteriliyor
- [ ] Session timeout durumunda login'e yönlendiriliyor
```

## Implementation Plan Overview

### Phase 1: Diagnostic (Öncelik: Yüksek)
1. Diagnostic script oluştur
2. Script'i çalıştır ve rapor al
3. Sorunları belirle

### Phase 2: Database Fixes (Öncelik: Yüksek)
1. Migration script oluştur
2. Trigger ekle (auth.users → users sync)
3. Test kullanıcıları oluştur
4. RLS policy'leri düzelt

### Phase 3: Code Improvements (Öncelik: Orta)
1. AuthStore'u güçlendir (logging, error handling)
2. Error handler class ekle
3. LoginPage'i iyileştir
4. Debug panel ekle (development only)

### Phase 4: Documentation (Öncelik: Düşük)
1. Supabase setup guide
2. Troubleshooting guide
3. Testing guide

### Phase 5: Testing & Verification (Öncelik: Yüksek)
1. Manuel test checklist'i tamamla
2. Her rol ile giriş testi
3. Session persistence testi
4. Error scenario testleri

## Supabase Configuration Requirements

### Email Auth Settings

```yaml
Authentication:
  Providers:
    Email:
      Enabled: true
      Confirm email: false  # Development için kapalı
      Secure email change: true
      
  Email Templates:
    Confirm signup: [Default template]
    
  URL Configuration:
    Site URL: http://localhost:5173
    Redirect URLs:
      - http://localhost:5173/**
      - http://localhost:5173/auth/callback
```

### Database Settings

```yaml
Database:
  Connection pooling: Enabled
  Connection limit: 15
  
  Extensions:
    - uuid-ossp (enabled)
    
  RLS:
    Enabled: true
    Policies: [As defined in migrations]
```

## Security Considerations

1. **Development vs Production**
   - Email confirmation: Development'ta kapalı, Production'da açık
   - Debug panel: Sadece development'ta görünür
   - Detailed errors: Sadece development'ta göster

2. **RLS Policies**
   - Her tablo için RLS aktif
   - Branch-based isolation
   - Role-based access control

3. **Session Management**
   - Secure session storage
   - Auto-refresh tokens
   - Proper cleanup on logout

4. **Error Messages**
   - Production'da generic messages
   - Development'ta detailed messages
   - Hiçbir zaman sensitive data leak etme

## Performance Considerations

1. **Initialize Optimization**
   - Timeout mechanism (5 seconds)
   - Prevent multiple simultaneous calls
   - Cache session data

2. **Profile Fetching**
   - Single query with all needed data
   - Cache in Zustand store
   - Refresh only when needed

3. **RLS Performance**
   - Indexed columns (branch_id, user_id)
   - Efficient policy queries
   - Function caching (SECURITY DEFINER)

## Monitoring and Debugging

### Development Tools

1. **Console Logging**
   ```typescript
   // Structured logging
   console.group('🔐 Auth Operation: signIn')
   console.log('Email:', email)
   console.log('Timestamp:', new Date().toISOString())
   console.log('Result:', result)
   console.groupEnd()
   ```

2. **Debug Panel**
   - Real-time auth state
   - Session info
   - Quick actions
   - Error history

3. **Network Tab**
   - Supabase API calls
   - Response times
   - Error responses

### Production Monitoring

1. **Error Tracking**
   - Log authentication failures
   - Track error patterns
   - Alert on critical issues

2. **Performance Metrics**
   - Login success rate
   - Average login time
   - Session duration

3. **Security Monitoring**
   - Failed login attempts
   - Unusual access patterns
   - RLS policy violations
