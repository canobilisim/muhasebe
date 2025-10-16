import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerService } from '@/services/customerService'
import type { Customer, CustomerInsert, CustomerUpdate } from '@/types'

interface CustomerFormProps {
  customer?: Customer
  onSave: (customer: Customer) => void
  onCancel: () => void
}

export const CustomerForm = ({ customer, onSave, onCancel }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    tax_number: '',
    credit_limit: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        tax_number: customer.tax_number || '',
        credit_limit: customer.credit_limit || 0
      })
    }
  }, [customer])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Müşteri adı zorunludur')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let savedCustomer: Customer

      if (customer) {
        // Update existing customer
        const updateData: CustomerUpdate = {
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          tax_number: formData.tax_number.trim() || null,
          credit_limit: formData.credit_limit
        }
        savedCustomer = await CustomerService.updateCustomer(customer.id, updateData)
      } else {
        // Create new customer
        const insertData: CustomerInsert = {
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Müşteri Adı *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Müşteri adını girin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Telefon numarasını girin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="E-posta adresini girin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input
                id="tax_number"
                type="text"
                value={formData.tax_number}
                onChange={(e) => handleInputChange('tax_number', e.target.value)}
                placeholder="Vergi numarasını girin"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Adres bilgisini girin"
              />
            </div>

            <div className="space-y-2">
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
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : (customer ? 'Güncelle' : 'Kaydet')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}