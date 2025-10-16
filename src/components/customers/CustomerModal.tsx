import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CustomerForm } from './CustomerForm'
import type { Customer } from '@/types'

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer?: Customer
  onSave: (customer: Customer) => void
}

export const CustomerModal = ({ isOpen, onClose, customer, onSave }: CustomerModalProps) => {
  const handleSave = (savedCustomer: Customer) => {
    onSave(savedCustomer)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </DialogTitle>
        </DialogHeader>
        <CustomerForm
          customer={customer}
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}