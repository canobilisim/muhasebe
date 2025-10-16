import { useState, useEffect } from 'react'
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

export const StockPage = () => {
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
    updateFilter,
    refreshProducts
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

      if (result.success) {
        setIsProductModalOpen(false)
        setSelectedProduct(null)
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
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.critical_stock_level).length
  const outOfStockProducts = products.filter(p => p.stock_quantity <= 0).length

  return (
    <Layout 
      title="Stok Yönetimi" 
      subtitle="Ürün stok kontrolü ve yönetimi"
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Ürün</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Ürün</p>
                  <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Kritik Stok</p>
                  <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tükenen</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ürün Listesi
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsExcelImportModalOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Excel İçe Aktar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsBulkPriceModalOpen(true)}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Toplu Fiyat Güncelle
                </Button>
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ürün
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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