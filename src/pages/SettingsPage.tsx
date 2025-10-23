import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Building2, Users, MapPin, Zap, Key } from 'lucide-react'
import { FastSaleCategoryManager } from '@/components/settings/FastSaleCategoryManager'
import { ApiSettingsTab } from '@/components/settings/ApiSettingsTab'

const SettingsPage = () => {
  const { userRole, profile } = useAuthStore()
  const [showFastSaleModal, setShowFastSaleModal] = useState(false)

  return (
    <Layout 
      title="Sistem Ayarları" 
      subtitle="Uygulama ve firma ayarları"
    >
      <div className="space-y-6 p-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="general">
              <Settings className="w-4 h-4 mr-2" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="w-4 h-4 mr-2" />
              e-Fatura API
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Kullanıcı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Kullanıcı:</strong> {profile?.full_name}</p>
                  <p><strong>E-posta:</strong> {profile?.email}</p>
                  <p><strong>Rol:</strong> {userRole}</p>
                  <p><strong>Şube ID:</strong> {profile?.branch_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fast Sale Categories - Admin/Manager only */}
              {(userRole === 'admin' || userRole === 'manager') && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowFastSaleModal(true)}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Hızlı Satış Kategorileri</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Hızlı satış ekranı kategorilerini yönetin
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Company Settings Placeholder */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Firma Ayarları</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Firma bilgileri ve logo yönetimi
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Management - Admin/Manager only */}
              {(userRole === 'admin' || userRole === 'manager') && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Kullanıcı Yönetimi</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Kullanıcı ekleme ve düzenleme
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Branch Management - Admin only */}
              {userRole === 'admin' && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Şube Yönetimi</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Şube ekleme ve düzenleme
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* API Settings Tab */}
          <TabsContent value="api">
            <ApiSettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Fast Sale Category Manager Modal */}
      {showFastSaleModal && (
        <FastSaleCategoryManager 
          isOpen={showFastSaleModal} 
          onClose={() => setShowFastSaleModal(false)} 
        />
      )}
    </Layout>
  )
}

export default SettingsPage
