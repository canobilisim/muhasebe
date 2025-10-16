# Task 3.2 Visual Guide - Error Handling

## Error Display Examples

### 1. Production Mode - User View

When a user encounters an error in production, they see only the user-friendly Turkish message:

```
┌─────────────────────────────────────────────┐
│  ⚠️  Hata                                   │
├─────────────────────────────────────────────┤
│  E-posta veya şifre hatalı.                │
│  Lütfen tekrar deneyin.                    │
└─────────────────────────────────────────────┘
```

### 2. Development Mode - Developer View

In development, developers see the same message plus expandable details:

```
┌─────────────────────────────────────────────┐
│  ⚠️  Hata                                   │
├─────────────────────────────────────────────┤
│  E-posta veya şifre hatalı.                │
│  Lütfen tekrar deneyin.                    │
│                                             │
│  ▶ Geliştirici Detayları                   │
└─────────────────────────────────────────────┘
```

When expanded:

```
┌─────────────────────────────────────────────┐
│  ⚠️  Hata                                   │
├─────────────────────────────────────────────┤
│  E-posta veya şifre hatalı.                │
│  Lütfen tekrar deneyin.                    │
│                                             │
│  ▼ Geliştirici Detayları                   │
│  ┌───────────────────────────────────────┐ │
│  │ Kategori: auth                        │ │
│  │ Context: signIn:authentication        │ │
│  │ Zaman: 16.10.2025 13:45:23           │ │
│  │ Detay:                                │ │
│  │ Error: Invalid login credentials      │ │
│  │   at signIn (authStore.ts:95)        │ │
│  │   at handleSubmit (LoginPage.tsx:67) │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Error Categories and Examples

### Connection Errors (connection)

**Triggers:**
- Network failures
- Timeouts
- CORS issues

**User Message Examples:**
```
"Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin."
"Sunucu yapılandırma hatası. Lütfen sistem yöneticinize başvurun."
"Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
```

**Developer Details:**
```
Category: connection
Context: signIn:authentication
Error: NetworkError: Failed to fetch
  at fetch (native)
  at supabase.auth.signInWithPassword
```

### Authentication Errors (auth)

**Triggers:**
- Invalid credentials
- Email not confirmed
- User not found

**User Message Examples:**
```
"E-posta veya şifre hatalı. Lütfen tekrar deneyin."
"E-posta adresiniz onaylanmamış. Lütfen e-postanızı kontrol edin."
"Kullanıcı bulunamadı. Lütfen bilgilerinizi kontrol edin."
```

**Developer Details:**
```
Category: auth
Context: signIn:authentication
Error: AuthApiError: Invalid login credentials
  at GoTrueClient.signInWithPassword
  at authStore.signIn
```

### Authorization Errors (authorization)

**Triggers:**
- Inactive user account
- Missing profile
- Missing branch assignment
- Permission denied

**User Message Examples:**
```
"Hesabınız devre dışı bırakılmış. Lütfen sistem yöneticinize başvurun."
"Kullanıcı profili bulunamadı. Lütfen sistem yöneticinize başvurun."
"Şube ataması bulunamadı. Lütfen sistem yöneticinize başvurun."
"Erişim izniniz yok. Lütfen sistem yöneticinize başvurun."
```

**Developer Details:**
```
Category: authorization
Context: signIn:authorization
Error: User account is inactive
  at authStore.signIn (line 158)
  Profile: { id: "123", is_active: false }
```

### System Errors (system)

**Triggers:**
- Session errors
- Unexpected errors
- Database errors

**User Message Examples:**
```
"Oturum hatası oluştu. Lütfen tekrar giriş yapın."
"Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
```

**Developer Details:**
```
Category: system
Context: initialize:exception
Error: TypeError: Cannot read property 'id' of null
  at authStore.initialize (line 445)
  Stack: [full stack trace]
```

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (e.g., Click "Giriş Yap")                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LoginPage.onSubmit()                       │
│         Calls: authStore.signIn(email, password)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              authStore.signIn()                         │
│    Calls: supabase.auth.signInWithPassword()           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
                  ❌ Error!
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│        AuthErrorHandler.handle(error, context)          │
│                                                         │
│  1. Categorize error → 'auth'                          │
│  2. Generate user message → "E-posta veya şifre..."   │
│  3. Generate dev message → Full stack trace            │
│  4. Add timestamp → "2025-10-16T13:45:23.123Z"        │
│  5. Add context → "signIn:authentication"              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Store in AuthStore State                   │
│                                                         │
│  error: "E-posta veya şifre hatalı..."                │
│  lastError: {                                          │
│    category: 'auth',                                   │
│    message: "E-posta veya şifre hatalı...",          │
│    devMessage: "AuthApiError: Invalid...",            │
│    timestamp: "2025-10-16T13:45:23.123Z",            │
│    context: "signIn:authentication"                    │
│  }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LoginPage Re-renders                       │
│                                                         │
│  Shows Alert with:                                     │
│  - User message (always)                               │
│  - Developer details (if isDevelopment)                │
└─────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. AuthStore Integration

```typescript
// In authStore.ts
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    const authError = AuthErrorHandler.handle(
      error, 
      'signIn:authentication'
    )
    set({ 
      error: authError.message,      // ← User sees this
      lastError: authError,           // ← Devs see this
      isLoading: false,
      connectionStatus: 'disconnected'
    })
  }
} catch (error) {
  const authError = AuthErrorHandler.handle(error, 'signIn:exception')
  // Handle...
}
```

### 2. LoginPage Integration

```typescript
// In LoginPage.tsx
const { error, lastError } = useAuth()
const isDevelopment = AuthErrorHandler.isDevelopment()

// In JSX:
{error && (
  <Alert variant="destructive">
    <AlertDescription>
      <div className="space-y-2">
        <p className="font-medium">{error}</p>
        {isDevelopment && lastError && (
          <details>
            <summary>Geliştirici Detayları</summary>
            {/* Show category, context, timestamp, devMessage */}
          </details>
        )}
      </div>
    </AlertDescription>
  </Alert>
)}
```

### 3. useAuth Hook Integration

```typescript
// In useAuth.ts
export const useAuth = () => {
  const {
    error,
    lastError,  // ← Added this
    // ... other state
  } = useAuthStore()

  return {
    error,
    lastError,  // ← Exposed to components
    // ... other values
  }
}
```

## Benefits

### For Users
✅ Clear, actionable error messages in Turkish
✅ No technical jargon
✅ Guidance on what to do next
✅ Professional, polished experience

### For Developers
✅ Full error context and stack traces
✅ Categorized errors for easier debugging
✅ Timestamp for tracking issues
✅ Context information (where error occurred)
✅ Only visible in development mode

### For System
✅ Centralized error handling
✅ Consistent error format
✅ Easy to extend with new error types
✅ Separation of user and developer concerns
✅ Production-safe (no sensitive info leaked)

## Testing Scenarios

### Scenario 1: Wrong Password
```
Input: admin@demo.com / wrongpassword
Category: auth
User Message: "E-posta veya şifre hatalı. Lütfen tekrar deneyin."
Dev Message: "AuthApiError: Invalid login credentials"
```

### Scenario 2: Network Timeout
```
Input: Any credentials (network down)
Category: connection
User Message: "Bağlantı zaman aşımına uğradı..."
Dev Message: "NetworkError: Timeout after 5000ms"
```

### Scenario 3: Inactive User
```
Input: inactive@demo.com / 123456
Category: authorization
User Message: "Hesabınız devre dışı bırakılmış..."
Dev Message: "User account is inactive (is_active: false)"
```

### Scenario 4: Missing Profile
```
Input: orphan@demo.com / 123456 (auth.users exists, users doesn't)
Category: authorization
User Message: "Kullanıcı profili bulunamadı..."
Dev Message: "Profile not found for user_id: abc123"
```

## Summary

Task 3.2 provides a **complete, production-ready error handling system** that:
- Categorizes all authentication errors
- Provides user-friendly Turkish messages
- Includes detailed developer information
- Integrates seamlessly with existing code
- Maintains security in production
- Enhances debugging in development
