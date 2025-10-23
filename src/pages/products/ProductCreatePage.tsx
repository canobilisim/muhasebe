import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProductFormCompact } from '@/components/products/ProductFormCompact'
import { ProductService } from '@/services/productService'
import { SerialNumberService } from '@/services/serialNumberService'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { ProductFormData } from '@/types/product'

function ProductCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ProductFormData, action: 'save' | 'saveAndNew') => {
    setIsSubmitting(true)
    
    try {
      // Prepare product data
      const productData = {
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

      // Create product
      const result = await ProductService.createProduct(productData)

      if (!result.success || !result.data) {
        toast.error(result.error || 'Ürün oluşturulurken hata oluştu')
        return
      }

      // If serial number tracking is enabled and serial numbers provided, add them
      if (data.serial_number_tracking_enabled && data.serialNumbers && data.serialNumbers.length > 0) {
        const serialNumberResult = await SerialNumberService.bulkAddSerialNumbers(
          result.data.id,
          data.serialNumbers
        )

        if (!serialNumberResult.success) {
          toast.warning('Ürün oluşturuldu ancak seri numaraları eklenirken hata oluştu')
        }
      }

      toast.success('Ürün başarıyla oluşturuldu')

      // Navigate based on action
      if (action === 'save') {
        navigate('/products/manage')
      }
      // If saveAndNew, form will be reset by ProductForm component
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Ürün oluşturulurken beklenmeyen bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/products/manage')
  }

  return (
    <Layout
      title="Yeni Ürün Ekle"
      subtitle="Hızlı ve kolay ürün ekleme"
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
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Layout>
  )
}

export default ProductCreatePage
