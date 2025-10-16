import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, Bell, BellOff, Package } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface StockAlertsProps {
  products: Product[]
  onProductEdit: (product: Product) => void
}

export const StockAlerts = ({ products, onProductEdit }: StockAlertsProps) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [criticalProducts, setCriticalProducts] = useState<Product[]>([])
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([])

  useEffect(() => {
    // Filter critical and out of stock products
    const critical = products.filter(p => 
      p.is_active && p.stock_quantity > 0 && p.stock_quantity <= p.critical_stock_level
    )
    const outOfStock = products.filter(p => 
      p.is_active && p.stock_quantity <= 0
    )

    setCriticalProducts(critical)
    setOutOfStockProducts(outOfStock)
  }, [products])

  const toggleAlerts = () => {
    setAlertsEnabled(!alertsEnabled)
    // In a real app, this would save to user preferences
  }

  const getStockStatusBadge = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Tükendi
        </Badge>
      )
    }
    if (product.stock_quantity <= product.critical_stock_level) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Kritik
        </Badge>
      )
    }
    return null
  }

  if (!alertsEnabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-gray-400" />
              Stok Uyarıları (Kapalı)
            </CardTitle>
            <Button variant="outline" onClick={toggleAlerts}>
              <Bell className="w-4 h-4 mr-2" />
              Uyarıları Aç
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Stok uyarıları kapatılmış durumda.</p>
        </CardContent>
      </Card>
    )
  }

  const totalAlerts = criticalProducts.length + outOfStockProducts.length

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-500" />
              Stok Uyarıları
            </CardTitle>
            <Button variant="outline" onClick={toggleAlerts}>
              <BellOff className="w-4 h-4 mr-2" />
              Uyarıları Kapat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600">
            <Package className="w-5 h-5" />
            <p>Tüm ürünlerin stok seviyeleri normal durumda.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            Stok Uyarıları
            <Badge variant="destructive">{totalAlerts}</Badge>
          </CardTitle>
          <Button variant="outline" onClick={toggleAlerts}>
            <BellOff className="w-4 h-4 mr-2" />
            Uyarıları Kapat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Alert */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <p className="font-medium">Stok Uyarısı</p>
            <p className="text-sm">
              {outOfStockProducts.length > 0 && (
                <span>{outOfStockProducts.length} ürün tükendi. </span>
              )}
              {criticalProducts.length > 0 && (
                <span>{criticalProducts.length} ürünün stok seviyesi kritik.</span>
              )}
            </p>
          </div>
        </Alert>

        {/* Out of Stock Products */}
        {outOfStockProducts.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Tükenen Ürünler ({outOfStockProducts.length})
            </h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead className="text-right">Satış Fiyatı</TableHead>
                    <TableHead className="text-center">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outOfStockProducts.slice(0, 5).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.barcode}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right">
                        {getStockStatusBadge(product)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.sale_price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProductEdit(product)}
                        >
                          Stok Ekle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {outOfStockProducts.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                ve {outOfStockProducts.length - 5} ürün daha...
              </p>
            )}
          </div>
        )}

        {/* Critical Stock Products */}
        {criticalProducts.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Kritik Stok Seviyesindeki Ürünler ({criticalProducts.length})
            </h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Mevcut Stok</TableHead>
                    <TableHead className="text-right">Kritik Seviye</TableHead>
                    <TableHead className="text-center">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalProducts.slice(0, 5).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.barcode}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {product.stock_quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {product.critical_stock_level}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProductEdit(product)}
                        >
                          Stok Ekle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {criticalProducts.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                ve {criticalProducts.length - 5} ürün daha...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}