import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserPlus, Users, DollarSign, UserCheck, TrendingUp } from 'lucide-react';
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

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personel Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Personel bilgileri ve maaş takibi
          </p>
        </div>
        <Button onClick={handleAddPersonnel} size="lg" className="shadow-lg">
          <UserPlus className="mr-2 h-5 w-5" />
          Yeni Personel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Toplam Personel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{personnel.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">{activeCount} aktif</span>
              {inactiveCount > 0 && <span className="text-muted-foreground">, {inactiveCount} pasif</span>}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Toplam Maaş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {totalSalaries.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aylık brüt toplam</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              Aktif Personel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">%{((activeCount / personnel.length) * 100 || 0).toFixed(0)}</span> aktiflik oranı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Personel ara (ad, soyad, TC, telefon, pozisyon...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 text-base"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                  Bu işlem geri alınamaz ve personele ait tüm hesap hareketleri de silinecektir.
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
