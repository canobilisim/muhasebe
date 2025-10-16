import { Product } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'

interface DeleteProductDialogProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  isLoading: boolean
  onConfirm: () => void
}

export const DeleteProductDialog = ({
  isOpen,
  onClose,
  product,
  isLoading,
  onConfirm
}: DeleteProductDialogProps) => {
  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Ürün Sil
          </DialogTitle>
          <DialogDescription className="text-left">
            <strong>{product.name}</strong> ürünü silmek istediğinizden emin misiniz?
            <br />
            <br />
            <span className="text-sm text-gray-600">
              Bu işlem ürünü pasif duruma getirecektir. Ürün tamamen silinmeyecek, 
              sadece listede görünmez hale gelecektir.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}