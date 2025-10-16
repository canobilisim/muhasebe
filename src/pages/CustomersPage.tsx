import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { CustomerTable, CustomerModal, CustomerBalanceReport, OverduePayments } from '@/components/customers'
import { useCustomers } from '@/hooks/useCustomers'
import { Users, Plus, Search, Filter, ChevronLeft, ChevronRight, BarChart3, AlertTriangle } from 'lucide-react'
import type { Customer } from '@/types'

export const CustomersPage = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'balance' | 'overdue'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
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
    goToPage,
    nextPage,
    prevPage
  } = useCustomers({
    search: searchQuery,
    isActive: showActiveOnly,
    hasBalance: showBalanceOnly
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    updateFilter({ search: query })
  }

  const handleFilterChange = (filterType: 'active' | 'balance', value: boolean) => {
    if (filterType === 'active') {
      setShowActiveOnly(value)
      updateFilter({ isActive: value })
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
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('list')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Müşteri Listesi
                </Button>
                <Button
                  variant={activeTab === 'balance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('balance')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Bakiye Raporu
                </Button>
                <Button
                  variant={activeTab === 'overdue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('overdue')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Vadesi Geçen
                </Button>
              </div>
              {activeTab === 'list' && (
                <Button onClick={handleAddCustomer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Müşteri
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <>
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Müşteri Listesi
                  {pagination.totalCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pagination.totalCount} müşteri
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Müşteri adı, telefon veya e-posta ile ara..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2">
                    <Button
                      variant={showActiveOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('active', !showActiveOnly)}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Sadece Aktif
                    </Button>
                    <Button
                      variant={showBalanceOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('balance', !showBalanceOnly)}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Borçlu Müşteriler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loading />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">{error}</div>
                    <Button variant="outline" onClick={refreshCustomers}>
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
                      <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Sayfa {pagination.page} / {pagination.totalPages} 
                          ({pagination.totalCount} toplam müşteri)
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={pagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Önceki
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            Sonraki
                            <ChevronRight className="w-4 h-4" />
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