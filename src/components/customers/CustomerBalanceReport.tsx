import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomerBalanceService, type CustomerBalanceInfo, type OverduePayment } from '@/services/customerBalanceService'
import { AlertTriangle, TrendingUp, Users, DollarSign, Download } from 'lucide-react'

interface BalanceReportData {
  summary: {
    totalOutstanding: number
    totalOverdue: number
    customersWithDebt: number
    totalCustomers: number
    averageDebt: number
  }
  customersWithBalance: CustomerBalanceInfo[]
  overduePayments: OverduePayment[]
  nearCreditLimit: CustomerBalanceInfo[]
}

export const CustomerBalanceReport = () => {
  const navigate = useNavigate()
  const [reportData, setReportData] = useState<BalanceReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'balances' | 'overdue' | 'credit'>('summary')

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await CustomerBalanceService.generateBalanceReportData()
      setReportData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const exportToCSV = () => {
    if (!reportData) return

    const csvData = reportData.customersWithBalance.map(customer => ({
      'Müşteri Adı': customer.name,
      'Telefon': customer.phone || '',
      'Bakiye': customer.current_balance,
      'Kredi Limiti': customer.credit_limit,
      'Vadesi Geçen Tutar': customer.overdueAmount,
      'Son Alışveriş': customer.lastPaymentDate ? formatDate(customer.lastPaymentDate) : '',
      'Toplam Alışveriş': customer.totalPurchases,
      'Ortalama Sepet': customer.averageTicket
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `musteri-bakiye-raporu-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadReportData}>Tekrar Dene</Button>
        </CardContent>
      </Card>
    )
  }

  if (!reportData) return null

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Alacak</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.summary.totalOutstanding)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vadesi Geçen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reportData.summary.totalOverdue)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borçlu Müşteri</p>
                <p className="text-2xl font-bold">
                  {reportData.summary.customersWithDebt}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Borç</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.averageDebt)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'summary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('summary')}
              >
                Özet
              </Button>
              <Button
                variant={activeTab === 'balances' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('balances')}
              >
                Bakiyeler ({reportData.customersWithBalance.length})
              </Button>
              <Button
                variant={activeTab === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('overdue')}
              >
                Vadesi Geçen ({reportData.overduePayments.length})
              </Button>
              <Button
                variant={activeTab === 'credit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('credit')}
              >
                Kredi Limiti ({reportData.nearCreditLimit.length})
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Excel'e Aktar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'balances' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead className="text-right">Bakiye</TableHead>
                    <TableHead className="text-right">Kredi Limiti</TableHead>
                    <TableHead className="text-right">Kullanım Oranı</TableHead>
                    <TableHead>Son Alışveriş</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.customersWithBalance.map((customer) => {
                    const usageRatio = customer.credit_limit > 0 
                      ? (customer.current_balance / customer.credit_limit) * 100 
                      : 0
                    
                    return (
                      <TableRow 
                        key={customer.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          {customer.phone && (
                            <div className="text-sm">{customer.phone}</div>
                          )}
                          {customer.email && (
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(customer.current_balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.credit_limit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.credit_limit > 0 ? `${usageRatio.toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {customer.lastPaymentDate 
                            ? formatDate(customer.lastPaymentDate)
                            : 'Hiç alışveriş yok'
                          }
                        </TableCell>
                        <TableCell>
                          {customer.isOverdue && (
                            <Badge variant="destructive">Vadesi Geçmiş</Badge>
                          )}
                          {usageRatio > 80 && (
                            <Badge variant="secondary">Limit Yakın</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Satış Tarihi</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-right">Gecikme (Gün)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.overduePayments.map((payment) => (
                    <TableRow 
                      key={payment.sale.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/customers/${payment.customer.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div>{payment.customer.name}</div>
                          {payment.customer.phone && (
                            <div className="text-sm text-gray-500">{payment.customer.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.sale.sale_date)}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(payment.overdueAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {payment.daysPastDue} gün
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="text-right">Bakiye</TableHead>
                    <TableHead className="text-right">Kredi Limiti</TableHead>
                    <TableHead className="text-right">Kullanım Oranı</TableHead>
                    <TableHead className="text-right">Kalan Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.nearCreditLimit.map((customer) => {
                    const usageRatio = (customer.current_balance / customer.credit_limit) * 100
                    const remainingLimit = customer.credit_limit - customer.current_balance
                    
                    return (
                      <TableRow 
                        key={customer.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div>{customer.name}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(customer.current_balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.credit_limit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={usageRatio > 90 ? 'destructive' : 'secondary'}>
                            {usageRatio.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(remainingLimit)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Genel Durum</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Toplam Müşteri:</span>
                      <span className="font-semibold">{reportData.summary.totalCustomers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Borçlu Müşteri:</span>
                      <span className="font-semibold text-red-600">{reportData.summary.customersWithDebt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Borçlu Müşteri Oranı:</span>
                      <span className="font-semibold">
                        {((reportData.summary.customersWithDebt / reportData.summary.totalCustomers) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Finansal Durum</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Toplam Alacak:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(reportData.summary.totalOutstanding)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vadesi Geçen:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(reportData.summary.totalOverdue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ortalama Borç:</span>
                      <span className="font-semibold">
                        {formatCurrency(reportData.summary.averageDebt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}