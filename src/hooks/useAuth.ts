import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'

/**
 * Custom hook for authentication state and actions
 * Provides easy access to auth state and methods
 */
export const useAuth = () => {
  const {
    user,
    profile,
    session,
    isLoading,
    isInitialized,
    error,
    lastError,
    isAuthenticated,
    userRole,
    branchId,
    signIn,
    signOut,
    initialize,
    clearError,
  } = useAuthStore()

  // Initialize auth on first mount
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize()
    }
  }, [isInitialized, isLoading, initialize])

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return userRole === role
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userRole ? roles.includes(userRole) : false
  }

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return userRole === 'admin'
  }

  /**
   * Check if user is manager or admin
   */
  const isManager = (): boolean => {
    return userRole === 'manager' || userRole === 'admin'
  }

  /**
   * Check if user can access admin features
   */
  const canAccessAdmin = (): boolean => {
    return hasAnyRole(['admin'])
  }

  /**
   * Check if user can access manager features
   */
  const canAccessManager = (): boolean => {
    return hasAnyRole(['admin', 'manager'])
  }

  /**
   * Check if user can perform cashier operations
   */
  const canAccessCashier = (): boolean => {
    return hasAnyRole(['admin', 'manager', 'cashier'])
  }

  /**
   * Get user's full name or email as fallback
   */
  const getDisplayName = (): string => {
    if (profile?.full_name) {
      return profile.full_name
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    return user?.email || 'Kullanıcı'
  }

  /**
   * Get user's initials for avatar
   */
  const getUserInitials = (): string => {
    const name = getDisplayName()
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return {
    // State
    user,
    profile,
    session,
    isLoading,
    isInitialized,
    error,
    lastError,
    isAuthenticated,
    userRole,
    branchId,

    // Actions
    signIn,
    signOut,
    logout: signOut, // Alias for signOut
    initialize,
    clearError,

    // Helper methods
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    canAccessAdmin,
    canAccessManager,
    canAccessCashier,
    getDisplayName,
    getUserInitials,
  }
}

/**
 * Hook for requiring authentication
 * Throws error if user is not authenticated
 */
export const useRequireAuth = () => {
  const auth = useAuth()

  if (!auth.isAuthenticated) {
    throw new Error('Authentication required')
  }

  return auth
}

/**
 * Hook for requiring specific role
 * Throws error if user doesn't have required role
 */
export const useRequireRole = (requiredRole: UserRole) => {
  const auth = useRequireAuth()

  if (!auth.hasRole(requiredRole)) {
    throw new Error(`Role '${requiredRole}' required`)
  }

  return auth
}

/**
 * Hook for requiring any of the specified roles
 * Throws error if user doesn't have any of the required roles
 */
export const useRequireAnyRole = (requiredRoles: UserRole[]) => {
  const auth = useRequireAuth()

  if (!auth.hasAnyRole(requiredRoles)) {
    throw new Error(`One of roles [${requiredRoles.join(', ')}] required`)
  }

  return auth
}