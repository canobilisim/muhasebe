import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Upload, Save, Loader2 } from 'lucide-react'

interface CompanyInfoFormData {
  name: string
  address: string
  phone: string
  tax_number: string
}

export const CompanyInfoForm = () => {
  const { 
    settings, 
    isLoading, 
    error, 
    canEditSettings, 
    updateSettings, 
    uploadLogo, 
    getReceiptTemplates,
    clearError 
  } = useSettings()

  const [formData, setFormData] = useState<CompanyInfoFormData>({
    name: '',
    address: '',
    phone: '',
    tax_number: '',
  })

  const [receiptTemplates, setReceiptTemplates] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load form data when settings change
  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        tax_number: settings.tax_number || '',
      })
    }
  }, [settings])

  // Load receipt templates
  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getReceiptTemplates()
      setReceiptTemplates(templates)
      if (templates.length > 0) {
        setSelectedTemplate(templates[0])
      }
    }
    loadTemplates()
  }, [getReceiptTemplates])

  // Handle form input changes
  const handleInputChange = (field: keyof CompanyInfoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear messages when user starts typing
    if (error) clearError()
    if (successMessage) setSuccessMessage(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canEditSettings) {
      return
    }

    setIsSaving(true)
    setSuccessMessage(null)

    try {
      const result = await updateSettings({
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        tax_number: formData.tax_number.trim() || null,
      })

      if (result.success) {
        setSuccessMessage('Firma bilgileri başarıyla güncellendi')
      }
    } catch (err) {
      console.error('Error updating settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canEditSettings) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      clearError()
      // Set a temporary error for logo upload
      console.error('Lütfen geçerli bir resim dosyası seçin')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      clearError()
      console.error('Dosya boyutu 2MB\'dan küçük olmalıdır')
      return
    }

    try {
      const result = await uploadLogo(file)
      if (result.success) {
        setSuccessMessage('Logo başarıyla yüklendi')
      }
    } catch (err) {
      console.error('Error uploading logo:', err)
    }
  }

  if (isLoading && !settings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Ayarlar yükleniyor...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Firma Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Firma Adı *</Label>
            <Input
              id="company-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Firma adını girin"
              disabled={!canEditSettings}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="company-address">Adres</Label>
            <Textarea
              id="company-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Firma adresini girin"
              disabled={!canEditSettings}
              rows={3}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="company-phone">Telefon</Label>
            <Input
              id="company-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Telefon numarasını girin"
              disabled={!canEditSettings}
            />
          </div>

          {/* Tax Number */}
          <div className="space-y-2">
            <Label htmlFor="company-tax">Vergi Numarası</Label>
            <Input
              id="company-tax"
              type="text"
              value={formData.tax_number}
              onChange={(e) => handleInputChange('tax_number', e.target.value)}
              placeholder="Vergi numarasını girin"
              disabled={!canEditSettings}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="company-logo">Firma Logosu</Label>
            <div className="flex items-center gap-4">
              <Input
                id="company-logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={!canEditSettings}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('company-logo')?.click()}
                disabled={!canEditSettings}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Logo Yükle
              </Button>
              <span className="text-sm text-gray-500">
                (Maksimum 2MB, JPG/PNG formatında)
              </span>
            </div>
          </div>

          {/* Receipt Template */}
          <div className="space-y-2">
            <Label htmlFor="receipt-template">Fiş Şablonu</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={!canEditSettings}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fiş şablonu seçin" />
              </SelectTrigger>
              <SelectContent>
                {receiptTemplates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          {canEditSettings && (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving || isLoading}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          )}

          {/* Read-only message */}
          {!canEditSettings && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              Bu ayarları değiştirmek için yönetici yetkisine sahip olmanız gerekir.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}