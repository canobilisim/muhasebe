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
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getPersonnelTransactions, deleteTransaction } from '@/services/personnelService';
import { formatCurrency } from '@/lib/utils';
import type { Database } from '@/types/database';
import { toast } from 'sonner';

type PersonnelTransaction = Database['public']['Tables']['personnel_transactions']['Row'];

interface PersonnelTransactionsTabProps {
  personnelId: string;
}

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  hakedis: 'Hakediş',
  avans: 'Avans',
  odeme: 'Ödeme',
  kesinti: 'Kesinti',
};

const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  hakedis: 'bg-green-100 text-green-800',
  avans: 'bg-orange-100 text-orange-800',
  odeme: 'bg-blue-100 text-blue-800',
  kesinti: 'bg-red-100 text-red-800',
};

export function PersonnelTransactionsTab({ personnelId }: PersonnelTransactionsTabProps) {
  const [transactions, setTransactions] = useState<PersonnelTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<PersonnelTransaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [personnelId]);

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

  const handleDeleteClick = (transaction: PersonnelTransaction) => {
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

  // Özet hesaplamaları
  const currentBalance = transactions.length > 0 ? Number(transactions[0].balance) : 0;
  const totalCredit = transactions.reduce((sum, t) => sum + Number(t.credit_amount), 0);
  const totalDebit = transactions.reduce((sum, t) => sum + Number(t.debit_amount), 0);

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Güncel Bakiye</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance > 0 ? 'text-green-600' : currentBalance < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(Math.abs(currentBalance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentBalance > 0 ? 'Personel alacaklı' : currentBalance < 0 ? 'Personel borçlu' : 'Bakiye sıfır'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Alacak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCredit)}
            </div>
            <p className="text-xs text-muted-foreground">Hakediş toplamı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalDebit)}
            </div>
            <p className="text-xs text-muted-foreground">Avans/Ödeme toplamı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">İşlem Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Toplam hareket</p>
          </CardContent>
        </Card>
      </div>

      {/* İşlem Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Hareketleri</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Henüz hesap hareketi bulunmuyor</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem Tipi</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Borç</TableHead>
                    <TableHead className="text-right">Alacak</TableHead>
                    <TableHead className="text-right">Bakiye</TableHead>
                    <TableHead>Ödeme Tipi</TableHead>
                    <TableHead>İşlem No</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={TRANSACTION_TYPE_COLORS[transaction.transaction_type]}>
                          {TRANSACTION_TYPE_LABELS[transaction.transaction_type] || transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="truncate">{transaction.description || '-'}</div>
                        {transaction.notes && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {transaction.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.debit_amount > 0 ? (
                          <span className="text-orange-600 font-medium flex items-center justify-end gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {formatCurrency(transaction.debit_amount)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.credit_amount > 0 ? (
                          <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {formatCurrency(transaction.credit_amount)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={transaction.balance > 0 ? 'text-green-600' : transaction.balance < 0 ? 'text-red-600' : ''}>
                          {formatCurrency(Math.abs(transaction.balance))}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.payment_type ? (
                          <Badge variant="outline">
                            {transaction.payment_type === 'cash' ? 'Nakit' : 'Banka'}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.transaction_number || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(transaction);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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
