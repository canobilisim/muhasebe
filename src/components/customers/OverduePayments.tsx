import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomerBalanceService, type OverduePayment } from '@/services/customerBalanceService'
import { AlertTriangle, Phone, Mail, Calendar } from 'lucide-react'

export const OverduePayments = () => {
  const navigate = useNavigate()
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOverduePayments()
  }, [])

  const loadOverduePayments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const payments = await CustomerBalanceService.getOverduePayments()
      setOverduePayments(payments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vadesi geçen ödemeler yüklenirken hata oluştu')
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getDaysOverdueBadgeVariant = (days: number) => {
    if (days > 90) return 'destructive'
    if (days > 60) return 'secondary'
    return 'outline'
  }

  const handleCallCustomer = (phone: string | null) => {
    if (phone) {
      window.open(`tel:${phone}`)
    }
  }

  const handleEmailCustomer = (email: string | null) => {
    if (email) {
      window.open(`mailto:${email}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loading />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadOverduePayments}>Tekrar Dene</Button>
        </CardContent>
      </Card>
    )
  }

  const totalOverdueAmount = overduePayments.reduce((sum, payment) => sum + payment.overdueAmount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Vadesi Geçen Ödemeler
          {overduePayments.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {overduePayments.length} ödeme
            </Badge>
          )}
        </CardTitle>
        {totalOverdueAmount > 0 && (
          <div className="text-sm text-gray-600">
            Toplam vadesi geçen tutar: <span className="font-semibold text-red-600">
              {formatCurrency(totalOverdueAmount)}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {overduePayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Vadesi geçen ödeme bulunmuyor</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri Bilgileri</TableHead>
                  <TableHead>Satış Bilgileri</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-center">Gecikme</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overduePayments.map((payment) => (
                  <TableRow 
                    key={payment.sale.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/customers/${payment.customer.id}`)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">{payment.customer.name}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {payment.customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {payment.customer.phone}
                            </div>
                          )}
                          {payment.customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {payment.customer.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">#{payment.sale.sale_number}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(payment.sale.sale_date)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {payment.sale.payment_type === 'credit' ? 'Açık Hesap' : 
                           payment.sale.payment_type === 'partial' ? 'Parçalı' : 
                           payment.sale.payment_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-semibold text-red-600">
                          {formatCurrency(payment.overdueAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Toplam: {formatCurrency(payment.sale.net_amount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getDaysOverdueBadgeVariant(payment.daysPastDue)}>
                        {payment.daysPastDue} gün
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {payment.customer.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCallCustomer(payment.customer.phone)}
                            title="Müşteriyi Ara"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.customer.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmailCustomer(payment.customer.email)}
                            title="E-posta Gönder"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}