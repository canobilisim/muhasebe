import { Product, ProductInsert, ProductUpdate } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductForm } from './ProductForm'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  isLoading: boolean
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<{ success: boolean; error?: string }>
  onCheckBarcode?: (barcode: string, excludeId?: string) => Promise<{ success: boolean; data: boolean; error?: string | null }>
}

export const ProductModal = ({
  isOpen,
  onClose,
  product,
  isLoading,
  onSubmit,
  onCheckBarcode
}: ProductModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <ProductForm
          product={product}
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onClose}
          onCheckBarcode={onCheckBarcode}
        />
      </DialogContent>
    </Dialog>
  )
}