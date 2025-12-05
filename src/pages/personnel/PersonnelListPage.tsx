import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserPlus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonnelTable } from '@/components/personnel/PersonnelTable';
import { getPersonnel, deletePersonnel, type PersonnelWithStats } from '@/services/personnelService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
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

export default function PersonnelListPage() {
  const navigate = useNavigate();
  const { profile, branchId } = useAuthStore();
  const [personnel, setPersonnel] = useState<PersonnelWithStats[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<PersonnelWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<PersonnelWithStats | null>(null);

  useEffect(() => {
    loadPersonnel();
  }, [branchId]);

  useEffect(() => {
    filterPersonnel();
  }, [searchTerm, personnel]);

  const loadPersonnel = async () => {
    const effectiveBranchId = branchId || profile?.branch_id;
    
    if (!effectiveBranchId) {
      setLoading(false);
      toast.error('Şube bilgisi bulunamadı', {
        description: 'Lütfen giriş yapın veya şube seçin',
      });
      return;
    }

    try {
      setLoading(true);
      const data = await getPersonnel(effectiveBranchId);
      setPersonnel(data);
    } catch (error: any) {
      toast.error('Personel listesi yüklenirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPersonnel = () => {
    if (!searchTerm.trim()) {
      setFilteredPersonnel(personnel);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = personnel.filter(
      (p) =>
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        p.tc_kimlik?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term) ||
        p.position?.toLowerCase().includes(term) ||
        p.department?.toLowerCase().includes(term)
    );
    setFilteredPersonnel(filtered);
  };

  const handleAddPersonnel = () => {
    navigate('/personnel/new');
  };

  const handlePersonnelClick = (personnelId: string) => {
    navigate(`/personnel/${personnelId}`);
  };

  const handleEdit = (personnelId: string) => {
    navigate(`/personnel/${personnelId}/edit`);
  };

  const handleDeleteClick = (personnelId: string) => {
    const person = personnel.find(p => p.id === personnelId);
    if (person) {
      setPersonnelToDelete(person);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!personnelToDelete) return;

    try {
      await deletePersonnel(personnelToDelete.id);
      toast.success('Personel silindi', {
        description: `${personnelToDelete.first_name} ${personnelToDelete.last_name} başarıyla silindi`,
      });
      loadPersonnel();
    } catch (error: any) {
      toast.error('Personel silinirken hata oluştu', {
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setPersonnelToDelete(null);
    }
  };

  const activeCount = personnel.filter((p) => p.is_active).length;
  const inactiveCount = personnel.filter((p) => !p.is_active).length;
  const totalSalaries = personnel.reduce((sum, p) => sum + Number(p.monthly_salary), 0);
  const totalAdvances = personnel.reduce((sum, p) => sum + Number(p.remaining_advances), 0);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personel Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Personel bilgileri, maaş ve avans takibi
          </p>
        </div>
        <Button onClick={handleAddPersonnel} size="lg">
          <UserPlus className="mr-2 h-5 w-5" />
          Yeni Personel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} aktif, {inactiveCount} pasif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Maaş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSalaries.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </div>
            <p className="text-xs text-muted-foreground">Aylık brüt toplam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Avans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAdvances.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </div>
            <p className="text-xs text-muted-foreground">Kalan avans borcu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Personel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              {((activeCount / personnel.length) * 100 || 0).toFixed(0)}% oranı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Personel ara (ad, soyad, TC, telefon, pozisyon...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PersonnelTable
            personnel={filteredPersonnel}
            loading={loading}
            onPersonnelClick={handlePersonnelClick}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onRefresh={loadPersonnel}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {personnelToDelete && (
                <>
                  <strong>{personnelToDelete.first_name} {personnelToDelete.last_name}</strong> adlı personeli silmek istediğinize emin misiniz?
                  <br /><br />
                  Bu işlem geri alınamaz ve personele ait tüm maaş ve avans kayıtları da silinecektir.
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
    </Layout>
  );
}
