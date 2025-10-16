import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Wallet, DollarSign } from 'lucide-react'

interface CashOpenCloseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, description?: string) => Promise<void>
  type: 'open' | 'close'
  isLoading?: boolean
}

export const CashOpenCloseModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  isLoading = false
}: CashOpenCloseModalProps) => {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const isOpening = type === 'open'
  const title = isOpening ? 'Kasa Açılışı' : 'Kasa Kapanışı'
  const buttonText = isOpening ? 'Kasayı Aç' : 'Kasayı Kapat'
  const amountLabel = isOpening ? 'Açılış Tutarı' : 'Kapanış Tutarı'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Geçerli bir tutar giriniz')
      return
    }

    try {
      await onSubmit(numAmount, description || undefined)
      setAmount('')
      setDescription('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem sırasında hata oluştu')
    }
  }

  const handleClose = () => {
    setAmount('')
    setDescription('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{amountLabel} *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isOpening ? 'Kasa açılış açıklaması...' : 'Kasa kapanış açıklaması...'}
              rows={3}
            />
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
              className={isOpening ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isLoading ? 'İşleniyor...' : buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}