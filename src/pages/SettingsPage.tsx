import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Building2, Users, MapPin } from 'lucide-react'

export const SettingsPage = () => {
  const { userRole, profile } = useAuthStore()

  return (
    <Layout 
      title="Sistem Ayarları" 
      subtitle="Uygulama ve firma ayarları"
    >
      <div className="space-y-6 p-4">
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

        {/* Company Settings Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Firma Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Firma bilgileri, logo yükleme ve diğer ayarlar buraya eklenecek.
            </p>
          </CardContent>
        </Card>

        {/* User Management Placeholder - Admin/Manager only */}
        {(userRole === 'admin' || userRole === 'manager') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Kullanıcı Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Kullanıcı ekleme, düzenleme ve silme işlemleri buraya eklenecek.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Branch Management Placeholder - Admin only */}
        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Şube Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Şube ekleme, düzenleme ve silme işlemleri buraya eklenecek.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}