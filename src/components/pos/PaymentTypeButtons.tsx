import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePOSStore } from '@/stores/posStore'
import { PaymentType, PaymentTypeLabels } from '@/types/enums'
import { CreditCard, Banknote, FileText, Split } from 'lucide-react'

export const PaymentTypeButtons = () => {
  const { paymentInfo, setPaymentType, selectedCustomer } = usePOSStore()

  const paymentTypes = [
    {
      type: PaymentType.CASH,
      label: PaymentTypeLabels[PaymentType.CASH],
      icon: Banknote,
      color: 'bg-green-500 hover:bg-green-600',
      shortcut: 'F8'
    },
    {
      type: PaymentType.POS,
      label: PaymentTypeLabels[PaymentType.POS],
      icon: CreditCard,
      color: 'bg-blue-500 hover:bg-blue-600',
      shortcut: 'F9'
    },
    {
      type: PaymentType.CREDIT,
      label: PaymentTypeLabels[PaymentType.CREDIT],
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      shortcut: 'F10',
      disabled: !selectedCustomer
    },
    {
      type: PaymentType.PARTIAL,
      label: PaymentTypeLabels[PaymentType.PARTIAL],
      icon: Split,
      color: 'bg-purple-500 hover:bg-purple-600',
      shortcut: 'F11'
    }
  ]

  const handlePaymentTypeChange = (type: keyof typeof PaymentType) => {
    setPaymentType(type)
  }

  return (
    <Card>
      <CardHeader className="py-3 lg:py-6">
        <CardTitle className="text-base lg:text-lg">Ödeme Türü</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 lg:space-y-3 p-3 lg:p-6">
        {/* Mobile: 2x2 grid, Desktop: single column */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
          {paymentTypes.map((payment) => {
            const Icon = payment.icon
            const isSelected = paymentInfo.type === payment.type
            const isDisabled = payment.disabled

            return (
              <Button
                key={payment.type}
                variant={isSelected ? "default" : "outline"}
                onClick={() => handlePaymentTypeChange(payment.type)}
                disabled={isDisabled}
                className={`
                  w-full h-12 lg:h-14 justify-start text-left relative touch-manipulation
                  ${isSelected && !isDisabled ? payment.color + ' text-white' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs lg:text-sm truncate">{payment.label}</div>
                  {payment.type === PaymentType.CREDIT && !selectedCustomer && (
                    <div className="text-xs opacity-75 hidden lg:block">Müşteri seçiniz</div>
                  )}
                </div>
                <div className="text-xs opacity-75 absolute right-1 lg:right-3 top-1 lg:top-2 hidden sm:block">
                  {payment.shortcut}
                </div>
              </Button>
            )
          })}
        </div>
        
        {/* Payment type info - hidden on mobile */}
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded hidden lg:block">
          <div className="font-semibold mb-1">Klavye Kısayolları:</div>
          <div>F8: Nakit • F9: POS • F10: Açık Hesap • F11: Parçalı</div>
        </div>
      </CardContent>
    </Card>
  )
}