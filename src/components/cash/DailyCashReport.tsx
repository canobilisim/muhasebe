import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { cashService, type DailyCashSummary, type CashMovementWithDetails } from '@/services/cashService'
import { FileText, Printer, Calendar } from 'lucide-react'

interface DailyCashReportProps {
  selectedDate?: string
  className?: string
}

export const DailyCashReport = ({ selectedDate, className }: DailyCashReportProps) => {
  const [reportDate, setReportDate] = useState(selectedDate || new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState<DailyCashSummary | null>(null)
  const [movements, setMovements] = useState<CashMovementWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDailyReport = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [summaryData, movementsData] = await Promise.all([
        cashService.getDailyCashSummary(reportDate),
        cashService.getDailyCashMovements(reportDate)
      ])

      setSummary(summaryData)
      setMovements(movementsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Günlük rapor oluşturulurken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const printReport = () => {
    if (!summary) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Günlük Kasa Raporu - ${new Date(reportDate).toLocaleDateString('tr-TR')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; }
            .summary-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
            .movements { margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .amount { text-align: right; }
            .positive { color: green; }
            .negative { color: red; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Günlük Kasa Raporu</h1>
            <h2>${new Date(reportDate).toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h2>
          </div>

          <div class="summary">
            <h3>Kasa Özeti</h3>
            <div class="summary-item">
              <span>Açılış Tutarı:</span>
              <span>${formatCurrency(summary.opening_amount)}</span>
            </div>
            <div class="summary-item">
              <span>Toplam Satış:</span>
              <span>${formatCurrency(summary.total_sales)}</span>
            </div>
            <div class="summary-item">
              <span>Toplam Gelir:</span>
              <span>${formatCurrency(summary.total_income)}</span>
            </div>
            <div class="summary-item">
              <span>Toplam Gider:</span>
              <span>${formatCurrency(summary.total_expense)}</span>
            </div>
            <div class="summary-item">
              <span>Kapanış Tutarı:</span>
              <span>${summary.closing_amount > 0 ? formatCurrency(summary.closing_amount) : 'Kapanmadı'}</span>
            </div>
            <div class="summary-item" style="border-top: 2px solid #333; font-weight: bold;">
              <span>Beklenen Kasa:</span>
              <span>${formatCurrency(summary.opening_amount + summary.total_sales + summary.total_income - summary.total_expense)}</span>
            </div>
            ${summary.closing_amount > 0 ? `
              <div class="summary-item" style="font-weight: bold;">
                <span>Kasa Farkı:</span>
                <span class="${summary.cash_difference >= 0 ? 'positive' : 'negative'}">
                  ${summary.cash_difference >= 0 ? '+' : ''}${formatCurrency(summary.cash_difference)}
                </span>
              </div>
            ` : ''}
          </div>

          ${movements.length > 0 ? `
            <div class="movements">
              <h3>Kasa Hareketleri (${movements.length} adet)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Saat</th>
                    <th>Tür</th>
                    <th>Açıklama</th>
                    <th>Referans</th>
                    <th>Kullanıcı</th>
                    <th>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  ${movements.map(movement => `
                    <tr>
                      <td>${new Date(movement.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>${getMovementTypeLabel(movement.movement_type)}</td>
                      <td>${movement.description || '-'}</td>
                      <td>${movement.reference_number || movement.sale_number || '-'}</td>
                      <td>${movement.user_name || '-'}</td>
                      <td class="amount ${movement.movement_type === 'expense' ? 'negative' : 'positive'}">
                        ${movement.movement_type === 'expense' ? '-' : '+'}${formatCurrency(movement.amount)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
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

  useEffect(() => {
    if (reportDate) {
      generateDailyReport()
    }
  }, [reportDate])

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Günlük Kasa Raporu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tarih Seçimi */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="reportDate">Rapor Tarihi</Label>
              <Input
                id="reportDate"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={generateDailyReport} disabled={isLoading}>
                <Calendar className="w-4 h-4 mr-2" />
                {isLoading ? 'Yükleniyor...' : 'Rapor Oluştur'}
              </Button>
              {summary && (
                <Button onClick={printReport} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Yazdır
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

          {/* Rapor İçeriği */}
          {summary && (
            <div className="space-y-6">
              {/* Özet Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kasa Özeti</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Açılış Tutarı:</span>
                      <span className="font-semibold">{formatCurrency(summary.opening_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam Satış:</span>
                      <span className="font-semibold text-purple-600">{formatCurrency(summary.total_sales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam Gelir:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(summary.total_income)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam Gider:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(summary.total_expense)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Kapanış Tutarı:</span>
                      <span className="font-semibold">
                        {summary.closing_amount > 0 ? formatCurrency(summary.closing_amount) : 'Kapanmadı'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kasa Durumu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Beklenen Kasa:</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.opening_amount + summary.total_sales + summary.total_income - summary.total_expense)}
                      </span>
                    </div>
                    {summary.closing_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Kasa Farkı:</span>
                        <span className={`font-semibold ${summary.cash_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {summary.cash_difference >= 0 ? '+' : ''}{formatCurrency(summary.cash_difference)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Toplam Hareket:</span>
                      <span className="font-semibold">{summary.movement_count} adet</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hareket Sayıları */}
              {movements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hareket Detayları</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      {['opening', 'sale', 'income', 'expense', 'closing'].map(type => {
                        const count = movements.filter(m => m.movement_type === type).length
                        const total = movements
                          .filter(m => m.movement_type === type)
                          .reduce((sum, m) => sum + m.amount, 0)
                        
                        return (
                          <div key={type} className="space-y-1">
                            <div className="text-sm text-gray-600">{getMovementTypeLabel(type)}</div>
                            <div className="font-semibold">{count} adet</div>
                            <div className="text-sm">{formatCurrency(total)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Veri Yok Mesajı */}
          {!isLoading && !summary && reportDate && (
            <div className="text-center py-8 text-gray-500">
              Seçilen tarihte kasa hareketi bulunamadı
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}