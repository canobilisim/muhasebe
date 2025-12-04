import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { FastSaleCategoryService } from '@/services/fastSaleCategoryService';
import { showToast } from '@/lib/toast';
import type { FastSaleCategory } from '@/types';
import { useFastSaleStore } from '@/stores/fastSaleStore';

interface FastSaleCategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastSaleCategoryManager = ({ isOpen, onClose }: FastSaleCategoryManagerProps) => {
  const [categories, setCategories] = useState<FastSaleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FastSaleCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_order: 1,
    is_active: true,
  });
  const refreshFastSaleData = useFastSaleStore(state => state.refreshData);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const result = await FastSaleCategoryService.getAll();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        showToast.error(result.error || 'Kategoriler yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: FastSaleCategory) => {
    // Yeni kategori ekleme kontrolü - maksimum 5 kategori
    if (!category && categories.length >= 5) {
      showToast.error('Maksimum 5 hızlı satış kategorisi ekleyebilirsiniz');
      return;
    }

    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        display_order: category.display_order,
        is_active: category.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        display_order: categories.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      display_order: 1,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast.error('Kategori adı zorunludur');
      return;
    }

    try {
      let result;
      if (editingCategory) {
        result = await FastSaleCategoryService.update(editingCategory.id, formData);
      } else {
        result = await FastSaleCategoryService.create(formData);
      }

      if (result.success) {
        showToast.success(editingCategory ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
        handleCloseModal();
        loadCategories();
        // Refresh fast sale cache
        refreshFastSaleData();
      } else {
        showToast.error(result.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showToast.error('Kategori kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const result = await FastSaleCategoryService.delete(id);
      if (result.success) {
        showToast.success('Kategori silindi');
        loadCategories();
        // Refresh fast sale cache
        refreshFastSaleData();
      } else {
        showToast.error(result.error || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast.error('Kategori silinirken hata oluştu');
    }
  };

  return (
    <>
      {/* Main Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Hızlı Satış Kategorileri</DialogTitle>
              <Button 
                onClick={() => handleOpenModal()} 
                size="sm"
                disabled={categories.length >= 5}
                title={categories.length >= 5 ? 'Maksimum 5 kategori ekleyebilirsiniz' : ''}
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kategori
              </Button>
            </div>
            <DialogDescription>
              Hızlı satış ekranında gösterilecek kategorileri yönetin. (Maksimum 5 kategori)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Henüz kategori eklenmemiş</p>
                <p className="text-sm mt-1">Yeni kategori eklemek için yukarıdaki butonu kullanın</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.display_order}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            category.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {category.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Kategori bilgilerini güncelleyin.' : 'Yeni bir hızlı satış kategorisi oluşturun.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kategori Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: AKSESUAR"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Görüntüleme Sırası</Label>
              <Input
                id="display_order"
                type="number"
                min="1"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                Aktif
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                İptal
              </Button>
              <Button type="submit">
                {editingCategory ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
