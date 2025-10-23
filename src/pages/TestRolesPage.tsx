import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout/Layout'
import { AdminRoute, ManagerRoute, CashierRoute } from '@/components/layout/PrivateRoute'

const TestRolesPage = () => {
  const { getDisplayName, userRole, canAccessAdmin, canAccessManager, canAccessCashier } = useAuth()

  return (
    <Layout 
      title="Rol Tabanlı Erişim Testi" 
      subtitle={`Kullanıcı: ${getDisplayName()} - Rol: ${userRole}`}
    >
      <div className="max-w-4xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Everyone can see this */}
          <Card>
            <CardHeader>
              <CardTitle>Genel Erişim</CardTitle>
              <CardDescription>Tüm kullanıcılar görebilir</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Bu kart tüm giriş yapmış kullanıcılar tarafından görülebilir.</p>
            </CardContent>
          </Card>

          {/* Cashier and above */}
          {canAccessCashier() && (
            <Card>
              <CardHeader>
                <CardTitle>Kasiyer Erişimi</CardTitle>
                <CardDescription>Kasiyer, Manager ve Admin</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Bu kart kasiyer yetkisi olan kullanıcılar tarafından görülebilir.</p>
                <Button className="mt-2 w-full">
                  POS İşlemleri
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Manager and above */}
          {canAccessManager() && (
            <Card>
              <CardHeader>
                <CardTitle>Manager Erişimi</CardTitle>
                <CardDescription>Manager ve Admin</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Bu kart manager yetkisi olan kullanıcılar tarafından görülebilir.</p>
                <Button className="mt-2 w-full" variant="secondary">
                  Raporlar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin only */}
          {canAccessAdmin() && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Erişimi</CardTitle>
                <CardDescription>Sadece Admin</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Bu kart sadece admin kullanıcılar tarafından görülebilir.</p>
                <Button className="mt-2 w-full" variant="destructive">
                  Sistem Ayarları
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Route-based protection examples */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Route Tabanlı Koruma Örnekleri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CashierRoute>
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">Kasiyer Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Bu içerik CashierRoute ile korunuyor</p>
                </CardContent>
              </Card>
            </CashierRoute>

            <ManagerRoute>
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">Manager Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Bu içerik ManagerRoute ile korunuyor</p>
                </CardContent>
              </Card>
            </ManagerRoute>

            <AdminRoute>
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Admin Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Bu içerik AdminRoute ile korunuyor</p>
                </CardContent>
              </Card>
            </AdminRoute>
          </div>
        </div>

        {/* Permission summary */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Yetki Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Admin Erişimi:</strong>
                  <span className={canAccessAdmin() ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {canAccessAdmin() ? '✓' : '✗'}
                  </span>
                </div>
                <div>
                  <strong>Manager Erişimi:</strong>
                  <span className={canAccessManager() ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {canAccessManager() ? '✓' : '✗'}
                  </span>
                </div>
                <div>
                  <strong>Kasiyer Erişimi:</strong>
                  <span className={canAccessCashier() ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {canAccessCashier() ? '✓' : '✗'}
                  </span>
                </div>
                <div>
                  <strong>Mevcut Rol:</strong>
                  <span className="ml-2 font-medium">{userRole}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default TestRolesPage
