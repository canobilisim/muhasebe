import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Receipt, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export default function RetailSalesPage() {
  const navigate = useNavigate();

  // Mock data for retail sales
  const retailSales = [
    {
      id: '1',
      saleNumber: 'POS-2024-001',
      date: '2024-01-15',
      time: '14:30',
      customerName: 'Perakende Müşterisi',
      totalAmount: 125.50,
      paymentMethod: 'Nakit',
      status: 'Tamamlandı',
      itemCount: 3
    },
    {
      id: '2',
      saleNumber: 'POS-2024-002',
      date: '2024-01-15',
      time: '15:45',
      customerName: 'Ahmet Yılmaz',
      totalAmount: 89.75,
      paymentMethod: 'Kredi Kartı',
      status: 'Tamamlandı',
      itemCount: 2
    },
    {
      id: '3',
      saleNumber: 'POS-2024-003',
      date: '2024-01-15',
      time: '16:20',
      customerName: 'Perakende Müşterisi',
      totalAmount: 45.00,
      paymentMethod: 'Nakit',
      status: 'Tamamlandı',
      itemCount: 1
    }
  ];

  return (
    <Layout
      title="Perakende Satışlar"
      subtitle="Hızlı satış (POS) sisteminden kaydedilen perakende satışlar"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Satış ara..."
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          </div>
          
          <Button onClick={() => navigate('/pos2')}>
            <Zap className="h-4 w-4 mr-2" />
            Yeni POS Satış
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Satış</p>
                  <p className="text-xl font-bold">{retailSales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bugün</p>
                  <p className="text-xl font-bold">₺{retailSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ortalama Satış</p>
                  <p className="text-xl font-bold">₺{(retailSales.reduce((sum, sale) => sum + sale.totalAmount, 0) / retailSales.length).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Ürün</p>
                  <p className="text-xl font-bold">{retailSales.reduce((sum, sale) => sum + sale.itemCount, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Perakende Satışlar</CardTitle>
          </CardHeader>
          <CardContent>
            {retailSales.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz perakende satış bulunmuyor
                </h3>
                <p className="text-gray-500 mb-6">
                  İlk perakende satışınızı yapmak için POS sistemini kullanın.
                </p>
                <Button onClick={() => navigate('/pos2')}>
                  <Zap className="h-4 w-4 mr-2" />
                  POS Satış Yap
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Satış No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih/Saat</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Müşteri</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ürün Sayısı</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tutar</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ödeme</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retailSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-blue-600">{sale.saleNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{sale.date}</p>
                            <p className="text-sm text-gray-500">{sale.time}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">{sale.customerName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">{sale.itemCount} adet</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600">₺{sale.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            sale.paymentMethod === 'Nakit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {sale.status}
                          </span>
                        </td>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}