import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layout } from '@/components/layout/Layout'
import { KPICard, SalesChart, TurkcellDailyCard, TurkcellMonthlyCard } from '@/components/dashboard'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Wallet,
  Package,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

const DashboardPage = () => {
  const { getDisplayName, userRole, branchId } = useAuth()
  const { kpis, weeklySalesChart, monthlySalesChart, loading, error, refreshData } = useDashboard()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle={`Hoş geldiniz, ${getDisplayName()}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Dashboard" subtitle={`Hoş geldiniz, ${getDisplayName()}`}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-red-600">Hata: {error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout 
      title="Dashboard" 
      subtitle={`Hoş geldiniz, ${getDisplayName()}`}
      actions={
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Bugünkü Satışlar"
            value={formatCurrency(kpis?.todaySales.totalAmount || 0)}
            subtitle={`${kpis?.todaySales.totalCount || 0} satış`}
            icon={DollarSign}
          />
          
          <KPICard
            title="Aylık Satışlar"
            value={formatCurrency(kpis?.monthlySales.totalAmount || 0)}
            subtitle={`${kpis?.monthlySales.totalCount || 0} satış`}
            icon={TrendingUp}
          />
          
          <KPICard
            title="Kasa Durumu"
            value={formatCurrency(kpis?.cashSummary.currentAmount || 0)}
            subtitle={`Açılış: ${formatCurrency(kpis?.cashSummary.openingAmount || 0)}`}
            icon={Wallet}
          />
          
          <KPICard
            title="Uyarılar"
            value={`${(kpis?.lowStockProducts || 0) + (kpis?.pendingPayments || 0)}`}
            subtitle={`${kpis?.lowStockProducts || 0} düşük stok, ${kpis?.pendingPayments || 0} bekleyen ödeme`}
            icon={AlertTriangle}
            className={((kpis?.lowStockProducts || 0) + (kpis?.pendingPayments || 0)) > 0 ? 'border-orange-200 bg-orange-50' : ''}
          />
        </div>

        {/* Turkcell KPI Cards with Error Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <TurkcellDailyCard />
          </div>
          
          <div className="md:col-span-1">
            <TurkcellMonthlyCard />
          </div>
        </div>

        {/* Payment Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Nakit Satışlar"
            value={formatCurrency(kpis?.todaySales.cashAmount || 0)}
            icon={DollarSign}
            className="border-green-200 bg-green-50"
          />
          
          <KPICard
            title="POS Satışlar"
            value={formatCurrency(kpis?.todaySales.posAmount || 0)}
            icon={ShoppingCart}
            className="border-blue-200 bg-blue-50"
          />
          
          <KPICard
            title="Açık Hesap"
            value={formatCurrency(kpis?.todaySales.creditAmount || 0)}
            icon={Package}
            className="border-orange-200 bg-orange-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart
            data={weeklySalesChart}
            title="Haftalık Satış Trendi"
            description="Son 7 günün satış performansı"
            type="line"
            dataKey="amount"
            color="#3b82f6"
          />
          
          <SalesChart
            data={monthlySalesChart}
            title="Aylık Satış Performansı"
            description="Son 12 ayın satış trendi"
            type="bar"
            dataKey="amount"
            color="#10b981"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>POS Sistemi</CardTitle>
              <CardDescription>Satış işlemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/pos2">
                <Button className="w-full">
                  POS'a Git
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raporlar</CardTitle>
              <CardDescription>Detaylı raporlar</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/reports">
                <Button className="w-full" variant="outline">
                  Raporları Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stok Yönetimi</CardTitle>
              <CardDescription>Ürün ve stok işlemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/stock">
                <Button className="w-full" variant="secondary">
                  Stok Yönetimi
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kasa Yönetimi</CardTitle>
              <CardDescription>Kasa işlemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/cash">
                <Button className="w-full" variant="secondary">
                  Kasa Yönetimi
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardPage