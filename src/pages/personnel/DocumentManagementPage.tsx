import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, FileText, Calendar, User } from 'lucide-react';

interface PersonnelDocument {
  id: string;
  personnelName: string;
  documentType: string;
  status: string;
  lastUpdate: string;
  dueDate?: string;
}

export default function DocumentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const documents: PersonnelDocument[] = [];

  const filteredDocuments = documents.filter(doc =>
    doc.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Evrak Yönetimi"
      subtitle="Personel evrakları görüntüleyin ve oluşturun"
    >
      <div className="space-y-6">
        {/* Left Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personel Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Personel detaylarını görmek için bir satırda göz konumu tıklayın
                </p>
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Personel seçilmedi</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
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
            </div>

            {/* Documents Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Personel</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Evrak Tipi</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Durum ↕</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Dosya</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Son Güncelleme ↕</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Kayıt bulunamadı.
                            </h3>
                            <p className="text-gray-500">
                              Henüz personel evrakı bulunmuyor.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{doc.personnelName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{doc.documentType}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                doc.status === 'Tamamlandı' 
                                  ? 'bg-green-100 text-green-800' 
                                  : doc.status === 'Beklemede'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {doc.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{doc.lastUpdate}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {/* Action buttons would go here */}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredDocuments.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Toplam 0 kayıttan 1-0 arası gösteriliyor
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
                        <button className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>«</button>
                        <button className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>‹</button>
                        <button className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>›</button>
                        <button className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>»</button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}