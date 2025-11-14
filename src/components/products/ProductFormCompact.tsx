import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { SerialNumberManager } from './SerialNumberManager'
import { CategoryCombobox } from './CategoryCombobox'
import { Loader2, Package, DollarSign, Settings, Barcode } from 'lucide-react'
import type { SerialNumber } from '@/types/product'
import { productFormSchema, type ProductFormData } from '@/utils/validationSchemas'
import { showFormErrorSummary, getFieldErrorClass } from '@/utils/errorHandling'
import toast from 'react-hot-toast'

interface ProductFormCompactProps {
  mode: 'create' | 'edit'
  initialData?: Partial<ProductFormData>
  initialSerialNumbers?: SerialNumber[]
  onSubmit: (data: ProductFormData, action: 'save' | 'saveAndNew') => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function ProductFormCompact({
  mode,
  initialData,
  initialSerialNumbers = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}: ProductFormCompactProps) {
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>(initialSerialNumbers)
  const [serialNumberIdCounter, setSerialNumberIdCounter] = useState(initialSerialNumbers.length)

  // Initialize form with default values
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      barcode: initialData?.barcode || '',
      category: initialData?.category || '',
      unit: initialData?.unit || 'Adet',
      vat_rate: initialData?.vat_rate ?? 20,
      is_vat_included: initialData?.is_vat_included ?? false,
      purchase_price: initialData?.purchase_price ?? 0,
      sale_price_1: initialData?.sale_price_1 ?? 0,
      sale_price_2: initialData?.sale_price_2 ?? undefined,
      description: initialData?.description || '',
      stock_tracking_enabled: initialData?.stock_tracking_enabled ?? true,
      serial_number_tracking_enabled: initialData?.serial_number_tracking_enabled ?? false,
      is_active: initialData?.is_active ?? true,
      stock_quantity: initialData?.stock_quantity ?? 0,
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      color: initialData?.color || '',
      serial_number: initialData?.serial_number || '',
      condition: initialData?.condition || 'Yeni',
      serialNumbers: []
    }
  })

  const { register, watch, setValue, formState: { errors } } = form
  const serialNumberTrackingEnabled = watch('serial_number_tracking_enabled')
  const stockTrackingEnabled = watch('stock_tracking_enabled')
  const isActive = watch('is_active') ?? true
  const [showManualVat, setShowManualVat] = useState(false)

  // Generate barcode - EAN-13 format (12 digits + check digit)
  const generateBarcode = () => {
    // 12 haneli rastgele sayı oluştur (EAN-13 için 12 hane + kontrol hanesi)
    const prefix = '200' // İç kullanım için önek
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
    const barcode12 = prefix + random
    
    // EAN-13 kontrol hanesi hesaplama
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode12[i], 10) // parseInt'e 10 tabanı eklendi
      sum += i % 2 === 0 ? digit : digit * 3
    }
    const checkDigit = (10 - (sum % 10)) % 10
    
    const barcode = barcode12 + checkDigit
    setValue('barcode', barcode)
    toast.success('Barkod oluşturuldu')
  }

  // Handle serial number operations
  const handleSerialNumberAdd = useCallback((serialNumber: string) => {
    setSerialNumbers(prev => {
      const newSerialNumber: SerialNumber = {
        id: `temp-${serialNumberIdCounter}`,
        product_id: (initialData as any)?.id || '',
        serial_number: serialNumber,
        status: 'available',
        added_date: new Date().toISOString(),
        sold_date: null,
        sale_id: null,
        created_at: new Date().toISOString()
      }
      return [...prev, newSerialNumber]
    })
    setSerialNumberIdCounter(prev => prev + 1)
  }, [serialNumberIdCounter, (initialData as any)?.id])

  const handleSerialNumberRemove = useCallback((id: string) => {
    setSerialNumbers(prev => prev.filter(sn => sn.id !== id))
  }, [])

  const handleSerialNumberBulkAdd = useCallback((newSerialNumbers: string[]) => {
    setSerialNumbers(prev => {
      const newItems: SerialNumber[] = newSerialNumbers.map((sn, index) => ({
        id: `temp-${serialNumberIdCounter + index}`,
        product_id: (initialData as any)?.id || '',
        serial_number: sn,
        status: 'available' as const,
        added_date: new Date().toISOString(),
        sold_date: null,
        sale_id: null,
        created_at: new Date().toISOString()
      }))
      return [...prev, ...newItems]
    })
    setSerialNumberIdCounter(prev => prev + newSerialNumbers.length)
  }, [serialNumberIdCounter, (initialData as any)?.id])

  // Handle form submission
  const handleFormSubmit = async (action: 'save' | 'saveAndNew') => {
    const isValid = await form.trigger()
    
    if (!isValid) {
      showFormErrorSummary(form.formState.errors)
      return
    }

    const formData = form.getValues()
    
    // Add serial numbers to form data
    const dataWithSerialNumbers: ProductFormData = {
      ...formData,
      serialNumbers: serialNumbers
        .filter(sn => sn.status === 'available')
        .map(sn => sn.serial_number)
    }

    await onSubmit(dataWithSerialNumbers, action)

    // If saveAndNew, reset form and serial numbers
    if (action === 'saveAndNew') {
      form.reset()
      setSerialNumbers([])
      setSerialNumberIdCounter(0)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Left Column - Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Temel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm">Ürün Adı *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ürün adını girin"
              className={`h-9 ${getFieldErrorClass(!!errors.name)}`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Barcode */}
          <div className="space-y-1">
            <Label htmlFor="barcode" className="text-sm">Barkod *</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Barkod numarası"
                className={`h-9 flex-1 ${getFieldErrorClass(!!errors.barcode)}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateBarcode}
                disabled={isSubmitting}
                className="h-9 px-3"
                title="Barkod Oluştur"
              >
                <Barcode className="h-4 w-4" />
              </Button>
            </div>
            {errors.barcode && (
              <p className="text-xs text-red-500">{errors.barcode.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm">Kategori</Label>
            <CategoryCombobox
              value={watch('category') || ''}
              onChange={(value) => setValue('category', value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Unit */}
          <div className="space-y-1">
            <Label htmlFor="unit" className="text-sm">Birim *</Label>
            <Select
              value={watch('unit')}
              onValueChange={(value) => setValue('unit', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Birim seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Adet">Adet</SelectItem>
                <SelectItem value="Kg">Kilogram</SelectItem>
                <SelectItem value="Lt">Litre</SelectItem>
                <SelectItem value="M">Metre</SelectItem>
                <SelectItem value="M2">Metrekare</SelectItem>
                <SelectItem value="M3">Metreküp</SelectItem>
                <SelectItem value="Paket">Paket</SelectItem>
                <SelectItem value="Kutu">Kutu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">Açıklama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Ürün açıklaması"
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Middle Column - Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Fiyat Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Purchase Price */}
          <div className="space-y-1">
            <Label htmlFor="purchase_price" className="text-sm">Alış Fiyatı *</Label>
            <Input
              id="purchase_price"
              type="number"
              step="0.01"
              min="0"
              {...register('purchase_price', { valueAsNumber: true })}
              placeholder="0.00"
              className={`h-9 ${getFieldErrorClass(!!errors.purchase_price)}`}
              disabled={isSubmitting}
            />
            {errors.purchase_price && (
              <p className="text-xs text-red-500">{errors.purchase_price.message}</p>
            )}
          </div>

          {/* Sale Price 1 */}
          <div className="space-y-1">
            <Label htmlFor="sale_price_1" className="text-sm">1. Satış Fiyatı *</Label>
            <Input
              id="sale_price_1"
              type="number"
              step="0.01"
              min="0"
              {...register('sale_price_1', { valueAsNumber: true })}
              placeholder="0.00"
              className={`h-9 ${getFieldErrorClass(!!errors.sale_price_1)}`}
              disabled={isSubmitting}
            />
            {errors.sale_price_1 && (
              <p className="text-xs text-red-500">{errors.sale_price_1.message}</p>
            )}
          </div>

          {/* Sale Price 2 */}
          <div className="space-y-1">
            <Label htmlFor="sale_price_2" className="text-sm">2. Satış Fiyatı</Label>
            <Input
              id="sale_price_2"
              type="number"
              step="0.01"
              min="0"
              {...register('sale_price_2', { 
                setValueAs: (v) => v === '' || v === null || v === undefined ? undefined : parseFloat(v)
              })}
              placeholder="Boş bırakılırsa 1. fiyat kullanılır"
              className={`h-9 ${getFieldErrorClass(!!errors.sale_price_2)}`}
              disabled={isSubmitting}
            />
            {errors.sale_price_2 && (
              <p className="text-xs text-red-500">{errors.sale_price_2.message}</p>
            )}
          </div>

          {/* VAT Rate */}
          <div className="space-y-1">
            <Label htmlFor="vat_rate" className="text-sm">KDV Oranı (%) *</Label>
            {!showManualVat ? (
              <Select
                value={watch('vat_rate')?.toString()}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowManualVat(true)
                    return
                  }
                  setValue('vat_rate', parseInt(value))
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="KDV oranı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">%0</SelectItem>
                  <SelectItem value="1">%1</SelectItem>
                  <SelectItem value="10">%10</SelectItem>
                  <SelectItem value="20">%20</SelectItem>
                  <SelectItem value="custom">Manuel Giriş</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={watch('vat_rate') ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  setValue('vat_rate', val === '' ? 0 : parseFloat(val))
                }}
                placeholder="KDV oranını girin (örn: 18)"
                className="h-9"
                disabled={isSubmitting}
                autoFocus
              />
            )}
          </div>

          {/* VAT Included */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_vat_included"
              checked={watch('is_vat_included')}
              onCheckedChange={(checked) => setValue('is_vat_included', !!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_vat_included" className="text-sm">
              Fiyatlara KDV dahil
            </Label>
          </div>

          {/* Technical Specs */}
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Teknik Özellikler</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="brand" className="text-sm">Marka</Label>
                <Input
                  id="brand"
                  {...register('brand')}
                  placeholder="Marka"
                  className="h-9"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="model" className="text-sm">Model</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="Model"
                  className="h-9"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="color" className="text-sm">Renk</Label>
              <Select
                value={watch('color') || ''}
                onValueChange={(value) => setValue('color', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Renk seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Siyah">Siyah</SelectItem>
                  <SelectItem value="Beyaz">Beyaz</SelectItem>
                  <SelectItem value="Gri">Gri</SelectItem>
                  <SelectItem value="Gümüş">Gümüş</SelectItem>
                  <SelectItem value="Altın">Altın</SelectItem>
                  <SelectItem value="Mavi">Mavi</SelectItem>
                  <SelectItem value="Kırmızı">Kırmızı</SelectItem>
                  <SelectItem value="Yeşil">Yeşil</SelectItem>
                  <SelectItem value="Sarı">Sarı</SelectItem>
                  <SelectItem value="Turuncu">Turuncu</SelectItem>
                  <SelectItem value="Mor">Mor</SelectItem>
                  <SelectItem value="Pembe">Pembe</SelectItem>
                  <SelectItem value="Kahverengi">Kahverengi</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Serial Number (Product Model Serial) */}
            <div className="space-y-1">
              <Label htmlFor="serial_number" className="text-sm">Model Seri No</Label>
              <Input
                id="serial_number"
                {...register('serial_number')}
                placeholder="Ürün modeli seri numarası"
                className="h-9"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Ürün modelinin genel seri numarası (opsiyonel)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Settings & Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Ayarlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stock Tracking */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stock_tracking_enabled"
              checked={stockTrackingEnabled}
              onCheckedChange={(checked) => setValue('stock_tracking_enabled', !!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="stock_tracking_enabled" className="text-sm">
              Stok takibi yap
            </Label>
          </div>

          {/* Stock Quantity - Show when stock tracking is enabled */}
          {stockTrackingEnabled && (
            <div className="space-y-1 pl-6">
              <Label htmlFor="stock_quantity" className="text-sm">Mevcut Stok</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="1"
                {...register('stock_quantity', { valueAsNumber: true })}
                placeholder="0"
                className={`h-9 ${getFieldErrorClass(!!errors.stock_quantity)}`}
                disabled={isSubmitting}
              />
              {errors.stock_quantity && (
                <p className="text-xs text-red-500">{errors.stock_quantity.message}</p>
              )}
            </div>
          )}

          {/* Serial Number Tracking */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="serial_number_tracking_enabled"
              checked={serialNumberTrackingEnabled}
              onCheckedChange={(checked) => setValue('serial_number_tracking_enabled', !!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="serial_number_tracking_enabled" className="text-sm">
              Seri numarası takibi yap
            </Label>
          </div>

          {/* Product Condition */}
          <div className="space-y-1">
            <Label htmlFor="condition" className="text-sm">Ürün Durumu *</Label>
            <Select
              value={watch('condition') || 'Yeni'}
              onValueChange={(value) => setValue('condition', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yeni">Yeni</SelectItem>
                <SelectItem value="2. El">2. El</SelectItem>
                <SelectItem value="Yenilenmiş">Yenilenmiş</SelectItem>
                <SelectItem value="Demo">Demo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active/Inactive Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Ürün Durumu
              </Label>
              <p className="text-xs text-muted-foreground">
                {isActive ? 'Aktif' : 'Pasif'}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Serial Numbers Section */}
          {serialNumberTrackingEnabled && (
            <div className="pt-4 border-t">
              <SerialNumberManager
                serialNumbers={serialNumbers}
                onAdd={handleSerialNumberAdd}
                onRemove={handleSerialNumberRemove}
                onBulkAdd={handleSerialNumberBulkAdd}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t space-y-3">
            <Button
              type="button"
              onClick={() => handleFormSubmit('save')}
              disabled={isSubmitting}
              className="w-full h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
            
            {mode === 'create' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleFormSubmit('saveAndNew')}
                disabled={isSubmitting}
                className="w-full h-10"
              >
                Kaydet ve Yeni Ekle
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full h-10"
            >
              İptal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}