import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { CustomerTable, CustomerModal, CustomerBalanceReport, OverduePayments } from '@/components/customers'
import { useCustomers } from '@/hooks/useCustomers'
import { Users, Plus, Search, Filter, ChevronLeft, ChevronRight, BarChart3, AlertTriangle } from 'lucide-react'
import type { Customer } from '@/types'

const CustomersPage = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'balance' | 'overdue'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showBalanceOnly, setShowBalanceOnly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  const {
    customers,
    loading,
    error,
    pagination,
    updateFilter,
    refreshCustomers,
    nextPage,
    prevPage
  } = useCustomers({
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
      // Filtre kapalıyken undefined gönder (tüm müşterileri göster)
      updateFilter({ isActive: value ? true : undefined })
    } else {
      setShowBalanceOnly(value)
      updateFilter({ hasBalance: value })
    }
  }

  const handleAddCustomer = () => {
    setEditingCustomer(undefined)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleSaveCustomer = () => {
    refreshCustomers()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(undefined)
  }

  return (
    <Layout 
      title="Müşteri Yönetimi" 
      subtitle="Müşteri bilgileri ve borç takibi"
      actions={
        activeTab === 'list' && (
          <Button onClick={handleAddCustomer} size="default" className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Müşteri
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'list' ? 'default' : 'outline'}
                size="default"
                onClick={() => setActiveTab('list')}
                className="shadow-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Müşteri Listesi
              </Button>
              <Button
                variant={activeTab === 'balance' ? 'default' : 'outline'}
                size="default"
                onClick={() => setActiveTab('balance')}
                className="shadow-sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Bakiye Raporu
              </Button>
              <Button
                variant={activeTab === 'overdue' ? 'default' : 'outline'}
                size="default"
                onClick={() => setActiveTab('overdue')}
                className="shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Vadesi Geçen
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <>
            {/* Search and Filters */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Müşteri Listesi</CardTitle>
                    {pagination.totalCount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {pagination.totalCount} müşteri bulundu
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
                      placeholder="Müşteri adı, telefon veya e-posta ile ara..."
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
                      Borçlu Müşteriler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Table */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loading />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-600 mb-4 text-lg">{error}</div>
                    <Button variant="outline" onClick={refreshCustomers} className="shadow-sm">
                      Tekrar Dene
                    </Button>
                  </div>
                ) : (
                  <>
                    <CustomerTable
                      customers={customers}
                      onEdit={handleEditCustomer}
                      onRefresh={refreshCustomers}
                    />

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t bg-gray-50">
                        <div className="text-sm text-gray-600">
                          Sayfa <span className="font-semibold text-gray-900">{pagination.page}</span> / {pagination.totalPages} 
                          <span className="mx-2">•</span>
                          <span className="font-semibold text-gray-900">{pagination.totalCount}</span> toplam müşteri
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
          </>
        )}

        {activeTab === 'balance' && <CustomerBalanceReport />}
        
        {activeTab === 'overdue' && <OverduePayments />}
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />
    </Layout>
  )
}

export default CustomersPage
