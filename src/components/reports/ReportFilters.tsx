import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ReportFilters as IReportFilters } from '@/services/reportsService'
import { Filter, X } from 'lucide-react'

interface ReportFiltersProps {
  filters: IReportFilters
  onFiltersChange: (filters: IReportFilters) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  showCustomerFilter?: boolean
  showPaymentFilters?: boolean
  showStockFilters?: boolean
}

export const ReportFilters = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  showCustomerFilter = false,
  showPaymentFilters = false,
  showStockFilters = false
}: ReportFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof IReportFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtreler
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Gizle' : 'Göster'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tarih Filtreleri */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Başlangıç Tarihi</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Bitiş Tarihi</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Ödeme Filtreleri */}
            {showPaymentFilters && (
              <>
                <div className="space-y-2">
                  <Label>Ödeme Tipi</Label>
                  <Select
                    value={filters.paymentType || 'all'}
                    onValueChange={(value) => handleFilterChange('paymentType', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="credit">Açık Hesap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ödeme Durumu</Label>
                  <Select
                    value={filters.paymentStatus || 'all'}
                    onValueChange={(value) => handleFilterChange('paymentStatus', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="paid">Ödendi</SelectItem>
                      <SelectItem value="pending">Bekliyor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Stok Filtreleri */}
            {showStockFilters && (
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                  onValueChange={(value) => handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Button onClick={onApplyFilters} size="sm">
              Filtrele
            </Button>
            
            {hasActiveFilters && (
              <Button 
                onClick={onClearFilters} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Temizle
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground ml-auto">
              {hasActiveFilters ? 'Filtre aktif' : 'Filtre yok'}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}