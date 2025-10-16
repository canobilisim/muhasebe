# Task 3.3 Visual Guide: Connection Status Tracking

## Connection Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Application Start                          │
│              connectionStatus: 'disconnected'                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  User Clicks "Giriş Yap"                     │
│              connectionStatus: 'checking'                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
            ┌───────▼──────┐  ┌────▼──────────┐
            │  Connection  │  │   Connection  │
            │   Success    │  │    Failure    │
            └───────┬──────┘  └────┬──────────┘
                    │               │
        ┌───────────▼──────┐  ┌────▼──────────────────┐
        │  Auth Success    │  │  Connection Error     │
        │  status:         │  │  status:              │
        │  'connected'     │  │  'disconnected'       │
        └───────┬──────────┘  │  lastError: {...}     │
                │              └───────────────────────┘
                │
        ┌───────▼──────────┐
        │  Dashboard       │
        │  status:         │
        │  'connected'     │
        └──────────────────┘
```

## Connection Status States

### 1. Disconnected State
```
┌─────────────────────────────────────┐
│  connectionStatus: 'disconnected'   │
│  ─────────────────────────────────  │
│  • Initial state                    │
│  • After sign out                   │
│  • After connection error           │
│  • No active session                │
└─────────────────────────────────────┘
```

### 2. Checking State
```
┌─────────────────────────────────────┐
│  connectionStatus: 'checking'       │
│  ─────────────────────────────────  │
│  • During signIn()                  │
│  • During initialize()              │
│  • During checkConnection()         │
│  • During auth state changes        │
└─────────────────────────────────────┘
```

### 3. Connected State
```
┌─────────────────────────────────────┐
│  connectionStatus: 'connected'      │
│  ─────────────────────────────────  │
│  • After successful sign in         │
│  • After successful initialize      │
│  • Active authenticated session     │
│  • Receiving auth state updates     │
└─────────────────────────────────────┘
```

## Method: checkConnection()

### Flow Diagram
```
┌──────────────────────────────────────────────────────────┐
│  checkConnection() called                                 │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  Set connectionStatus = 'checking'                        │
│  Log: "🔌 Auth Operation: checkConnection"               │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  Try: supabase.auth.getSession()                         │
└──────────────────────────────────────────────────────────┘
                        ↓
                ┌───────┴────────┐
                │                │
        ┌───────▼──────┐  ┌──────▼────────┐
        │   Success    │  │    Error      │
        └───────┬──────┘  └──────┬────────┘
                │                │
    ┌───────────▼──────────┐  ┌──▼─────────────────────┐
    │ Has session?         │  │ Handle error           │
    │ Yes → 'connected'    │  │ Set 'disconnected'     │
    │ No → 'disconnected'  │  │ Set lastError          │
    │ Return true          │  │ Return false           │
    └──────────────────────┘  └────────────────────────┘
```

## Auth Operations Connection Tracking

### signIn() Flow
```
signIn(email, password)
    ↓
Set status = 'checking'
    ↓
Call supabase.auth.signInWithPassword()
    ↓
    ├─ Error? → Detect if connection error
    │           ├─ Network/Fetch/Connection → 'disconnected'
    │           └─ Auth error → 'connected' (server reachable)
    │
    └─ Success → Fetch profile
                    ↓
                Set status = 'connected'
```

### initialize() Flow
```
initialize()
    ↓
Set status = 'checking'
    ↓
Get session (with timeout)
    ↓
    ├─ No session → Set 'disconnected'
    │
    ├─ Error → Set 'disconnected' + lastError
    │
    └─ Has session → Fetch profile
                        ↓
                    Set status = 'connected'
```

### signOut() Flow
```
signOut()
    ↓
Call supabase.auth.signOut()
    ↓
Set status = 'disconnected'
Clear all auth state
```

## Auth State Change Events

```
┌────────────────────────────────────────────────────────┐
│  onAuthStateChange Event Handler                       │
└────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┼───────────────┬──────────────┐
        │               │               │              │
    ┌───▼────┐    ┌─────▼─────┐   ┌────▼────┐   ┌────▼────────┐
    │SIGNED  │    │  SIGNED   │   │ TOKEN   │   │    USER     │
    │  OUT   │    │    IN     │   │REFRESHED│   │   UPDATED   │
    └───┬────┘    └─────┬─────┘   └────┬────┘   └────┬────────┘
        │               │               │              │
        │          Set 'checking'  Set 'checking'  Set 'connected'
        │               │               │              │
    Set 'disconnected'  │               │              │
        │          Re-initialize   Re-initialize       │
        │               │               │              │
        └───────────────┴───────────────┴──────────────┘
```

## Error Detection Logic

```
┌─────────────────────────────────────────────────────────┐
│  Error Received from Supabase                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  AuthErrorHandler.handle(error, context)                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Check if Connection Error:                             │
│  • authError.category === 'connection'                  │
│  • error.message includes 'network'                     │
│  • error.message includes 'fetch'                       │
│  • error.message includes 'connection'                  │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴────────────────┐
        │                                │
    ┌───▼──────────────┐      ┌──────────▼─────────┐
    │ Is Connection    │      │ Not Connection     │
    │ Error            │      │ Error              │
    │                  │      │                    │
    │ Set status:      │      │ Set status:        │
    │ 'disconnected'   │      │ 'connected'        │
    │                  │      │ (server reachable) │
    └──────────────────┘      └────────────────────┘
```

## Console Output Examples

### Successful Connection Check
```
🔌 Auth Operation: checkConnection
  Timestamp: 2025-10-16T10:30:45.123Z
  Context: Connection health check
  Attempting to connect to Supabase...
  ✅ Connection successful!
  Has session: true
```

### Failed Connection Check
```
🔌 Auth Operation: checkConnection
  Timestamp: 2025-10-16T10:30:45.123Z
  Context: Connection health check
  Attempting to connect to Supabase...
  Connection check failed: {
    category: 'connection',
    message: 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.',
    devMessage: 'Network error: Failed to fetch'
  }
```

### Sign In with Connection Tracking
```
🔐 Auth Operation: signIn
  Timestamp: 2025-10-16T10:31:00.456Z
  Email: admin@demo.com
  Context: User login attempt
  Step 1: Calling supabase.auth.signInWithPassword...
  Step 1 Result: { success: true, hasUser: true, hasSession: true }
  Step 2: Fetching user profile from users table...
  User ID: abc-123-def
  Step 2 Result: { success: true, hasProfile: true }
  Step 3: Checking user active status...
  Is Active: true
  Role: admin
  Branch ID: branch-001
  Step 4: Setting authenticated state...
  ✅ Sign in successful!
  Duration: 234ms
  User Role: admin
  Branch ID: branch-001
```

## Integration with UI Components

### Example: Connection Status Indicator
```typescript
function ConnectionIndicator() {
  const connectionStatus = useAuthStore(state => state.connectionStatus)
  
  const statusConfig = {
    connected: {
      icon: '🟢',
      text: 'Bağlı',
      color: 'text-green-600'
    },
    disconnected: {
      icon: '🔴',
      text: 'Bağlantı Yok',
      color: 'text-red-600'
    },
    checking: {
      icon: '🟡',
      text: 'Kontrol Ediliyor...',
      color: 'text-yellow-600'
    }
  }
  
  const config = statusConfig[connectionStatus]
  
  return (
    <div className={`flex items-center gap-2 ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  )
}
```

### Example: Connection Error Display
```typescript
function ConnectionErrorAlert() {
  const { connectionStatus, lastError } = useAuthStore()
  
  if (connectionStatus !== 'disconnected' || !lastError) {
    return null
  }
  
  return (
    <Alert variant="destructive">
      <AlertTitle>Bağlantı Hatası</AlertTitle>
      <AlertDescription>
        <p>{lastError.message}</p>
        {isDevelopment && lastError.devMessage && (
          <details className="mt-2">
            <summary>Geliştirici Detayları</summary>
            <pre className="text-xs">{lastError.devMessage}</pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  )
}
```

## State Persistence

Note: `connectionStatus` is **NOT** persisted to localStorage. It's always initialized as `'disconnected'` on app start and updated based on actual connection checks.

Persisted fields:
- user
- profile
- session
- isInitialized
- isAuthenticated
- userRole
- branchId

Non-persisted (runtime only):
- connectionStatus ← Always starts fresh
- lastError
- isLoading
- error
- initializeAttempts
- debugMode
