import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar, CreditCard, User, FileText } from 'lucide-react'
import type { SaleWithDetails } from '@/types'

interface SaleDetailModalProps {
  sale: SaleWithDetails
  isOpen: boolean
  onClose: () => void
}

export const SaleDetailModal = ({ sale, isOpen, onClose }: SaleDetailModalProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: 'Nakit',
      pos: 'Kredi Kartı',
      credit: 'Veresiye',
      partial: 'Karma'
    }
    return labels[type] || type
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Satış Detayı - {sale.sale_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Tarih</p>
                  <p className="font-medium">{formatDate(sale.sale_date)}</p>
                </div>
              </div>

              {sale.customer && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Müşteri</p>
                    <p className="font-medium">{sale.customer.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Ödeme Tipi</p>
                  <p className="font-medium">{getPaymentTypeLabel(sale.payment_type)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sale Items */}
          <div>
            <h3 className="font-semibold mb-3">Ürünler</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="text-center">Miktar</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">İndirim</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {item.product?.name || item.note || 'Ürün'}
                          </p>
                          {item.product?.barcode && (
                            <p className="text-xs text-gray-500">
                              Barkod: {item.product.barcode}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(item.discount_amount || 0) > 0 ? (
                          <span className="text-red-600">
                            -{formatCurrency(item.discount_amount || 0)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.total_amount || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">{formatCurrency(sale.total_amount || 0)}</span>
              </div>
              
              {(sale.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İndirim:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(sale.discount_amount || 0)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net Toplam:</span>
                <span>{formatCurrency(sale.net_amount || 0)}</span>
              </div>

              {(sale.paid_amount || 0) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ödenen:</span>
                  <span>{formatCurrency(sale.paid_amount || 0)}</span>
                </div>
              )}

              {(sale.change_amount || 0) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Para Üstü:</span>
                  <span>{formatCurrency(sale.change_amount || 0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Notlar</h3>
              <p className="text-sm text-gray-600">{sale.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
