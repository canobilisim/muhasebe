import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, User, Calendar, DollarSign } from 'lucide-react'

export default function ExpenseCategoriesPage() {
  const [formData, setFormData] = useState({
    transactionType: '',
    customerSupplier: '',
    transactionDate: '',
    paymentMethod: '',
    cashBank: '',
    amount: '',
    dueDate: '',
    referenceDocNo: '',
    description: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    console.log('Form submitted:', formData)
  }

  const handleCancel = () => {
    // Navigate back or reset form
  }

  return (
    <Layout
      title="Yeni Finansal Hareket"
      subtitle="Yeni bir finansal hareket eklemek için bu formu kullanabilirsiniz"
      actions={
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Finansal Hareket Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İşlem Tipi */}
              <div className="space-y-2">
                <Label htmlFor="transactionType">İşlem Tipi</Label>
                <Select value={formData.transactionType} onValueChange={(value) => handleInputChange('transactionType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gelir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Gelir</SelectItem>
                    <SelectItem value="expense">Gider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Müşteri/Tedarikçi */}
              <div className="space-y-2">
                <Label htmlFor="customerSupplier">Müşteri/Tedarikçi</Label>
                <div className="relative">
                  <Input
                    id="customerSupplier"
                    placeholder="Müşteri/tedarikçi ara"
                    value={formData.customerSupplier}
                    onChange={(e) => handleInputChange('customerSupplier', e.target.value)}
                    className="pr-10"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* İşlem Tarihi */}
              <div className="space-y-2">
                <Label htmlFor="transactionDate">İşlem Tarihi</Label>
                <div className="relative">
                  <Input
                    id="transactionDate"
                    type="datetime-local"
                    value={formData.transactionDate}
                    onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Ödeme Yöntemi */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nakit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="bank-transfer">Banka Havalesi</SelectItem>
                    <SelectItem value="credit-card">Kredi Kartı</SelectItem>
                    <SelectItem value="check">Çek</SelectItem>
                    <SelectItem value="promissory-note">Senet</SelectItem>
                    <SelectItem value="on-account">Veresiye</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kasa/Banka */}
              <div className="space-y-2">
                <Label htmlFor="cashBank">Kasa/Banka</Label>
                <Input
                  id="cashBank"
                  placeholder="Kasa/banka seçin"
                  value={formData.cashBank}
                  onChange={(e) => handleInputChange('cashBank', e.target.value)}
                />
              </div>

              {/* Tutar */}
              <div className="space-y-2">
                <Label htmlFor="amount">Tutar</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="pr-10"
                  />
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Para Birimi */}
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Select defaultValue="try">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="try">Türk Lirası</SelectItem>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vade Tarihi */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vade Tarihi</Label>
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    placeholder="Tarihi ve saati seçin"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Referans Belge No */}
              <div className="space-y-2">
                <Label htmlFor="referenceDocNo">Referans Belge No</Label>
                <Input
                  id="referenceDocNo"
                  value={formData.referenceDocNo}
                  onChange={(e) => handleInputChange('referenceDocNo', e.target.value)}
                />
              </div>
            </div>

            {/* Açıklama */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" onClick={handleCancel}>
                İptal
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}