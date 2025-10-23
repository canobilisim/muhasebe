import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductService } from '@/services/productService';
import { Product } from '@/types';
import { useState, useEffect } from 'react';
import { quickProductSchema, type QuickProductFormData } from '@/utils/validationSchemas';
import { getFieldErrorClass, showErrorToast, showSuccessToast } from '@/utils/errorHandling';

interface ProductNotFoundModalProps {
  isOpen: boolean;
  barcode: string;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
}

export function ProductNotFoundModal({
  isOpen,
  barcode,
  onClose,
  onProductCreated,
}: ProductNotFoundModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<QuickProductFormData>({
    resolver: zodResolver(quickProductSchema),
    defaultValues: {
      barcode,
      vatRate: '20',
    },
  });

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    const result = await ProductService.getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  };

  const onSubmit = async (data: QuickProductFormData) => {
    setIsSubmitting(true);

    try {
      // Create product with minimal required fields
      const productData = {
        name: data.name,
        barcode: data.barcode,
        sale_price: parseFloat(data.salePrice),
        vat_rate: parseFloat(data.vatRate),
        category: data.category || null,
        is_vat_included: false,
        stock_tracking_enabled: true,
        serial_number_tracking_enabled: false,
        is_active: true,
      };

      const result = await ProductService.createProduct(productData);

      if (result.success && result.data) {
        showSuccessToast('Ürün başarıyla oluşturuldu');
        onProductCreated(result.data);
        onClose();
      } else {
        showErrorToast(result.error || 'Ürün oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showErrorToast(error, 'Ürün oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Ürün Bulunamadı</DialogTitle>
          </div>
          <DialogDescription>
            Bu barkoda ait ürün bulunamadı. Hızlıca yeni ürün ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Barkod (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Barkod</Label>
            <Input
              id="barcode"
              {...register('barcode')}
              readOnly
              className="bg-gray-50"
            />
          </div>

          {/* Ürün Adı */}
          <div className="space-y-2">
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ürün adını giriniz"
              autoFocus
              className={getFieldErrorClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Satış Fiyatı */}
          <div className="space-y-2">
            <Label htmlFor="salePrice">Satış Fiyatı (₺) *</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              {...register('salePrice')}
              placeholder="0.00"
              className={getFieldErrorClass(!!errors.salePrice)}
            />
            {errors.salePrice && (
              <p className="text-sm text-red-500">{errors.salePrice.message}</p>
            )}
          </div>

          {/* KDV Oranı */}
          <div className="space-y-2">
            <Label htmlFor="vatRate">KDV Oranı (%) *</Label>
            <Select
              defaultValue="20"
              onValueChange={(value) => setValue('vatRate', value)}
            >
              <SelectTrigger id="vatRate">
                <SelectValue placeholder="KDV oranı seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">%0</SelectItem>
                <SelectItem value="1">%1</SelectItem>
                <SelectItem value="10">%10</SelectItem>
                <SelectItem value="20">%20</SelectItem>
              </SelectContent>
            </Select>
            {errors.vatRate && (
              <p className="text-sm text-red-500">{errors.vatRate.message}</p>
            )}
          </div>

          {/* Kategori (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Kategori seçiniz (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Oluşturuluyor...' : 'Ürün Ekle ve Sepete Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
