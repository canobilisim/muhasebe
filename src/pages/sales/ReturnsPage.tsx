import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSales, cancelSale } from '@/services/salesService';
import type { Sale, InvoiceStatus } from '@/types/sales';
import { useAuthStore } from '@/stores/authStore';

export default function ReturnsPage() {
  const { branchId } = useAuthStore();

  // State
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load sales
  useEffect(() => {
    loadSales();
  }, [branchId]);

  const loadSales = async () => {
    if (!branchId) return;

    setIsLoading(true);

    try {
      // Load only sent sales (eligible for cancellation/return)
      const result = await getSales(branchId, {
        status: 'sent',
      });
      setSales(result);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast.error('Satışlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel invoice
  const handleCancelClick = (sale: Sale) => {
    setSelectedSale(sale);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSale) return;

    setIsProcessing(true);

    try {
      const result = await cancelSale(selectedSale.id);

      if (result.success) {
        toast.success('Fatura başarıyla iptal edildi');
        setCancelModalOpen(false);
        setSelectedSale(null);
        loadSales(); // Reload list
      } else {
        toast.error(result.error || 'Fatura iptal edilemedi');
      }
    } catch (error) {
      console.error('Error cancelling sale:', error);
      toast.error('Fatura iptal edilirken hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle return invoice
  const handleReturnClick = (sale: Sale) => {
    setSelectedSale(sale);
    setReturnModalOpen(true);
  };

  const handleReturnConfirm = async () => {
    if (!selectedSale) return;

    // TODO: Implement return invoice functionality
    toast('İade faturası özelliği yakında eklenecek', { icon: 'ℹ️' });
    setReturnModalOpen(false);
    setSelectedSale(null);
  };

  // Get status badge
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">Gönderildi</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Bekliyor</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Hata</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">İptal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ₺`;
  };

  return (
    <Layout
      title="İade / İptal"
      subtitle="Fatura iade ve iptal işlemleri"
    >
      <div className="space-y-6">
        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              İptal Edilebilir Faturalar ({sales.length} kayıt)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-4">Yükleniyor...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                İptal edilebilir fatura bulunamadı
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura No</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.invoice_number || sale.sale_number || '-'}
                      </TableCell>
                      <TableCell>{formatDate(sale.invoice_date || '')}</TableCell>
                      <TableCell>{sale.customer_name || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(sale.total_amount || 0)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge((sale.status || 'pending') as InvoiceStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnClick(sale)}
                            className="gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            İade Et
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(sale)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            İptal Et
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <DialogTitle>Fatura İptal</DialogTitle>
            </div>
            <DialogDescription>
              Bu faturayı iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fatura No</p>
                  <p className="font-medium">
                    {selectedSale.invoice_number || selectedSale.sale_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Müşteri</p>
                  <p className="font-medium">{selectedSale.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tarih</p>
                  <p className="font-medium">{formatDate(selectedSale.invoice_date || '')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tutar</p>
                  <p className="font-medium">{formatCurrency(selectedSale.total_amount || 0)}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Uyarı:</strong> Fatura iptal edildiğinde:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                  <li>Turkcell e-Fatura sisteminde iptal edilecek</li>
                  <li>Ürün stokları geri yüklenecek</li>
                  <li>Seri numaraları serbest bırakılacak</li>
                  <li>Bu işlem geri alınamaz</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              disabled={isProcessing}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'İptal Ediliyor...' : 'Faturayı İptal Et'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-500" />
              <DialogTitle>İade Faturası Oluştur</DialogTitle>
            </div>
            <DialogDescription>
              Bu satış için iade faturası oluşturmak istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Fatura No</p>
                  <p className="font-medium">
                    {selectedSale.invoice_number || selectedSale.sale_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Müşteri</p>
                  <p className="font-medium">{selectedSale.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tarih</p>
                  <p className="font-medium">{formatDate(selectedSale.invoice_date || '')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tutar</p>
                  <p className="font-medium">{formatCurrency(selectedSale.total_amount || 0)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Bilgi:</strong> İade faturası oluşturulduğunda:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                  <li>Turkcell e-Fatura sisteminde iade faturası kesilecek</li>
                  <li>Ürün stokları geri yüklenecek</li>
                  <li>Müşteriye iade tutarı iade edilmelidir</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReturnModalOpen(false)}
              disabled={isProcessing}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={handleReturnConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Oluşturuluyor...' : 'İade Faturası Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
