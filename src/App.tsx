import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { PrivateRoute } from '@/components/layout/PrivateRoute'
import { PageLoading } from '@/components/ui/loading'
import { LoginPage } from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import { useAuthStore } from '@/stores/authStore'
import './App.css'

// Lazy load other pages
const TestRolesPage = lazy(() => import('@/pages/TestRolesPage').then(module => ({ default: module.TestRolesPage })))

const FastSalePage = lazy(() => import('@/pages/pos/FastSalePage').then(module => ({ default: module.default })))
const CustomersPage = lazy(() => import('@/pages/CustomersPage').then(module => ({ default: module.CustomersPage })))
const StockPage = lazy(() => import('@/pages/StockPage').then(module => ({ default: module.StockPage })))
const CashPage = lazy(() => import('@/pages/CashPage').then(module => ({ default: module.CashPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(module => ({ default: module.ReportsPage })))
const OperatorOperationsPage = lazy(() => import('@/pages/OperatorOperationsPage').then(module => ({ default: module.OperatorOperationsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))

// Sayfa yüklenirken scroll'u en üste taşı
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const { initialize, isInitialized, isLoading } = useAuthStore()
  const [hasHydrated, setHasHydrated] = React.useState(false)

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    
    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }

    return unsubscribe
  }, [])

  // Initialize auth after hydration
  useEffect(() => {
    if (hasHydrated) {
      const state = useAuthStore.getState()
      
      // If we have session but not authenticated, fix it
      if (state.session && state.user && !state.isAuthenticated) {
        useAuthStore.setState({
          isAuthenticated: true,
          userRole: state.profile?.role || null,
          branchId: state.profile?.branch_id || null,
        })
      }
      
      if (!isInitialized && !isLoading) {
        initialize()
        
        // Fallback: If initialization takes too long, force it to complete
        const fallbackTimer = setTimeout(() => {
          const currentState = useAuthStore.getState()
          if (!currentState.isInitialized) {
            useAuthStore.setState({ 
              isInitialized: true, 
              isLoading: false,
              connectionStatus: 'disconnected'
            })
          }
        }, 10000)
        
        return () => clearTimeout(fallbackTimer)
      }
    }
  }, [hasHydrated, isInitialized, isLoading, initialize])

  // Show loading while hydrating or initializing
  if (!hasHydrated || !isInitialized || isLoading) {
    return <PageLoading />
  }

  return (
    <div className="fixed inset-0 bg-white">
      <ErrorBoundary>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <DashboardPage />
                    </div>
                  </PrivateRoute>
                } 
              />
              
              {/* Test roles page - only in development */}
              {import.meta.env.DEV && (
                <Route 
                  path="/test-roles" 
                  element={
                    <PrivateRoute>
                      <TestRolesPage />
                    </PrivateRoute>
                  } 
                />
              )}


                
                {/* New Fast Sale POS */}
                <Route path="/pos2" element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <FastSalePage />
                  </PrivateRoute>
                } />

              {/* Customers - Manager and above */}
              <Route 
                path="/customers" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <CustomersPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Stock - Manager and above */}
              <Route 
                path="/stock" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <StockPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Cash - Cashier and above */}
              <Route 
                path="/cash" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <CashPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Reports - Manager and above */}
              <Route 
                path="/reports" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <ReportsPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Operator Operations - Manager and above */}
              <Route 
                path="/operator-operations" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <OperatorOperationsPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Settings - Admin only */}
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute requiredRoles={['admin']}>
                    <SettingsPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 - Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </div>
  )
}

export default App
