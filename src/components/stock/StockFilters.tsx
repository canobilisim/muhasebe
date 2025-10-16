import { useState, useEffect } from 'react'
import { ProductFilter } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X, AlertTriangle } from 'lucide-react'

interface StockFiltersProps {
  filter: ProductFilter
  onFilterChange: (filter: ProductFilter) => void
  categories: string[]
}

export const StockFilters = ({ filter, onFilterChange, categories }: StockFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filter.search || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filter, search: searchTerm })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleCategoryChange = (category: string) => {
    onFilterChange({ 
      ...filter, 
      category: category === 'all' ? undefined : category 
    })
  }

  const handleStatusChange = (status: string) => {
    switch (status) {
      case 'all':
        onFilterChange({ ...filter, isActive: undefined, isLowStock: undefined })
        break
      case 'active':
        onFilterChange({ ...filter, isActive: true, isLowStock: undefined })
        break
      case 'inactive':
        onFilterChange({ ...filter, isActive: false, isLowStock: undefined })
        break
      case 'low-stock':
        onFilterChange({ ...filter, isActive: undefined, isLowStock: true })
        break
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    onFilterChange({})
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filter.search) count++
    if (filter.category) count++
    if (filter.isActive !== undefined) count++
    if (filter.isLowStock) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Ürün adı veya barkod ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filter.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              filter.isLowStock ? 'low-stock' :
              filter.isActive === true ? 'active' :
              filter.isActive === false ? 'inactive' : 'all'
            }
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
              <SelectItem value="low-stock">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Kritik Stok
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Temizle
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filter.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Arama: "{filter.search}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  setSearchTerm('')
                  onFilterChange({ ...filter, search: undefined })
                }}
              />
            </Badge>
          )}
          {filter.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Kategori: {filter.category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filter, category: undefined })}
              />
            </Badge>
          )}
          {filter.isActive === true && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Aktif Ürünler
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filter, isActive: undefined })}
              />
            </Badge>
          )}
          {filter.isActive === false && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Pasif Ürünler
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filter, isActive: undefined })}
              />
            </Badge>
          )}
          {filter.isLowStock && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Kritik Stok
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filter, isLowStock: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}