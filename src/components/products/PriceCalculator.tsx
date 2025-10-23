import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface PriceCalculatorProps {
  vatRate: number
  isVatIncluded: boolean
  onVatIncludedChange: (isVatIncluded: boolean) => void
  purchasePrice: number
  onPurchasePriceChange: (price: number) => void
  salePrice: number
  onSalePriceChange: (price: number) => void
  purchasePriceError?: string
  salePriceError?: string
  disabled?: boolean
}

export function PriceCalculator({
  vatRate,
  isVatIncluded,
  onVatIncludedChange,
  purchasePrice,
  onPurchasePriceChange,
  salePrice,
  onSalePriceChange,
  purchasePriceError,
  salePriceError,
  disabled
}: PriceCalculatorProps) {
  const [purchasePriceInput, setPurchasePriceInput] = useState(purchasePrice.toString())
  const [salePriceInput, setSalePriceInput] = useState(salePrice.toString())

  // Update inputs when props change
  useEffect(() => {
    setPurchasePriceInput(purchasePrice.toString())
  }, [purchasePrice])

  useEffect(() => {
    setSalePriceInput(salePrice.toString())
  }, [salePrice])

  // Calculate VAT excluded and included prices
  const calculatePrices = (price: number, isIncluded: boolean) => {
    if (isIncluded) {
      // Price is VAT included, calculate excluded
      const vatExcluded = price / (1 + vatRate / 100)
      const vatAmount = price - vatExcluded
      return {
        vatExcluded: Number(vatExcluded.toFixed(2)),
        vatIncluded: price,
        vatAmount: Number(vatAmount.toFixed(2))
      }
    } else {
      // Price is VAT excluded, calculate included
      const vatAmount = price * (vatRate / 100)
      const vatIncluded = price + vatAmount
      return {
        vatExcluded: price,
        vatIncluded: Number(vatIncluded.toFixed(2)),
        vatAmount: Number(vatAmount.toFixed(2))
      }
    }
  }

  const purchasePriceCalc = calculatePrices(purchasePrice, isVatIncluded)
  const salePriceCalc = calculatePrices(salePrice, isVatIncluded)

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPurchasePriceInput(value)

    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      onPurchasePriceChange(numValue)
    }
  }

  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSalePriceInput(value)

    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      onSalePriceChange(numValue)
    }
  }

  const handlePurchasePriceBlur = () => {
    const numValue = parseFloat(purchasePriceInput)
    if (isNaN(numValue) || numValue < 0) {
      setPurchasePriceInput('0')
      onPurchasePriceChange(0)
    } else {
      setPurchasePriceInput(numValue.toFixed(2))
    }
  }

  const handleSalePriceBlur = () => {
    const numValue = parseFloat(salePriceInput)
    if (isNaN(numValue) || numValue < 0) {
      setSalePriceInput('0')
      onSalePriceChange(0)
    } else {
      setSalePriceInput(numValue.toFixed(2))
    }
  }

  return (
    <div className="space-y-4">
      {/* VAT Mode Switch */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="space-y-0.5">
          <Label className="text-base font-medium">
            Fiyat Giriş Modu
          </Label>
          <p className="text-sm text-muted-foreground">
            {isVatIncluded ? 'KDV Dahil fiyat giriyorsunuz' : 'KDV Hariç (Matrah) fiyat giriyorsunuz'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm font-medium transition-colors",
            !isVatIncluded ? "text-primary" : "text-muted-foreground"
          )}>
            KDV Hariç
          </span>
          <Switch
            checked={isVatIncluded}
            onCheckedChange={onVatIncludedChange}
            disabled={disabled}
          />
          <span className={cn(
            "text-sm font-medium transition-colors",
            isVatIncluded ? "text-primary" : "text-muted-foreground"
          )}>
            KDV Dahil
          </span>
        </div>
      </div>

      {/* Purchase Price */}
      <div className="space-y-2">
        <Label htmlFor="purchase-price" className={cn(purchasePriceError && 'text-destructive')}>
          Alış Fiyatı
        </Label>
        <Input
          id="purchase-price"
          type="number"
          value={purchasePriceInput}
          onChange={handlePurchasePriceChange}
          onBlur={handlePurchasePriceBlur}
          placeholder="0.00"
          min="0"
          step="0.01"
          disabled={disabled}
          className={cn(purchasePriceError && 'border-destructive focus-visible:ring-destructive')}
        />
        {purchasePriceError && (
          <p className="text-sm text-destructive">{purchasePriceError}</p>
        )}
        
        {/* Calculated Purchase Prices */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md text-sm">
          <div>
            <p className="text-muted-foreground mb-1">KDV Hariç</p>
            <p className="font-medium">₺{purchasePriceCalc.vatExcluded.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">KDV Dahil</p>
            <p className="font-medium">₺{purchasePriceCalc.vatIncluded.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Sale Price */}
      <div className="space-y-2">
        <Label htmlFor="sale-price" className={cn(salePriceError && 'text-destructive')}>
          Satış Fiyatı
        </Label>
        <Input
          id="sale-price"
          type="number"
          value={salePriceInput}
          onChange={handleSalePriceChange}
          onBlur={handleSalePriceBlur}
          placeholder="0.00"
          min="0"
          step="0.01"
          disabled={disabled}
          className={cn(salePriceError && 'border-destructive focus-visible:ring-destructive')}
        />
        {salePriceError && (
          <p className="text-sm text-destructive">{salePriceError}</p>
        )}
        
        {/* Calculated Sale Prices */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md text-sm">
          <div>
            <p className="text-muted-foreground mb-1">KDV Hariç</p>
            <p className="font-medium">₺{salePriceCalc.vatExcluded.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">KDV Dahil</p>
            <p className="font-medium">₺{salePriceCalc.vatIncluded.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* VAT Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <span className="font-medium">KDV Oranı: %{vatRate}</span>
          {' • '}
          Alış KDV: ₺{purchasePriceCalc.vatAmount.toFixed(2)}
          {' • '}
          Satış KDV: ₺{salePriceCalc.vatAmount.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
