import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, X } from 'lucide-react';

interface ProductNotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewProduct: () => void;
  barcode: string;
}

export const ProductNotFoundModal: React.FC<ProductNotFoundModalProps> = ({
  isOpen,
  onClose,
  onAddNewProduct,
  barcode,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Ürün Bulunamadı
          </DialogTitle>
          <DialogDescription>
            <strong>{barcode}</strong> barkodu sistemde kayıtlı değil. Yeni ürün olarak eklemek ister misiniz?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">Barkod Bulunamadı</p>
                <p className="text-sm text-yellow-800">
                  Bu barkod ile kayıtlı ürün bulunmuyor. Hızlı ürün ekleme ile yeni ürün oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Vazgeç
          </Button>
          <Button
            onClick={onAddNewProduct}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Ürün Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};