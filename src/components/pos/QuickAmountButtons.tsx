import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePOSStore } from '@/stores/posStore'
import { PaymentType } from '@/types/enums'

export const QuickAmountButtons = () => {
  const { paymentInfo, totalAmount, setPaidAmount } = usePOSStore()

  const quickAmounts = [20, 50, 100, 200]
  const adjustments = [
    { label: '+10', value: 10 },
    { label: '-10', value: -10 }
  ]

  const handleQuickAmount = (amount: number) => {
    // For credit payments, set exact amount
    if (paymentInfo.type === PaymentType.CREDIT) {
      setPaidAmount(totalAmount)
      return
    }
    
    setPaidAmount(amount)
  }

  const handleAdjustment = (adjustment: number) => {
    const newAmount = Math.max(0, paymentInfo.paidAmount + adjustment)
    setPaidAmount(newAmount)
  }

  const handleExactAmount = () => {
    setPaidAmount(totalAmount)
  }

  // Don't show quick amounts for credit payments
  if (paymentInfo.type === PaymentType.CREDIT) {
    return null
  }

  return (
    <Card>
      <CardHeader className="py-3 lg:py-6">
        <CardTitle className="text-base lg:text-lg">Hızlı Tutar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4 p-3 lg:p-6">
        {/* Quick amount buttons */}
        <div className="grid grid-cols-2 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => handleQuickAmount(amount)}
              className="h-10 lg:h-12 text-sm lg:text-lg font-semibold touch-manipulation"
            >
              {amount} ₺
            </Button>
          ))}
        </div>

        {/* Exact amount button */}
        <Button
          variant="secondary"
          onClick={handleExactAmount}
          className="w-full h-10 lg:h-12 text-sm lg:text-lg font-semibold touch-manipulation"
          disabled={totalAmount === 0}
        >
          <span className="hidden sm:inline">Tam Tutar ({totalAmount.toFixed(2)} ₺)</span>
          <span className="sm:hidden">Tam ({totalAmount.toFixed(2)} ₺)</span>
        </Button>

        {/* Adjustment buttons */}
        <div className="grid grid-cols-2 gap-2">
          {adjustments.map((adj) => (
            <Button
              key={adj.label}
              variant="outline"
              onClick={() => handleAdjustment(adj.value)}
              className="h-9 lg:h-10 text-sm lg:text-base touch-manipulation"
              disabled={adj.value < 0 && paymentInfo.paidAmount < Math.abs(adj.value)}
            >
              {adj.label} ₺
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}