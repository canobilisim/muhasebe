import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Receipt, User, Calendar, CreditCard, Package, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRetailSales } from '@/hooks/useRetailSales';
import type { SaleWithDetails } from '@/types/sales';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function RetailSaleDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getSaleDetail } = useRetailSales();
  const [sale, setSale] = useState<SaleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSaleDetail();
    }
  }, [id]);

  const loadSaleDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const saleData = await getSaleDetail(id);
      if (saleData) {
        setSale(saleData);
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Nakit',
    pos: 'Kredi Kartı',
    credit: 'Açık Hesap',
    partial: 'Kısmi Ödeme'
  };

  if (loading) {
    return (
      <Layout title="Satış Detayı" subtitle="Yükleniyor...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-16 w-16 text-gray-300 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!sale) {
    return (
      <Layout title="Satış Detayı" subtitle="Satış bulunamadı">
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Satış Bulunamadı</h3>
            <p className="text-gray-500 mb-6">İstediğiniz satış kaydı bulunamadı.</p>
            <Button onClick={() => navigate('/retail-sales')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Perakende Satışlara Dön
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const items = sale.sale_items || sale.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout
      title={`Satış Detayı - ${sale.sale_number}`}
      subtitle="Perakende satış detay bilgileri"
    >
      <div className="space-y-6">
        {/* Geri Butonu */}
        <div>
          <Button variant="outline" onClick={() => navigate('/retail-sales')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Perakende Satışlara Dön
          </Button>
        </div>

        {/* Satış Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Kolon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Satış Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Satış Numarası</label>
                <p className="text-lg font-semibold">{sale.sale_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tarih ve Saat
                </label>
                <p className="text-base">
                  {sale.sale_date && format(new Date(sale.sale_date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Müşteri
                </label>
                {sale.customer_id ? (
                  <p 
                    className="text-base text-blue-600 hover:underline cursor-pointer"
                    onClick={() => navigate(`/customers/${sale.customer_id}`)}
                  >
                    {sale.customer?.name || sale.customer_name}
                  </p>
                ) : (
                  <p className="text-base">{sale.customer?.name || sale.customer_name || 'Perakende Müşterisi'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Ödeme Yöntemi
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  sale.payment_type === 'cash' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {paymentMethodLabels[sale.payment_type] || sale.payment_type}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sağ Kolon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Tutar Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Toplam Ürün</span>
                <span className="font-medium">{itemCount} adet</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="font-medium">₺{Number(sale.subtotal || sale.total_amount).toFixed(2)}</span>
              </div>

              {sale.discount_amount && Number(sale.discount_amount) > 0 && (
                <div className="flex justify-between items-center py-2 border-b text-red-600">
                  <span>İndirim</span>
                  <span className="font-medium">-₺{Number(sale.discount_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                <span className="text-lg font-semibold text-gray-900">Toplam Tutar</span>
                <span className="text-2xl font-bold text-green-600">
                  ₺{Number(sale.total_amount).toFixed(2)}
                </span>
              </div>

              {sale.payment_type === 'partial' && sale.paid_amount && (
                <>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Ödenen</span>
                    <span className="font-medium text-green-600">
                      ₺{Number(sale.paid_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Kalan</span>
                    <span className="font-medium text-orange-600">
                      ₺{(Number(sale.total_amount) - Number(sale.paid_amount)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ürün Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Satılan Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ürün</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Birim Fiyat</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Miktar</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">İndirim</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.product?.name || item.product_name}</p>
                          {item.product?.barcode && (
                            <p className="text-sm text-gray-500">Barkod: {item.product.barcode}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        ₺{Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.quantity} {item.product?.unit || 'adet'}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {item.discount_amount && Number(item.discount_amount) > 0 
                          ? `-₺${Number(item.discount_amount).toFixed(2)}`
                          : '-'
                        }
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₺{Number(item.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        {sale.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{sale.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
