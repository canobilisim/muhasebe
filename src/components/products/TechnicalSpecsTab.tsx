import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ProductFormData, ProductCondition } from '@/types/product'

interface TechnicalSpecsTabProps {
  form: UseFormReturn<ProductFormData>
  disabled?: boolean
}

const PRODUCT_CONDITIONS: ProductCondition[] = [
  'Yeni',
  '2. El',
  'Yenilenmiş',
  'Demo'
]

const COLORS = [
  'Siyah',
  'Beyaz',
  'Gri',
  'Gümüş',
  'Altın',
  'Mavi',
  'Kırmızı',
  'Yeşil',
  'Sarı',
  'Turuncu',
  'Mor',
  'Pembe',
  'Kahverengi',
  'Diğer'
]

export function TechnicalSpecsTab({ form, disabled }: TechnicalSpecsTabProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = form

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Teknik Özellikler</h3>
        <p className="text-sm text-muted-foreground">
          Ürünün teknik detaylarını girin. Bu alanlar opsiyoneldir.
        </p>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand" className={cn(errors.brand && 'text-destructive')}>
            Marka
          </Label>
          <Input
            id="brand"
            {...register('brand')}
            placeholder="Örn: Apple, Samsung, Xiaomi"
            disabled={disabled}
            className={cn(errors.brand && 'border-destructive focus-visible:ring-destructive')}
          />
          {errors.brand && (
            <p className="text-sm text-destructive">{errors.brand.message}</p>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model" className={cn(errors.model && 'text-destructive')}>
            Model
          </Label>
          <Input
            id="model"
            {...register('model')}
            placeholder="Örn: iPhone 15 Pro, Galaxy S24"
            disabled={disabled}
            className={cn(errors.model && 'border-destructive focus-visible:ring-destructive')}
          />
          {errors.model && (
            <p className="text-sm text-destructive">{errors.model.message}</p>
          )}
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color" className={cn(errors.color && 'text-destructive')}>
            Renk
          </Label>
          <Select
            value={watch('color') || ''}
            onValueChange={(value) => setValue('color', value)}
            disabled={disabled}
          >
            <SelectTrigger
              id="color"
              className={cn(errors.color && 'border-destructive')}
            >
              <SelectValue placeholder="Renk seçin" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.color && (
            <p className="text-sm text-destructive">{errors.color.message}</p>
          )}
        </div>

        {/* Serial Number (Product Model Serial) */}
        <div className="space-y-2">
          <Label htmlFor="serial_number" className={cn(errors.serial_number && 'text-destructive')}>
            Seri Numarası
          </Label>
          <Input
            id="serial_number"
            {...register('serial_number')}
            placeholder="Ürün modeli seri numarası (opsiyonel)"
            disabled={disabled}
            className={cn(errors.serial_number && 'border-destructive focus-visible:ring-destructive')}
          />
          {errors.serial_number && (
            <p className="text-sm text-destructive">{errors.serial_number.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Bu alan ürün modelinin genel seri numarasıdır. Stok takibi için seri numaraları ayrı olarak girilir.
          </p>
        </div>

        {/* Product Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition" className={cn(errors.condition && 'text-destructive')}>
            Ürün Durumu
          </Label>
          <Select
            value={watch('condition') || ''}
            onValueChange={(value) => setValue('condition', value as ProductCondition)}
            disabled={disabled}
          >
            <SelectTrigger
              id="condition"
              className={cn(errors.condition && 'border-destructive')}
            >
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CONDITIONS.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-sm text-destructive">{errors.condition.message}</p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-muted/50 border rounded-lg">
        <h4 className="font-medium mb-2">Teknik Özellikler Hakkında</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <span className="font-medium">Marka:</span> Ürünün üretici markası</li>
          <li>• <span className="font-medium">Model:</span> Ürünün model adı veya numarası</li>
          <li>• <span className="font-medium">Renk:</span> Ürünün rengi</li>
          <li>• <span className="font-medium">Seri No:</span> Ürün modelinin genel seri numarası</li>
          <li>• <span className="font-medium">Durum:</span> Ürünün fiziksel durumu (Yeni, 2. El, vb.)</li>
        </ul>
      </div>
    </div>
  )
}
