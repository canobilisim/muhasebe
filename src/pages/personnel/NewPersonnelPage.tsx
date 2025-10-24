import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UserCheck, Save, X } from 'lucide-react';

export default function NewPersonnelPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    tcNo: '',
    phone: '',
    email: '',
    address: '',
    branch: '',
    position: '',
    status: 'Aday',
    startDate: '',
    endDate: '',
    salary: '',
    currency: 'Türk Lirası',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/personnel/list');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/personnel/list');
  };

  return (
    <Layout
      title="Yeni Personel Ekle"
      subtitle="Şirketinize yeni bir personel eklemek için aşağıdaki formu doldurun. Personel eklendikten sonra gerekli evrakları yükleyebilirsiniz"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/personnel/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ad *</Label>
                  <Input
                    id="name"
                    placeholder="Personel adı"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Soyad *</Label>
                  <Input
                    id="surname"
                    placeholder="Personel soyadı"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tcNo">T.C. Kimlik Numarası *</Label>
                <Input
                  id="tcNo"
                  placeholder="11 haneli T.C. kimlik numarası"
                  value={formData.tcNo}
                  onChange={(e) => handleInputChange('tcNo', e.target.value)}
                  maxLength={11}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    placeholder="0532 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@firma.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  placeholder="Personelin ikamet adresi"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle>İş Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="branch">Şube *</Label>
                <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Merkez Şube" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Merkez Şube">Merkez Şube</SelectItem>
                    <SelectItem value="Şube 1">Şube 1</SelectItem>
                    <SelectItem value="Şube 2">Şube 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="position">Pozisyon/Unvan *</Label>
                <Input
                  id="position"
                  placeholder="Örn: Satış Temsilcisi, Muhasebe Uzmanı"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status">Durum *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aday">Aday</SelectItem>
                    <SelectItem value="Aktif Çalışan">Aktif Çalışan</SelectItem>
                    <SelectItem value="İstifa Etti">İstifa Etti</SelectItem>
                    <SelectItem value="İşten Çıkarıldı">İşten Çıkarıldı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">İşe Başlama Tarihi *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">İşten Ayrılış Tarihi</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary">Maaş Tutarı *</Label>
                  <Input
                    id="salary"
                    placeholder="0,00"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Para Birimi *</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Türk Lirası">Türk Lirası</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  placeholder="Personel hakkında ek notlar"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Kaydediliyor...' : 'Personel Ekle'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}