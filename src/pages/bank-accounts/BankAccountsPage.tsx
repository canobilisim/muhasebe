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
import { Plus, Search, Edit, Trash2, Landmark, CreditCard, Eye } from 'lucide-react'

interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  iban: string
  currency: 'TRY' | 'USD' | 'EUR'
  balance: number
  branch: string
  status: 'active' | 'inactive'
  createdAt: string
}

export default function BankAccountsPage() {
  const [accounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'Türkiye İş Bankası',
      accountName: 'Ana Hesap',
      accountNumber: '1234567890',
      iban: 'TR12 0006 4000 0011 2345 6789 01',
      currency: 'TRY',
      balance: 125000,
      branch: 'Merkez Şube',
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      bankName: 'Garanti BBVA',
      accountName: 'Döviz Hesabı',
      accountNumber: '9876543210',
      iban: 'TR98 0062 0000 0000 9876 5432 10',
      currency: 'USD',
      balance: 15000,
      branch: 'Merkez Şube',
      status: 'active',
      createdAt: '2024-02-15'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAccounts = accounts.filter(account =>
    account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm) ||
    account.iban.includes(searchTerm)
  )

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    })
    return formatter.format(amount)
  }

  return (
    <Layout
      title="Banka Hesapları"
      subtitle="Şirket banka hesaplarını yönetin ve bakiye bilgilerini takip edin"
      actions={
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Hesap Ekle
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam TL Bakiye</p>
                  <p className="text-2xl font-bold text-green-600">₺125.000,00</p>
                </div>
                <Landmark className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam USD Bakiye</p>
                  <p className="text-2xl font-bold text-blue-600">$15.000,00</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Hesap Sayısı</p>
                  <p className="text-2xl font-bold text-purple-600">{accounts.filter(a => a.status === 'active').length}</p>
                </div>
                <Landmark className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hesap Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Banka Hesapları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Arama */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Banka adı, hesap adı veya IBAN ara"
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
                      <TableHead>Banka Adı</TableHead>
                      <TableHead>Hesap Adı</TableHead>
                      <TableHead>Hesap No</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Para Birimi</TableHead>
                      <TableHead>Bakiye</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'Arama kriterlerine uygun hesap bulunamadı.' : 'Henüz banka hesabı eklenmemiş.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Landmark className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{account.bankName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="font-mono text-sm">{account.accountNumber}</TableCell>
                          <TableCell className="font-mono text-sm">{account.iban}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {account.currency}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(account.balance, account.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              account.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" title="Detaylar">
                                <Eye className="h-4 w-4" />
                              </Button>
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
              {filteredAccounts.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Toplam {filteredAccounts.length} hesap gösteriliyor
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