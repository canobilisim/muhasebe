import { UseFormReturn } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VatRateSelector } from './VatRateSelector'
import { PriceCalculator } from './PriceCalculator'
import { cn } from '@/lib/utils'
import type { ProductFormData } from '@/types/product'
import type { FastSaleCategory } from '@/types'
import { FastSaleCategoryService } from '@/services/fastSaleCategoryService'
import { ProductService } from '@/services/productService'

interface ProductInfoTabProps {
  form: UseFormReturn<ProductFormData>
  disabled?: boolean
}

// Category options
const CATEGORY_OPTIONS = [
  'Telefon',
  'Aksesuar',
  'Tablet',
  'Servis Parçası',
  'Diğer'
]

// Unit options
const UNIT_OPTIONS = [
  'Adet',
  'Kutu',
  'Paket',
  'Kg',
  'Litre',
  'Metre'
]

export function ProductInfoTab({ form, disabled }: ProductInfoTabProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = form

  // Watch values for PriceCalculator
  const vatRate = watch('vat_rate')
  const isVatIncluded = watch('is_vat_included')
  const purchasePrice = watch('purchase_price')
  const salePrice = watch('sale_price_1')
  const stockTrackingEnabled = watch('stock_tracking_enabled')
  const serialNumberTrackingEnabled = watch('serial_number_tracking_enabled')
  const showInFastSale = watch('show_in_fast_sale')
  const fastSaleCategoryId = watch('fast_sale_category_id')

  // Fast sale categories state
  const [fastSaleCategories, setFastSaleCategories] = useState<FastSaleCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Load fast sale categories
  useEffect(() => {
    loadFastSaleCategories()
  }, [])

  // Auto-load next order number when category changes
  useEffect(() => {
    if (showInFastSale && fastSaleCategoryId) {
      loadNextOrderNumber(fastSaleCategoryId)
    }
  }, [fastSaleCategoryId, showInFastSale])

  const loadFastSaleCategories = async () => {
    setLoadingCategories(true)
    try {
      const result = await FastSaleCategoryService.getAll()
      if (result.success && result.data) {
        setFastSaleCategories(result.data.filter(cat => cat.is_active))
      }
    } catch (error) {
      console.error('Error loading fast sale categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadNextOrderNumber = async (categoryId: string) => {
    try {
      const nextOrder = await ProductService.getNextOrderNumber(categoryId)
      setValue('fast_sale_order', nextOrder)
    } catch (error) {
      console.error('Error loading next order number:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
        
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className={cn(errors.name && 'text-destructive')}>
            Ürün Adı <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Ürün adını girin"
            disabled={disabled}
            className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Barcode */}
        <div className="space-y-2">
          <Label htmlFor="barcode" className={cn(errors.barcode && 'text-destructive')}>
            Barkod <span className="text-destructive">*</span>
          </Label>
          <Input
            id="barcode"
            {...register('barcode')}
            placeholder="Barkod numarasını girin"
            disabled={disabled}
            className={cn(errors.barcode && 'border-destructive focus-visible:ring-destructive')}
          />
          {errors.barcode && (
            <p className="text-sm text-destructive">{errors.barcode.message}</p>
          )}
        </div>

        {/* Category and Unit Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className={cn(errors.category && 'text-destructive')}>
              Kategori
            </Label>
            <Select
              value={watch('category') || ''}
              onValueChange={(value) => setValue('category', value)}
              disabled={disabled}
            >
              <SelectTrigger
                id="category"
                className={cn(errors.category && 'border-destructive focus-visible:ring-destructive')}
              >
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit" className={cn(errors.unit && 'text-destructive')}>
              Birim <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('unit')}
              onValueChange={(value) => setValue('unit', value)}
              disabled={disabled}
            >
              <SelectTrigger
                id="unit"
                className={cn(errors.unit && 'border-destructive focus-visible:ring-destructive')}
              >
                <SelectValue placeholder="Birim seçin" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && (
              <p className="text-sm text-destructive">{errors.unit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* VAT Rate Section */}
      <div className="pt-6 border-t">
        <VatRateSelector
          value={vatRate}
          onChange={(value) => setValue('vat_rate', value)}
          error={errors.vat_rate?.message}
          disabled={disabled}
        />
      </div>

      {/* Price Calculator Section */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Fiyatlandırma</h3>
        <PriceCalculator
          vatRate={vatRate}
          isVatIncluded={isVatIncluded}
          onVatIncludedChange={(value) => setValue('is_vat_included', value)}
          purchasePrice={purchasePrice}
          onPurchasePriceChange={(value) => setValue('purchase_price', value)}
          salePrice={salePrice}
          onSalePriceChange={(value) => setValue('sale_price_1', value)}
          purchasePriceError={errors.purchase_price?.message}
          salePriceError={errors.sale_price_1?.message}
          disabled={disabled}
        />
      </div>

      {/* Description */}
      <div className="space-y-2 pt-6 border-t">
        <Label htmlFor="description" className={cn(errors.description && 'text-destructive')}>
          Açıklama
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Ürün açıklaması (opsiyonel)"
          rows={4}
          disabled={disabled}
          className={cn(errors.description && 'border-destructive focus-visible:ring-destructive')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Tracking Options */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">Takip Seçenekleri</h3>
        
        {/* Stock Tracking */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="stock-tracking" className="text-base font-medium cursor-pointer">
              Stok Takibi
            </Label>
            <p className="text-sm text-muted-foreground">
              Bu ürün için stok miktarı takip edilsin
            </p>
          </div>
          <Switch
            id="stock-tracking"
            checked={stockTrackingEnabled}
            onCheckedChange={(checked) => setValue('stock_tracking_enabled', checked)}
            disabled={disabled}
          />
        </div>

        {/* Serial Number Tracking */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="serial-tracking" className="text-base font-medium cursor-pointer">
              Seri Numarası Takibi
            </Label>
            <p className="text-sm text-muted-foreground">
              Bu ürün için seri numarası bazlı takip yapılsın
            </p>
          </div>
          <Switch
            id="serial-tracking"
            checked={serialNumberTrackingEnabled}
            onCheckedChange={(checked) => setValue('serial_number_tracking_enabled', checked)}
            disabled={disabled}
          />
        </div>

        {serialNumberTrackingEnabled && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">Not:</span> Seri numarası takibi aktif edildiğinde, 
              her ürün kalemi için benzersiz seri numaraları ekleyebilirsiniz. 
              Satış sırasında hangi seri numarasının satıldığı kaydedilecektir.
            </p>
          </div>
        )}
      </div>

      {/* Fast Sale Settings */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">Hızlı Satış Ayarları</h3>
        
        {/* Show in Fast Sale */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="fast-sale-toggle" className="text-base font-medium cursor-pointer">
              Hızlı Satışta Göster
            </Label>
            <p className="text-sm text-muted-foreground">
              Bu ürün hızlı satış ekranında görünsün
            </p>
          </div>
          <Switch
            id="fast-sale-toggle"
            checked={showInFastSale || false}
            onCheckedChange={(checked) => {
              setValue('show_in_fast_sale', checked)
              if (!checked) {
                setValue('fast_sale_category_id', '')
                setValue('fast_sale_order', 1)
              }
            }}
            disabled={disabled}
          />
        </div>

        {/* Fast Sale Category and Order */}
        {showInFastSale && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="fast-sale-category" className={cn(errors.fast_sale_category_id && 'text-destructive')}>
                Hızlı Satış Kategorisi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={fastSaleCategoryId || ''}
                onValueChange={(value) => setValue('fast_sale_category_id', value)}
                disabled={disabled || loadingCategories}
              >
                <SelectTrigger
                  id="fast-sale-category"
                  className={cn(errors.fast_sale_category_id && 'border-destructive focus-visible:ring-destructive')}
                >
                  <SelectValue placeholder={loadingCategories ? 'Yükleniyor...' : 'Kategori seçin'} />
                </SelectTrigger>
                <SelectContent>
                  {fastSaleCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fast_sale_category_id && (
                <p className="text-sm text-destructive">{errors.fast_sale_category_id.message}</p>
              )}
            </div>

            {/* Order Number */}
            <div className="space-y-2">
              <Label htmlFor="fast-sale-order" className={cn(errors.fast_sale_order && 'text-destructive')}>
                Sıra Numarası (1-99) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fast-sale-order"
                type="number"
                min="1"
                max="99"
                {...register('fast_sale_order', { valueAsNumber: true })}
                placeholder="Sıra numarası"
                disabled={disabled}
                className={cn(errors.fast_sale_order && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.fast_sale_order && (
                <p className="text-sm text-destructive">{errors.fast_sale_order.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Aynı sıra numarasına sahip ürünler varsa otomatik olarak kaydırılacaktır
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
