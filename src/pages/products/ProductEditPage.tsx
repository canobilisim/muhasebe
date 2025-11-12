import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProductFormCompact } from '@/components/products/ProductFormCompact'
import { ProductService } from '@/services/productService'
import { SerialNumberService } from '@/services/serialNumberService'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { ProductFormData, SerialNumber } from '@/types/product'

function ProductEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [productData, setProductData] = useState<Partial<ProductFormData> | null>(null)
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([])
  const [productName, setProductName] = useState<string>('')

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        toast.error('Ürün ID bulunamadı')
        navigate('/products/manage')
        return
      }

      setIsLoading(true)
      try {
        const result = await ProductService.getProductWithSerialNumbers(id)

        if (!result.success || !result.data) {
          toast.error(result.error || 'Ürün yüklenirken hata oluştu')
          navigate('/products/manage')
          return
        }

        const product = result.data
        setProductName(product.name)

        // Map product data to form data
        setProductData({
          name: product.name,
          barcode: product.barcode,
          category: product.category || '',
          unit: product.unit || 'Adet',
          vat_rate: product.vat_rate ?? 20,
          is_vat_included: product.is_vat_included ?? false,
          purchase_price: product.purchase_price || 0,
          sale_price_1: (product as any).sale_price_1 || 0,
          sale_price_2: (product as any).sale_price_2 || undefined,
          description: product.description || '',
          stock_tracking_enabled: product.stock_tracking_enabled ?? true,
          serial_number_tracking_enabled: product.serial_number_tracking_enabled ?? false,
          is_active: product.is_active ?? true,
          stock_quantity: product.stock_quantity ?? 0,
          brand: product.brand || '',
          model: product.model || '',
          color: product.color || '',
          serial_number: product.serial_number || '',
          condition: (product.condition as any) || 'Yeni',
        })

        // Set serial numbers if available
        if (product.serialNumbers) {
          setSerialNumbers(product.serialNumbers)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Ürün yüklenirken beklenmeyen bir hata oluştu')
        navigate('/products/manage')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, navigate])

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return

    setIsSubmitting(true)
    
    try {
      // Prepare product data
      const productUpdateData = {
        name: data.name,
        barcode: data.barcode,
        category: data.category || null,
        unit: data.unit,
        vat_rate: data.vat_rate,
        is_vat_included: data.is_vat_included,
        purchase_price: data.purchase_price,
        sale_price: data.sale_price_1, // Set main sale_price to sale_price_1
        sale_price_1: data.sale_price_1,
        sale_price_2: (data.sale_price_2 && !isNaN(data.sale_price_2)) ? data.sale_price_2 : data.sale_price_1, // Boşsa veya NaN ise 1. fiyat kullan
        description: data.description || null,
        stock_tracking_enabled: data.stock_tracking_enabled,
        serial_number_tracking_enabled: data.serial_number_tracking_enabled,
        is_active: data.is_active ?? true,
        stock_quantity: data.stock_quantity ?? 0,
        brand: data.brand || null,
        model: data.model || null,
        color: data.color || null,
        serial_number: data.serial_number || null,
        condition: data.condition || 'Yeni',
      }

      // Update product
      const result = await ProductService.updateProduct(id, productUpdateData)

      if (!result.success) {
        toast.error(result.error || 'Ürün güncellenirken hata oluştu')
        return
      }

      // Handle serial numbers if tracking is enabled
      if (data.serial_number_tracking_enabled && data.serialNumbers) {
        // Get existing serial numbers
        const existingSerialNumbers = serialNumbers.map(sn => sn.serial_number)
        const newSerialNumbers = data.serialNumbers.filter(sn => !existingSerialNumbers.includes(sn))

        // Add new serial numbers
        if (newSerialNumbers.length > 0) {
          const serialNumberResult = await SerialNumberService.bulkAddSerialNumbers(
            id,
            newSerialNumbers
          )

          if (!serialNumberResult.success) {
            console.warn('Ürün güncellendi ancak seri numaraları eklenirken hata oluştu')
          }
        }

        // Remove deleted serial numbers (only available ones can be removed)
        const removedSerialNumbers = serialNumbers.filter(
          sn => sn.status === 'available' && !data.serialNumbers?.includes(sn.serial_number)
        )

        for (const sn of removedSerialNumbers) {
          await SerialNumberService.removeSerialNumber(sn.id)
        }
      }

      toast.success('Ürün başarıyla güncellendi')
      navigate('/products/manage')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Ürün güncellenirken beklenmeyen bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/products/manage')
  }

  if (isLoading) {
    return (
      <Layout
        title="Ürün Düzenle"
        subtitle="Yükleniyor..."
      >
        <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600">Ürün yükleniyor...</p>
            <span className="sr-only">Ürün bilgileri yükleniyor, lütfen bekleyin</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (!productData) {
    return null
  }

  return (
    <Layout
      title={`${productName} - Düzenle`}
      subtitle="Ürün bilgilerini güncelleyin"
      actions={
        <Button
          variant="outline"
          onClick={() => navigate('/products/manage')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Button>
      }
    >
      <ProductFormCompact
        mode="edit"
        initialData={productData}
        initialSerialNumbers={serialNumbers}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  )
}

export default ProductEditPage
