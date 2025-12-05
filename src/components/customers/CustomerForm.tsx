import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedInput } from '@/components/ui/formatted-input'
import { Switch } from '@/components/ui/switch'
import { CustomerService } from '@/services/customerService'
import { User, Phone, MapPin, DollarSign } from 'lucide-react'
import type { Customer, CustomerInsert, CustomerUpdate } from '@/types'

interface CustomerFormProps {
  customer?: Customer
  onSave: (customer: Customer) => void
  onCancel: () => void
}

export const CustomerForm = ({ customer, onSave, onCancel }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '0',
    email: '',
    address: '',
    tax_number: '',
    credit_limit: 0,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '0',
        email: customer.email || '',
        address: customer.address || '',
        tax_number: customer.tax_number || '',
        credit_limit: customer.credit_limit || 0,
        is_active: customer.is_active ?? true
      })
    }
  }, [customer])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { setError('Müşteri adı zorunludur'); return }
    setLoading(true)
    setError(null)
    try {
      let savedCustomer: Customer
      if (customer) {
        const updateData: CustomerUpdate = {
          name: formData.name.trim(),
          phone: formData.phone && formData.phone !== '0' ? formData.phone.trim() : null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          tax_number: formData.tax_number.trim() || null,
          credit_limit: formData.credit_limit,
          is_active: formData.is_active
        }
        savedCustomer = await CustomerService.updateCustomer(customer.id, updateData)
      } else {
        const insertData: CustomerInsert = {
          name: formData.name.trim(),
          phone: formData.phone && formData.phone !== '0' ? formData.phone.trim() : null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          tax_number: formData.tax_number.trim() || null,
          credit_limit: formData.credit_limit,
          current_balance: 0,
          is_active: true
        }
        savedCustomer = await CustomerService.createCustomer(insertData)
      }
      onSave(savedCustomer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müşteri kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Durum */}
      {customer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Durum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label>Müşteri Aktif</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Pasif müşteriler hızlı satış ekranında seçildiğinde uyarı verilir
            </p>
          </CardContent>
        </Card>
      )}

      {/* Kişisel Bilgiler */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-blue-500" />
            Müşteri Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="name">Müşteri Adı *</Label>
              <FormattedInput
                id="name"
                formatterType="name"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="Müşteri adını girin"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input
                id="tax_number"
                type="text"
                value={formData.tax_number}
                onChange={(e) => handleInputChange('tax_number', e.target.value)}
                placeholder="Vergi numarasını girin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-green-500" />
            İletişim Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="phone">Telefon</Label>
              <FormattedInput
                id="phone"
                formatterType="phone"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="email">E-posta</Label>
              <FormattedInput
                id="email"
                formatterType="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="E-posta adresini girin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adres Bilgileri */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-purple-500" />
            Adres Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div>
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Adres bilgisini girin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Finansal Bilgiler */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-amber-500" />
            Finansal Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div>
            <Label htmlFor="credit_limit">Kredi Limiti (₺)</Label>
            <Input
              id="credit_limit"
              type="number"
              min="0"
              step="0.01"
              value={formData.credit_limit}
              onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Müşterinin açık hesap alışveriş yapabileceği maksimum tutar
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          İptal
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? 'Kaydediliyor...' : (customer ? 'Güncelle' : 'Kaydet')}
        </Button>
      </div>
    </form>
  )
}
