import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FolderPlus, Save } from 'lucide-react';
import { CategoryService, type ProductCategoryInsert } from '@/services/categoryService';
import { showToast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';

interface QuickCategoryAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: any) => void;
  parentId?: string | null;
}

export const QuickCategoryAddModal: React.FC<QuickCategoryAddModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
  parentId = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<Array<{ id: string; name: string; full_path: string }>>([]);
  const { branchId } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    parentId: parentId || '',
    description: '',
  });

  // Load parent categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadParentCategories();
      // Reset form
      setFormData({
        name: '',
        parentId: parentId || '',
        description: '',
      });
    }
  }, [isOpen, parentId]);

  const loadParentCategories = async () => {
    try {
      const result = await CategoryService.getFlatCategoryList();
      if (result.success && result.data) {
        setParentCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading parent categories:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast.error('Kategori adı gereklidir');
      return;
    }

    setIsLoading(true);

    try {
      // Check if category already exists
      const parentIdForCheck = formData.parentId === 'root' ? null : formData.parentId || null;
      const existsCheck = await CategoryService.checkCategoryExists(
        formData.name.trim(), 
        parentIdForCheck
      );
      
      if (existsCheck.success && existsCheck.data) {
        showToast.error('Bu kategori adı zaten kullanımda!');
        setIsLoading(false);
        return;
      }

      const categoryData: ProductCategoryInsert = {
        name: formData.name.trim(),
        parent_id: formData.parentId === 'root' ? null : formData.parentId || null,
        description: formData.description.trim() || null,
        branch_id: branchId,
        is_active: true,
        display_order: 0,
      };

      const result = await CategoryService.createCategory(categoryData);

      if (result.success && result.data) {
        showToast.success('Yeni kategori başarıyla eklendi');
        onCategoryAdded(result.data);
        onClose();
      } else {
        showToast.error(result.error || 'Kategori eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast.error('Kategori eklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-green-600" />
            Hızlı Kategori Ekleme
          </DialogTitle>
          <DialogDescription>
            Yeni kategori ekleyin. Ana kategori veya alt kategori olarak ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Kategori Adı */}
          <div className="space-y-2">
            <Label htmlFor="name">Kategori Adı *</Label>
            <Input
              id="name"
              placeholder="Kategori adını giriniz"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              autoFocus
            />
          </div>

          {/* Üst Kategori */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Üst Kategori</Label>
            <Select 
              value={formData.parentId} 
              onValueChange={(value) => handleInputChange('parentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ana kategori olarak ekle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Ana Kategori</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.full_path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              placeholder="Kategori açıklaması (opsiyonel)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Kategori Ekle
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};