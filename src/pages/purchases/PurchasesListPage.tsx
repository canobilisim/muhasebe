import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export default function PurchasesListPage() {
  const navigate = useNavigate();

  return (
    <Layout
      title="Alış Faturaları"
      subtitle="Tedarikçilerden yapılan alışların fatura listesi"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Fatura ara..."
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          </div>
          
          <Button onClick={() => navigate('/purchases/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Alış Faturası
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Fatura</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bu Ay</p>
                  <p className="text-xl font-bold">₺0,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Tutar</p>
                  <p className="text-xl font-bold">₺0,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alış Faturaları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz alış faturası bulunmuyor
              </h3>
              <p className="text-gray-500 mb-6">
                İlk alış faturanızı oluşturmak için aşağıdaki butona tıklayın.
              </p>
              <Button onClick={() => navigate('/purchases/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Alış Faturası Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}