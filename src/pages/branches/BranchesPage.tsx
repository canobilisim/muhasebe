import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, Building2, MapPin, Phone, Users } from 'lucide-react'

interface Branch {
  id: string
  name: string
  address: string
  phone: string
  manager: string
  employeeCount: number
  status: 'active' | 'inactive'
  createdAt: string
}

export default function BranchesPage() {
  const [branches] = useState<Branch[]>([
    {
      id: '1',
      name: 'Merkez Şube',
      address: 'Atatürk Cad. No:123 Çankaya/Ankara',
      phone: '0312 123 45 67',
      manager: 'Ahmet Yılmaz',
      employeeCount: 15,
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'İstanbul Şubesi',
      address: 'Bağdat Cad. No:456 Kadıköy/İstanbul',
      phone: '0216 987 65 43',
      manager: 'Fatma Demir',
      employeeCount: 8,
      status: 'active',
      createdAt: '2024-03-15'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout
      title="Şube Yönetimi"
      subtitle="Şirket şubelerini yönetin ve şube bilgilerini güncelleyin"
      actions={
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Şube Ekle
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Şube Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Şube Listesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Arama */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Şube adı, adres veya müdür ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tablo */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Şube Adı</TableHead>
                      <TableHead>Adres</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Müdür</TableHead>
                      <TableHead>Personel Sayısı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'Arama kriterlerine uygun şube bulunamadı.' : 'Henüz şube eklenmemiş.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBranches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{branch.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{branch.address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{branch.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>{branch.manager}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{branch.employeeCount} kişi</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              branch.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {branch.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" title="Düzenle">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Sil" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Sayfalama */}
              {filteredBranches.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Toplam {filteredBranches.length} şube gösteriliyor
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Sayfa başına</span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <span className="text-sm text-gray-500">Sayfa 1 / 1</span>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" disabled>«</Button>
                      <Button variant="outline" size="sm" disabled>‹</Button>
                      <Button variant="outline" size="sm" disabled>›</Button>
                      <Button variant="outline" size="sm" disabled>»</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}