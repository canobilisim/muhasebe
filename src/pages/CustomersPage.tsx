import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { CustomerTable, CustomerModal, CustomerBalanceReport, OverduePayments } from '@/components/customers'
import { useCustomers } from '@/hooks/useCustomers'
import { Users, UserPlus, Search, Filter, ChevronLeft, ChevronRight, BarChart3, AlertTriangle, DollarSign, UserCheck } from 'lucide-react'
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
    stats,
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

  // İstatistikler (backend'den geliyor)
  const { activeCount, totalBalance, customersWithDebt, totalCount } = stats
  const inactiveCount = totalCount - activeCount

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Yönetimi</h1>
            <p className="text-muted-foreground mt-1">
              Müşteri bilgileri ve borç takibi
            </p>
          </div>
          {activeTab === 'list' && (
            <Button onClick={handleAddCustomer} size="lg" className="shadow-lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Yeni Müşteri
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/30">
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
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Toplam Müşteri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600 font-medium">{activeCount} aktif</span>
                    {inactiveCount > 0 && <span>, {inactiveCount} pasif</span>}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-red-600" />
                    Toplam Alacak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {totalBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tahsil edilecek toplam</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                    Borçlu Müşteri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{customersWithDebt}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    %{((customersWithDebt / totalCount) * 100 || 0).toFixed(0)} borçlu oranı
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="border-t-4 border-t-primary shadow-lg">
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Müşteri ara (ad, telefon, e-posta, vergi no...)"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-11 h-11 text-base"
                    />
                  </div>
                  <div className="flex gap-2">
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
              </CardHeader>
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
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t bg-muted/30">
                        <div className="text-sm text-muted-foreground">
                          Sayfa <span className="font-semibold text-foreground">{pagination.page}</span> / {pagination.totalPages} 
                          <span className="mx-2">•</span>
                          <span className="font-semibold text-foreground">{pagination.totalCount}</span> toplam müşteri
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
