import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Receipt, User, CreditCard, Package } from 'lucide-react'
import type { SaleWithDetails } from '@/types/sales'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface RetailSaleDetailModalProps {
  sale: SaleWithDetails | null
  open: boolean
  onClose: () => void
}

export function RetailSaleDetailModal({ sale, open, onClose }: RetailSaleDetailModalProps) {
  if (!sale) return null

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Nakit',
    pos: 'Kredi Kartı',
    credit: 'Açık Hesap',
    partial: 'Kısmi Ödeme'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Satış Detayı
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Satış Bilgileri */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Satış Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Satış No</p>
                <p className="font-medium">{sale.sale_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tarih</p>
                <p className="font-medium">
                  {sale.sale_date && format(new Date(sale.sale_date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                <p className="font-medium">{paymentMethodLabels[sale.payment_type] || sale.payment_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durum</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Tamamlandı
                </span>
              </div>
            </div>
          </div>

          {/* Müşteri Bilgileri */}
          {sale.customer && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Müşteri Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Müşteri Adı</p>
                  <p className="font-medium">{sale.customer.name}</p>
                </div>
                {sale.customer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="font-medium">{sale.customer.phone}</p>
                  </div>
                )}
                {sale.customer.email && (
                  <div>
                    <p className="text-sm text-gray-600">E-posta</p>
                    <p className="font-medium">{sale.customer.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ürünler */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ürünler
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ürün</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Miktar</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Birim Fiyat</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">İndirim</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.sale_items || sale.items || []).map((item: any) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.product?.name || item.product_name}</p>
                          {item.product?.barcode && (
                            <p className="text-sm text-gray-500">{item.product.barcode}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">₺{Number(item.unit_price).toFixed(2)}</td>
                      <td className="text-right py-3 px-4">
                        {item.discount_amount ? `₺${Number(item.discount_amount).toFixed(2)}` : '-'}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        ₺{Number(item.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tutar Özeti */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="font-medium">₺{Number(sale.total_amount).toFixed(2)}</span>
              </div>
              {sale.discount_amount && Number(sale.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">İndirim</span>
                  <span className="font-medium text-red-600">-₺{Number(sale.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {sale.tax_amount && Number(sale.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">KDV</span>
                  <span className="font-medium">₺{Number(sale.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-lg">Genel Toplam</span>
                <span className="font-bold text-lg text-green-600">
                  ₺{Number(sale.net_amount || sale.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Ödeme Bilgileri */}
          {(sale.paid_amount || sale.change_amount) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Ödeme Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {sale.paid_amount && (
                  <div>
                    <p className="text-sm text-gray-600">Ödenen Tutar</p>
                    <p className="font-medium">₺{Number(sale.paid_amount).toFixed(2)}</p>
                  </div>
                )}
                {sale.change_amount && Number(sale.change_amount) > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Para Üstü</p>
                    <p className="font-medium">₺{Number(sale.change_amount).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notlar */}
          {sale.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Notlar</h3>
              <p className="text-gray-700">{sale.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
