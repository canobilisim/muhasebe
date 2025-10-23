import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductInfoTab } from './ProductInfoTab'
import { TechnicalSpecsTab } from './TechnicalSpecsTab'
import { SerialNumberManager } from './SerialNumberManager'
import { Loader2 } from 'lucide-react'
import type { SerialNumber } from '@/types/product'
import { productFormSchema, type ProductFormData } from '@/utils/validationSchemas'
import { showFormErrorSummary } from '@/utils/errorHandling'

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<ProductFormData>
  initialSerialNumbers?: SerialNumber[]
  onSubmit: (data: ProductFormData, action: 'save' | 'saveAndNew') => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function ProductForm({
  mode,
  initialData,
  initialSerialNumbers = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('info')
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
      sale_price: initialData?.sale_price ?? 0,
      description: initialData?.description || '',
      stock_tracking_enabled: initialData?.stock_tracking_enabled ?? true,
      serial_number_tracking_enabled: initialData?.serial_number_tracking_enabled ?? false,
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      color: initialData?.color || '',
      serial_number: initialData?.serial_number || '',
      condition: initialData?.condition,
      serialNumbers: []
    }
  })

  const serialNumberTrackingEnabled = form.watch('serial_number_tracking_enabled')

  // Handle serial number add - memoized for performance
  const handleSerialNumberAdd = useCallback((serialNumber: string) => {
    setSerialNumbers(prev => {
      const newSerialNumber: SerialNumber = {
        id: `temp-${serialNumberIdCounter}`,
        product_id: initialData?.id || '',
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
  }, [serialNumberIdCounter, initialData?.id])

  // Handle serial number remove - memoized for performance
  const handleSerialNumberRemove = useCallback((id: string) => {
    setSerialNumbers(prev => prev.filter(sn => sn.id !== id))
  }, [])

  // Handle bulk serial number add - memoized for performance
  const handleSerialNumberBulkAdd = useCallback((newSerialNumbers: string[]) => {
    setSerialNumbers(prev => {
      const newItems: SerialNumber[] = newSerialNumbers.map((sn, index) => ({
        id: `temp-${serialNumberIdCounter + index}`,
        product_id: initialData?.id || '',
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
  }, [serialNumberIdCounter, initialData?.id])

  // Handle form submission
  const handleSubmit = async (action: 'save' | 'saveAndNew') => {
    const isValid = await form.trigger()
    
    if (!isValid) {
      // Show error summary
      showFormErrorSummary(form.formState.errors)
      
      // Find first tab with errors
      const errors = form.formState.errors
      const hasInfoErrors = errors.name || errors.barcode || errors.category || 
                           errors.unit || errors.vat_rate || errors.purchase_price || 
                           errors.sale_price || errors.description
      const hasTechErrors = errors.brand || errors.model || errors.color || 
                           errors.serial_number || errors.condition

      if (hasInfoErrors) {
        setActiveTab('info')
      } else if (hasTechErrors) {
        setActiveTab('technical')
      }
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
      setActiveTab('info')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Yeni Ürün Ekle' : 'Ürün Düzenle'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6" aria-label={mode === 'create' ? 'Yeni ürün ekleme formu' : 'Ürün düzenleme formu'}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2" aria-label="Ürün form sekmeleri">
              <TabsTrigger value="info" aria-label="Ürün bilgileri sekmesi">Ürün Bilgileri</TabsTrigger>
              <TabsTrigger value="technical" aria-label="Teknik özellikler sekmesi">Teknik Özellikler</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6" role="tabpanel" aria-labelledby="info-tab">
              <ProductInfoTab form={form} disabled={isSubmitting} />
            </TabsContent>

            <TabsContent value="technical" className="space-y-6" role="tabpanel" aria-labelledby="technical-tab">
              <TechnicalSpecsTab form={form} disabled={isSubmitting} />
            </TabsContent>
          </Tabs>

          {/* Serial Number Manager - Show when tracking is enabled */}
          {serialNumberTrackingEnabled && (
            <div className="pt-6 border-t" role="region" aria-label="Seri numarası yönetimi">
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
          <div className="flex items-center justify-end gap-3 pt-6 border-t" role="group" aria-label="Form işlemleri">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Formu iptal et ve geri dön"
            >
              İptal
            </Button>
            
            {mode === 'create' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('saveAndNew')}
                disabled={isSubmitting}
                aria-label="Ürünü kaydet ve yeni ürün ekle"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydet ve Yeni Ekle'
                )}
              </Button>
            )}
            
            <Button
              type="button"
              onClick={() => handleSubmit('save')}
              disabled={isSubmitting}
              aria-label={mode === 'create' ? 'Ürünü kaydet ve kapat' : 'Ürün değişikliklerini kaydet'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Kaydediliyor...
                </>
              ) : (
                mode === 'create' ? 'Kaydet ve Kapat' : 'Kaydet'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
