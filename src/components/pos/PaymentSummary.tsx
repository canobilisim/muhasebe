import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePOSStore } from '@/stores/posStore'
import { formatCurrency } from '@/lib/utils'

export const PaymentSummary = () => {
  const { totalAmount, paymentInfo } = usePOSStore()

  return (
    <Card>
      <CardHeader className="py-3 lg:py-6">
        <CardTitle className="text-base lg:text-lg">Ödeme Özeti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4 p-3 lg:p-6">
        <div className="flex justify-between items-center text-base lg:text-lg font-semibold">
          <span>Tutar:</span>
          <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
        </div>
        
        <div className="flex justify-between items-center text-base lg:text-lg">
          <span>Ödenen:</span>
          <span className="text-green-600">{formatCurrency(paymentInfo.paidAmount)}</span>
        </div>
        
        <div className="flex justify-between items-center text-base lg:text-lg font-semibold border-t pt-2">
          <span>Para Üstü:</span>
          <span className={`${paymentInfo.changeAmount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
            {formatCurrency(paymentInfo.changeAmount)}
          </span>
        </div>
        
        {paymentInfo.paidAmount < totalAmount && totalAmount > 0 && (
          <div className="flex justify-between items-center text-sm lg:text-base text-red-600 bg-red-50 p-2 rounded">
            <span>Kalan:</span>
            <span className="font-semibold">{formatCurrency(totalAmount - paymentInfo.paidAmount)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}