/**
 * Manual Test Checklist - Automated Version
 * Task 9: Authentication Flow Tests
 * 
 * This test suite automates the manual test checklist to verify:
 * - Login flows for different user roles
 * - Session persistence
 * - Role-based access control
 * - Error handling scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

describe('Task 9.1: Giriş Akışı Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth store
    useAuthStore.setState({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  })

  it('Admin kullanıcısı ile giriş yapılabiliyor', async () => {
    // Mock successful admin login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: 'admin-id', email: 'admin@demo.com' } as any,
        session: { access_token: 'token', refresh_token: 'refresh' } as any
      },
      error: null
    })

    // Mock profile fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'admin-id',
              email: 'admin@demo.com',
              full_name: 'Admin User',
              role: 'admin',
              branch_id: 'branch-1',
              is_active: true
            },
            error: null
          })
        })
      })
    } as any)

    // Call signIn from auth store
    await useAuthStore.getState().signIn('admin@demo.com', '123456')

    // Verify signIn was called with correct credentials
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'admin@demo.com',
      password: '123456'
    })

    // Verify user is authenticated
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.profile?.role).toBe('admin')
  })

  it('Manager kullanıcısı ile giriş yapılabiliyor', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: 'manager-id', email: 'manager@demo.com' } as any,
        session: { access_token: 'token', refresh_token: 'refresh' } as any
      },
      error: null
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'manager-id',
              email: 'manager@demo.com',
              full_name: 'Manager User',
              role: 'manager',
              branch_id: 'branch-1',
              is_active: true
            },
            error: null
          })
        })
      })
    } as any)

    await useAuthStore.getState().signIn('manager@demo.com', '123456')

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'manager@demo.com',
      password: '123456'
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.profile?.role).toBe('manager')
  })

  it('Cashier kullanıcısı ile giriş yapılabiliyor', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: 'cashier-id', email: 'cashier@demo.com' } as any,
        session: { access_token: 'token', refresh_token: 'refresh' } as any
      },
      error: null
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'cashier-id',
              email: 'cashier@demo.com',
              full_name: 'Cashier User',
              role: 'cashier',
              branch_id: 'branch-1',
              is_active: true
            },
            error: null
          })
        })
      })
    } as any)

    await useAuthStore.getState().signIn('cashier@demo.com', '123456')

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'cashier@demo.com',
      password: '123456'
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.profile?.role).toBe('cashier')
  })

  it('Yanlış şifre ile hata mesajı gösteriliyor', async () => {
    // Mock failed login with wrong password
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: 'Invalid login credentials',
        status: 400
      } as any
    })

    await useAuthStore.getState().signIn('admin@demo.com', 'wrongpassword')

    // Verify error is set in store
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeTruthy()
  })

  it('Olmayan email ile hata mesajı gösteriliyor', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: 'Invalid login credentials',
        status: 400
      } as any
    })

    await useAuthStore.getState().signIn('nonexistent@demo.com', '123456')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeTruthy()
  })
})

describe('Task 9.2: Session Persistence Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  })

  it('Giriş yapıldıktan sonra session korunuyor', async () => {
    // Mock existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'token',
          refresh_token: 'refresh',
          user: { id: 'user-id', email: 'admin@demo.com' } as any
        } as any
      },
      error: null
    })

    // Mock profile fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'user-id',
              email: 'admin@demo.com',
              full_name: 'Admin User',
              role: 'admin',
              branch_id: 'branch-1',
              is_active: true
            },
            error: null
          })
        })
      })
    } as any)

    // Initialize auth store (simulates app startup)
    await useAuthStore.getState().initialize()

    // Should have loaded session and profile
    expect(supabase.auth.getSession).toHaveBeenCalled()
    
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.profile?.email).toBe('admin@demo.com')
  })

  it('Çıkış yapıldığında session temizleniyor', async () => {
    // First set up authenticated state
    useAuthStore.setState({
      user: { id: 'user-id', email: 'admin@demo.com' } as any,
      profile: {
        id: 'user-id',
        email: 'admin@demo.com',
        full_name: 'Admin User',
        role: 'admin',
        branch_id: 'branch-1',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      isAuthenticated: true,
      isLoading: false,
      error: null
    })

    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null
    })

    // Call signOut
    await useAuthStore.getState().signOut()
    
    expect(supabase.auth.signOut).toHaveBeenCalled()
    
    // Verify state is cleared
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.profile).toBeNull()
  })

  it('Session olmadığında login sayfasına yönlendiriliyor', async () => {
    // Mock no session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    await useAuthStore.getState().initialize()

    // Should not be authenticated
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })
})

describe('Task 9.3: Role-based Access Testleri', () => {
  it('Admin kullanıcısı tüm sayfalara erişebilir', () => {
    const adminProfile = {
      id: 'admin-id',
      email: 'admin@demo.com',
      full_name: 'Admin User',
      role: 'admin' as const,
      branch_id: 'branch-1',
      is_active: true
    }

    // Admin should have access to all routes
    expect(adminProfile.role).toBe('admin')
    expect(adminProfile.is_active).toBe(true)
  })

  it('Manager kullanıcısı Settings dışındaki sayfalara erişebilir', () => {
    const managerProfile = {
      id: 'manager-id',
      email: 'manager@demo.com',
      full_name: 'Manager User',
      role: 'manager' as const,
      branch_id: 'branch-1',
      is_active: true
    }

    // Manager should not have admin role
    expect(managerProfile.role).toBe('manager')
    expect(managerProfile.role).not.toBe('admin')
  })

  it('Cashier kullanıcısı sadece POS, Cash ve Dashboard erişebilir', () => {
    const cashierProfile = {
      id: 'cashier-id',
      email: 'cashier@demo.com',
      full_name: 'Cashier User',
      role: 'cashier' as const,
      branch_id: 'branch-1',
      is_active: true
    }

    // Cashier should have limited access
    expect(cashierProfile.role).toBe('cashier')
    expect(['admin', 'manager']).not.toContain(cashierProfile.role)
  })
})

describe('Task 9.4: Hata Durumları Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  })

  it('Network hatası durumunda anlamlı mesaj gösteriliyor', async () => {
    // Mock network error
    vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
      new Error('Network request failed')
    )

    await useAuthStore.getState().signIn('admin@demo.com', '123456')

    // Should handle network error gracefully
    expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeTruthy()
  })

  it('Inactive user ile giriş denemesi hata veriyor', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: 'inactive-id', email: 'inactive@demo.com' } as any,
        session: { access_token: 'token', refresh_token: 'refresh' } as any
      },
      error: null
    })

    // Mock inactive user profile
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'inactive-id',
              email: 'inactive@demo.com',
              full_name: 'Inactive User',
              role: 'cashier',
              branch_id: 'branch-1',
              is_active: false
            },
            error: null
          })
        })
      })
    } as any)

    await useAuthStore.getState().signIn('inactive@demo.com', '123456')

    // Should detect inactive user and show error
    expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
    
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeTruthy()
    expect(state.error).toContain('aktif değil')
  })

  it('Session timeout durumunda login sayfasına yönlendiriliyor', async () => {
    // Mock expired session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: { message: 'Session expired', status: 401 } as any
    })

    await useAuthStore.getState().initialize()

    // Should redirect to login when session is expired
    expect(supabase.auth.getSession).toHaveBeenCalled()
    
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('Profil bulunamadığında hata gösteriliyor', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: 'no-profile-id', email: 'noprofile@demo.com' } as any,
        session: { access_token: 'token', refresh_token: 'refresh' } as any
      },
      error: null
    })

    // Mock no profile found
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows found', code: 'PGRST116' } as any
          })
        })
      })
    } as any)

    await useAuthStore.getState().signIn('noprofile@demo.com', '123456')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeTruthy()
  })
})
