import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, Save, X, Package, Trash2, Check, ChevronsUpDown, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SaleItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number
  note?: string | null
  is_miscellaneous?: boolean | null
}

interface SaleDetail {
  id: string
  sale_number: string
  sale_date: string
  customer_id: string | null
  customer_name: string | null
  total_amount: number
  discount_amount: number
  net_amount: number
  payment_type: string
  payment_status: string
  paid_amount: number
  change_amount: number
  notes: string | null
  user_name: string
  items: SaleItem[]
}

interface SaleDetailModalProps {
  saleId: string | null
  open: boolean
  onClose: () => void
  onUpdate: () => void
  onDelete?: (saleId: string, saleNumber: string) => void
}

export const SaleDetailModal = ({ saleId, open, onClose, onUpdate, onDelete }: SaleDetailModalProps) => {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saleDetail, setSaleDetail] = useState<SaleDetail | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([])
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    customer_id: string
    payment_type: string
    payment_status: string
    notes: string
    sale_date: string
  }>({
    customer_id: '',
    payment_type: '',
    payment_status: '',
    notes: '',
    sale_date: ''
  })

  // Filtered customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery) return customers
    
    const query = customerSearchQuery.toLowerCase()
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query)
    )
  }, [customers, customerSearchQuery])

  useEffect(() => {
    if (open && saleId) {
      fetchSaleDetail()
      fetchCustomers()
    }
  }, [open, saleId])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const fetchSaleDetail = async () => {
    if (!saleId) return

    try {
      setLoading(true)

      // Satış bilgilerini çek
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select(`
          id,
          sale_number,
          sale_date,
          customer_id,
          total_amount,
          discount_amount,
          net_amount,
          payment_type,
          payment_status,
          paid_amount,
          change_amount,
          notes,
          customer:customers(name),
          user:users(full_name)
        `)
        .eq('id', saleId)
        .single()

      if (saleError) throw saleError

      // Satış kalemlerini çek
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          discount_amount,
          total_amount,
          note,
          is_miscellaneous,
          product:products(name)
        `)
        .eq('sale_id', saleId)

      if (itemsError) throw itemsError

      const detail: SaleDetail = {
        id: sale.id,
        sale_number: sale.sale_number,
        sale_date: sale.sale_date || new Date().toISOString(),
        customer_id: sale.customer_id,
        customer_name: sale.customer?.name || null,
        total_amount: sale.total_amount || 0,
        discount_amount: sale.discount_amount || 0,
        net_amount: sale.net_amount || 0,
        payment_type: sale.payment_type,
        payment_status: sale.payment_status,
        paid_amount: sale.paid_amount || 0,
        change_amount: sale.change_amount || 0,
        notes: sale.notes,
        user_name: sale.user?.full_name || 'Bilinmiyor',
        items: items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.is_miscellaneous ? 'Muhtelif Ürün' : (item.product?.name || 'Bilinmiyor'),
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          total_amount: item.total_amount,
          note: item.note,
          is_miscellaneous: item.is_miscellaneous
        }))
      }

      setSaleDetail(detail)
      setFormData({
        customer_id: detail.customer_id || '',
        payment_type: detail.payment_type as any,
        payment_status: detail.payment_status as any,
        notes: detail.notes || '',
        sale_date: detail.sale_date ? new Date(detail.sale_date).toISOString().slice(0, 16) : ''
      })
    } catch (err) {
      console.error('Error fetching sale detail:', err)
      alert('Satış detayları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveClick = () => {
    setSaveConfirmOpen(true)
  }

  const handleSaveConfirm = async () => {
    if (!saleDetail) return

    try {
      setSaving(true)

      const updateData: any = {
        customer_id: formData.customer_id || null,
        notes: formData.notes || null,
        sale_date: formData.sale_date ? new Date(formData.sale_date).toISOString() : saleDetail.sale_date,
        updated_at: new Date().toISOString()
      }

      // Sadece değişen alanları ekle
      if (formData.payment_type) {
        updateData.payment_type = formData.payment_type
      }
      if (formData.payment_status) {
        updateData.payment_status = formData.payment_status
      }

      console.log('Updating sale with data:', updateData)

      const { error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', saleDetail.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setSaveConfirmOpen(false)
      setEditMode(false)
      onUpdate()
      await fetchSaleDetail()
    } catch (err) {
      console.error('Error updating sale:', err)
      alert('Satış güncellenirken hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (saleDetail && onDelete) {
      onClose()
      onDelete(saleDetail.id, saleDetail.sale_number)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'cash': return 'Nakit'
      case 'pos': return 'POS'
      case 'credit': return 'Açık Hesap'
      case 'partial': return 'Kısmi Ödeme'
      default: return type
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ödendi</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Bekliyor</Badge>
      case 'overdue':
        return <Badge variant="destructive">Gecikmiş</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Satış Detayı - {saleDetail?.sale_number}</span>
            {isAdmin() && !editMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Düzenle
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Yükleniyor...
          </div>
        ) : saleDetail ? (
          <div className="space-y-6">
            {/* Genel Bilgiler */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tarih ve Saat</Label>
                {editMode ? (
                  <Input
                    type="datetime-local"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">
                    {new Date(saleDetail.sale_date).toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Kullanıcı</Label>
                <p className="font-medium">{saleDetail.user_name}</p>
              </div>
            </div>

            {/* Müşteri Bilgisi */}
            <div>
              <Label>Müşteri</Label>
              {editMode ? (
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.customer_id
                        ? customers.find((customer) => customer.id === formData.customer_id)?.name
                        : "Perakende"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Müşteri ara..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <div
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                          !formData.customer_id && "bg-accent"
                        )}
                        onClick={() => {
                          setFormData({ ...formData, customer_id: '' })
                          setCustomerSearchOpen(false)
                          setCustomerSearchQuery('')
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !formData.customer_id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Perakende
                      </div>
                      {filteredCustomers.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Müşteri bulunamadı
                        </div>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                              formData.customer_id === customer.id && "bg-accent"
                            )}
                            onClick={() => {
                              setFormData({ ...formData, customer_id: customer.id })
                              setCustomerSearchOpen(false)
                              setCustomerSearchQuery('')
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.customer_id === customer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {customer.name}
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="font-medium">{saleDetail.customer_name || 'Perakende'}</p>
              )}
            </div>

            {/* Ödeme Bilgileri */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ödeme Tipi</Label>
                {editMode ? (
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value) => setFormData({ ...formData, payment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="credit">Açık Hesap</SelectItem>
                      <SelectItem value="partial">Kısmi Ödeme</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{getPaymentTypeLabel(saleDetail.payment_type)}</p>
                )}
              </div>
              <div>
                <Label>Ödeme Durumu</Label>
                {editMode ? (
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Ödendi</SelectItem>
                      <SelectItem value="pending">Bekliyor</SelectItem>
                      <SelectItem value="overdue">Gecikmiş</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div>{getPaymentStatusBadge(saleDetail.payment_status)}</div>
                )}
              </div>
            </div>

            {/* Notlar */}
            <div>
              <Label>Notlar</Label>
              {editMode ? (
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Satış notu..."
                />
              ) : (
                <p className="font-medium">{saleDetail.notes || '-'}</p>
              )}
            </div>

            {/* Ürünler */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4" />
                Satılan Ürünler
              </Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">İndirim</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleDetail.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.product_name}</span>
                          {item.note && (
                            <span className="text-xs text-muted-foreground italic mt-1">
                              {item.note}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right">
                        {item.discount_amount > 0 ? formatCurrency(item.discount_amount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Toplam Bilgileri */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara Toplam:</span>
                <span className="font-medium">{formatCurrency(saleDetail.total_amount)}</span>
              </div>
              {saleDetail.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>İndirim:</span>
                  <span className="font-medium">-{formatCurrency(saleDetail.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Net Toplam:</span>
                <span>{formatCurrency(saleDetail.net_amount)}</span>
              </div>
              {saleDetail.paid_amount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ödenen:</span>
                    <span className="font-medium">{formatCurrency(saleDetail.paid_amount)}</span>
                  </div>
                  {saleDetail.change_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Para Üstü:</span>
                      <span className="font-medium">{formatCurrency(saleDetail.change_amount)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Butonlar */}
            {editMode && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(false)
                    setFormData({
                      customer_id: saleDetail.customer_id || '',
                      payment_type: saleDetail.payment_type,
                      payment_status: saleDetail.payment_status,
                      notes: saleDetail.notes || '',
                      sale_date: saleDetail.sale_date ? new Date(saleDetail.sale_date).toISOString().slice(0, 16) : ''
                    })
                  }}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
                <Button onClick={handleSaveClick} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>

      {/* Kaydetme Onay Modal */}
      <Dialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-blue-600" />
              Değişiklikleri Kaydet
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">{saleDetail?.sale_number}</span> numaralı satışta yaptığınız değişiklikleri kaydetmek istediğinizden emin misiniz?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSaveConfirmOpen(false)}
              disabled={saving}
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveConfirm}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
