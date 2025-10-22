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
  ExcelImportModal,
  BulkPriceUpdateModal
} from '@/components/stock'
import { Edit, Plus, Upload, Calculator } from 'lucide-react'

export const ProductManagePage = () => {
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

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return

    setIsSubmitting(true)
    try {
      await deleteProduct(selectedProduct.id)
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
    } finally {
      setIsSubmitting(false)
    }
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

      setIsProductModalOpen(false)
      setSelectedProduct(null)

      if (result.success) {
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

  const handleExcelImport = async (products: ProductInsert[]) => {
    await bulkImportProducts(products)
    setIsExcelImportModalOpen(false)
    refreshProducts()
  }

  const handleBulkPriceUpdate = async (updates: { id: string; data: ProductUpdate }[]) => {
    await bulkUpdatePrices(updates)
    setIsBulkPriceModalOpen(false)
    refreshProducts()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
            <p className="text-gray-600 mt-1">Ürün ekleyin, düzenleyin veya silin</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsExcelImportModalOpen(true)}
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Excel İçe Aktar
            </Button>
            <Button
              onClick={() => setIsBulkPriceModalOpen(true)}
              variant="outline"
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

        <StockFilters
          filter={filter}
          onFilterChange={updateFilter}
          categories={categories}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Ürünler ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <ProductTable
              products={products}
              isLoading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </CardContent>
        </Card>

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false)
            setSelectedProduct(null)
          }}
          onSubmit={handleProductSubmit}
          product={selectedProduct}
          isLoading={isSubmitting}
          onCheckBarcode={checkBarcodeExists}
        />

        <ExcelImportModal
          isOpen={isExcelImportModalOpen}
          onClose={() => setIsExcelImportModalOpen(false)}
          onImport={handleExcelImport}
        />

        <BulkPriceUpdateModal
          isOpen={isBulkPriceModalOpen}
          onClose={() => setIsBulkPriceModalOpen(false)}
          onUpdate={handleBulkPriceUpdate}
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
      </div>
    </Layout>
  )
}

export default ProductManagePage
