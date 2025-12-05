import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { PrivateRoute } from '@/components/layout/PrivateRoute'
import { PageLoading } from '@/components/ui/loading'
import { useAuthStore } from '@/stores/authStore'
import { useFastSaleStore } from '@/stores/fastSaleStore'
import './App.css'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TestRolesPage = lazy(() => import('@/pages/TestRolesPage'))
const FastSalePage = lazy(() => import('@/pages/pos/FastSalePage'))
const CustomersPage = lazy(() => import('@/pages/CustomersPage'))
const CustomerDetailPage = lazy(() => import('@/pages/CustomerDetailPage'))

// Product pages
const ProductsListPage = lazy(() => import('@/pages/products/ProductsListPage'))
const ProductManagePage = lazy(() => import('@/pages/products/ProductManagePage'))
const ProductCreatePage = lazy(() => import('@/pages/products/ProductCreatePage'))
const ProductEditPage = lazy(() => import('@/pages/products/ProductEditPage'))
const CategoriesPage = lazy(() => import('@/pages/products/CategoriesPage'))

// Sales pages
const NewSalePage = lazy(() => import('@/pages/sales/NewSalePage'))
const SalesListPage = lazy(() => import('@/pages/sales/SalesListPage'))
const ReturnsPage = lazy(() => import('@/pages/sales/ReturnsPage'))
const RetailSalesPage = lazy(() => import('@/pages/sales/RetailSalesPage'))
const RetailSaleDetailPage = lazy(() => import('@/pages/sales/RetailSaleDetailPage'))

// Purchase pages
const NewPurchasePage = lazy(() => import('@/pages/purchases/NewPurchasePage'))
const PurchasesListPage = lazy(() => import('@/pages/purchases/PurchasesListPage'))
const InboxPage = lazy(() => import('@/pages/purchases/InboxPage'))

// Müstasil Fişi pages
const NewMustasilFisPage = lazy(() => import('@/modules/mustasil-fis/index'))

// İrsaliye pages
const NewIrsaliyePage = lazy(() => import('@/modules/irsaliye/index'))
const IrsaliyeListPage = lazy(() => import('@/modules/irsaliye/IrsaliyeList'))

// Personnel pages
const PersonnelListPage = lazy(() => import('@/pages/personnel/PersonnelListPage'))
const PersonnelDetailPage = lazy(() => import('@/pages/personnel/PersonnelDetailPage'))
const DocumentManagementPage = lazy(() => import('@/pages/personnel/DocumentManagementPage'))
const NewPersonnelPage = lazy(() => import('@/pages/personnel/NewPersonnelPage'))
const EditPersonnelPage = lazy(() => import('@/pages/personnel/EditPersonnelPage'))

// Supplier pages
const SuppliersPage = lazy(() => import('@/pages/suppliers/SuppliersPage'))
const NewSupplierPage = lazy(() => import('@/pages/suppliers/NewSupplierPage'))
const SupplierDetailPage = lazy(() => import('@/pages/suppliers/SupplierDetailPage'))

// Financial pages
const CheckPortfolioPage = lazy(() => import('@/pages/financial/CheckPortfolioPage'))
const PromissoryNotePortfolioPage = lazy(() => import('@/pages/financial/PromissoryNotePortfolioPage'))
const ExpenseCategoriesPage = lazy(() => import('@/pages/financial/ExpenseCategoriesPage'))
const FinancialMovementsPage = lazy(() => import('@/pages/financial/FinancialMovementsPage'))

// Branch & Cash pages
const BranchesPage = lazy(() => import('@/pages/branches/BranchesPage'))
const BankAccountsPage = lazy(() => import('@/pages/bank-accounts/BankAccountsPage'))

// Stock page
const StockPage = lazy(() => import('@/pages/StockPage'))

// Other pages
const CashPage = lazy(() => import('@/pages/CashPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const OperatorOperationsPage = lazy(() => import('@/pages/OperatorOperationsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Sayfa yüklenirken scroll'u en üste taşı
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const { initialize, isInitialized, isLoading, isAuthenticated } = useAuthStore()
  const loadFastSaleData = useFastSaleStore(state => state.loadData)
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

  // Preload fast sale data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      // Arka planda hızlı satış verilerini yükle
      loadFastSaleData()
    }
  }, [isAuthenticated, isInitialized, loadFastSaleData])

  // Show loading while hydrating or initializing
  if (!hasHydrated || !isInitialized || isLoading) {
    return <PageLoading />
  }

  return (
    <div className="fixed inset-0 bg-white">
      <Toaster />
      <SonnerToaster position="top-right" />
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
                    <DashboardPage />
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
              
              {/* Customer Detail - Manager and above */}
              <Route 
                path="/customers/:id" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <CustomerDetailPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Customer Export/Import - Manager and above */}
              <Route 
                path="/customers/export" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <CustomersPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/customers/import" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <CustomersPage />
                  </PrivateRoute>
                } 
              />

              {/* Suppliers - Manager and above */}
              <Route 
                path="/suppliers" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <SuppliersPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/suppliers/new" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewSupplierPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/suppliers/:id" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <SupplierDetailPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/suppliers/:id/edit" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewSupplierPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Products - Manager and above */}
              <Route 
                path="/products" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <ProductsListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/manage" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <ProductManagePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/create" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <ProductCreatePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/edit/:id" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <ProductEditPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/products/categories" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <CategoriesPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Stock Management Routes */}
              <Route 
                path="/stock" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <StockPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/stock/production" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <StockPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/stock/transfer" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <StockPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/stock/export" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <StockPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/stock/import" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <StockPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Purchase Routes - Manager and above */}
              <Route 
                path="/purchases/new" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewPurchasePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchases/list" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <PurchasesListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/purchases/inbox" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <InboxPage />
                  </PrivateRoute>
                } 
              />

              {/* Müstasil Fişi Routes - Manager and above */}
              <Route 
                path="/mustasil-fis/new" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewMustasilFisPage />
                  </PrivateRoute>
                } 
              />

              {/* İrsaliye Routes - Manager and above */}
              <Route 
                path="/irsaliye/yeni" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewIrsaliyePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/irsaliye/liste" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <IrsaliyeListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/irsaliye/:id" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <IrsaliyeListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/irsaliye/:id/edit" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewIrsaliyePage />
                  </PrivateRoute>
                } 
              />

              {/* Retail Sales - Cashier and above */}
              <Route 
                path="/retail-sales" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <RetailSalesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/retail-sales/:id" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <RetailSaleDetailPage />
                  </PrivateRoute>
                } 
              />

              {/* Sales - Cashier and above */}
              <Route 
                path="/sales/new" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <NewSalePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/sales/list" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <SalesListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/sales/returns" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <ReturnsPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Personnel Routes - Manager and above */}
              <Route 
                path="/personnel" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <PersonnelListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/list" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <PersonnelListPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/new" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <NewPersonnelPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/:id" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <PersonnelDetailPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/:id/edit" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <EditPersonnelPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/personnel/documents" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <DocumentManagementPage />
                  </PrivateRoute>
                } 
              />

              {/* Branch & Cash Routes - Cashier and above */}
              <Route 
                path="/branches" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <BranchesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/cash" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <CashPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/bank-accounts" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager', 'cashier']}>
                    <BankAccountsPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Financial Routes - Manager and above */}
              <Route 
                path="/financial/checks" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <CheckPortfolioPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/financial/promissory-notes" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <PromissoryNotePortfolioPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/financial/expense-categories" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <ExpenseCategoriesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/financial/expenses" 
                element={
                  <PrivateRoute requiredRoles={['admin', 'manager']}>
                    <FinancialMovementsPage />
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
