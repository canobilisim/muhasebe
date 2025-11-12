import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Receipt, Search, Filter, Eye, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRetailSales } from '@/hooks/useRetailSales';
import { RetailSaleDetailModal } from '@/components/sales/RetailSaleDetailModal';
import type { SaleWithDetails } from '@/types/sales';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function RetailSalesPage() {
  const navigate = useNavigate();
  const { sales, summary, loading, loadSales, getSaleDetail, deleteSale } = useRetailSales();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

  // Arama filtresi
  const handleSearch = () => {
    loadSales({ search: searchQuery });
  };

  // Satış detayını görüntüle
  const handleViewSale = async (saleId: string) => {
    const sale = await getSaleDetail(saleId);
    if (sale) {
      setSelectedSale(sale);
      setDetailModalOpen(true);
    }
  };

  // Satış silme onayı
  const handleDeleteClick = (saleId: string) => {
    setSaleToDelete(saleId);
    setDeleteDialogOpen(true);
  };

  // Satışı sil
  const handleConfirmDelete = async () => {
    if (saleToDelete) {
      await deleteSale(saleToDelete);
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  // Ödeme yöntemi etiketleri
  const paymentMethodLabels: Record<string, string> = {
    cash: 'Nakit',
    pos: 'Kredi Kartı',
    credit: 'Açık Hesap',
    partial: 'Kısmi Ödeme'
  };

  // Filtrelenmiş satışlar
  const filteredSales = searchQuery
    ? sales.filter(sale =>
        sale.sale_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sales;

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Filter className="h-4 w-4 mr-2" />
              )}
              Ara
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
                  <p className="text-xl font-bold">{summary.totalSales}</p>
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
                  <p className="text-sm text-gray-600">Toplam Tutar</p>
                  <p className="text-xl font-bold">₺{summary.totalAmount.toFixed(2)}</p>
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
                  <p className="text-xl font-bold">₺{summary.averageAmount.toFixed(2)}</p>
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
                  <p className="text-xl font-bold">{summary.totalItems}</p>
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
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-spin" />
                <p className="text-gray-500">Satışlar yükleniyor...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Satış bulunamadı' : 'Henüz perakende satış bulunmuyor'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? 'Arama kriterlerinize uygun satış bulunamadı.'
                    : 'İlk perakende satışınızı yapmak için POS sistemini kullanın.'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/pos2')}>
                    <Zap className="h-4 w-4 mr-2" />
                    POS Satış Yap
                  </Button>
                )}
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
                    {filteredSales.map((sale) => {
                      const items = sale.sale_items || sale.items || []
                      const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                      
                      return (
                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-blue-600">{sale.sale_number}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">
                                {sale.sale_date && format(new Date(sale.sale_date), 'dd.MM.yyyy', { locale: tr })}
                              </p>
                              <p className="text-sm text-gray-500">
                                {sale.sale_date && format(new Date(sale.sale_date), 'HH:mm', { locale: tr })}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-900">
                              {sale.customer?.name || sale.customer_name || 'Perakende Müşterisi'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-900">{itemCount} adet</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-green-600">
                              ₺{Number(sale.total_amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sale.payment_type === 'cash' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {paymentMethodLabels[sale.payment_type] || sale.payment_type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Tamamlandı
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Görüntüle"
                                onClick={() => handleViewSale(sale.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Sil" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteClick(sale.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Satış Detay Modalı */}
      <RetailSaleDetailModal
        sale={selectedSale}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedSale(null);
        }}
      />

      {/* Silme Onay Dialogu */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Satışı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu satışı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              Ürün stokları geri yüklenecek ve ilgili kasa hareketi silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}