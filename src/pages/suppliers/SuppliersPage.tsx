import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { useSuppliers } from '@/hooks/useSuppliers'
import { Truck, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SupplierTable } from '@/components/suppliers/SupplierTable'

const SuppliersPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showBalanceOnly, setShowBalanceOnly] = useState(false)

  const {
    suppliers,
    loading,
    error,
    pagination,
    updateFilter,
    refreshSuppliers,
    nextPage,
    prevPage
  } = useSuppliers({
    search: searchQuery,
    isActive: showActiveOnly ? true : undefined,
    hasBalance: showBalanceOnly
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    updateFilter({ search: query })
  }

  const handleFilterChange = (filterType: 'active' | 'balance', value: boolean) => {
    if (filterType === 'active') {
      setShowActiveOnly(value)
      updateFilter({ isActive: value ? true : undefined })
    } else {
      setShowBalanceOnly(value)
      updateFilter({ hasBalance: value })
    }
  }

  return (
    <Layout 
      title="Tedarikçi Yönetimi" 
      subtitle="Tedarikçi bilgileri ve borç takibi"
      actions={
        <Button onClick={() => navigate('/suppliers/new')} size="default" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Tedarikçi
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Tedarikçi</p>
                  <p className="text-3xl font-bold text-gray-900">{pagination.totalCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Aktif Tedarikçi</p>
                  <p className="text-3xl font-bold text-green-600">
                    {suppliers.filter(s => s.is_active).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Borç</p>
                  <p className="text-3xl font-bold text-red-600">
                    ₺{suppliers.reduce((sum, s) => sum + (s.current_balance || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <Truck className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Borçlu Tedarikçi</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {suppliers.filter(s => (s.current_balance || 0) > 0).length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Tedarikçi Listesi</CardTitle>
                {pagination.totalCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {pagination.totalCount} tedarikçi bulundu
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tedarikçi adı, firma veya telefon ile ara..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Button
                  variant={showActiveOnly ? "default" : "outline"}
                  size="default"
                  onClick={() => handleFilterChange('active', !showActiveOnly)}
                  className="shadow-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Sadece Aktif
                </Button>
                <Button
                  variant={showBalanceOnly ? "default" : "outline"}
                  size="default"
                  onClick={() => handleFilterChange('balance', !showBalanceOnly)}
                  className="shadow-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Borçlu Tedarikçiler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loading />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4 text-lg">{error}</div>
                <Button variant="outline" onClick={refreshSuppliers} className="shadow-sm">
                  Tekrar Dene
                </Button>
              </div>
            ) : (
              <>
                <SupplierTable
                  suppliers={suppliers}
                  onRefresh={refreshSuppliers}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Sayfa <span className="font-semibold text-gray-900">{pagination.page}</span> / {pagination.totalPages} 
                      <span className="mx-2">•</span>
                      <span className="font-semibold text-gray-900">{pagination.totalCount}</span> toplam tedarikçi
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={prevPage}
                        disabled={pagination.page === 1}
                        className="shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Önceki
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={nextPage}
                        disabled={pagination.page === pagination.totalPages}
                        className="shadow-sm"
                      >
                        Sonraki
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default SuppliersPage
