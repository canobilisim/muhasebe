import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, Receipt, AlertTriangle } from 'lucide-react'
import type { DailyCashSummary } from '@/services/cashService'

interface CashSummaryProps {
  summary: DailyCashSummary | null
  isLoading?: boolean
}

export const CashSummary = ({ summary, isLoading }: CashSummaryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Kasa özeti yüklenemedi
          </div>
        </CardContent>
      </Card>
    )
  }

  const expectedCash = summary.opening_amount + summary.total_sales + summary.total_income - summary.total_expense
  const actualCash = summary.closing_amount || expectedCash
  const cashDifference = actualCash - expectedCash

  return (
    <div className="space-y-4">
      {/* Ana Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açılış Tutarı</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.opening_amount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.total_sales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.total_expense)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kasa Durumu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beklenen Kasa</CardTitle>
            <Wallet className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(expectedCash)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Açılış + Satış + Gelir - Gider
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiili Kasa</CardTitle>
            <Wallet className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.closing_amount > 0 ? formatCurrency(summary.closing_amount) : 'Kapanmadı'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Kapanış tutarı
            </p>
          </CardContent>
        </Card>

        <Card className={cashDifference !== 0 ? 'border-orange-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kasa Farkı</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${cashDifference !== 0 ? 'text-orange-600' : 'text-gray-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              cashDifference > 0 ? 'text-green-600' : 
              cashDifference < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {summary.closing_amount > 0 ? (
                <>
                  {cashDifference > 0 ? '+' : ''}{formatCurrency(cashDifference)}
                </>
              ) : (
                'Hesaplanmadı'
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Fiili - Beklenen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hareket Sayısı */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Toplam Hareket Sayısı</span>
            <span className="text-lg font-bold">{summary.movement_count}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}