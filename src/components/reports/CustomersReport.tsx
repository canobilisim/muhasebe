import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ReportFilters } from './ReportFilters'
import { reportsService, CustomerReportData, ReportFilters as IReportFilters } from '@/services/reportsService'
import { useAuth } from '@/hooks/useAuth'
import { Download, Users, Loader2 } from 'lucide-react'

export const CustomersReport = () => {
  const { branchId } = useAuth()
  const [data, setData] = useState<CustomerReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<IReportFilters>({
    branchId
  })

  // branchId değiştiğinde filters'ı güncelle
  useEffect(() => {
    if (branchId) {
      setFilters(prev => ({ ...prev, branchId }))
    }
  }, [branchId])

  const fetchData = async () => {
    if (!branchId) {
      console.log('Branch ID not available yet, skipping fetch')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching customers report with filters:', filters)
      const result = await reportsService.getCustomersReport(filters)
      console.log('Customers report result:', result)
      setData(result)
    } catch (err) {
      console.error('Customers report fetch error:', err)
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // branchId hazır olduğunda ve filters değiştiğinde veri çek
  useEffect(() => {
    if (branchId && filters.branchId) {
      fetchData()
    }
  }, [branchId, filters.branchId])

  const handleApplyFilters = () => {
    fetchData()
  }

  const handleClearFilters = () => {
    const newFilters = { branchId }
    setFilters(newFilters)
    setTimeout(() => fetchData(), 100)
  }

  const handleExportExcel = () => {
    const excelData = reportsService.prepareExcelData(data, 'customers')
    console.log('Excel export data:', excelData)
    alert('Excel export özelliği yakında eklenecek')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBalanceBadge = (balance: number) => {
    if (balance > 0) {
      return <Badge variant="destructive">Borçlu</Badge>
    } else if (balance < 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Alacaklı</Badge>
    } else {
      return <Badge variant="secondary">Sıfır</Badge>
    }
  }

  const totalBalance = data.reduce((sum, customer) => sum + customer.current_balance, 0)
  const totalPurchases = data.reduce((sum, customer) => sum + customer.total_purchases, 0)
  const activeCustomers = data.filter(customer => customer.total_purchases > 0).length

  return (
    <div className="space-y-6">
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Müşteri Raporu
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.length} müşteri • {activeCustomers} aktif • 
                Toplam Bakiye: {formatCurrency(totalBalance)} • 
                Toplam Alışveriş: {formatCurrency(totalPurchases)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                disabled={data.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Yenile'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 text-center py-4">
              Hata: {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Yükleniyor...
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Müşteri bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri Adı</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead className="text-right">Bakiye</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Toplam Alışveriş</TableHead>
                    <TableHead>Son Alışveriş</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="text-sm">{customer.phone}</div>
                          )}
                          {customer.email && (
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-medium ${
                          customer.current_balance > 0 ? 'text-red-600' : 
                          customer.current_balance < 0 ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {formatCurrency(Math.abs(customer.current_balance))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getBalanceBadge(customer.current_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.total_purchases)}
                      </TableCell>
                      <TableCell>
                        {customer.last_purchase_date ? 
                          new Date(customer.last_purchase_date).toLocaleDateString('tr-TR') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}