import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SalesReport, CustomersReport, StockReport } from '@/components/reports'
import { 
  BarChart3, 
  FileText, 
  Users, 
  Package,
  TrendingUp
} from 'lucide-react'

type ReportType = 'overview' | 'sales' | 'customers' | 'stock'

export const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('overview')

  const reportTypes = [
    {
      id: 'overview' as ReportType,
      title: 'Genel Bakış',
      description: 'Rapor kategorilerini görüntüle',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      id: 'sales' as ReportType,
      title: 'Satış Raporu',
      description: 'Detaylı satış analizi ve filtreleme',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'customers' as ReportType,
      title: 'Müşteri Raporu',
      description: 'Müşteri analizi ve borç takibi',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: 'stock' as ReportType,
      title: 'Stok Raporu',
      description: 'Stok durumu ve değer analizi',
      icon: Package,
      color: 'text-orange-600'
    }
  ]

  const renderReportContent = () => {
    switch (activeReport) {
      case 'sales':
        return <SalesReport />
      case 'customers':
        return <CustomersReport />
      case 'stock':
        return <StockReport />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.slice(1).map((report) => {
              const Icon = report.icon
              return (
                <Card 
                  key={report.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveReport(report.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${report.color}`} />
                      {report.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {report.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Raporu Görüntüle
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
    }
  }

  return (
    <Layout 
      title="Raporlar" 
      subtitle="Satış ve performans raporları"
      actions={
        activeReport !== 'overview' && (
          <Button 
            onClick={() => setActiveReport('overview')} 
            variant="outline" 
            size="sm"
          >
            ← Geri
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Report Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {reportTypes.map((report) => {
                const Icon = report.icon
                const isActive = activeReport === report.id
                
                return (
                  <Button
                    key={report.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveReport(report.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {report.title}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        {renderReportContent()}
      </div>
    </Layout>
  )
}