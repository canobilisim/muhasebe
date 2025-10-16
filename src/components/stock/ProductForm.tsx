import { useState, useEffect } from 'react'
import { Product, ProductInsert, ProductUpdate } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface ProductFormProps {
  product?: Product | null
  isLoading: boolean
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  onCheckBarcode?: (barcode: string, excludeId?: string) => Promise<{ success: boolean; data: boolean; error?: string | null }>
}

export const ProductForm = ({ 
  product, 
  isLoading, 
  onSubmit, 
  onCancel,
  onCheckBarcode 
}: ProductFormProps) => {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category: '',
    purchase_price: 0,
    sale_price: 0,
    stock_quantity: 0,
    critical_stock_level: 5,
    is_active: true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [barcodeChecking, setBarcodeChecking] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode,
        name: product.name,
        category: product.category || '',
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        stock_quantity: product.stock_quantity,
        critical_stock_level: product.critical_stock_level,
        is_active: product.is_active
      })
    }
  }, [product])

  const validateForm = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barkod zorunludur'
    } else if (onCheckBarcode) {
      setBarcodeChecking(true)
      try {
        const result = await onCheckBarcode(formData.barcode, product?.id)
        if (result.success && result.data) {
          newErrors.barcode = 'Bu barkod zaten kullanılıyor'
        }
      } catch (error) {
        newErrors.barcode = 'Barkod kontrolü sırasında hata oluştu'
      } finally {
        setBarcodeChecking(false)
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı zorunludur'
    }

    if (formData.purchase_price < 0) {
      newErrors.purchase_price = 'Alış fiyatı negatif olamaz'
    }

    if (formData.sale_price < 0) {
      newErrors.sale_price = 'Satış fiyatı negatif olamaz'
    }

    if (formData.sale_price < formData.purchase_price) {
      newErrors.sale_price = 'Satış fiyatı alış fiyatından düşük olamaz'
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stok miktarı negatif olamaz'
    }

    if (formData.critical_stock_level < 0) {
      newErrors.critical_stock_level = 'Kritik stok seviyesi negatif olamaz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) return

    const result = await onSubmit(formData)
    if (result.success) {
      onCancel() // Close the form on success
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Barkod *</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => handleInputChange('barcode', e.target.value)}
            placeholder="Ürün barkodu"
            className={errors.barcode ? 'border-red-500' : ''}
          />
          {errors.barcode && (
            <p className="text-sm text-red-600">{errors.barcode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Ürün Adı *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ürün adı"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Ürün kategorisi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stok Miktarı</Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
            className={errors.stock_quantity ? 'border-red-500' : ''}
          />
          {errors.stock_quantity && (
            <p className="text-sm text-red-600">{errors.stock_quantity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_price">Alış Fiyatı (₺)</Label>
          <Input
            id="purchase_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.purchase_price}
            onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value) || 0)}
            className={errors.purchase_price ? 'border-red-500' : ''}
          />
          {errors.purchase_price && (
            <p className="text-sm text-red-600">{errors.purchase_price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price">Satış Fiyatı (₺)</Label>
          <Input
            id="sale_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.sale_price}
            onChange={(e) => handleInputChange('sale_price', parseFloat(e.target.value) || 0)}
            className={errors.sale_price ? 'border-red-500' : ''}
          />
          {errors.sale_price && (
            <p className="text-sm text-red-600">{errors.sale_price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="critical_stock_level">Kritik Stok Seviyesi</Label>
          <Input
            id="critical_stock_level"
            type="number"
            min="0"
            value={formData.critical_stock_level}
            onChange={(e) => handleInputChange('critical_stock_level', parseInt(e.target.value) || 0)}
            className={errors.critical_stock_level ? 'border-red-500' : ''}
          />
          {errors.critical_stock_level && (
            <p className="text-sm text-red-600">{errors.critical_stock_level}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded"
            />
            Aktif
          </Label>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <p>Lütfen form hatalarını düzeltin.</p>
        </Alert>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || barcodeChecking}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isLoading || barcodeChecking}
        >
          {(isLoading || barcodeChecking) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {product ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  )
}