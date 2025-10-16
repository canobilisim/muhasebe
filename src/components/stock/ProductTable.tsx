import { useState, memo, useMemo, useCallback } from 'react'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, AlertTriangle } from 'lucide-react'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export const ProductTable = memo<ProductTableProps>(({ products, isLoading, onEdit, onDelete }) => {
  const [sortBy, setSortBy] = useState<keyof Product>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = useCallback((column: keyof Product) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }, [sortBy, sortOrder])

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue, 'tr')
          : bValue.localeCompare(aValue, 'tr')
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
  }, [products, sortBy, sortOrder])

  const getStockStatus = useCallback((product: Product) => {
    if (product.stock_quantity <= 0) {
      return { label: 'Tükendi', variant: 'destructive' as const, icon: AlertTriangle }
    }
    if (product.stock_quantity <= product.critical_stock_level) {
      return { label: 'Kritik', variant: 'destructive' as const, icon: AlertTriangle }
    }
    return { label: 'Normal', variant: 'default' as const, icon: null }
  }, [])



  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Henüz ürün bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('barcode')}
            >
              Barkod
              {sortBy === 'barcode' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('name')}
            >
              Ürün Adı
              {sortBy === 'name' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('category')}
            >
              Kategori
              {sortBy === 'category' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('stock_quantity')}
            >
              Stok
              {sortBy === 'stock_quantity' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead className="text-center">Durum</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('purchase_price')}
            >
              Alış Fiyatı
              {sortBy === 'purchase_price' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('sale_price')}
            >
              Satış Fiyatı
              {sortBy === 'sale_price' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead className="text-center">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const StatusIcon = stockStatus.icon
            
            return (
              <TableRow key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                <TableCell className="font-mono text-sm">
                  {product.barcode}
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                  {!product.is_active && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Pasif
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {product.category || '-'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {product.stock_quantity}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit mx-auto">
                    {StatusIcon && <StatusIcon className="w-3 h-3" />}
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(product.purchase_price)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(product.sale_price)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
})

ProductTable.displayName = 'ProductTable'