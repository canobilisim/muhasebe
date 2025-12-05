import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, TrendingUp, TrendingDown, FileText, Filter, Printer, X, Download } from 'lucide-react';
import { getPersonnelTransactions, deleteTransaction } from '@/services/personnelService';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { downloadPersonnelTransactionsPDF, type PersonnelTransactionPDF, type PersonnelPDF } from '@/utils/personnelTransactionsPdfGenerator';

type PersonnelTransaction = PersonnelTransactionPDF;
type Personnel = PersonnelPDF;

interface PersonnelTransactionsTabProps {
  personnelId: string;
  personnel?: Personnel;
}

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  hakedis: 'Hakediş',
  odeme: 'Ödeme',
};

const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  hakedis: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  odeme: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
};

export function PersonnelTransactionsTab({ personnelId, personnel }: PersonnelTransactionsTabProps) {
  const [transactions, setTransactions] = useState<PersonnelTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PersonnelTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<PersonnelTransaction | null>(null);
  
  // Detay modal state'leri
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PersonnelTransaction | null>(null);
  
  // Filtre state'leri
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [paymentType, setPaymentType] = useState<string>('all');

  useEffect(() => {
    loadTransactions();
  }, [personnelId]);

  useEffect(() => {
    applyFilters();
  }, [transactions, startDate, endDate, transactionType, paymentType]);

  // Maaş gününden bugüne varsayılan tarih aralığını ayarla
  useEffect(() => {
    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (personnel?.salary_day) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Maaş günü bu ayda geçtiyse bu aydan başla, geçmediyse geçen aydan
      let salaryDate = new Date(currentYear, currentMonth, personnel.salary_day);
      if (salaryDate > today) {
        salaryDate = new Date(currentYear, currentMonth - 1, personnel.salary_day);
      }
      
      setStartDate(formatDateLocal(salaryDate));
      setEndDate(formatDateLocal(today));
    } else {
      // Maaş günü yoksa son 30 gün
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setStartDate(formatDateLocal(thirtyDaysAgo));
      setEndDate(formatDateLocal(today));
    }
  }, [personnel]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getPersonnelTransactions(personnelId);
      setTransactions(data);
    } catch (error: any) {
      toast.error('Hesap hareketleri yüklenirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Tarih filtresi
    if (startDate) {
      filtered = filtered.filter(t => t.transaction_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.transaction_date <= endDate);
    }

    // İşlem tipi filtresi
    if (transactionType !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === transactionType);
    }

    // Ödeme tipi filtresi
    if (paymentType !== 'all') {
      filtered = filtered.filter(t => t.payment_type === paymentType);
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (personnel?.salary_day) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let salaryDate = new Date(currentYear, currentMonth, personnel.salary_day);
      if (salaryDate > today) {
        salaryDate = new Date(currentYear, currentMonth - 1, personnel.salary_day);
      }
      setStartDate(formatDateLocal(salaryDate));
      setEndDate(formatDateLocal(today));
    } else {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setStartDate(formatDateLocal(thirtyDaysAgo));
      setEndDate(formatDateLocal(today));
    }
    setTransactionType('all');
    setPaymentType('all');
  };

  const handlePrint = () => {
    // Yazdırma öncesi sayfa başlığını güncelle
    const originalTitle = document.title;
    if (personnel) {
      document.title = `${personnel.first_name} ${personnel.last_name} - Hesap Hareketleri`;
    }
    
    window.print();
    
    // Yazdırma sonrası başlığı geri yükle
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleExportPDF = () => {
    if (!personnel) {
      toast.error('Personel bilgisi bulunamadı');
      return;
    }

    try {
      downloadPersonnelTransactionsPDF({
        personnel,
        transactions: filteredTransactions,
        dateRange: {
          startDate,
          endDate,
        },
        summary: {
          currentBalance,
          totalCredit,
          totalDebit,
          transactionCount: filteredTransactions.length,
        },
        companyInfo: {
          name: 'HesapOnda',
        },
      });
      toast.success('PDF başarıyla oluşturuldu');
    } catch (error: any) {
      toast.error('PDF oluşturulurken hata oluştu', {
        description: error.message,
      });
    }
  };

  const handleTransactionClick = (transaction: PersonnelTransaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (transaction: PersonnelTransaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransaction(transactionToDelete.id);
      toast.success('İşlem silindi');
      loadTransactions();
    } catch (error: any) {
      toast.error('İşlem silinirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  // Özet hesaplamaları (TÜM veriye göre - filtrelerden etkilenmesin)
  const currentBalance = transactions.length > 0 ? Number(transactions[0].balance) : 0;
  const totalCredit = transactions.reduce((sum, t) => sum + Number(t.credit_amount), 0);
  const totalDebit = transactions.reduce((sum, t) => sum + Number(t.debit_amount), 0);

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={`border-l-4 ${currentBalance > 0 ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/10' : currentBalance < 0 ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10' : 'border-l-gray-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${currentBalance > 0 ? 'text-green-600' : currentBalance < 0 ? 'text-red-600' : 'text-gray-600'}`} />
              Güncel Bakiye
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${currentBalance > 0 ? 'text-green-600' : currentBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(Math.abs(currentBalance))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentBalance > 0 ? '✓ Personel alacaklı' : currentBalance < 0 ? '⚠ Personel borçlu' : 'Bakiye sıfır'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Toplam Hakediş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrency(totalCredit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Alacak toplamı</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              Toplam Ödeme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalDebit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Borç toplamı</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              İşlem Sayısı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Toplam hareket</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtre ve Yazdırma Butonları */}
      <div className="flex items-center gap-2 print:hidden">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtrele
        </Button>
        <Button variant="outline" onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" />
          PDF İndir
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Yazdır
        </Button>
        {(transactionType !== 'all' || paymentType !== 'all') && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Filtre Paneli */}
      {showFilters && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-base">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionType">İşlem Tipi</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="hakedis">Hakediş</SelectItem>
                    <SelectItem value="odeme">Ödeme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentType">Ödeme Tipi</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger id="paymentType">
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="bank">Banka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* İşlem Listesi */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Hesap Hareketleri
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                {transactions.length === 0 ? 'Henüz hesap hareketi bulunmuyor' : 'Filtreye uygun işlem bulunamadı'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {transactions.length === 0 ? 'Hakediş veya ödeme ekleyerek başlayın' : 'Farklı filtre kriterleri deneyin'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Tarih</TableHead>
                    <TableHead className="font-semibold">İşlem</TableHead>
                    <TableHead className="font-semibold">Açıklama</TableHead>
                    <TableHead className="text-right font-semibold">Borç</TableHead>
                    <TableHead className="text-right font-semibold">Alacak</TableHead>
                    <TableHead className="text-right font-semibold">Bakiye</TableHead>
                    <TableHead className="font-semibold">Ödeme</TableHead>
                    <TableHead className="font-semibold">İşlem No</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow 
                      key={transaction.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-1 rounded-full bg-primary/20" />
                          {new Date(transaction.transaction_date).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${TRANSACTION_TYPE_COLORS[transaction.transaction_type]} font-medium`}>
                          {TRANSACTION_TYPE_LABELS[transaction.transaction_type] || transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="font-medium truncate">{transaction.description || '-'}</div>
                        {transaction.notes && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {transaction.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(transaction.debit_amount || 0) > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950/30">
                            <TrendingDown className="h-3.5 w-3.5 text-orange-600" />
                            <span className="text-orange-700 dark:text-orange-400 font-semibold">
                              {formatCurrency(transaction.debit_amount || 0)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(transaction.credit_amount || 0) > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/30">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              {formatCurrency(transaction.credit_amount || 0)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-bold ${
                          (transaction.balance || 0) > 0 
                            ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                            : (transaction.balance || 0) < 0 
                            ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' 
                            : 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400'
                        }`}>
                          {formatCurrency(Math.abs(transaction.balance || 0))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.transaction_type === 'odeme' && transaction.payment_type ? (
                          <Badge variant="outline" className="font-medium">
                            {transaction.payment_type === 'cash' ? '💵 Nakit' : '🏦 Banka'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {transaction.transaction_number || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/30"
                          onClick={(e) => handleDeleteClick(transaction, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <AlertDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              İşlem Detayları
            </AlertDialogTitle>
          </AlertDialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tarih</p>
                  <p className="text-base font-semibold">
                    {new Date(selectedTransaction.transaction_date).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">İşlem Tipi</p>
                  <Badge className={`${TRANSACTION_TYPE_COLORS[selectedTransaction.transaction_type]} font-medium mt-1`}>
                    {TRANSACTION_TYPE_LABELS[selectedTransaction.transaction_type]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedTransaction.transaction_type === 'hakedis' ? 'Alacak Tutarı' : 'Borç Tutarı'}
                  </p>
                  <p className={`text-2xl font-bold ${selectedTransaction.transaction_type === 'hakedis' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {formatCurrency(selectedTransaction.transaction_type === 'hakedis' ? (selectedTransaction.credit_amount || 0) : (selectedTransaction.debit_amount || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">İşlem Sonrası Bakiye</p>
                  <p className={`text-2xl font-bold ${(selectedTransaction.balance || 0) > 0 ? 'text-green-600' : (selectedTransaction.balance || 0) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(selectedTransaction.balance || 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedTransaction.balance || 0) > 0 ? 'Alacaklı' : (selectedTransaction.balance || 0) < 0 ? 'Borçlu' : 'Dengede'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Açıklama</p>
                <p className="text-base">{selectedTransaction.description || '-'}</p>
              </div>

              {selectedTransaction.transaction_type === 'odeme' && selectedTransaction.payment_type && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ödeme Tipi</p>
                  <Badge variant="outline" className="font-medium mt-1">
                    {selectedTransaction.payment_type === 'cash' ? '💵 Nakit' : '🏦 Banka Transferi'}
                  </Badge>
                </div>
              )}

              {selectedTransaction.notes && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notlar</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTransaction.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">İşlem No: {selectedTransaction.transaction_number}</p>
                <p className="text-xs text-muted-foreground">
                  Oluşturulma: {selectedTransaction.created_at ? new Date(selectedTransaction.created_at).toLocaleString('tr-TR') : '-'}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Kapat</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {transactionToDelete && (
                <>
                  <strong>{new Date(transactionToDelete.transaction_date).toLocaleDateString('tr-TR')}</strong> tarihli{' '}
                  <strong>{TRANSACTION_TYPE_LABELS[transactionToDelete.transaction_type]}</strong> işlemini silmek istediğinize emin misiniz?
                  <br /><br />
                  Bu işlem geri alınamaz ve bakiyeler otomatik olarak yeniden hesaplanacaktır.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
