import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import type { SaleWithDetails } from '@/types'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface SaleEditModalProps {
  sale: SaleWithDetails | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export const SaleEditModal = ({ sale, isOpen, onClose, onSave }: SaleEditModalProps) => {
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (sale) {
      setDueDate(sale.due_date ? sale.due_date.split('T')[0] : '')
      setNotes(sale.notes || '')
    }
  }, [sale])

  const handleSave = async () => {
    if (!sale) return

    // Nakit veya POS satışlarına vade tarihi tanımlanamaz
    if (dueDate && (sale.payment_type === 'cash' || sale.payment_type === 'pos')) {
      toast.error('Nakit ve POS satışlarına vade tarihi tanımlanamaz!')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('sales')
        .update({
          due_date: dueDate || null,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sale.id)

      if (error) throw error

      toast.success('Satış başarıyla güncellendi')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating sale:', error)
      toast.error('Satış güncellenirken bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: 'Nakit',
      pos: 'Kredi Kartı',
      credit: 'Veresiye',
      partial: 'Karma'
    }
    return labels[type] || type
  }



  if (!sale) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Satış Düzenle - {sale.sale_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Satış Tarihi</p>
              <p className="font-medium">{formatDate(sale.sale_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ödeme Tipi</p>
              <p className="font-medium">{getPaymentTypeLabel(sale.payment_type)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Tutar</p>
              <p className="font-medium text-lg">{formatCurrency(sale.net_amount || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Müşteri</p>
              <p className="font-medium">{sale.customer?.name || 'Müşteri yok'}</p>
            </div>

          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Vade Tarihi
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={sale.payment_type === 'cash' || sale.payment_type === 'pos'}
              />
              {(sale.payment_type === 'cash' || sale.payment_type === 'pos') ? (
                <p className="text-xs text-red-600">
                  ⚠️ Nakit ve POS satışlarına vade tarihi tanımlanamaz
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Açık hesap satışlar için ödeme vadesi belirleyin
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                placeholder="Satış hakkında notlar..."
              />
            </div>
          </div>

          {sale.due_date && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">
                Mevcut Vade Tarihi: {formatDate(sale.due_date)}
              </p>
              {new Date(sale.due_date) < new Date() && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Vade tarihi geçmiş
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
