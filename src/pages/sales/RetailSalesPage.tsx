import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Receipt, Search, Filter, Eye, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useRetailSales } from '@/hooks/useRetailSales';
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
  const { sales, summary, loading, loadSales, loadSummary, deleteSale } = useRetailSales();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  
  // Filtre state'leri
  const [startDate, setStartDate] = useState(() => {
    // Bugünün tarihi (yerel saat dilimi)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [endDate, setEndDate] = useState(() => {
    // Bugünün tarihi (yerel saat dilimi)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Arama ve filtreleme
  const handleSearch = () => {
    const startDateTime = startDate ? `${startDate}T00:00:00` : undefined;
    const endDateTime = endDate ? `${endDate}T23:59:59` : undefined;
    
    loadSales({ 
      search: searchQuery,
      startDate: startDateTime,
      endDate: endDateTime,
      paymentMethod: paymentFilter !== 'all' ? paymentFilter : undefined,
    });
    
    // Özet kartlarını da güncelle
    loadSummary(startDateTime, endDateTime);
  };

  // Satış detayını görüntüle
  const handleViewSale = (saleId: string) => {
    navigate(`/retail-sales/${saleId}`);
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

  // İlk yükleme - bugünün satışlarını getir
  useEffect(() => {
    handleSearch();
  }, []);

  // Arama kutusu temizlendiğinde otomatik ara
  useEffect(() => {
    if (searchQuery === '') {
      handleSearch();
    }
  }, [searchQuery]);

  // Filtreleri temizle
  const handleClearFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    setStartDate(todayStr);
    setEndDate(todayStr);
    setPaymentFilter('all');
    setSearchQuery('');
    
    const startDateTime = `${todayStr}T00:00:00`;
    const endDateTime = `${todayStr}T23:59:59`;
    
    loadSales({
      startDate: startDateTime,
      endDate: endDateTime,
    });
    
    // Özet kartlarını da güncelle
    loadSummary(startDateTime, endDateTime);
  };

  return (
    <Layout
      title="Perakende Satışlar"
      subtitle="Hızlı satış (POS) sisteminden kaydedilen perakende satışlar"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Satış no, müşteri adı veya ürün ara..."
                  className="pl-10 w-96"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Ara
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtreler
              </Button>
            </div>
            
            <Button onClick={() => navigate('/pos2')}>
              <Zap className="h-4 w-4 mr-2" />
              Yeni POS Satış
            </Button>
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Bitiş Tarihi</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentFilter">Ödeme Yöntemi</Label>
                    <select
                      id="paymentFilter"
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                      <option value="all">Tümü</option>
                      <option value="cash">Nakit</option>
                      <option value="pos">Kredi Kartı</option>
                      <option value="credit">Açık Hesap</option>
                      <option value="partial">Kısmi Ödeme</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleSearch} className="flex-1" disabled={loading}>
                      Uygula
                    </Button>
                    <Button onClick={handleClearFilters} variant="outline" disabled={loading}>
                      Temizle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Satış</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.totalSales}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Tutar</p>
                  <p className="text-3xl font-bold text-green-600">₺{summary.totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Ortalama Satış</p>
                  <p className="text-3xl font-bold text-orange-600">₺{summary.averageAmount.toFixed(2)}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-purple-600">{summary.totalItems}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Receipt className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Perakende Satışlar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-spin" />
                <p className="text-gray-500">Satışlar yükleniyor...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-16">
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
                  <Button onClick={() => navigate('/pos2')} className="shadow-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    POS Satış Yap
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto p-6">
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
                    {sales.map((sale: any) => {
                      const items = sale.sale_items || sale.items || []
                      const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                      
                      return (
                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div 
                              className="flex items-center gap-2 cursor-pointer hover:underline"
                              onClick={() => handleViewSale(sale.id)}
                              title="Detayları görüntüle"
                            >
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
                            {sale.customer_id ? (
                              <span 
                                className="text-blue-600 hover:underline cursor-pointer"
                                onClick={() => navigate(`/customers/${sale.customer_id}`)}
                                title="Müşteri detayına git"
                              >
                                {sale.customer?.name || sale.customer_name}
                              </span>
                            ) : (
                              <span className="text-gray-900">
                                {sale.customer?.name || sale.customer_name || 'Perakende Müşterisi'}
                              </span>
                            )}
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