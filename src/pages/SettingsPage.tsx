import { Layout } from '@/components/layout/Layout'
import { CompanyInfoForm, UserManagementTable, BranchManagement } from '@/components/settings'
import { useAuthStore } from '@/stores/authStore'

export const SettingsPage = () => {
  const { userRole } = useAuthStore()

  return (
    <Layout 
      title="Sistem Ayarları" 
      subtitle="Uygulama ve firma ayarları"
    >
      <div className="space-y-6">
        {/* Company Information - Available to all users */}
        <CompanyInfoForm />

        {/* User Management - Admin and Manager only */}
        {(userRole === 'admin' || userRole === 'manager') && (
          <UserManagementTable />
        )}

        {/* Branch Management - Admin only */}
        {userRole === 'admin' && (
          <BranchManagement />
        )}
      </div>
    </Layout>
  )
}