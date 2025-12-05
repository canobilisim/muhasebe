import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts } from '@/hooks/useProducts'
import { ProductService } from '@/services/productService'
import { ProductTable, StockFilters } from '@/components/stock'
import { Package } from 'lucide-react'

const ProductsListPage = () => {
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
    <Layout
      title="Ürün Listesi"
      subtitle="Tüm ürünleri görüntüleyin ve yönetin"
    >
      <div className="space-y-6">
        <StockFilters
          filter={filter}
          onFilterChange={updateFilter}
          categories={categories}
        />

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Ürünler</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{products.length} ürün bulundu</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
