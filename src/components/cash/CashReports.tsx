import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cashService, type CashMovementWithDetails } from '@/services/cashService'
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react'

interface CashReportsProps {
  className?: string
}

export const CashReports = ({ className }: CashReportsProps) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [movements, setMovements] = useState<CashMovementWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Başlangıç ve bitiş tarihleri seçiniz')
      return
    }

    if (startDate > endDate) {
      setError('Başlangıç tarihi bitiş tarihinden büyük olamaz')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await cashService.getCashMovementsByDateRange(startDate, endDate)
      setMovements(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor oluşturulurken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    if (movements.length === 0) {
      setError('Dışa aktarılacak veri bulunamadı')
      return
    }

    const headers = ['Tarih', 'Saat', 'Tür', 'Açıklama', 'Referans', 'Kullanıcı', 'Tutar']
    const csvContent = [
      headers.join(','),
      ...movements.map(movement => [
        movement.movement_date,
        new Date(movement.created_at).toLocaleTimeString('tr-TR'),
        getMovementTypeLabel(movement.movement_type),
        `"${movement.description || ''}"`,
        movement.reference_number || movement.sale_number || '',
        `"${movement.user_name || ''}"`,
        movement.amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `kasa-raporu-${startDate}-${endDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'opening': return 'Açılış'
      case 'closing': return 'Kapanış'
      case 'income': return 'Gelir'
      case 'expense': return 'Gider'
      case 'sale': return 'Satış'
      default: return 'Diğer'
    }
  }

  const getMovementTypeInfo = (type: string) => {
    switch (type) {
      case 'opening':
        return { icon: Wallet, color: 'bg-blue-100 text-blue-800' }
      case 'closing':
        return { icon: Wallet, color: 'bg-gray-100 text-gray-800' }
      case 'income':
        return { icon: TrendingUp, color: 'bg-green-100 text-green-800' }
      case 'expense':
        return { icon: TrendingDown, color: 'bg-red-100 text-red-800' }
      case 'sale':
        return { icon: Receipt, color: 'bg-purple-100 text-purple-800' }
      default:
        return { icon: Wallet, color: 'bg-gray-100 text-gray-800' }
    }
  }

  // Rapor özetini hesapla
  const reportSummary = movements.reduce((acc, movement) => {
    switch (movement.movement_type) {
      case 'opening':
        acc.totalOpening += movement.amount
        break
      case 'closing':
        acc.totalClosing += movement.amount
        break
      case 'income':
        acc.totalIncome += movement.amount
        break
      case 'expense':
        acc.totalExpense += movement.amount
        break
      case 'sale':
        acc.totalSales += movement.amount
        break
    }
    return acc
  }, {
    totalOpening: 0,
    totalClosing: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalSales: 0
  })

  const netAmount = reportSummary.totalOpening + reportSummary.totalIncome + reportSummary.totalSales - reportSummary.totalExpense

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Kasa Raporları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tarih Seçimi */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Başlangıç Tarihi</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Bitiş Tarihi</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={generateReport} disabled={isLoading}>
                <Calendar className="w-4 h-4 mr-2" />
                {isLoading ? 'Yükleniyor...' : 'Rapor Oluştur'}
              </Button>
              {movements.length > 0 && (
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  CSV İndir
                </Button>
              )}
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Rapor Özeti */}
          {movements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-blue-700">Toplam Açılış</div>
                  <div className="text-lg font-bold text-blue-800">
                    {formatCurrency(reportSummary.totalOpening)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-purple-700">Toplam Satış</div>
                  <div className="text-lg font-bold text-purple-800">
                    {formatCurrency(reportSummary.totalSales)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-green-700">Toplam Gelir</div>
                  <div className="text-lg font-bold text-green-800">
                    {formatCurrency(reportSummary.totalIncome)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-red-700">Toplam Gider</div>
                  <div className="text-lg font-bold text-red-800">
                    {formatCurrency(reportSummary.totalExpense)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-700">Net Tutar</div>
                  <div className={`text-lg font-bold ${netAmount >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    {formatCurrency(netAmount)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rapor Tablosu */}
          {movements.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Saat</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Referans</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.movement_type)
                    const Icon = typeInfo.icon
                    const isNegative = movement.movement_type === 'expense'

                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(movement.movement_date).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {new Date(movement.created_at).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={typeInfo.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {getMovementTypeLabel(movement.movement_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={movement.description || ''}>
                            {movement.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {movement.reference_number || movement.sale_number || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {movement.user_name || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                            {isNegative ? '-' : '+'}{formatCurrency(movement.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Veri Yok Mesajı */}
          {!isLoading && movements.length === 0 && startDate && endDate && (
            <div className="text-center py-8 text-gray-500">
              Seçilen tarih aralığında kasa hareketi bulunamadı
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}