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
import { Loader2, Package, Save, Plus, Search } from 'lucide-react';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import { showToast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';
import { QuickCategoryAddModal } from './QuickCategoryAddModal';
import type { ProductInsert } from '@/types';

interface QuickProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
  barcode: string;
}

const UNIT_OPTIONS = [
  { value: 'adet', label: 'Adet' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'gram', label: 'Gram' },
  { value: 'litre', label: 'Litre' },
  { value: 'ml', label: 'Mililitre' },
  { value: 'kutu', label: 'Kutu' },
  { value: 'paket', label: 'Paket' },
  { value: 'metre', label: 'Metre' },
  { value: 'cm', label: 'Santimetre' },
];

export const QuickProductAddModal: React.FC<QuickProductAddModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  barcode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; full_path: string; level: number }>>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const { branchId } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    salePrice: '',
    unit: 'adet',
    category: '',
    stockQuantity: '1',
  });

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Reset form
      setFormData({
        name: '',
        salePrice: '',
        unit: 'adet',
        category: '',
        stockQuantity: '1',
      });
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const result = await CategoryService.getFlatCategoryList();
      if (result.success && result.data) {
        setCategories(result.data);
        // Set first category as default if available
        if (result.data && result.data.length > 0) {
          setFormData(prev => ({ ...prev, category: result.data![0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryAdded = async (newCategory: any) => {
    // Reload categories
    await loadCategories();
    // Select the newly added category
    setFormData(prev => ({ ...prev, category: newCategory.id }));
    showToast.success(`${newCategory.name} kategorisi eklendi`);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast.error('Ürün adı gereklidir');
      return;
    }

    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      showToast.error('Geçerli bir satış fiyatı giriniz');
      return;
    }

    setIsLoading(true);

    try {
      // Check if barcode already exists
      const barcodeCheck = await ProductService.checkBarcodeExists(barcode);
      if (barcodeCheck.success && barcodeCheck.data) {
        showToast.error('Bu barkod zaten kullanımda!');
        setIsLoading(false);
        return;
      }

      // Get category name from categories list
      const selectedCategory = categories.find(c => c.id === formData.category);
      const categoryName = selectedCategory ? selectedCategory.name : 'GENEL';

      const productData: ProductInsert = {
        barcode: barcode,
        name: formData.name.trim(),
        category: categoryName, // Category name for display
        category_id: formData.category || null, // Category ID for relations
        sale_price: parseFloat(formData.salePrice),
        sale_price_1: parseFloat(formData.salePrice),
        sale_price_2: parseFloat(formData.salePrice),
        sale_price_3: parseFloat(formData.salePrice),
        purchase_price: 0, // Default to 0 for quick add
        stock_quantity: parseInt(formData.stockQuantity) || 1,
        critical_stock_level: 5, // Default critical level
        is_active: true,
        show_in_fast_sale: false, // Default to false for quick add
        branch_id: branchId, // Add current user's branch_id
      };

      const result = await ProductService.createProduct(productData);

      if (result.success && result.data) {
        showToast.success('Yeni ürün başarıyla eklendi');
        onProductAdded(result.data);
        onClose();
      } else {
        showToast.error(result.error || 'Ürün eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showToast.error('Ürün eklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Hızlı Ürün Ekleme
          </DialogTitle>
          <DialogDescription>
            Satış sürecinde hızlıca yeni ürün ekleyin. Barkod otomatik olarak doldurulmuştur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Barkod (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Barkod</Label>
            <Input
              id="barcode"
              value={barcode}
              readOnly
              className="bg-gray-50 text-gray-600"
            />
          </div>

          {/* Ürün Adı */}
          <div className="space-y-2">
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              placeholder="Ürün adını giriniz"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              autoFocus
            />
          </div>

          {/* Satış Fiyatı */}
          <div className="space-y-2">
            <Label htmlFor="salePrice">Satış Fiyatı (₺) *</Label>
            <Input
              id="salePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.salePrice}
              onChange={(e) => handleInputChange('salePrice', e.target.value)}
            />
          </div>

          {/* Miktar Birimi */}
          <div className="space-y-2">
            <Label htmlFor="unit">Miktar Birimi</Label>
            <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <div className="flex gap-2">
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Kategori seçiniz" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="sticky top-0 bg-white border-b p-2 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Kategori ara..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {categories
                    .filter((category) =>
                      categorySearch === '' ||
                      category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                      category.full_path.toLowerCase().includes(categorySearch.toLowerCase())
                    )
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {'  '.repeat(category.level)}
                        {category.level > 0 ? '└ ' : ''}
                        {category.name}
                      </SelectItem>
                    ))}
                  {categories.filter((category) =>
                    categorySearch === '' ||
                    category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                    category.full_path.toLowerCase().includes(categorySearch.toLowerCase())
                  ).length === 0 && (
                    <div className="py-6 text-center text-sm text-gray-500">
                      Kategori bulunamadı
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowCategoryModal(true)}
                title="Yeni Kategori Ekle"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stok Adedi */}
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stok Adedi</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              placeholder="1"
              value={formData.stockQuantity}
              onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
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
                Kaydet & Satışa Dön
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      {/* Hızlı Kategori Ekleme Modal */}
      <QuickCategoryAddModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </Dialog>
  );
};