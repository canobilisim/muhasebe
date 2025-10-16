import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ReportFilters } from './ReportFilters'
import { reportsService, SalesReportData, ReportFilters as IReportFilters } from '@/services/reportsService'
import { useAuth } from '@/hooks/useAuth'
import { Download, FileText, Loader2 } from 'lucide-react'

export const SalesReport = () => {
  const { branchId } = useAuth()
  const [data, setData] = useState<SalesReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<IReportFilters>({
    branchId,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Son 30 gün
    endDate: new Date().toISOString().split('T')[0]
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await reportsService.getSalesReport(filters)
      setData(result)
    } catch (err) {
      console.error('Sales report fetch error:', err)
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApplyFilters = () => {
    fetchData()
  }

  const handleClearFilters = () => {
    setFilters({
      branchId,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
  }

  const handleExportExcel = () => {
    const excelData = reportsService.prepareExcelData(data, 'sales')
    // Excel export functionality would be implemented here
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

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'cash': return 'Nakit'
      case 'pos': return 'POS'
      case 'credit': return 'Açık Hesap'
      default: return type
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ödendi</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Bekliyor</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalAmount = data.reduce((sum, item) => sum + item.net_amount, 0)
  const totalDiscount = data.reduce((sum, item) => sum + item.discount_amount, 0)

  return (
    <div className="space-y-6">
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        showPaymentFilters={true}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Satış Raporu
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.length} satış • Toplam: {formatCurrency(totalAmount)}
                {totalDiscount > 0 && ` • İndirim: ${formatCurrency(totalDiscount)}`}
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
              Seçilen kriterlere uygun satış bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Satış No</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead className="text-right">İndirim</TableHead>
                    <TableHead className="text-right">Net Tutar</TableHead>
                    <TableHead>Ödeme</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.sale_number}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.sale_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {sale.customer_name || 'Perakende'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.discount_amount > 0 ? formatCurrency(sale.discount_amount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(sale.net_amount)}
                      </TableCell>
                      <TableCell>
                        {getPaymentTypeLabel(sale.payment_type)}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(sale.payment_status)}
                      </TableCell>
                      <TableCell>
                        {sale.user_name}
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