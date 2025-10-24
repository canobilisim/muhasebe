import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Personnel {
  id: string;
  name: string;
  surname: string;
  tcNo: string;
  branch: string;
  position: string;
  status: string;
  salary: number;
  startDate: string;
  phone: string;
}

export default function PersonnelListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const personnelList: Personnel[] = [
    {
      id: '1',
      name: 'Ahmet',
      surname: 'Yılmaz',
      tcNo: '12345678901',
      branch: 'Merkez Şube',
      position: 'Satış Temsilcisi',
      status: 'Aktif Çalışan',
      salary: 15000,
      startDate: '2024-01-15',
      phone: '0532 123 45 67'
    },
    {
      id: '2',
      name: 'Fatma',
      surname: 'Demir',
      tcNo: '98765432109',
      branch: 'Merkez Şube',
      position: 'Muhasebe Uzmanı',
      status: 'Aday',
      salary: 18000,
      startDate: '2023-06-10',
      phone: '0533 987 65 43'
    }
  ];

  const filteredPersonnel = personnelList.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.tcNo.includes(searchTerm) ||
    person.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Personel Yönetimi"
      subtitle="Şirket personellerini yönetin, evrakları takip edin ve maaş bilgilerini güncelleyin"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Personel adı, evrak tipi ile arayın"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          
          <Button onClick={() => navigate('/personnel/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Personel
          </Button>
        </div>

        {/* Personnel List */}
        <Card>
          <CardHeader>
            <CardTitle>Personel Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPersonnel.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Personel bulunamadı' : 'Kayıt bulunamadı.'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Arama kriterlerinizi değiştirin veya yeni personel ekleyin.'
                    : 'İlk personel kaydınızı oluşturmak için aşağıdaki butona tıklayın.'
                  }
                </p>
                <Button onClick={() => navigate('/personnel/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Personel Ekle
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ad Soyad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">T.C. Kimlik No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Şube</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Telefon</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum ↕</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Maaş ↕</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Evrak Durumu</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">İşe Başlama ↕</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPersonnel.map((person) => (
                      <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{person.name} {person.surname}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{person.tcNo}</td>
                        <td className="py-3 px-4 text-gray-900">{person.branch}</td>
                        <td className="py-3 px-4 text-gray-900">{person.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            person.status === 'Aktif Çalışan' 
                              ? 'bg-green-100 text-green-800' 
                              : person.status === 'Aday'
                              ? 'bg-blue-100 text-blue-800'
                              : person.status === 'İstifa Etti'
                              ? 'bg-yellow-100 text-yellow-800'
                              : person.status === 'İşten Çıkarıldı'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {person.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-green-600">
                          ₺{person.salary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Tamamlandı
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{person.startDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" title="Görüntüle">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Düzenle">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Sil" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredPersonnel.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Toplam {filteredPersonnel.length} kayıttan 1-{Math.min(10, filteredPersonnel.length)} arası gösteriliyor
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sayfa başına</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-sm text-gray-500">Sayfa 1 / 1</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>«</Button>
                    <Button variant="outline" size="sm" disabled>‹</Button>
                    <Button variant="outline" size="sm" disabled>›</Button>
                    <Button variant="outline" size="sm" disabled>»</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}