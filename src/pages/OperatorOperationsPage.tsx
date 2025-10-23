import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Settings } from 'lucide-react'
import { TargetSettingsForm } from '@/components/settings'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const OperatorOperationsPage = () => {
  return (
    <Layout 
      title="Operatör İşlemleri" 
      subtitle="Turkcell işlemleri ve hedef ayarları"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Operatör İşlemleri</h2>
            <p className="text-sm text-gray-600">Turkcell işlemlerinizi yönetin ve hedeflerinizi ayarlayın</p>
          </div>
        </div>

        {/* Target Settings Form with Error Boundary */}
        <ErrorBoundary>
          <TargetSettingsForm />
        </ErrorBoundary>

        {/* Additional Operations Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Diğer İşlemler
            </CardTitle>
            <CardDescription>
              Gelecekte eklenecek operatör işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
              <Settings className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                Ek operatör işlemleri buraya eklenecek
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default OperatorOperationsPage