import { useState, useEffect } from 'react'
import { Product, ProductInsert, ProductUpdate, FastSaleCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { FastSaleCategoryService } from '@/services/fastSaleCategoryService'

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
    sale_price_1: 0,
    sale_price_2: 0,
    sale_price_3: 0,
    stock_quantity: 0,
    critical_stock_level: 5,
    is_active: true,
    show_in_fast_sale: false,
    fast_sale_category_id: '',
    fast_sale_order: 1
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [barcodeChecking, setBarcodeChecking] = useState(false)
  const [fastSaleCategories, setFastSaleCategories] = useState<FastSaleCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    loadFastSaleCategories()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode,
        name: product.name,
        category: product.category || '',
        purchase_price: product.purchase_price,
        sale_price_1: product.sale_price_1 || product.sale_price || 0,
        sale_price_2: product.sale_price_2 || product.sale_price || 0,
        sale_price_3: product.sale_price_3 || product.sale_price || 0,
        stock_quantity: product.stock_quantity,
        critical_stock_level: product.critical_stock_level,
        is_active: product.is_active,
        show_in_fast_sale: product.show_in_fast_sale || false,
        fast_sale_category_id: product.fast_sale_category_id || '',
        fast_sale_order: product.fast_sale_order || 1
      })
    }
  }, [product])

  // Kategori değiştiğinde otomatik sıra numarası ata
  useEffect(() => {
    if (formData.show_in_fast_sale && formData.fast_sale_category_id && !product) {
      // Yeni ürün ekleniyorsa otomatik sıra numarası al
      loadNextOrderNumber(formData.fast_sale_category_id);
    }
  }, [formData.fast_sale_category_id, formData.show_in_fast_sale]);

  const loadNextOrderNumber = async (categoryId: string) => {
    try {
      const { ProductService } = await import('@/services/productService');
      const nextOrder = await ProductService.getNextOrderNumber(categoryId);
      setFormData(prev => ({ ...prev, fast_sale_order: nextOrder }));
    } catch (error) {
      console.error('Error loading next order number:', error);
    }
  };

  const loadFastSaleCategories = async () => {
    setLoadingCategories(true)
    try {
      const result = await FastSaleCategoryService.getAll()
      if (result.success && result.data) {
        setFastSaleCategories(result.data)
      }
    } catch (error) {
      console.error('Error loading fast sale categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

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

    if (formData.sale_price_1 <= 0) {
      newErrors.sale_price_1 = 'Fiyat 1 zorunludur ve 0\'dan büyük olmalıdır'
    }

    if (formData.sale_price_2 < 0) {
      newErrors.sale_price_2 = 'Fiyat 2 negatif olamaz'
    }

    if (formData.sale_price_3 < 0) {
      newErrors.sale_price_3 = 'Fiyat 3 negatif olamaz'
    }

    if (formData.sale_price_1 < formData.purchase_price) {
      newErrors.sale_price_1 = 'Satış fiyatı alış fiyatından düşük olamaz'
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stok miktarı negatif olamaz'
    }

    if (formData.critical_stock_level < 0) {
      newErrors.critical_stock_level = 'Kritik stok seviyesi negatif olamaz'
    }

    // Hızlı satış validasyonları
    if (formData.show_in_fast_sale) {
      if (!formData.fast_sale_category_id) {
        newErrors.fast_sale_category_id = 'Hızlı satış kategorisi seçmelisiniz'
      }
      if (formData.fast_sale_order < 1 || formData.fast_sale_order > 99) {
        newErrors.fast_sale_order = 'Sıra numarası 1-99 arasında olmalıdır'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) return

    // NOT: Hızlı satış sıralaması adjust_fast_sale_order trigger'ı tarafından otomatik yapılıyor
    // Manuel güncelleme yapmıyoruz

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
          <Label htmlFor="sale_price_1">Satış Fiyatı 1 (₺) *</Label>
          <Input
            id="sale_price_1"
            type="number"
            min="0"
            step="0.01"
            value={formData.sale_price_1}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              handleInputChange('sale_price_1', value);
              // Eğer fiyat 2 ve 3 boşsa, otomatik doldur
              if (!formData.sale_price_2 || formData.sale_price_2 === 0) {
                handleInputChange('sale_price_2', value);
              }
              if (!formData.sale_price_3 || formData.sale_price_3 === 0) {
                handleInputChange('sale_price_3', value);
              }
            }}
            className={errors.sale_price_1 ? 'border-red-500' : ''}
          />
          {errors.sale_price_1 && (
            <p className="text-sm text-red-600">{errors.sale_price_1}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price_2">Satış Fiyatı 2 (₺)</Label>
          <Input
            id="sale_price_2"
            type="number"
            min="0"
            step="0.01"
            value={formData.sale_price_2}
            onChange={(e) => handleInputChange('sale_price_2', parseFloat(e.target.value) || 0)}
            className={errors.sale_price_2 ? 'border-red-500' : ''}
            placeholder="Boş bırakılırsa Fiyat 1 kullanılır"
          />
          {errors.sale_price_2 && (
            <p className="text-sm text-red-600">{errors.sale_price_2}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price_3">Satış Fiyatı 3 (₺)</Label>
          <Input
            id="sale_price_3"
            type="number"
            min="0"
            step="0.01"
            value={formData.sale_price_3}
            onChange={(e) => handleInputChange('sale_price_3', parseFloat(e.target.value) || 0)}
            className={errors.sale_price_3 ? 'border-red-500' : ''}
            placeholder="Boş bırakılırsa Fiyat 1 kullanılır"
          />
          {errors.sale_price_3 && (
            <p className="text-sm text-red-600">{errors.sale_price_3}</p>
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

      {/* Hızlı Satış Ayarları */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Hızlı Satış Ayarları</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.show_in_fast_sale}
                onChange={(e) => handleInputChange('show_in_fast_sale', e.target.checked)}
                className="rounded"
              />
              Hızlı satışta göster
            </Label>
          </div>

          {formData.show_in_fast_sale && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="fast_sale_category_id">Hızlı Satış Kategorisi *</Label>
                <select
                  id="fast_sale_category_id"
                  value={formData.fast_sale_category_id}
                  onChange={(e) => handleInputChange('fast_sale_category_id', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loadingCategories}
                >
                  <option value="">Kategori Seçin</option>
                  {fastSaleCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.fast_sale_category_id && (
                  <p className="text-sm text-red-600">{errors.fast_sale_category_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fast_sale_order">Sıra Numarası (1-99) *</Label>
                <Input
                  id="fast_sale_order"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.fast_sale_order}
                  onChange={(e) => handleInputChange('fast_sale_order', parseInt(e.target.value) || 1)}
                  className={errors.fast_sale_order ? 'border-red-500' : ''}
                />
                {errors.fast_sale_order && (
                  <p className="text-sm text-red-600">{errors.fast_sale_order}</p>
                )}
              </div>
            </div>
          )}
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