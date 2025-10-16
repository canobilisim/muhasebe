import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ReportFilters } from './ReportFilters'
import { reportsService, StockReportData, ReportFilters as IReportFilters } from '@/services/reportsService'
import { useAuth } from '@/hooks/useAuth'
import { Download, Package, Loader2, AlertTriangle } from 'lucide-react'

export const StockReport = () => {
  const { branchId } = useAuth()
  const [data, setData] = useState<StockReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<IReportFilters>({
    branchId,
    isActive: true
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await reportsService.getStockReport(filters)
      setData(result)
    } catch (err) {
      console.error('Stock report fetch error:', err)
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
    setFilters({ branchId, isActive: true })
  }

  const handleExportExcel = () => {
    const excelData = reportsService.prepareExcelData(data, 'stock')
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

  const getStockStatusBadge = (quantity: number, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Pasif</Badge>
    }
    
    if (quantity <= 0) {
      return <Badge variant="destructive">Tükendi</Badge>
    } else if (quantity < 10) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Kritik</Badge>
    } else if (quantity < 50) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Düşük</Badge>
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>
    }
  }

  const totalValue = data.reduce((sum, item) => sum + item.total_value, 0)
  const totalProducts = data.length
  const activeProducts = data.filter(item => item.is_active).length
  const lowStockProducts = data.filter(item => item.is_active && item.stock_quantity < 10).length
  const outOfStockProducts = data.filter(item => item.is_active && item.stock_quantity <= 0).length

  return (
    <div className="space-y-6">
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        showStockFilters={true}
      />

      {/* Stok Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Ürün</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Düşük Stok</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Değer</p>
                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stok Raporu
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalProducts} ürün • {activeProducts} aktif • 
                {outOfStockProducts > 0 && `${outOfStockProducts} tükendi • `}
                {lowStockProducts > 0 && `${lowStockProducts} kritik stok • `}
                Toplam Değer: {formatCurrency(totalValue)}
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
              Seçilen kriterlere uygun ürün bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün Adı</TableHead>
                    <TableHead>Barkod</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">Maliyet</TableHead>
                    <TableHead className="text-right">Toplam Değer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.barcode || '-'}
                      </TableCell>
                      <TableCell>
                        {product.category || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          product.stock_quantity <= 0 ? 'text-red-600' :
                          product.stock_quantity < 10 ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStockStatusBadge(product.stock_quantity, product.is_active)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.unit_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.cost_price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.total_value)}
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