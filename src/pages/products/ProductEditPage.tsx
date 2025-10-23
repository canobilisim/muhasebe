import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProductForm } from '@/components/products/ProductForm'
import { ProductService } from '@/services/productService'
import { SerialNumberService } from '@/services/serialNumberService'
import { ChevronRight, Loader2 } from 'lucide-react'
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
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          category: product.category || '',
          unit: product.unit,
          vat_rate: product.vat_rate,
          is_vat_included: product.is_vat_included,
          purchase_price: product.purchase_price || 0,
          sale_price: product.sale_price || 0,
          description: product.description || '',
          stock_tracking_enabled: product.stock_tracking_enabled,
          serial_number_tracking_enabled: product.serial_number_tracking_enabled,
          brand: product.brand || '',
          model: product.model || '',
          color: product.color || '',
          serial_number: product.serial_number || '',
          condition: product.condition,
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

  const handleSubmit = async (data: ProductFormData, action: 'save' | 'saveAndNew') => {
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
        sale_price: data.sale_price,
        description: data.description || null,
        stock_tracking_enabled: data.stock_tracking_enabled,
        serial_number_tracking_enabled: data.serial_number_tracking_enabled,
        brand: data.brand || null,
        model: data.model || null,
        color: data.color || null,
        serial_number: data.serial_number || null,
        condition: data.condition || null,
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
            toast.warning('Ürün güncellendi ancak seri numaraları eklenirken hata oluştu')
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
      <Layout>
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
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate('/products/manage')}
            className="hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
            aria-label="Ürün yönetimine geri dön"
          >
            Ürün Yönetimi
          </button>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span className="text-gray-900 font-medium">Ürün Düzenle</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span className="text-gray-900 font-medium" aria-current="page">{productName}</span>
        </nav>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
          <p className="text-gray-600 mt-1">
            {productName} ürününün bilgilerini güncelleyin
          </p>
        </div>

        {/* Product Form */}
        <ProductForm
          mode="edit"
          initialData={productData}
          initialSerialNumbers={serialNumbers}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  )
}

export default ProductEditPage
