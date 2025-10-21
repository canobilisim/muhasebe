import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, Calendar, User, CreditCard, FileText } from 'lucide-react'
import type { CustomerPaymentWithDetails } from '@/types'

interface PaymentDetailModalProps {
  payment: CustomerPaymentWithDetails | null
  isOpen: boolean
  onClose: () => void
}

export const PaymentDetailModal = ({ payment, isOpen, onClose }: PaymentDetailModalProps) => {
  if (!payment) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentTypeLabel = (type: string) => {
    return type === 'cash' ? 'Nakit' : 'Kredi Kartı'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            Ödeme Detayı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ödeme Numarası */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <FileText className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Ödeme Numarası</p>
              <p className="font-semibold text-lg">{payment.payment_number || 'Bilinmiyor'}</p>
            </div>
          </div>

          {/* Tutar */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Ödeme Tutarı</p>
              <p className="font-bold text-2xl text-green-600">{formatCurrency(payment.amount)}</p>
            </div>
          </div>

          {/* Ödeme Tipi */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Ödeme Tipi</span>
            <Badge variant="outline" className="text-sm">
              {getPaymentTypeLabel(payment.payment_type)}
            </Badge>
          </div>

          {/* Tarih */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Ödeme Tarihi</p>
              <p className="font-medium">{formatDate(payment.payment_date)}</p>
            </div>
          </div>

          {/* İşlemi Yapan */}
          {payment.user && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">İşlemi Yapan</p>
                <p className="font-medium">{payment.user.full_name}</p>
              </div>
            </div>
          )}

          {/* Not */}
          {payment.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Not</p>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
