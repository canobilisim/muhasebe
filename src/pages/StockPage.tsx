import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/hooks/useProducts'
import { ProductService } from '@/services/productService'
import { Product, ProductInsert, ProductUpdate } from '@/types'
import {
  ProductTable,
  ProductModal,
  DeleteProductDialog,
  StockFilters,
  StockAlerts,
  ExcelImportModal,
  BulkPriceUpdateModal
} from '@/components/stock'
import { Package, Plus, AlertTriangle, Upload, Calculator } from 'lucide-react'
import { Alert } from '@/components/ui/alert'

const StockPage = () => {
  const {
    products,
    isLoading,
    error,
    filter,
    createProduct,
    updateProduct,
    deleteProduct,
    checkBarcodeExists,
    bulkImportProducts,
    bulkUpdatePrices,
    updateFilter
  } = useProducts()

  const [categories, setCategories] = useState<string[]>([])
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false)
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await ProductService.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    }
    fetchCategories()
  }, [])

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsProductModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleProductSubmit = async (data: ProductInsert | ProductUpdate) => {
    setIsSubmitting(true)
    
    try {
      let result
      if (selectedProduct) {
        result = await updateProduct(selectedProduct.id, data as ProductUpdate)
      } else {
        result = await createProduct(data as ProductInsert)
      }

      // Modal'ı her zaman kapat (başarılı veya başarısız)
      setIsProductModalOpen(false)
      setSelectedProduct(null)

      if (result.success) {
        // Refresh categories in case a new one was added
        const categoriesResponse = await ProductService.getCategories()
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data)
        }
      }

      return result
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const handleCloseModals = () => {
    setIsProductModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsExcelImportModalOpen(false)
    setIsBulkPriceModalOpen(false)
    setSelectedProduct(null)
  }

  const handleExcelImport = async (products: ProductInsert[]) => {
    return await bulkImportProducts(products)
  }

  const handleBulkPriceUpdate = async (updates: { id: string; data: ProductUpdate }[]) => {
    return await bulkUpdatePrices(updates)
  }

  // Get statistics
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.critical_stock_level || 0)).length
  const outOfStockProducts = products.filter(p => p.stock_quantity <= 0).length

  return (
    <Layout 
      title="Stok Yönetimi" 
      subtitle="Ürün stok kontrolü ve yönetimi"
      actions={
        <Button onClick={handleAddProduct} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ürün
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Aktif Ürün</p>
                  <p className="text-3xl font-bold text-green-600">{activeProducts}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Kritik Stok</p>
                  <p className="text-3xl font-bold text-orange-600">{lowStockProducts}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Tükenen</p>
                  <p className="text-3xl font-bold text-red-600">{outOfStockProducts}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts */}
        <StockAlerts 
          products={products}
          onProductEdit={handleEditProduct}
        />

        {/* Main Content */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Ürün Listesi</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsExcelImportModalOpen(true)}
                  className="shadow-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Excel İçe Aktar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsBulkPriceModalOpen(true)}
                  className="shadow-sm"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Toplu Fiyat Güncelle
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Filters */}
            <StockFilters
              filter={filter}
              onFilterChange={updateFilter}
              categories={categories}
            />

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <p>{error}</p>
              </Alert>
            )}

            {/* Products Table */}
            <ProductTable
              products={products}
              isLoading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </CardContent>
        </Card>

        {/* Product Modal */}
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={handleCloseModals}
          product={selectedProduct}
          isLoading={isSubmitting}
          onSubmit={handleProductSubmit}
          onCheckBarcode={checkBarcodeExists}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseModals}
          product={selectedProduct}
          isLoading={isSubmitting}
          onConfirm={handleDeleteConfirm}
        />

        {/* Excel Import Modal */}
        <ExcelImportModal
          isOpen={isExcelImportModalOpen}
          onClose={handleCloseModals}
          onImport={handleExcelImport}
          isLoading={isSubmitting}
        />

        {/* Bulk Price Update Modal */}
        <BulkPriceUpdateModal
          isOpen={isBulkPriceModalOpen}
          onClose={handleCloseModals}
          products={products}
          onUpdate={handleBulkPriceUpdate}
          isLoading={isSubmitting}
        />
      </div>
    </Layout>
  )
}

export default StockPage
