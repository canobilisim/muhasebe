import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTransaction } from '@/services/personnelService';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/types/database';
import { toast } from 'sonner';

type Personnel = Database['public']['Tables']['personnel']['Row'];

interface TransactionModalProps {
  personnel: Personnel;
  transactionType: 'hakedis' | 'avans' | 'odeme' | 'kesinti';
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TRANSACTION_LABELS: Record<string, string> = {
  hakedis: 'Hakediş',
  avans: 'Avans',
  odeme: 'Ödeme',
  kesinti: 'Kesinti',
};

const formSchema = z.object({
  transaction_date: z.string().min(1, 'Tarih gerekli'),
  amount: z.string().min(1, 'Tutar gerekli'),
  description: z.string().min(1, 'Açıklama gerekli'),
  payment_type: z.enum(['cash', 'bank']).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function TransactionModal({
  personnel,
  transactionType,
  open,
  onClose,
  onSuccess,
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const { user, branchId } = useAuthStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      payment_type: 'cash',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!branchId) {
      toast.error('Şube bilgisi bulunamadı');
      return;
    }

    try {
      setLoading(true);

      const amount = parseFloat(data.amount);

      // Hakediş ve kesinti için credit (alacak), avans ve ödeme için debit (borç)
      const isCredit = transactionType === 'hakedis';
      const isDebit = transactionType === 'avans' || transactionType === 'odeme' || transactionType === 'kesinti';

      await createTransaction({
        personnel_id: personnel.id,
        branch_id: branchId,
        user_id: user?.id || null,
        transaction_date: data.transaction_date,
        transaction_type: transactionType,
        description: data.description,
        debit_amount: isDebit ? amount : 0,
        credit_amount: isCredit ? amount : 0,
        payment_type: data.payment_type || null,
        notes: data.notes || null,
      });

      toast.success(`${TRANSACTION_LABELS[transactionType]} kaydedildi`);
      onSuccess();
    } catch (error: any) {
      toast.error('İşlem kaydedilirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{TRANSACTION_LABELS[transactionType]} Ekle</DialogTitle>
          <DialogDescription>
            {personnel.first_name} {personnel.last_name} için {TRANSACTION_LABELS[transactionType].toLowerCase()} kaydı oluşturun
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarih</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tutar (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        transactionType === 'hakedis'
                          ? 'Örn: Ocak 2024 Maaşı'
                          : transactionType === 'avans'
                          ? 'Örn: Acil Avans'
                          : transactionType === 'odeme'
                          ? 'Örn: Maaş Ödemesi'
                          : 'Örn: SGK Kesintisi'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ödeme Tipi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ödeme tipi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="bank">Banka Transferi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ek notlar..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
