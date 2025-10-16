import { Suspense, lazy, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { PrivateRoute, AdminRoute, ManagerRoute, CashierRoute } from '@/components/layout/PrivateRoute'
import { PageLoading } from '@/components/ui/loading'
import { LoginPage } from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import { AuthDebugPanel } from '@/components/debug/AuthDebugPanel'
import { Button } from '@/components/ui/button'
import { Bug } from 'lucide-react'
import './App.css'

// Lazy load other pages
const TestRolesPage = lazy(() => import('@/pages/TestRolesPage').then(module => ({ default: module.TestRolesPage })))
const POSPage = lazy(() => import('@/pages/POSPage').then(module => ({ default: module.POSPage })))
const CustomersPage = lazy(() => import('@/pages/CustomersPage').then(module => ({ default: module.CustomersPage })))
const StockPage = lazy(() => import('@/pages/StockPage').then(module => ({ default: module.StockPage })))
const CashPage = lazy(() => import('@/pages/CashPage').then(module => ({ default: module.CashPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(module => ({ default: module.ReportsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV

function App() {
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/test-roles" 
              element={
                <PrivateRoute>
                  <TestRolesPage />
                </PrivateRoute>
              } 
            />

            {/* POS - Cashier and above */}
            <Route 
              path="/pos" 
              element={
                <CashierRoute>
                  <POSPage />
                </CashierRoute>
              } 
            />

            {/* Customers - Manager and above */}
            <Route 
              path="/customers" 
              element={
                <ManagerRoute>
                  <CustomersPage />
                </ManagerRoute>
              } 
            />

            {/* Stock - Manager and above */}
            <Route 
              path="/stock" 
              element={
                <ManagerRoute>
                  <StockPage />
                </ManagerRoute>
              } 
            />

            {/* Cash - Cashier and above */}
            <Route 
              path="/cash" 
              element={
                <CashierRoute>
                  <CashPage />
                </CashierRoute>
              } 
            />

            {/* Reports - Manager and above */}
            <Route 
              path="/reports" 
              element={
                <ManagerRoute>
                  <ReportsPage />
                </ManagerRoute>
              } 
            />

            {/* Settings - Admin only */}
            <Route 
              path="/settings" 
              element={
                <AdminRoute>
                  <SettingsPage />
                </AdminRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster />

        {/* Debug Panel - Development Only */}
        {isDevelopment && (
          <>
            {showDebugPanel && (
              <AuthDebugPanel onClose={() => setShowDebugPanel(false)} />
            )}
            
            {!showDebugPanel && (
              <Button
                onClick={() => setShowDebugPanel(true)}
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40"
                size="icon"
                title="Open Auth Debug Panel"
              >
                <Bug className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </Router>
    </ErrorBoundary>
  )
}

export default App
