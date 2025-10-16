import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calculator, AlertTriangle } from 'lucide-react'
import { Product, ProductUpdate } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface BulkPriceUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onUpdate: (updates: { id: string; data: ProductUpdate }[]) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

type UpdateType = 'percentage' | 'fixed' | 'margin'
type PriceType = 'purchase' | 'sale' | 'both'

export const BulkPriceUpdateModal = ({ 
  isOpen, 
  onClose, 
  products, 
  onUpdate, 
  isLoading 
}: BulkPriceUpdateModalProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [updateType, setUpdateType] = useState<UpdateType>('percentage')
  const [priceType, setPriceType] = useState<PriceType>('sale')
  const [value, setValue] = useState('')
  const [category, setCategory] = useState<string>('')
  const [previewData, setPreviewData] = useState<Array<{
    product: Product
    newPurchasePrice: number
    newSalePrice: number
  }>>([])

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[]

  // Filter products based on category
  const filteredProducts = category 
    ? products.filter(p => p.category === category)
    : products

  useEffect(() => {
    // Auto-select all filtered products when category changes
    setSelectedProducts(filteredProducts.map(p => p.id))
  }, [category, filteredProducts])

  useEffect(() => {
    // Update preview when parameters change
    updatePreview()
  }, [selectedProducts, updateType, priceType, value])

  const updatePreview = () => {
    if (!value || selectedProducts.length === 0) {
      setPreviewData([])
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setPreviewData([])
      return
    }

    const preview = products
      .filter(p => selectedProducts.includes(p.id))
      .map(product => {
        let newPurchasePrice = product.purchase_price
        let newSalePrice = product.sale_price

        if (priceType === 'purchase' || priceType === 'both') {
          newPurchasePrice = calculateNewPrice(product.purchase_price, updateType, numValue)
        }

        if (priceType === 'sale' || priceType === 'both') {
          if (updateType === 'margin') {
            // For margin calculation, use purchase price as base
            newSalePrice = newPurchasePrice * (1 + numValue / 100)
          } else {
            newSalePrice = calculateNewPrice(product.sale_price, updateType, numValue)
          }
        }

        return {
          product,
          newPurchasePrice: Math.max(0, newPurchasePrice),
          newSalePrice: Math.max(0, newSalePrice)
        }
      })

    setPreviewData(preview)
  }

  const calculateNewPrice = (currentPrice: number, type: UpdateType, value: number): number => {
    switch (type) {
      case 'percentage':
        return currentPrice * (1 + value / 100)
      case 'fixed':
        return currentPrice + value
      case 'margin':
        return currentPrice * (1 + value / 100)
      default:
        return currentPrice
    }
  }  cons
t handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleUpdate = async () => {
    if (previewData.length === 0) return

    const updates = previewData.map(item => ({
      id: item.product.id,
      data: {
        purchase_price: item.newPurchasePrice,
        sale_price: item.newSalePrice
      } as ProductUpdate
    }))

    const result = await onUpdate(updates)
    if (result.success) {
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedProducts([])
    setUpdateType('percentage')
    setPriceType('sale')
    setValue('')
    setCategory('')
    setPreviewData([])
    onClose()
  }

  const isValid = value && !isNaN(parseFloat(value)) && selectedProducts.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Toplu Fiyat Güncelleme
          </DialogTitle>
          <DialogDescription>
            Seçili ürünlerin fiyatlarını toplu olarak güncelleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategori Filtresi</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm kategoriler</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Update Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceType">Fiyat Türü</Label>
              <Select value={priceType} onValueChange={(value: PriceType) => setPriceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Alış Fiyatı</SelectItem>
                  <SelectItem value="sale">Satış Fiyatı</SelectItem>
                  <SelectItem value="both">Her İkisi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="updateType">Güncelleme Türü</Label>
              <Select value={updateType} onValueChange={(value: UpdateType) => setUpdateType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Yüzde (%)</SelectItem>
                  <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                  <SelectItem value="margin">Kâr Marjı (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">
                Değer {updateType === 'percentage' || updateType === 'margin' ? '(%)' : '(₺)'}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={updateType === 'fixed' ? '0.00' : '0'}
              />
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Ürün Seçimi ({selectedProducts.length}/{filteredProducts.length})</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedProducts.length === filteredProducts.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}
              </Button>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Mevcut Alış</TableHead>
                    <TableHead className="text-right">Mevcut Satış</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleProductToggle(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.barcode}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.purchase_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.sale_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <Label>Önizleme ({previewData.length} ürün)</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead className="text-right">Eski Alış</TableHead>
                      <TableHead className="text-right">Yeni Alış</TableHead>
                      <TableHead className="text-right">Eski Satış</TableHead>
                      <TableHead className="text-right">Yeni Satış</TableHead>
                      <TableHead className="text-right">Kâr Marjı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 10).map((item) => {
                      const marginPercent = ((item.newSalePrice - item.newPurchasePrice) / item.newPurchasePrice) * 100
                      return (
                        <TableRow key={item.product.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">{item.product.barcode}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.product.purchase_price)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            {formatCurrency(item.newPurchasePrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.product.sale_price)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            {formatCurrency(item.newSalePrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={marginPercent < 0 ? 'text-red-600' : 'text-green-600'}>
                              %{marginPercent.toFixed(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {previewData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  ve {previewData.length - 10} ürün daha...
                </p>
              )}
            </div>
          )}

          {/* Warnings */}
          {previewData.some(item => item.newSalePrice < item.newPurchasePrice) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="font-medium">Uyarı</p>
                <p className="text-sm">
                  Bazı ürünlerin satış fiyatı alış fiyatından düşük olacak. Bu durum zarar yaratabilir.
                </p>
              </div>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            İptal
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Güncelleniyor...' : `${previewData.length} Ürünü Güncelle`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}