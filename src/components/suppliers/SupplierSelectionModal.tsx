import { useState, useEffect } from 'react'
import { Search, Truck, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SupplierService } from '@/services/supplierService'
import type { Supplier } from '@/types/supplier'

interface SupplierSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (supplier: Supplier) => void
  onCreateNew: () => void
}

export function SupplierSelectionModal({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
}: SupplierSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSuppliers()
    }
  }, [isOpen])

  // Filter suppliers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuppliers(suppliers)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(term) ||
          supplier.company_name?.toLowerCase().includes(term) ||
          supplier.phone?.toLowerCase().includes(term) ||
          supplier.email?.toLowerCase().includes(term) ||
          supplier.tax_number?.toLowerCase().includes(term)
      )
      setFilteredSuppliers(filtered)
    }
  }, [searchTerm, suppliers])

  const loadSuppliers = async () => {
    setIsLoading(true)
    try {
      const result = await SupplierService.getSuppliers({ isActive: true }, 1, 100)
      if (result.data) {
        setSuppliers(result.data)
        setFilteredSuppliers(result.data)
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (supplier: Supplier) => {
    onSelect(supplier)
    onClose()
    setSearchTerm('')
  }

  const handleCreateNew = () => {
    onCreateNew()
    onClose()
    setSearchTerm('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tedarikçi Seç
          </DialogTitle>
          <DialogDescription>
            Alış faturası için tedarikçi seçin veya yeni tedarikçi oluşturun
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tedarikçi adı, firma, telefon veya vergi numarası ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Create New Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Tedarikçi Oluştur
          </Button>

          {/* Suppliers List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Yükleniyor...</div>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Truck className="h-12 w-12 mb-2 text-gray-300" />
                <p>Tedarikçi bulunamadı</p>
                {searchTerm && (
                  <p className="text-sm">"{searchTerm}" için sonuç yok</p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelect(supplier)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {supplier.name}
                          </h3>
                          {!supplier.is_active && (
                            <Badge variant="secondary">Pasif</Badge>
                          )}
                        </div>
                        
                        {supplier.company_name && (
                          <p className="text-sm text-gray-600 mb-1">
                            {supplier.company_name}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          {supplier.phone && (
                            <span className="flex items-center gap-1">
                              📞 {supplier.phone}
                            </span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1">
                              ✉️ {supplier.email}
                            </span>
                          )}
                          {supplier.tax_number && (
                            <span className="flex items-center gap-1">
                              🏢 VKN: {supplier.tax_number}
                            </span>
                          )}
                        </div>

                        {supplier.current_balance && supplier.current_balance > 0 && (
                          <div className="mt-2">
                            <Badge variant="destructive" className="text-xs">
                              Borç: ₺{supplier.current_balance.toFixed(2)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(supplier)
                        }}
                      >
                        Seç
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
