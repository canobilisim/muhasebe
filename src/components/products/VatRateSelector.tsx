import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface VatRateSelectorProps {
  value: number
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
}

const STANDARD_RATES = [0, 1, 10, 20]

export function VatRateSelector({ value, onChange, error, disabled }: VatRateSelectorProps) {
  const [customRate, setCustomRate] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const isStandardRate = STANDARD_RATES.includes(value)

  const handleStandardRateClick = (rate: number) => {
    onChange(rate)
    setShowCustomInput(false)
    setCustomRate('')
  }

  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCustomRate(inputValue)

    // Validate and update
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue)
    }
  }

  const handleCustomRateBlur = () => {
    const numValue = parseFloat(customRate)
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      // Reset to last valid value
      setCustomRate(value.toString())
    }
  }

  return (
    <div className="space-y-2">
      <Label className={cn(error && 'text-destructive')}>
        KDV Oranı <span className="text-destructive">*</span>
      </Label>
      
      <div className="flex flex-wrap gap-2">
        {STANDARD_RATES.map((rate) => (
          <Button
            key={rate}
            type="button"
            variant={value === rate && !showCustomInput ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStandardRateClick(rate)}
            disabled={disabled}
            className="min-w-[60px]"
          >
            %{rate}
          </Button>
        ))}
        
        <Button
          type="button"
          variant={showCustomInput || (!isStandardRate && !showCustomInput) ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setShowCustomInput(true)
            setCustomRate(value.toString())
          }}
          disabled={disabled}
        >
          Özel Oran
        </Button>
      </div>

      {showCustomInput && (
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1 max-w-[200px]">
            <Input
              type="number"
              value={customRate}
              onChange={handleCustomRateChange}
              onBlur={handleCustomRateBlur}
              placeholder="Özel oran girin"
              min="0"
              max="100"
              step="0.01"
              disabled={disabled}
              className={cn(
                'pr-8',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>
      )}

      {!showCustomInput && !isStandardRate && (
        <div className="text-sm text-muted-foreground">
          Seçili: %{value}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Özel oran 0-100 arasında olmalıdır
      </p>
    </div>
  )
}
