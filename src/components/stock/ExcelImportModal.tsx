import { useState, useRef } from 'react'
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
import { Alert } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Upload, Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { ProductInsert } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (products: ProductInsert[]) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

interface ImportRow {
  barcode: string
  name: string
  category: string
  purchasePrice: number
  salePrice: number
  stockQuantity: number
  criticalStockLevel: number
  brand?: string
  model?: string
  color?: string
  serialNumber?: string
  condition?: string
  isValid: boolean
  errors: string[]
}

export const ExcelImportModal = ({ isOpen, onClose, onImport, isLoading }: ExcelImportModalProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<ImportRow[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload')
  const [importResult, setImportResult] = useState<{ success: boolean; error?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseExcelFile(selectedFile)
    }
  }

  const parseExcelFile = async (file: File) => {
    try {
      // In a real implementation, you would use a library like xlsx or papaparse
      // For now, we'll simulate parsing CSV data
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Expected headers: Barkod, Ürün Adı, Kategori, Alış Fiyatı, Satış Fiyatı, Stok Miktarı, Kritik Seviye, Marka, Model, Renk, Seri No, Durum
      const expectedHeaders = ['Barkod', 'Ürün Adı', 'Kategori', 'Alış Fiyatı', 'Satış Fiyatı', 'Stok Miktarı', 'Kritik Seviye', 'Marka', 'Model', 'Renk', 'Seri No', 'Durum']
      
      if (!expectedHeaders.every(header => headers.includes(header))) {
        throw new Error('Excel dosyası gerekli kolonları içermiyor. Lütfen şablon dosyasını kullanın.')
      }

      const data: ImportRow[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = line.split(',').map(v => v.trim())
        const row: ImportRow = {
          barcode: values[0] || '',
          name: values[1] || '',
          category: values[2] || '',
          purchasePrice: parseFloat(values[3]) || 0,
          salePrice: parseFloat(values[4]) || 0,
          stockQuantity: parseInt(values[5]) || 0,
          criticalStockLevel: parseInt(values[6]) || 0,
          brand: values[7] || undefined,
          model: values[8] || undefined,
          color: values[9] || undefined,
          serialNumber: values[10] || undefined,
          condition: values[11] || undefined,
          isValid: true,
          errors: []
        }

        // Validate row
        if (!row.barcode) {
          row.errors.push('Barkod gerekli')
          row.isValid = false
        }
        if (!row.name) {
          row.errors.push('Ürün adı gerekli')
          row.isValid = false
        }
        if (row.purchasePrice <= 0) {
          row.errors.push('Alış fiyatı 0\'dan büyük olmalı')
          row.isValid = false
        }
        if (row.salePrice <= 0) {
          row.errors.push('Satış fiyatı 0\'dan büyük olmalı')
          row.isValid = false
        }
        if (row.stockQuantity < 0) {
          row.errors.push('Stok miktarı negatif olamaz')
          row.isValid = false
        }
        if (row.criticalStockLevel < 0) {
          row.errors.push('Kritik seviye negatif olamaz')
          row.isValid = false
        }
        if (row.condition && !['Yeni', '2. El', 'Yenilenmiş', 'Demo'].includes(row.condition)) {
          row.errors.push('Durum: Yeni, 2. El, Yenilenmiş veya Demo olmalı')
          row.isValid = false
        }

        data.push(row)
      }

      setImportData(data)
      setStep('preview')
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Dosya okunurken hata oluştu: ' + (error as Error).message)
    }
  }

  const handleImport = async () => {
    const validRows = importData.filter(row => row.isValid)
    
    if (validRows.length === 0) {
      alert('İçe aktarılacak geçerli ürün bulunamadı.')
      return
    }

    const products: ProductInsert[] = validRows.map(row => ({
      barcode: row.barcode,
      name: row.name,
      category: row.category || null,
      purchase_price: row.purchasePrice,
      sale_price: row.salePrice,
      stock_quantity: row.stockQuantity,
      critical_stock_level: row.criticalStockLevel,
      brand: row.brand || null,
      model: row.model || null,
      color: row.color || null,
      serial_number: row.serialNumber || null,
      condition: row.condition as 'Yeni' | '2. El' | 'Yenilenmiş' | 'Demo' | null,
      is_active: true
    }))

    const result = await onImport(products)
    setImportResult(result)
    setStep('result')
  }

  const downloadTemplate = () => {
    const headers = ['Barkod', 'Ürün Adı', 'Kategori', 'Alış Fiyatı', 'Satış Fiyatı', 'Stok Miktarı', 'Kritik Seviye', 'Marka', 'Model', 'Renk', 'Seri No', 'Durum']
    const sampleData = [
      ['1234567890123', 'Örnek Ürün 1', 'Kategori A', '10.50', '15.75', '100', '10', 'Samsung', 'Galaxy S21', 'Siyah', 'IMEI123456', 'Yeni'],
      ['1234567890124', 'Örnek Ürün 2', 'Kategori B', '25.00', '35.00', '50', '5', 'Apple', 'iPhone 13', 'Beyaz', '', '2. El']
    ]
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'urun_import_sablonu.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    setFile(null)
    setImportData([])
    setStep('upload')
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const validRowsCount = importData.filter(row => row.isValid).length
  const invalidRowsCount = importData.length - validRowsCount

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Excel'den Ürün İçe Aktarma</DialogTitle>
          <DialogDescription>
            Excel veya CSV dosyasından toplu ürün içe aktarımı yapabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Dosya Seçin</p>
                <p className="text-sm text-gray-500">
                  Excel (.xlsx) veya CSV (.csv) dosyası seçin
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="font-medium">Önemli Notlar:</p>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• Dosya şablonunu indirip kullanmanız önerilir</li>
                  <li>• Barkod ve ürün adı alanları zorunludur</li>
                  <li>• Fiyatlar pozitif sayı olmalıdır</li>
                  <li>• Mevcut barkodlar güncellenecektir</li>
                </ul>
              </div>
            </Alert>

            <div className="flex justify-center">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Şablon İndir
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Önizleme</h3>
                <p className="text-sm text-gray-500">
                  {validRowsCount} geçerli, {invalidRowsCount} hatalı kayıt
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Geri
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={validRowsCount === 0 || isLoading}
                >
                  {isLoading ? 'İçe Aktarılıyor...' : `${validRowsCount} Ürünü İçe Aktar`}
                </Button>
              </div>
            </div>

            {invalidRowsCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <p className="font-medium">Hatalı Kayıtlar</p>
                  <p className="text-sm">
                    {invalidRowsCount} kayıtta hata bulundu. Bu kayıtlar içe aktarılmayacak.
                  </p>
                </div>
              </Alert>
            )}

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Durum</TableHead>
                    <TableHead>Barkod</TableHead>
                    <TableHead>Ürün Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Marka</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Alış</TableHead>
                    <TableHead className="text-right">Satış</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead>Hatalar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((row, index) => (
                    <TableRow key={index} className={!row.isValid ? 'bg-red-50' : ''}>
                      <TableCell>
                        {row.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{row.barcode}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.brand || '-'}</TableCell>
                      <TableCell>{row.model || '-'}</TableCell>
                      <TableCell>{row.condition || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.purchasePrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(row.salePrice)}
                      </TableCell>
                      <TableCell className="text-right">{row.stockQuantity}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 && (
                          <div className="text-xs text-red-600">
                            {row.errors.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4 text-center">
            {importResult?.success ? (
              <div>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-600">İçe Aktarma Başarılı</h3>
                <p className="text-gray-600">
                  {validRowsCount} ürün başarıyla içe aktarıldı.
                </p>
              </div>
            ) : (
              <div>
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-600">İçe Aktarma Başarısız</h3>
                <p className="text-gray-600">
                  {importResult?.error || 'Bilinmeyen bir hata oluştu.'}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'result' && (
            <Button onClick={handleClose}>
              Kapat
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}