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
import { Plus, Search, Download, Trash2, Settings, FileText } from 'lucide-react'

interface FinancialMovement {
  id: string
  transactionDate: string
  customerSupplier: string
  transactionType: string
  paymentMethod: string
  amount: number
  dueDate: string
  status: string
  description: string
  operations: string[]
}

export default function FinancialMovementsPage() {
  const [movements] = useState<FinancialMovement[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMovements = movements.filter(movement =>
    movement.customerSupplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout
      title="Finansal Hareketler"
      subtitle="Müşteri ve tedarikçilerle yapılan tüm finansal hareketleri görüntüleyebilirsiniz"
      actions={
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Toplu Ekle
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Finansal Hareket
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Finansal Hareketler Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Finansal Hareketler Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Arama ve Filtreler */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Müşteri adı, açıklama veya belge no ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>

              {/* Tablo */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşlem Tarihi</TableHead>
                      <TableHead>Müşteri/Tedarikçi</TableHead>
                      <TableHead>İşlem Tipi</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Vade Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          Kayıt bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{movement.transactionDate}</TableCell>
                          <TableCell>{movement.customerSupplier}</TableCell>
                          <TableCell>{movement.transactionType}</TableCell>
                          <TableCell>{movement.paymentMethod}</TableCell>
                          <TableCell>{movement.amount.toLocaleString('tr-TR')} ₺</TableCell>
                          <TableCell>{movement.dueDate}</TableCell>
                          <TableCell>{movement.status}</TableCell>
                          <TableCell>{movement.description}</TableCell>
                          <TableCell>{movement.operations.join(', ')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Sayfalama */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Toplam 0 kayıttan 1-0 arası gösteriliyor
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}