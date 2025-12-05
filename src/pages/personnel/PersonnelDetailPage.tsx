import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, DollarSign, CreditCard, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PersonnelInfoTab } from '@/components/personnel/PersonnelInfoTab';
import { PersonnelTransactionsTab } from '@/components/personnel/PersonnelTransactionsTab';
import { TransactionModal } from '@/components/personnel/TransactionModal';
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
import { getPersonnelById, deletePersonnel } from '@/services/personnelService';
import type { Database } from '@/types/database';
import { toast } from 'sonner';

type Personnel = Database['public']['Tables']['personnel']['Row'];

export default function PersonnelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'hakedis' | 'avans' | 'odeme' | 'kesinti'>('hakedis');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadPersonnel();
    }
  }, [id]);

  const loadPersonnel = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getPersonnelById(id);
      setPersonnel(data);
    } catch (error: any) {
      toast.error('Personel bilgileri yüklenirken hata oluştu', {
        description: error.message,
      });
      navigate('/personnel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!personnel) return;

    try {
      await deletePersonnel(personnel.id);
      toast.success('Personel silindi', {
        description: `${personnel.first_name} ${personnel.last_name} başarıyla silindi`,
      });
      navigate('/personnel');
    } catch (error: any) {
      toast.error('Personel silinirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!personnel) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/personnel')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {personnel.first_name} {personnel.last_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {personnel.position || 'Pozisyon belirtilmemiş'} • {personnel.department || 'Departman belirtilmemiş'}
            </p>
          </div>
          <Badge variant={personnel.is_active ? 'default' : 'secondary'}>
            {personnel.is_active ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setTransactionType('hakedis');
              setShowTransactionModal(true);
            }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Hakediş
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setTransactionType('avans');
              setShowTransactionModal(true);
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Avans Ver
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setTransactionType('odeme');
              setShowTransactionModal(true);
            }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Ödeme
          </Button>
          <Button variant="outline" onClick={() => navigate(`/personnel/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(true)} className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="transactions">Hesap Hareketleri</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <PersonnelInfoTab personnel={personnel} />
        </TabsContent>

        <TabsContent value="transactions">
          <PersonnelTransactionsTab personnelId={personnel.id} />
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          personnel={personnel}
          transactionType={transactionType}
          open={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false);
            loadPersonnel();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{personnel.first_name} {personnel.last_name}</strong> adlı personeli silmek istediğinize emin misiniz?
              <br /><br />
              Bu işlem geri alınamaz ve personele ait tüm maaş ve avans kayıtları da silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </Layout>
  );
}
