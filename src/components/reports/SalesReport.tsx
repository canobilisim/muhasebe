import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReportFilters } from './ReportFilters'
import { SaleDetailModal } from './SaleDetailModal'
import { reportsService, SalesReportData, ReportFilters as IReportFilters } from '@/services/reportsService'
import { useAuth } from '@/hooks/useAuth'
import { Download, FileText, Loader2, DollarSign, CreditCard, Wallet, TrendingUp, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const SalesReport = () => {
  const { branchId, isAdmin } = useAuth()
  const [data, setData] = useState<SalesReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<{ id: string; saleNumber: string } | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [totalProfit, setTotalProfit] = useState(0)
  const [filters, setFilters] = useState<IReportFilters>({
    branchId: branchId || undefined,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Son 30 gün
    endDate: new Date().toISOString().split('T')[0]
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
      console.log('Fetching sales report with filters:', filters)
      const result = await reportsService.getSalesReport(filters)
      console.log('Sales report result:', result)
      setData(result)
      
      // Kâr hesapla
      await calculateProfit(result)
    } catch (err) {
      console.error('Sales report fetch error:', err)
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const calculateProfit = async (sales: SalesReportData[]) => {
    if (sales.length === 0) {
      setTotalProfit(0)
      return
    }

    try {
      // Tüm satış ID'lerini topla
      const saleIds = sales.map(s => s.id)
      
      // Tek sorguda tüm sale_items'ları çek
      const { data: items, error } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          product:products(purchase_price)
        `)
        .in('sale_id', saleIds)

      if (error) {
        console.error('Error fetching sale items for profit calculation:', error)
        setTotalProfit(0)
        return
      }

      console.log('Sale items for profit calculation:', items)

      // Kâr hesapla
      let profit = 0
      items?.forEach((item: any) => {
        const purchasePrice = item.product?.purchase_price || 0
        const salePrice = item.unit_price
        const quantity = item.quantity
        const itemProfit = (salePrice - purchasePrice) * quantity
        
        console.log(`Item: Sale=${salePrice}, Purchase=${purchasePrice}, Qty=${quantity}, Profit=${itemProfit}`)
        profit += itemProfit
      })
      
      console.log('Total profit calculated:', profit)
      setTotalProfit(profit)
    } catch (err) {
      console.error('Error calculating profit:', err)
      setTotalProfit(0)
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
    const newFilters: IReportFilters = {
      branchId: branchId || undefined,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
    setFilters(newFilters)
    // Filtreleri temizledikten sonra veriyi yeniden çek
    setTimeout(() => fetchData(), 100)
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

  const openDetailModal = (saleId: string) => {
    setSelectedSaleId(saleId)
    setDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedSaleId(null)
  }

  const openDeleteModal = (e: React.MouseEvent, saleId: string, saleNumber: string) => {
    e.stopPropagation() // Satır tıklamasını engelle
    setSaleToDelete({ id: saleId, saleNumber })
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setSaleToDelete(null)
  }

  const handleDeleteSale = async () => {
    if (!saleToDelete) return

    try {
      setDeletingId(saleToDelete.id)
      
      // Önce sale_items'ları sil
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleToDelete.id)

      if (itemsError) throw itemsError

      // Sonra cash_movements'ı sil
      const { error: cashError } = await supabase
        .from('cash_movements')
        .delete()
        .eq('sale_id', saleToDelete.id)

      if (cashError) throw cashError

      // Son olarak satışı sil
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleToDelete.id)

      if (saleError) throw saleError

      // Listeyi güncelle
      setData(prev => prev.filter(sale => sale.id !== saleToDelete.id))
      closeDeleteModal()
    } catch (err) {
      console.error('Delete sale error:', err)
      alert('Satış silinirken hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
    } finally {
      setDeletingId(null)
    }
  }

  // Özet hesaplamaları
  const totalRevenue = data.reduce((sum, item) => sum + item.net_amount, 0)
  const cashSales = data.filter(s => s.payment_type === 'cash').reduce((sum, item) => sum + item.net_amount, 0)
  const posSales = data.filter(s => s.payment_type === 'pos').reduce((sum, item) => sum + item.net_amount, 0)
  const creditSales = data.filter(s => s.payment_type === 'credit').reduce((sum, item) => sum + item.net_amount, 0)

  return (
    <div className="space-y-6">
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        showPaymentFilters={true}
      />

      {/* Özet Kartları */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Ciro</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nakit</p>
                  <p className="text-2xl font-bold">{formatCurrency(cashSales)}</p>
                </div>
                <Wallet className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">POS</p>
                  <p className="text-2xl font-bold">{formatCurrency(posSales)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Açık Hesap</p>
                  <p className="text-2xl font-bold">{formatCurrency(creditSales)}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kâr</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Satış Listesi
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.length} satış kaydı
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
                    <TableHead className="text-right">Net Tutar</TableHead>
                    <TableHead>Ödeme</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    {isAdmin() && <TableHead className="text-center">İşlem</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((sale) => (
                    <TableRow 
                      key={sale.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetailModal(sale.id)}
                    >
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
                      {isAdmin() && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => openDeleteModal(e, sale.id, sale.sale_number)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Satış Detay Modal */}
      <SaleDetailModal
        saleId={selectedSaleId}
        open={detailModalOpen}
        onClose={closeDetailModal}
        onUpdate={fetchData}
        onDelete={(saleId, saleNumber) => {
          setSaleToDelete({ id: saleId, saleNumber })
          setDeleteModalOpen(true)
        }}
      />

      {/* Silme Onay Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Satışı Sil
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{saleToDelete?.saleNumber}</span> numaralı satışı silmek istediğinizden emin misiniz?
              <br />
              <br />
              Bu işlem geri alınamaz ve satışa ait tüm kayıtlar silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={!!deletingId}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSale}
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}