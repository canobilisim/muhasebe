import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/useProducts'
import { ProductService } from '@/services/productService'
import { Product, ProductInsert, ProductUpdate } from '@/types'
import {
  ProductTable,
  DeleteProductDialog,
  StockFilters,
  ExcelImportModal,
  BulkPriceUpdateModal
} from '@/components/stock'
import { Edit, Plus, Upload, Calculator, Download, Trash2 } from 'lucide-react'
import { ExcelService } from '@/services/excelService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ProductManagePage = () => {
  const navigate = useNavigate()
  const {
    products,
    isLoading,
    error,
    filter,
    deleteProduct,
    bulkImportProducts,
    bulkUpdatePrices,
    updateFilter,
    refreshProducts
  } = useProducts()

  const [categories, setCategories] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false)
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await ProductService.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    }
    fetchCategories()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New product
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleAddProduct()
      }
      // Ctrl/Cmd + E: Export to Excel
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && products.length > 0) {
        e.preventDefault()
        handleExcelExport()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [products])

  const handleAddProduct = useCallback(() => {
    navigate('/products/create')
  }, [navigate])

  const handleEditProduct = useCallback((product: Product) => {
    navigate(`/products/edit/${product.id}`)
  }, [navigate])

  const handleDeleteProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return

    setIsSubmitting(true)
    try {
      const result = await deleteProduct(selectedProduct.id)
      if (result.success) {
        setIsDeleteDialogOpen(false)
        setSelectedProduct(null)
        // Show appropriate message
        if (result.message) {
          toast.success(result.message)
        } else {
          toast.success('Ürün başarıyla silindi')
        }
      } else {
        toast.error(result.error || 'Ürün silinirken hata oluştu')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExcelImport = async (products: ProductInsert[]) => {
    const result = await bulkImportProducts(products)
    setIsExcelImportModalOpen(false)
    if (result.success) {
      refreshProducts()
    }
    return {
      success: result.success,
      error: result.error || undefined
    }
  }

  const handleBulkPriceUpdate = async (updates: { id: string; data: ProductUpdate }[]) => {
    const result = await bulkUpdatePrices(updates)
    setIsBulkPriceModalOpen(false)
    if (result.success) {
      refreshProducts()
    }
    return {
      success: result.success,
      error: result.error || undefined
    }
  }

  const handleExcelExport = () => {
    ExcelService.exportProductsToExcel(products)
  }

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return
    setIsBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedProductIds.length === 0) return

    setIsSubmitting(true)
    try {
      // Delete products one by one and collect results
      const deletePromises = selectedProductIds.map(id => deleteProduct(id))
      const results = await Promise.all(deletePromises)
      
      // Count successful deletions and deactivations
      const deleted = results.filter(r => r.success && !r.message).length
      const deactivated = results.filter(r => r.success && r.message).length
      const failed = results.filter(r => !r.success).length
      
      setIsBulkDeleteDialogOpen(false)
      setSelectedProductIds([])
      
      // Show summary message
      let message = ''
      if (deleted > 0) message += `${deleted} ürün silindi`
      if (deactivated > 0) {
        if (message) message += ', '
        message += `${deactivated} ürün pasife çekildi`
      }
      if (failed > 0) {
        if (message) message += ', '
        message += `${failed} ürün işlenemedi`
      }
      
      if (deleted > 0 || deactivated > 0) {
        toast.success(message)
      } else {
        toast.error('Hiçbir ürün işlenemedi')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout
      title="Ürün Yönetimi"
      subtitle="Ürün ekleyin, düzenleyin veya silin (Kısayollar: Ctrl+N: Yeni, Ctrl+E: Dışa Aktar)"
      actions={
        <div className="flex gap-2" role="group" aria-label="Ürün yönetimi işlemleri">
          <Button
            onClick={handleExcelExport}
            variant="outline"
            disabled={products.length === 0}
            aria-label="Ürünleri Excel dosyasına aktar (Ctrl+E)"
            title="Ürünleri Excel dosyasına aktar (Ctrl+E)"
            className="shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Excel'e Aktar
          </Button>
          <Button
            onClick={() => setIsExcelImportModalOpen(true)}
            variant="outline"
            aria-label="Excel dosyasından ürün içe aktar"
            className="shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            Excel İçe Aktar
          </Button>
          <Button
            onClick={() => setIsBulkPriceModalOpen(true)}
            variant="outline"
            aria-label="Toplu fiyat güncelleme"
            className="shadow-sm"
          >
            <Calculator className="w-4 h-4 mr-2" aria-hidden="true" />
            Toplu Fiyat Güncelle
          </Button>
          <Button 
            onClick={handleAddProduct}
            aria-label="Yeni ürün ekle (Ctrl+N)"
            title="Yeni ürün ekle (Ctrl+N)"
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Yeni Ürün
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        <StockFilters
          filter={filter}
          onFilterChange={updateFilter}
          categories={categories}
        />

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Edit className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Ürünler</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{products.length} ürün bulundu</p>
                </div>
              </div>
              {selectedProductIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleBulkDelete}
                  aria-label={`${selectedProductIds.length} ürünü toplu sil`}
                  className="shadow-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Toplu Sil ({selectedProductIds.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div 
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" 
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            
            <ProductTable
              products={products}
              isLoading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              showBulkSelect={true}
              selectedProducts={selectedProductIds}
              onSelectionChange={setSelectedProductIds}
            />
          </CardContent>
        </Card>

        <ExcelImportModal
          isOpen={isExcelImportModalOpen}
          onClose={() => setIsExcelImportModalOpen(false)}
          onImport={handleExcelImport}
          isLoading={isSubmitting}
        />

        <BulkPriceUpdateModal
          isOpen={isBulkPriceModalOpen}
          onClose={() => setIsBulkPriceModalOpen(false)}
          products={products}
          onUpdate={handleBulkPriceUpdate}
          isLoading={isSubmitting}
        />

        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedProduct(null)
          }}
          onConfirm={handleDeleteConfirm}
          product={selectedProduct}
          isLoading={isSubmitting}
        />

        <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Toplu Silme Onayı</DialogTitle>
              <DialogDescription>
                {selectedProductIds.length} ürünü silmek üzeresiniz. Bu işlem geri alınamaz.
                Devam etmek istiyor musunuz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Siliniyor...' : 'Sil'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default ProductManagePage
