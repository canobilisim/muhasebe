import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePOSStore } from '@/stores/posStore'
import { User, Search, X } from 'lucide-react'
import type { Customer } from '@/types'

export const CustomerSelector = () => {
  const { selectedCustomer, setSelectedCustomer } = usePOSStore()
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock customers for now - this will be replaced with actual API call
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      phone: '0532 123 45 67',
      email: 'ahmet@example.com',
      address: 'İstanbul',
      tax_number: '12345678901',
      credit_limit: 5000,
      current_balance: 1200,
      is_active: true,
      branch_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Fatma Demir',
      phone: '0533 987 65 43',
      email: 'fatma@example.com',
      address: 'Ankara',
      tax_number: '98765432109',
      credit_limit: 3000,
      current_balance: 0,
      is_active: true,
      branch_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsSearching(false)
    setSearchTerm('')
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
  }

  return (
    <Card>
      <CardHeader className="py-3 lg:py-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <User className="w-4 h-4 lg:w-5 lg:h-5" />
          Müşteri
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        {selectedCustomer ? (
          <div className="space-y-2 lg:space-y-3">
            <div className="p-2 lg:p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm lg:text-base truncate">{selectedCustomer.name}</div>
                  <div className="text-xs lg:text-sm text-gray-600">{selectedCustomer.phone}</div>
                  {selectedCustomer.current_balance > 0 && (
                    <div className="text-xs lg:text-sm text-orange-600 font-medium">
                      Bakiye: {selectedCustomer.current_balance.toFixed(2)} ₺
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCustomer}
                  className="text-gray-500 hover:text-red-600 w-8 h-8 lg:w-9 lg:h-9 p-0 touch-manipulation flex-shrink-0"
                >
                  <X className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearching(true)}
              className="w-full h-8 lg:h-9 text-xs lg:text-sm touch-manipulation"
            >
              Müşteri Değiştir
            </Button>
          </div>
        ) : (
          <div>
            {!isSearching ? (
              <div className="text-center py-3 lg:py-4">
                <User className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-3">Müşteri seçilmedi</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsSearching(true)}
                  className="w-full h-8 lg:h-9 text-xs lg:text-sm touch-manipulation"
                >
                  <Search className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  Müşteri Seç
                </Button>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Müşteri adı veya telefon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 h-8 lg:h-9 text-sm lg:text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsSearching(false)
                      setSearchTerm('')
                    }}
                    className="w-8 h-8 lg:w-9 lg:h-9 p-0 touch-manipulation"
                  >
                    <X className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                </div>
                
                <div className="max-h-40 lg:max-h-48 overflow-y-auto space-y-1 lg:space-y-2">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation"
                      >
                        <div className="font-medium text-xs lg:text-sm truncate">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                        {customer.current_balance > 0 && (
                          <div className="text-xs text-orange-600">
                            Bakiye: {customer.current_balance.toFixed(2)} ₺
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 lg:py-4 text-gray-500 text-xs lg:text-sm">
                      Müşteri bulunamadı
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}