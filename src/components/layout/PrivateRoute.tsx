import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import { Loader2 } from 'lucide-react'

interface PrivateRouteProps {
  children: ReactNode
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  fallback?: ReactNode
}

/**
 * PrivateRoute component that protects routes based on authentication and roles
 * 
 * @param children - The component to render if access is granted
 * @param requiredRole - Single role required to access the route
 * @param requiredRoles - Array of roles, user must have at least one
 * @param fallback - Custom component to show when access is denied
 */
export const PrivateRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles,
  fallback 
}: PrivateRouteProps) => {
  const { isAuthenticated, isInitialized, isLoading, hasRole, hasAnyRole } = useAuth()
  const location = useLocation()

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <AccessDenied />
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return fallback || <AccessDenied />
  }

  // Render children if all checks pass
  return <>{children}</>
}

/**
 * Component to show when user doesn't have required permissions
 */
const AccessDenied = () => {
  const { getDisplayName, userRole } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
          <div className="text-xs text-gray-500 mb-6">
            <p>Kullanıcı: {getDisplayName()}</p>
            <p>Rol: {userRole}</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Higher-order component for role-based route protection
 */
export const withRoleProtection = (
  Component: React.ComponentType,
  requiredRole?: UserRole,
  requiredRoles?: UserRole[]
) => {
  return (props: any) => (
    <PrivateRoute requiredRole={requiredRole} requiredRoles={requiredRoles}>
      <Component {...props} />
    </PrivateRoute>
  )
}

/**
 * Specific role-based route components
 */
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRole="admin">{children}</PrivateRoute>
)

export const ManagerRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRoles={['admin', 'manager']}>{children}</PrivateRoute>
)

export const CashierRoute = ({ children }: { children: ReactNode }) => (
  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>{children}</PrivateRoute>
)