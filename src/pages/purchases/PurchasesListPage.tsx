import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Search, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { PurchaseService } from '@/services/purchaseService';
import { useAuthStore } from '@/stores/authStore';
import { showErrorToast } from '@/utils/errorHandling';
import { Badge } from '@/components/ui/badge';

export default function PurchasesListPage() {
  const navigate = useNavigate();
  const { branchId } = useAuthStore();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPurchases();
  }, [branchId]);

  const loadPurchases = async () => {
    if (!branchId) return;

    setLoading(true);
    try {
      const result = await PurchaseService.getPurchases(branchId);
      if (result.success && result.data) {
        setPurchases(result.data);
      } else {
        showErrorToast(result.error || 'Alış faturaları yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      showErrorToast('Alış faturaları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      purchase.purchase_number?.toLowerCase().includes(query) ||
      purchase.invoice_number?.toLowerCase().includes(query) ||
      purchase.supplier?.name?.toLowerCase().includes(query)
    );
  });

  const totalPurchases = purchases.length;
  const thisMonthTotal = purchases
    .filter(p => {
      const purchaseDate = new Date(p.purchase_date);
      const now = new Date();
      return purchaseDate.getMonth() === now.getMonth() && 
             purchaseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);
  
  const pendingCount = purchases.filter(p => p.remaining_amount > 0).length;
  const totalAmount = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const getPaymentTypeBadge = (type: string) => {
    const badges = {
      cash: <Badge className="bg-green-100 text-green-800">Nakit</Badge>,
      pos: <Badge className="bg-blue-100 text-blue-800">Kredi Kartı</Badge>,
      credit: <Badge className="bg-orange-100 text-orange-800">Vadeli</Badge>,
      partial: <Badge className="bg-purple-100 text-purple-800">Kısmi</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>{type}</Badge>;
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <p className="text-xl font-bold">{totalPurchases}</p>
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
                  <p className="text-xl font-bold">₺{thisMonthTotal.toFixed(2)}</p>
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
                  <p className="text-xl font-bold">{pendingCount}</p>
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
                  <p className="text-xl font-bold">₺{totalAmount.toFixed(2)}</p>
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Yükleniyor...</p>
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz alış faturası bulunmuyor'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? 'Farklı bir arama terimi deneyin.' 
                    : 'İlk alış faturanızı oluşturmak için aşağıdaki butona tıklayın.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/purchases/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Alış Faturası Oluştur
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fatura No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tedarikçi</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ödeme Tipi</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Tutar</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Kalan</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{purchase.purchase_number}</p>
                            {purchase.invoice_number && (
                              <p className="text-sm text-gray-500">Fatura: {purchase.invoice_number}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{purchase.supplier?.name || '-'}</p>
                          {purchase.supplier?.company_name && (
                            <p className="text-sm text-gray-500">{purchase.supplier.company_name}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(purchase.purchase_date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          {getPaymentTypeBadge(purchase.payment_type)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₺{purchase.total_amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {purchase.remaining_amount > 0 ? (
                            <span className="text-orange-600 font-medium">
                              ₺{purchase.remaining_amount?.toFixed(2) || '0.00'}
                            </span>
                          ) : (
                            <span className="text-green-600">Ödendi</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/purchases/${purchase.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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