import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Truck } from 'lucide-react'
import { SupplierService } from '@/services/supplierService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { SupplierInsert } from '@/types'

const NewSupplierPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { handleError, showSuccess } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)
  const isEditMode = !!id
  
  const [formData, setFormData] = useState<Partial<SupplierInsert>>({
    name: '',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    tax_number: '',
    tax_office: '',
    trade_registry_no: '',
    credit_limit: 0,
    bank_name: '',
    iban: '',
    account_number: '',
    notes: '',
    is_active: true
  })

  useEffect(() => {
    if (id) {
      loadSupplier()
    }
  }, [id])

  const loadSupplier = async () => {
    if (!id) return

    setInitialLoading(true)
    try {
      const supplier = await SupplierService.getSupplierById(id)
      setFormData(supplier)
    } catch (error) {
      handleError(error, 'Tedarikçi bilgileri yüklenirken bir hata oluştu')
      navigate('/suppliers')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (field: keyof SupplierInsert, value: any) => {
    setFormData((prev: Partial<SupplierInsert>) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      handleError(new Error('Tedarikçi adı zorunludur'), 'Lütfen tedarikçi adını girin')
      return
    }

    setLoading(true)
    try {
      if (isEditMode && id) {
        await SupplierService.updateSupplier(id, formData as SupplierInsert)
        showSuccess('Tedarikçi başarıyla güncellendi')
      } else {
        await SupplierService.createSupplier(formData as SupplierInsert)
        showSuccess('Tedarikçi başarıyla oluşturuldu')
      }
      navigate('/suppliers')
    } catch (error) {
      handleError(error, isEditMode ? 'Tedarikçi güncellenirken bir hata oluştu' : 'Tedarikçi oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Layout title={isEditMode ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'} subtitle="Yükleniyor...">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title={isEditMode ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}
      subtitle={isEditMode ? 'Tedarikçi bilgilerini güncelle' : 'Yeni tedarikçi kaydı oluştur'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tedarikçi Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tedarikçi adı"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Firma Adı</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Firma adı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Yetkili Kişi</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Yetkili kişi adı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0555 123 45 67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ornek@firma.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit_limit">Kredi Limiti (₺)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adres Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Adres Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">İl</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="İl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="İlçe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Açık adres"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vergi Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Vergi Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_number">Vergi Numarası</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => handleInputChange('tax_number', e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_office">Vergi Dairesi</Label>
                <Input
                  id="tax_office"
                  value={formData.tax_office}
                  onChange={(e) => handleInputChange('tax_office', e.target.value)}
                  placeholder="Vergi dairesi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade_registry_no">Ticaret Sicil No</Label>
                <Input
                  id="trade_registry_no"
                  value={formData.trade_registry_no}
                  onChange={(e) => handleInputChange('trade_registry_no', e.target.value)}
                  placeholder="Ticaret sicil numarası"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banka Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Banka Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banka Adı</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="Banka adı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Hesap Numarası</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="Hesap numarası"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Tedarikçi hakkında notlar..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers')}
          >
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...') : (isEditMode ? 'Güncelle' : 'Kaydet')}
          </Button>
        </div>
      </form>
    </Layout>
  )
}

export default NewSupplierPage
