import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SerialNumber } from '@/types/product'

interface SerialNumberManagerProps {
  serialNumbers: SerialNumber[]
  onAdd: (serialNumber: string) => void
  onRemove: (id: string) => void
  onBulkAdd: (serialNumbers: string[]) => void
  disabled?: boolean
  error?: string
}

export function SerialNumberManager({
  serialNumbers,
  onAdd,
  onRemove,
  onBulkAdd,
  disabled,
  error
}: SerialNumberManagerProps) {
  const [singleSerialNumber, setSingleSerialNumber] = useState('')
  const [singleError, setSingleError] = useState('')
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkSerialNumbers, setBulkSerialNumbers] = useState('')
  const [bulkError, setBulkError] = useState('')
  const [bulkResults, setBulkResults] = useState<{
    success: string[]
    failed: Array<{ serialNumber: string; reason: string }>
  } | null>(null)

  // Get available and sold counts
  const availableCount = serialNumbers.filter(sn => sn.status === 'available').length
  const soldCount = serialNumbers.filter(sn => sn.status === 'sold').length
  const reservedCount = serialNumbers.filter(sn => sn.status === 'reserved').length

  // Check for duplicates
  const isDuplicate = (serialNumber: string): boolean => {
    return serialNumbers.some(
      sn => sn.serial_number.toLowerCase() === serialNumber.toLowerCase()
    )
  }

  // Handle single serial number add
  const handleSingleAdd = () => {
    const trimmed = singleSerialNumber.trim()
    
    if (!trimmed) {
      setSingleError('Seri numarası boş olamaz')
      return
    }

    if (isDuplicate(trimmed)) {
      setSingleError('Bu seri numarası zaten eklenmiş')
      return
    }

    onAdd(trimmed)
    setSingleSerialNumber('')
    setSingleError('')
  }

  // Handle bulk add
  const handleBulkAdd = () => {
    const lines = bulkSerialNumbers
      .split(/[\n,]/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (lines.length === 0) {
      setBulkError('En az bir seri numarası girmelisiniz')
      return
    }

    const success: string[] = []
    const failed: Array<{ serialNumber: string; reason: string }> = []

    lines.forEach(serialNumber => {
      if (isDuplicate(serialNumber)) {
        failed.push({ serialNumber, reason: 'Zaten eklenmiş' })
      } else if (success.includes(serialNumber)) {
        failed.push({ serialNumber, reason: 'Listede tekrar ediyor' })
      } else {
        success.push(serialNumber)
      }
    })

    // Add successful ones
    if (success.length > 0) {
      onBulkAdd(success)
    }

    // Show results
    setBulkResults({ success, failed })
    setBulkError('')

    // If all successful, close dialog after a delay
    if (failed.length === 0) {
      setTimeout(() => {
        setBulkDialogOpen(false)
        setBulkSerialNumbers('')
        setBulkResults(null)
      }, 1500)
    }
  }

  // Handle bulk dialog close
  const handleBulkDialogClose = () => {
    setBulkDialogOpen(false)
    setBulkSerialNumbers('')
    setBulkError('')
    setBulkResults(null)
  }

  // Handle Enter key in single input
  const handleSingleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSingleAdd()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className={cn(error && 'text-destructive')}>
            Seri Numaraları
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Mevcut: {availableCount}
            {reservedCount > 0 && ` • Rezerve: ${reservedCount}`}
            {soldCount > 0 && ` • Satılan: ${soldCount} (gizli)`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setBulkDialogOpen(true)}
          disabled={disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          Toplu Ekle
        </Button>
      </div>

      {/* Single Add */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={singleSerialNumber}
            onChange={(e) => {
              setSingleSerialNumber(e.target.value)
              setSingleError('')
            }}
            onKeyDown={handleSingleKeyDown}
            placeholder="Seri numarası veya IMEI girin"
            disabled={disabled}
            className={cn(singleError && 'border-destructive')}
          />
          {singleError && (
            <p className="text-sm text-destructive mt-1">{singleError}</p>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSingleAdd}
          disabled={disabled || !singleSerialNumber.trim()}
          size="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ekle
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Serial Numbers List */}
      {serialNumbers.length > 0 && (
        <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
          {serialNumbers.filter(sn => sn.status !== 'sold').map((sn) => (
            <div
              key={sn.id}
              className={cn(
                "flex items-center justify-between p-3 hover:bg-muted/50 transition-colors",
                sn.status === 'sold' && 'opacity-60'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-mono text-sm font-medium",
                  sn.status === 'sold' && 'line-through'
                )}>
                  {sn.serial_number}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Eklenme: {sn.added_date ? new Date(sn.added_date).toLocaleDateString('tr-TR') : '-'}
                  {sn.sold_date && ` • Satış: ${new Date(sn.sold_date).toLocaleDateString('tr-TR')}`}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Badge
                  variant={
                    sn.status === 'available' ? 'default' :
                    sn.status === 'reserved' ? 'secondary' :
                    'outline'
                  }
                  className={cn(
                    sn.status === 'available' && 'bg-green-500 hover:bg-green-600',
                    sn.status === 'reserved' && 'bg-yellow-500 hover:bg-yellow-600',
                    sn.status === 'sold' && 'bg-gray-400'
                  )}
                >
                  {sn.status === 'available' && 'Mevcut'}
                  {sn.status === 'reserved' && 'Rezerve'}
                  {sn.status === 'sold' && 'Satıldı'}
                </Badge>
                
                {sn.status === 'available' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(sn.id)}
                    disabled={disabled}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {serialNumbers.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">
            Henüz seri numarası eklenmemiş
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Yukarıdaki alandan tek tek veya toplu olarak ekleyebilirsiniz
          </p>
        </div>
      )}

      {/* Bulk Add Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={handleBulkDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Toplu Seri Numarası Ekle</DialogTitle>
            <DialogDescription>
              Her satıra bir seri numarası yazın veya virgülle ayırın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Textarea
                value={bulkSerialNumbers}
                onChange={(e) => {
                  setBulkSerialNumbers(e.target.value)
                  setBulkError('')
                }}
                placeholder="123456789&#10;987654321&#10;IMEI123456789"
                rows={10}
                className={cn(bulkError && 'border-destructive')}
              />
              {bulkError && (
                <p className="text-sm text-destructive mt-2">{bulkError}</p>
              )}
            </div>

            {bulkResults && (
              <div className="space-y-2">
                {bulkResults.success.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {bulkResults.success.length} seri numarası başarıyla eklendi
                      </p>
                    </div>
                  </div>
                )}

                {bulkResults.failed.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive mb-2">
                        {bulkResults.failed.length} seri numarası eklenemedi:
                      </p>
                      <div className="space-y-1 max-h-[150px] overflow-y-auto">
                        {bulkResults.failed.map((item, index) => (
                          <p key={index} className="text-xs text-destructive/80">
                            • {item.serialNumber}: {item.reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleBulkDialogClose}
            >
              {bulkResults ? 'Kapat' : 'İptal'}
            </Button>
            {!bulkResults && (
              <Button
                type="button"
                onClick={handleBulkAdd}
                disabled={!bulkSerialNumbers.trim()}
              >
                Ekle
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
