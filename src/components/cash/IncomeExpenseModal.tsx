import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TrendingUp, TrendingDown, DollarSign, Hash } from 'lucide-react'

interface IncomeExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, description: string, referenceNumber?: string) => Promise<void>
  type: 'income' | 'expense'
  isLoading?: boolean
}

export const IncomeExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  isLoading = false
}: IncomeExpenseModalProps) => {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [error, setError] = useState('')

  const isIncome = type === 'income'
  const title = isIncome ? 'Gelir Kaydı' : 'Gider Kaydı'
  const buttonText = isIncome ? 'Gelir Kaydet' : 'Gider Kaydet'
  const Icon = isIncome ? TrendingUp : TrendingDown

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Geçerli bir tutar giriniz')
      return
    }

    if (!description.trim()) {
      setError('Açıklama alanı zorunludur')
      return
    }

    try {
      await onSubmit(numAmount, description.trim(), referenceNumber.trim() || undefined)
      setAmount('')
      setDescription('')
      setReferenceNumber('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem sırasında hata oluştu')
    }
  }

  const handleClose = () => {
    setAmount('')
    setDescription('')
    setReferenceNumber('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Tutar *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isIncome ? 'Gelir açıklaması...' : 'Gider açıklaması...'}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Referans No</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Fiş/Fatura numarası"
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isLoading ? 'Kaydediliyor...' : buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}