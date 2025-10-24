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
import { Plus, Search, Download, Trash2, Settings } from 'lucide-react'

interface PromissoryNote {
  id: string
  noteNo: string
  debtor: string
  customer: string
  amount: number
  dueDate: string
  status: string
  operations: string[]
}

export default function PromissoryNotePortfolioPage() {
  const [notes] = useState<PromissoryNote[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredNotes = notes.filter(note =>
    note.noteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.debtor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout
      title="Senet Portföyü"
      subtitle="Müşterilerden alınan senetleri görüntüleyebilir ve işlem yapabilirsiniz"
      actions={
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Senet Girişi
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Senet Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Senet Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Arama ve Filtreler */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Senet no, borçlu adı veya müşteri ara"
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
                </div>
              </div>

              {/* Tablo */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Senet No</TableHead>
                      <TableHead>Borçlu</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Vade Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Kayıt bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell>{note.noteNo}</TableCell>
                          <TableCell>{note.debtor}</TableCell>
                          <TableCell>{note.customer}</TableCell>
                          <TableCell>{note.amount.toLocaleString('tr-TR')} ₺</TableCell>
                          <TableCell>{note.dueDate}</TableCell>
                          <TableCell>{note.status}</TableCell>
                          <TableCell>{note.operations.join(', ')}</TableCell>
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