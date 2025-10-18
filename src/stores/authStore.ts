import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types'
import type { AuthUser, AuthSession } from '@/types/supabase'
import { config } from '@/lib/config'
import { AuthErrorHandler, type AuthError } from '@/lib/auth-error-handler'
import { logger } from '@/lib/logger'

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
        
        set({ 
          isLoading: true, 
          error: null, 
          lastError: null,
          connectionStatus: 'checking' 
        })

        try {
          // Step 1: Authenticate with Supabase
          logger.log('Step 1: Calling supabase.auth.signInWithPassword...')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          logger.log('Step 1 Result:', { 
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
            logger.groupEnd()
            
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
            logger.log('Step 2: Fetching user profile from users table...')
            logger.log('User ID:', data.user.id)
            
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            logger.log('Step 2 Result:', { 
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
              logger.groupEnd()
              
              set({ 
                error: authError.message, 
                lastError: authError,
                isLoading: false,
                connectionStatus: 'disconnected'
              })
              return { success: false, error: authError.message }
            }

            // Step 3: Check if user is active
            logger.log('Step 3: Checking user active status...')
            logger.log('Is Active:', profile.is_active)
            logger.log('Role:', profile.role)
            logger.log('Branch ID:', profile.branch_id)
            
            if (!profile.is_active) {
              logger.warn('User is inactive, signing out...')
              await supabase.auth.signOut()
              
              const authError = AuthErrorHandler.handle(
                new Error('User account is inactive'),
                'signIn:authorization'
              )
              console.error('Authorization failed:', authError)
              logger.groupEnd()
              
              set({ 
                error: authError.message, 
                lastError: authError,
                isLoading: false,
                connectionStatus: 'disconnected'
              })
              return { success: false, error: authError.message }
            }

            // Step 4: Set authenticated state
            logger.log('Step 4: Setting authenticated state...')
            logger.log('✅ Sign in successful!')
            logger.log('User Role:', profile.role)
            logger.log('Branch ID:', profile.branch_id)
            
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
          logger.groupEnd()
          
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
          logger.groupEnd()
          
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
        
        logger.group('🚪 Auth Operation: signOut')
        logger.log('Timestamp:', timestamp)
        logger.log('Context: User logout')
        
        set({ isLoading: true })

        try {
          logger.log('Calling supabase.auth.signOut...')
          await supabase.auth.signOut()
          logger.log('✅ Sign out successful!')
          logger.groupEnd()
          
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
          logger.warn('Forcing state clear despite error')
          logger.groupEnd()
          
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
        
        // Structured logging - Start
        logger.group('🔄 Auth Operation: initialize')
        logger.log('Timestamp:', timestamp)
        logger.log('Attempt:', currentState.initializeAttempts + 1)
        logger.log('Max Retries:', maxRetries)
        logger.log('Context: Application initialization')
        
        // Prevent multiple simultaneous initializations
        if (currentState.isLoading) {
          logger.warn('Already initializing, skipping')
          logger.groupEnd()
          return
        }
        
        // Check retry limit
        if (currentState.initializeAttempts >= maxRetries) {
          console.error('Max retry attempts reached, aborting')
          logger.groupEnd()
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
          // Step 1: Get current session with longer timeout
          logger.log(`Step 1: Getting session...`)
          
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout after 15 seconds')), 15000)
          )
          
          let sessionResult
          try {
            sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any
          } catch (timeoutError) {
            console.error('Session check timed out, assuming no session')
            sessionResult = { data: { session: null }, error: null }
          }
          
          const { data: { session }, error } = sessionResult
          
          const duration1 = Date.now() - startTime
          logger.log('Step 1 Result:', { 
            success: !error,
            hasSession: !!session, 
            hasUser: !!session?.user,
            error: error?.message,
            duration: `${duration1}ms`
          })

          if (error) {
            const authError = AuthErrorHandler.handle(error, 'initialize:sessionCheck')
            console.error('Session check failed:', authError)
            logger.groupEnd()
            
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
            logger.log('Step 2: User session found, fetching profile...')
            logger.log('User ID:', session.user.id)
            logger.log('Session expires at:', new Date(session.expires_at! * 1000).toISOString())
            
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const duration2 = Date.now() - startTime
            logger.log('Step 2 Result:', { 
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
              logger.log('Step 3: Profile error or inactive user, signing out...')
              
              if (profileError) {
                const authError = AuthErrorHandler.handle(
                  profileError, 
                  'initialize:profileFetch'
                )
                console.error('Profile fetch failed:', authError)
                set({ lastError: authError })
              } else {
                logger.warn('User is inactive')
              }
              
              await supabase.auth.signOut()
              logger.log('Signed out successfully')
              logger.groupEnd()
              
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
            logger.log('Step 3: Setting authenticated state...')
            const totalDuration = Date.now() - startTime
            logger.log('✅ Initialize successful!')
            logger.log('Total Duration:', `${totalDuration}ms`)
            logger.log('User Role:', profile.role)
            logger.log('Branch ID:', profile.branch_id)
            logger.groupEnd()
            
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
            logger.log('Step 2: No session found, setting unauthenticated state')
            const totalDuration = Date.now() - startTime
            logger.log('Duration:', `${totalDuration}ms`)
            logger.groupEnd()
            
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
            logger.warn(`Will retry (${currentAttempts}/${maxRetries})`)
          } else {
            console.error('Max retries reached, giving up')
          }
          logger.groupEnd()
          
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
        logger.log('🧹 Clearing auth errors')
        set({ error: null, lastError: null })
      },

      checkConnection: async () => {
        const timestamp = new Date().toISOString()
        
        logger.group('🔌 Auth Operation: checkConnection')
        logger.log('Timestamp:', timestamp)
        logger.log('Context: Connection health check')
        
        set({ connectionStatus: 'checking' })

        try {
          // Try to get session to verify Supabase connection
          logger.log('Attempting to connect to Supabase...')
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            const authError = AuthErrorHandler.handle(error, 'checkConnection:sessionCheck')
            console.error('Connection check failed:', authError)
            logger.groupEnd()
            
            set({ 
              connectionStatus: 'disconnected',
              lastError: authError
            })
            return false
          }

          logger.log('✅ Connection successful!')
          logger.log('Has session:', !!data.session)
          logger.groupEnd()
          
          set({ 
            connectionStatus: data.session ? 'connected' : 'disconnected'
          })
          return true
        } catch (error) {
          const authError = AuthErrorHandler.handle(error, 'checkConnection:exception')
          console.error('Connection check exception:', authError)
          logger.groupEnd()
          
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
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            return JSON.parse(str)
          } catch (e) {
            console.error('Failed to parse auth storage:', e)
            return null
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (e) {
            console.error('Failed to save auth storage:', e)
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
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
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState as any),
        }
      },
      version: 1,
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        // If we have a session but not authenticated, fix it
        if (state?.session && !state?.isAuthenticated) {
          return {
            ...state,
            isAuthenticated: true,
          }
        }
        return state
      },
    }
  )
)

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const { initialize } = useAuthStore.getState()
  
  if (event === 'SIGNED_OUT') {
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
    const currentState = useAuthStore.getState()
    
    // Only re-initialize if we don't already have a valid session
    if (!currentState.isAuthenticated || !currentState.session) {
      useAuthStore.setState({ connectionStatus: 'checking' })
      await initialize()
    } else {
      useAuthStore.setState({ connectionStatus: 'connected' })
    }
  } else if (event === 'USER_UPDATED') {
    useAuthStore.setState({ connectionStatus: 'connected' })
  } else if (event === 'INITIAL_SESSION') {
    const currentState = useAuthStore.getState()
    
    // Only initialize if not already initialized
    if (!currentState.isInitialized && session) {
      await initialize()
    }
  }
})
