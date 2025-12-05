import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, Download, Plus, Filter, Receipt } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSales, getSaleById, createInvoiceForSale } from '@/services/salesService';
import type { Sale, SaleWithDetails, InvoiceStatus } from '@/types/sales';
import { useAuthStore } from '@/stores/authStore';

export default function SalesListPage() {
  const navigate = useNavigate();
  const { branchId } = useAuthStore();

  // State
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Load sales
  useEffect(() => {
    loadSales();
  }, [branchId, startDate, endDate, statusFilter]);

  const loadSales = async () => {
    if (!branchId) return;

    setIsLoading(true);

    try {
      const filter: any = {};

      if (startDate) {
        filter.start_date = startDate;
      }

      if (endDate) {
        filter.end_date = endDate;
      }

      if (statusFilter && statusFilter !== 'all') {
        filter.status = statusFilter;
      }

      if (searchQuery) {
        filter.search = searchQuery;
      }

      const result = await getSales(branchId, filter);
      setSales(result);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast.error('Satışlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (saleId: string) => {
    try {
      const sale = await getSaleById(saleId);

      if (sale) {
        setSelectedSale(sale);
        setDetailModalOpen(true);
      } else {
        toast.error('Satış detayları bulunamadı');
      }
    } catch (error) {
      console.error('Error loading sale details:', error);
      toast.error('Satış detayları yüklenirken hata oluştu');
    }
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast('PDF indirme özelliği yakında eklenecek', { icon: 'ℹ️' });
  };

  // Handle create invoice
  const handleCreateInvoice = async (saleId: string) => {
    try {
      const loadingToast = toast.loading('E-fatura kesiliyor...');
      
      const result = await createInvoiceForSale(saleId);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success('E-fatura başarıyla kesildi');
        loadSales(); // Reload sales to update status
      } else {
        toast.error(result.error || 'E-fatura kesilemedi');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('E-fatura kesilirken hata oluştu');
    }
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

  // Pagination
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sales.slice(startIndex, endIndex);

  return (
    <Layout
      title="Satış Listesi"
      subtitle="Tüm satışları görüntüle ve yönet"
      actions={
        <Button onClick={() => navigate('/sales/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Satış
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Filtreler</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'all')}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Durum seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="sent">Gönderildi</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                    <SelectItem value="cancelled">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Ara</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Müşteri, fatura no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={loadSales}>Ara</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Satışlar</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{sales.length} kayıt bulundu</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-4">Yükleniyor...</p>
              </div>
            ) : currentSales.length === 0 ? (
              <div className="text-center py-16">
                <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Satış kaydı bulunamadı</p>
              </div>
            ) : (
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Fatura Tipi</TableHead>
                      <TableHead className="text-right">Toplam</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{formatDate(sale.invoice_date || '')}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.customer_name || '-'}</p>
                            <p className="text-xs text-gray-500">
                              {sale.invoice_number || sale.sale_number || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sale.invoice_type === 'E_FATURA' ? 'e-Fatura' : 'e-Arşiv'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(sale.total_amount || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge((sale.status || 'pending') as InvoiceStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(sale.id)}
                              title="Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {sale.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCreateInvoice(sale.id)}
                                title="E-Fatura Kes"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleDownloadPDF}
                              title="PDF İndir"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600">
                      Sayfa <span className="font-semibold text-gray-900">{currentPage}</span> / {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="shadow-sm"
                      >
                        Önceki
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="shadow-sm"
                      >
                        Sonraki
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Satış Detayları</DialogTitle>
            <DialogDescription>
              {selectedSale?.invoice_number || selectedSale?.sale_number}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Müşteri Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Müşteri Adı</p>
                    <p className="font-medium">{selectedSale.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Müşteri Tipi</p>
                    <p className="font-medium">{selectedSale.customer_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">VKN/TCKN</p>
                    <p className="font-medium">{selectedSale.vkn_tckn}</p>
                  </div>
                  {selectedSale.tax_office && (
                    <div>
                      <p className="text-gray-600">Vergi Dairesi</p>
                      <p className="font-medium">{selectedSale.tax_office}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">E-posta</p>
                    <p className="font-medium">{selectedSale.email}</p>
                  </div>
                  {selectedSale.phone && (
                    <div>
                      <p className="text-gray-600">Telefon</p>
                      <p className="font-medium">{selectedSale.phone}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-600">Adres</p>
                    <p className="font-medium">{selectedSale.address}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div>
                <h3 className="font-semibold mb-2">Fatura Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Fatura Tipi</p>
                    <p className="font-medium">
                      {selectedSale.invoice_type === 'E_FATURA' ? 'e-Fatura' : 'e-Arşiv'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fatura Tarihi</p>
                    <p className="font-medium">{formatDate(selectedSale.invoice_date || '')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ödeme Türü</p>
                    <p className="font-medium">{selectedSale.payment_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Durum</p>
                    <div>{getStatusBadge((selectedSale.status || 'pending') as InvoiceStatus)}</div>
                  </div>
                  {selectedSale.invoice_uuid && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Fatura UUID</p>
                      <p className="font-medium text-xs">{selectedSale.invoice_uuid}</p>
                    </div>
                  )}
                  {selectedSale.error_message && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Hata Mesajı</p>
                      <p className="font-medium text-red-500">{selectedSale.error_message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sale Items */}
              <div>
                <h3 className="font-semibold mb-2">Satış Kalemleri</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead className="text-right">Miktar</TableHead>
                      <TableHead className="text-right">Birim Fiyat</TableHead>
                      <TableHead className="text-right">KDV (%)</TableHead>
                      <TableHead className="text-right">Toplam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-gray-500">{item.barcode}</p>
                            {item.serial_number && (
                              <p className="text-xs text-gray-500">
                                S/N: {item.serial_number.serial_number}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">%{item.vat_rate}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium">{formatCurrency(selectedSale.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam KDV</span>
                    <span className="font-medium">
                      {formatCurrency(selectedSale.total_vat_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Genel Toplam</span>
                    <span className="text-blue-600">
                      {formatCurrency(selectedSale.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
