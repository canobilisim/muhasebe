import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts } from '@/hooks/useProducts'
import { ProductService } from '@/services/productService'
import { ProductTable, StockFilters } from '@/components/stock'
import { Package } from 'lucide-react'

export const ProductsListPage = () => {
  const {
    products,
    isLoading,
    error,
    filter,
    updateFilter
  } = useProducts()

  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await ProductService.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    }
    fetchCategories()
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ürün Listesi</h1>
            <p className="text-gray-600 mt-1">Tüm ürünleri görüntüleyin ve yönetin</p>
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
              <Package className="w-5 h-5" />
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
              onEdit={() => {}}
              onDelete={() => {}}
              readOnly={true}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default ProductsListPage
