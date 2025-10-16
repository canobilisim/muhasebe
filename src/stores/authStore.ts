import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types'
import type { AuthUser, AuthSession } from '@/types/supabase'
import { config } from '@/lib/config'
import { AuthErrorHandler, type AuthError } from '@/lib/auth-error-handler'

type ConnectionStatus = 'connected' | 'disconnected' | 'checking'

interface AuthState {
  // State
  user: AuthUser | null
  profile: User | null
  session: AuthSession | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // Enhanced diagnostic fields
  connectionStatus: ConnectionStatus
  lastError: AuthError | null
  initializeAttempts: number
  debugMode: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
  checkConnection: () => Promise<boolean>
  
  // Computed properties
  isAuthenticated: boolean
  userRole: UserRole | null
  branchId: string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      
      // Enhanced diagnostic fields
      connectionStatus: 'disconnected',
      lastError: null,
      initializeAttempts: 0,
      debugMode: AuthErrorHandler.isDevelopment(),

      // Computed properties - these need to be regular state for reactivity
      isAuthenticated: false,
      userRole: null,
      branchId: null,

      // Actions
      signIn: async (email: string, password: string) => {
        const startTime = Date.now()
        const timestamp = new Date().toISOString()
        
        // Structured logging - Start
        console.group('🔐 Auth Operation: signIn')
        console.log('Timestamp:', timestamp)
        console.log('Email:', email)
        console.log('Context: User login attempt')
        
        set({ 
          isLoading: true, 
          error: null, 
          lastError: null,
          connectionStatus: 'checking' 
        })

        try {
          // Step 1: Authenticate with Supabase
          console.log('Step 1: Calling supabase.auth.signInWithPassword...')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          console.log('Step 1 Result:', { 
            success: !error, 
            hasUser: !!data?.user,
            hasSession: !!data?.session,
            error: error?.message 
          })

          if (error) {
            const authError = AuthErrorHandler.handle(error, 'signIn:authentication')
            console.error('Authentication failed:', authError)
            
            // Determine if this is a connection error
            const isConnectionError = authError.category === 'connection' || 
                                     error.message?.toLowerCase().includes('network') ||
                                     error.message?.toLowerCase().includes('fetch') ||
                                     error.message?.toLowerCase().includes('connection')
            
            if (isConnectionError) {
              console.error('🔴 Connection error detected')
            }
            console.groupEnd()
            
            set({ 
              error: authError.message, 
              lastError: authError,
              isLoading: false,
              connectionStatus: isConnectionError ? 'disconnected' : 'connected'
            })
            return { success: false, error: authError.message }
          }

          if (data.user && data.session) {
            // Step 2: Fetch user profile
            console.log('Step 2: Fetching user profile from users table...')
            console.log('User ID:', data.user.id)
            
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            console.log('Step 2 Result:', { 
              success: !profileError, 
              hasProfile: !!profile,
              profileError: profileError?.message 
            })

            if (profileError) {
              const authError = AuthErrorHandler.handle(
                profileError, 
                'signIn:profileFetch'
              )
              console.error('Profile fetch failed:', authError)
              console.groupEnd()
              
              set({ 
                error: authError.message, 
                lastError: authError,
                isLoading: false,
                connectionStatus: 'disconnected'
              })
              return { success: false, error: authError.message }
            }

            // Step 3: Check if user is active
            console.log('Step 3: Checking user active status...')
            console.log('Is Active:', profile.is_active)
            console.log('Role:', profile.role)
            console.log('Branch ID:', profile.branch_id)
            
            if (!profile.is_active) {
              console.warn('User is inactive, signing out...')
              await supabase.auth.signOut()
              
              const authError = AuthErrorHandler.handle(
                new Error('User account is inactive'),
                'signIn:authorization'
              )
              console.error('Authorization failed:', authError)
              console.groupEnd()
              
              set({ 
                error: authError.message, 
                lastError: authError,
                isLoading: false,
                connectionStatus: 'disconnected'
              })
              return { success: false, error: authError.message }
            }

            // Step 4: Set authenticated state
            console.log('Step 4: Setting authenticated state...')
            const duration = Date.now() - startTime
            console.log('✅ Sign in successful!')
            console.log('Duration:', `${duration}ms`)
            console.log('User Role:', profile.role)
            console.log('Branch ID:', profile.branch_id)
            console.groupEnd()
            
            set({
              user: data.user,
              profile,
              session: data.session,
              isLoading: false,
              isInitialized: true,
              error: null,
              lastError: null,
              isAuthenticated: true,
              userRole: profile.role,
              branchId: profile.branch_id,
              connectionStatus: 'connected',
            })

            return { success: true }
          }

          // No user or session returned
          const authError = AuthErrorHandler.handle(
            new Error('No user or session returned'),
            'signIn:noData'
          )
          console.error('Sign in failed:', authError)
          console.groupEnd()
          
          set({ 
            error: authError.message, 
            lastError: authError,
            isLoading: false,
            connectionStatus: 'disconnected'
          })
          return { success: false, error: authError.message }
        } catch (error) {
          const authError = AuthErrorHandler.handle(error, 'signIn:exception')
          console.error('Unexpected error during sign in:', authError)
          console.groupEnd()
          
          set({ 
            error: authError.message, 
            lastError: authError,
            isLoading: false,
            connectionStatus: 'disconnected'
          })
          return { success: false, error: authError.message }
        }
      },

      signOut: async () => {
        const timestamp = new Date().toISOString()
        
        console.group('🚪 Auth Operation: signOut')
        console.log('Timestamp:', timestamp)
        console.log('Context: User logout')
        
        set({ isLoading: true })

        try {
          console.log('Calling supabase.auth.signOut...')
          await supabase.auth.signOut()
          console.log('✅ Sign out successful!')
          console.groupEnd()
          
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            error: null,
            lastError: null,
            isAuthenticated: false,
            userRole: null,
            branchId: null,
            connectionStatus: 'disconnected',
            initializeAttempts: 0,
          })
        } catch (error) {
          const authError = AuthErrorHandler.handle(error, 'signOut:exception')
          console.error('Sign out error:', authError)
          console.warn('Forcing state clear despite error')
          console.groupEnd()
          
          // Force clear state even if signOut fails
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            error: null,
            lastError: authError,
            isAuthenticated: false,
            userRole: null,
            branchId: null,
            connectionStatus: 'disconnected',
            initializeAttempts: 0,
          })
        }
      },

      initialize: async () => {
        const startTime = Date.now()
        const timestamp = new Date().toISOString()
        const currentState = get()
        const maxRetries = 3
        const timeoutMs = 5000
        
        // Structured logging - Start
        console.group('🔄 Auth Operation: initialize')
        console.log('Timestamp:', timestamp)
        console.log('Attempt:', currentState.initializeAttempts + 1)
        console.log('Max Retries:', maxRetries)
        console.log('Context: Application initialization')
        
        // Prevent multiple simultaneous initializations
        if (currentState.isLoading) {
          console.warn('Already initializing, skipping')
          console.groupEnd()
          return
        }
        
        // Check retry limit
        if (currentState.initializeAttempts >= maxRetries) {
          console.error('Max retry attempts reached, aborting')
          console.groupEnd()
          set({ 
            isLoading: false, 
            isInitialized: true,
            connectionStatus: 'disconnected'
          })
          return
        }
        
        set({ 
          isLoading: true,
          connectionStatus: 'checking',
          initializeAttempts: currentState.initializeAttempts + 1
        })

        try {
          // Step 1: Get current session with timeout
          console.log(`Step 1: Getting session (timeout: ${timeoutMs}ms)...`)
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), timeoutMs)
          )
          
          const { data: { session }, error } = await Promise.race([
            sessionPromise, 
            timeoutPromise
          ]) as any
          
          const duration1 = Date.now() - startTime
          console.log('Step 1 Result:', { 
            success: !error,
            hasSession: !!session, 
            hasUser: !!session?.user,
            error: error?.message,
            duration: `${duration1}ms`
          })

          if (error) {
            const authError = AuthErrorHandler.handle(error, 'initialize:sessionCheck')
            console.error('Session check failed:', authError)
            console.groupEnd()
            
            set({ 
              isLoading: false, 
              isInitialized: true,
              lastError: authError,
              connectionStatus: 'disconnected'
            })
            return
          }

          if (session?.user) {
            // Step 2: Fetch user profile
            console.log('Step 2: User session found, fetching profile...')
            console.log('User ID:', session.user.id)
            console.log('Session expires at:', new Date(session.expires_at! * 1000).toISOString())
            
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const duration2 = Date.now() - startTime
            console.log('Step 2 Result:', { 
              success: !profileError,
              hasProfile: !!profile, 
              isActive: profile?.is_active,
              role: profile?.role,
              branchId: profile?.branch_id,
              profileError: profileError?.message,
              duration: `${duration2}ms`
            })

            if (profileError || !profile?.is_active) {
              // Step 3: Handle profile error or inactive user
              console.log('Step 3: Profile error or inactive user, signing out...')
              
              if (profileError) {
                const authError = AuthErrorHandler.handle(
                  profileError, 
                  'initialize:profileFetch'
                )
                console.error('Profile fetch failed:', authError)
                set({ lastError: authError })
              } else {
                console.warn('User is inactive')
              }
              
              await supabase.auth.signOut()
              console.log('Signed out successfully')
              console.groupEnd()
              
              set({
                user: null,
                profile: null,
                session: null,
                isLoading: false,
                isInitialized: true,
                isAuthenticated: false,
                userRole: null,
                branchId: null,
                connectionStatus: 'disconnected',
              })
              return
            }

            // Step 4: Set authenticated state
            console.log('Step 3: Setting authenticated state...')
            const totalDuration = Date.now() - startTime
            console.log('✅ Initialize successful!')
            console.log('Total Duration:', `${totalDuration}ms`)
            console.log('User Role:', profile.role)
            console.log('Branch ID:', profile.branch_id)
            console.groupEnd()
            
            set({
              user: session.user,
              profile,
              session,
              isLoading: false,
              isInitialized: true,
              isAuthenticated: true,
              userRole: profile.role,
              branchId: profile.branch_id,
              connectionStatus: 'connected',
              initializeAttempts: 0, // Reset on success
            })
          } else {
            // No session found
            console.log('Step 2: No session found, setting unauthenticated state')
            const totalDuration = Date.now() - startTime
            console.log('Duration:', `${totalDuration}ms`)
            console.groupEnd()
            
            set({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              isInitialized: true,
              isAuthenticated: false,
              userRole: null,
              branchId: null,
              connectionStatus: 'disconnected',
              initializeAttempts: 0, // Reset on success
            })
          }
        } catch (error) {
          const authError = AuthErrorHandler.handle(error, 'initialize:exception')
          console.error('Unexpected error during initialize:', authError)
          
          const currentAttempts = get().initializeAttempts
          if (currentAttempts < maxRetries) {
            console.warn(`Will retry (${currentAttempts}/${maxRetries})`)
          } else {
            console.error('Max retries reached, giving up')
          }
          console.groupEnd()
          
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isInitialized: true,
            isAuthenticated: false,
            userRole: null,
            branchId: null,
            lastError: authError,
            connectionStatus: 'disconnected',
          })
        }
      },

      clearError: () => {
        console.log('🧹 Clearing auth errors')
        set({ error: null, lastError: null })
      },

      checkConnection: async () => {
        const timestamp = new Date().toISOString()
        
        console.group('🔌 Auth Operation: checkConnection')
        console.log('Timestamp:', timestamp)
        console.log('Context: Connection health check')
        
        set({ connectionStatus: 'checking' })

        try {
          // Try to get session to verify Supabase connection
          console.log('Attempting to connect to Supabase...')
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            const authError = AuthErrorHandler.handle(error, 'checkConnection:sessionCheck')
            console.error('Connection check failed:', authError)
            console.groupEnd()
            
            set({ 
              connectionStatus: 'disconnected',
              lastError: authError
            })
            return false
          }

          console.log('✅ Connection successful!')
          console.log('Has session:', !!data.session)
          console.groupEnd()
          
          set({ 
            connectionStatus: data.session ? 'connected' : 'disconnected'
          })
          return true
        } catch (error) {
          const authError = AuthErrorHandler.handle(error, 'checkConnection:exception')
          console.error('Connection check exception:', authError)
          console.groupEnd()
          
          set({ 
            connectionStatus: 'disconnected',
            lastError: authError
          })
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist essential data, not loading states or diagnostic info
        user: state.user,
        profile: state.profile,
        session: state.session,
        isInitialized: state.isInitialized,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        branchId: state.branchId,
      }),
    }
  )
)

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const timestamp = new Date().toISOString()
  console.log('🔔 Auth State Change:', { event, timestamp, hasSession: !!session })
  
  const { initialize } = useAuthStore.getState()
  
  if (event === 'SIGNED_OUT') {
    console.log('Handling SIGNED_OUT event')
    useAuthStore.setState({
      user: null,
      profile: null,
      session: null,
      error: null,
      lastError: null,
      isAuthenticated: false,
      userRole: null,
      branchId: null,
      connectionStatus: 'disconnected',
    })
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    console.log(`Handling ${event} event, re-initializing...`)
    // Update connection status to checking during re-initialization
    useAuthStore.setState({ connectionStatus: 'checking' })
    // Re-initialize to fetch fresh profile data
    await initialize()
  } else if (event === 'USER_UPDATED') {
    console.log('Handling USER_UPDATED event')
    // Connection is active if we're receiving updates
    useAuthStore.setState({ connectionStatus: 'connected' })
  }
})