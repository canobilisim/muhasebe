import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePOSStore } from '@/stores/posStore'
import { PaymentType } from '@/types/enums'
import { Calculator } from 'lucide-react'

export const PaidAmountInput = () => {
  const { paymentInfo, totalAmount, setPaidAmount } = usePOSStore()
  const [inputValue, setInputValue] = useState('')

  // Update input value when paid amount changes from other sources (quick buttons)
  useEffect(() => {
    setInputValue(paymentInfo.paidAmount.toString())
  }, [paymentInfo.paidAmount])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    const numericValue = parseFloat(value) || 0
    setPaidAmount(numericValue)
  }

  // Don't show for credit payments
  if (paymentInfo.type === PaymentType.CREDIT) {
    return null
  }

  return (
    <Card>
      <CardHeader className="py-3 lg:py-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Calculator className="w-4 h-4 lg:w-5 lg:h-5" />
          Ödenen Tutar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        <div className="space-y-2 lg:space-y-3">
          <Label htmlFor="paid-amount" className="text-sm lg:text-base">Ödenen Miktar (₺)</Label>
          <Input
            id="paid-amount"
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="0.00"
            className="text-base lg:text-lg font-semibold text-center h-10 lg:h-12"
            step="0.01"
            min="0"
          />
          
          {paymentInfo.paidAmount < totalAmount && totalAmount > 0 && (
            <div className="text-xs lg:text-sm text-red-600 text-center">
              Kalan: {(totalAmount - paymentInfo.paidAmount).toFixed(2)} ₺
            </div>
          )}
          
          {paymentInfo.changeAmount > 0 && (
            <div className="text-xs lg:text-sm text-green-600 text-center font-medium">
              Para Üstü: {paymentInfo.changeAmount.toFixed(2)} ₺
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}