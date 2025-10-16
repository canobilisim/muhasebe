# Task 3 Visual Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Enhanced AuthStore                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  State Management                                   │    │
│  │  • user, profile, session                          │    │
│  │  • isLoading, isInitialized, error                 │    │
│  │  • connectionStatus (NEW)                          │    │
│  │  • lastError (NEW)                                 │    │
│  │  • initializeAttempts (NEW)                        │    │
│  │  • debugMode (NEW)                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Actions with Enhanced Logging                      │    │
│  │                                                     │    │
│  │  signIn()                                          │    │
│  │  ├─ 🔐 Structured logging                         │    │
│  │  ├─ Step 1: Authentication                        │    │
│  │  ├─ Step 2: Profile fetch                         │    │
│  │  ├─ Step 3: Active check                          │    │
│  │  ├─ Step 4: Set state                             │    │
│  │  └─ ✅ Success / ❌ Error                          │    │
│  │                                                     │    │
│  │  initialize()                                      │    │
│  │  ├─ 🔄 Retry logic (max 3)                        │    │
│  │  ├─ ⏱️ Timeout (5s)                                │    │
│  │  ├─ Step 1: Get session                           │    │
│  │  ├─ Step 2: Fetch profile                         │    │
│  │  ├─ Step 3: Handle errors                         │    │
│  │  └─ ✅ Success / ❌ Error                          │    │
│  │                                                     │    │
│  │  signOut()                                         │    │
│  │  └─ 🚪 Logout with logging                        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AuthErrorHandler                           │
│                                                              │
│  handle(error, context) → AuthError                         │
│  ├─ Categorize error                                        │
│  │  ├─ Connection (network, timeout, CORS)                 │
│  │  ├─ Auth (credentials, email, not found)                │
│  │  ├─ Authorization (inactive, profile, access)           │
│  │  └─ System (session, unexpected)                        │
│  │                                                          │
│  ├─ Generate user message (Turkish)                        │
│  │  └─ "E-posta veya şifre hatalı..."                     │
│  │                                                          │
│  └─ Generate dev message (detailed)                        │
│     └─ Stack trace, error details                          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Sign In Flow
```
User enters credentials
        │
        ▼
┌───────────────────┐
│ signIn() called   │
│ 🔐 Log: Start     │
└───────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Step 1: Authenticate          │
│ • Call Supabase auth          │
│ • Log result                  │
│ • Handle errors               │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Step 2: Fetch Profile         │
│ • Query users table           │
│ • Log result                  │
│ • Handle errors               │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Step 3: Check Active          │
│ • Verify is_active            │
│ • Log status                  │
│ • Sign out if inactive        │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Step 4: Set State             │
│ • Update all state fields     │
│ • Set connectionStatus        │
│ • Clear errors                │
│ • Log success                 │
└───────────────────────────────┘
        │
        ▼
    ✅ Success
```

### Initialize Flow with Retry
```
App starts
    │
    ▼
┌─────────────────────┐
│ initialize() called │
│ 🔄 Log: Start       │
│ Attempt: 1/3        │
└─────────────────────┘
    │
    ▼
┌──────────────────────────┐
│ Check retry limit        │
│ • Max 3 attempts         │
│ • Abort if exceeded      │
└──────────────────────────┘
    │
    ▼
┌──────────────────────────┐
│ Step 1: Get Session      │
│ • 5s timeout             │
│ • Log result             │
└──────────────────────────┘
    │
    ├─ Success ──────────────┐
    │                        ▼
    │              ┌──────────────────┐
    │              │ Step 2: Profile  │
    │              │ • Fetch profile  │
    │              │ • Check active   │
    │              └──────────────────┘
    │                        │
    │                        ▼
    │              ┌──────────────────┐
    │              │ Set State        │
    │              │ • Reset attempts │
    │              │ • Set connected  │
    │              └──────────────────┘
    │                        │
    │                        ▼
    │                    ✅ Success
    │
    └─ Error ────────────────┐
                             ▼
                   ┌──────────────────┐
                   │ Handle Error     │
                   │ • Log error      │
                   │ • Increment      │
                   │ • Retry if < 3   │
                   └──────────────────┘
                             │
                             ▼
                         ❌ Failed
```

## Error Handling Flow

```
Error occurs
    │
    ▼
┌─────────────────────────────────┐
│ AuthErrorHandler.handle()       │
│ • Receive error + context       │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Categorize Error                │
│ ├─ Check error message          │
│ ├─ Match patterns               │
│ └─ Assign category              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Generate Messages               │
│ ├─ User: Turkish, friendly      │
│ └─ Dev: Detailed, technical     │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Return AuthError                │
│ {                               │
│   category: 'auth',             │
│   message: 'E-posta hatalı',    │
│   devMessage: 'Stack trace...',  │
│   timestamp: '2025-10-16...',   │
│   context: 'signIn:auth'        │
│ }                               │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Update State                    │
│ • Set error message             │
│ • Set lastError                 │
│ • Set connectionStatus          │
│ • Log to console                │
└─────────────────────────────────┘
```

## Console Output Examples

### Successful Sign In
```
🔐 Auth Operation: signIn
  Timestamp: 2025-10-16T10:30:45.123Z
  Email: admin@demo.com
  Context: User login attempt
  
  Step 1: Calling supabase.auth.signInWithPassword...
  Step 1 Result: {
    success: true,
    hasUser: true,
    hasSession: true,
    error: undefined
  }
  
  Step 2: Fetching user profile from users table...
  User ID: 123e4567-e89b-12d3-a456-426614174000
  Step 2 Result: {
    success: true,
    hasProfile: true,
    profileError: undefined
  }
  
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

### Failed Sign In (Invalid Credentials)
```
🔐 Auth Operation: signIn
  Timestamp: 2025-10-16T10:31:12.456Z
  Email: wrong@demo.com
  Context: User login attempt
  
  Step 1: Calling supabase.auth.signInWithPassword...
  Step 1 Result: {
    success: false,
    hasUser: false,
    hasSession: false,
    error: "Invalid login credentials"
  }
  
  [Auth Error - signIn:authentication] {
    timestamp: "2025-10-16T10:31:12.456Z",
    error: Error: Invalid login credentials
  }
  
  Authentication failed: {
    category: "auth",
    message: "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
    devMessage: "Error: Invalid login credentials\n  at ...",
    timestamp: "2025-10-16T10:31:12.456Z",
    context: "signIn:authentication"
  }
```

### Initialize with Retry
```
🔄 Auth Operation: initialize
  Timestamp: 2025-10-16T10:32:00.000Z
  Attempt: 1
  Max Retries: 3
  Context: Application initialization
  
  Step 1: Getting session (timeout: 5000ms)...
  Step 1 Result: {
    success: false,
    hasSession: false,
    hasUser: false,
    error: "Session timeout",
    duration: "5001ms"
  }
  
  [Auth Error - initialize:sessionCheck] {
    timestamp: "2025-10-16T10:32:05.001Z",
    error: Error: Session timeout
  }
  
  Session check failed: {...}
  Will retry (1/3)

🔄 Auth Operation: initialize
  Timestamp: 2025-10-16T10:32:05.100Z
  Attempt: 2
  Max Retries: 3
  Context: Application initialization
  
  Step 1: Getting session (timeout: 5000ms)...
  Step 1 Result: {
    success: true,
    hasSession: true,
    hasUser: true,
    error: undefined,
    duration: "123ms"
  }
  
  Step 2: User session found, fetching profile...
  User ID: 123e4567-e89b-12d3-a456-426614174000
  Session expires at: 2025-10-16T11:32:05.000Z
  Step 2 Result: {
    success: true,
    hasProfile: true,
    isActive: true,
    role: "admin",
    branchId: "branch-001",
    profileError: undefined,
    duration: "156ms"
  }
  
  Step 3: Setting authenticated state...
  ✅ Initialize successful!
  Total Duration: 279ms
  User Role: admin
  Branch ID: branch-001
```

## State Changes

### Connection Status Transitions
```
disconnected → checking → connected     (Success)
disconnected → checking → disconnected  (Failure)
connected → checking → connected        (Refresh)
```

### Initialize Attempts
```
0 → 1 → 2 → 3 (Max reached, abort)
0 → 1 → 0 (Success, reset)
```

## Integration Points

### LoginPage Integration
```typescript
const { signIn, error, lastError, connectionStatus } = useAuthStore()

// Display user-friendly error
{error && <Alert>{error}</Alert>}

// Display developer details (dev mode only)
{lastError && isDev && (
  <details>
    <summary>Developer Details</summary>
    <pre>{lastError.devMessage}</pre>
  </details>
)}

// Show connection status
<Badge>{connectionStatus}</Badge>
```

### Debug Panel Integration
```typescript
const { 
  connectionStatus, 
  lastError, 
  initializeAttempts,
  debugMode 
} = useAuthStore()

// Display diagnostic info
<div>
  <p>Status: {connectionStatus}</p>
  <p>Attempts: {initializeAttempts}/3</p>
  {lastError && (
    <div>
      <p>Category: {lastError.category}</p>
      <p>Message: {lastError.message}</p>
      <p>Time: {lastError.timestamp}</p>
    </div>
  )}
</div>
```
