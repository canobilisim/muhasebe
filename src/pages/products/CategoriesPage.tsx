import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryService, ProductCategory, ProductCategoryInsert, ProductCategoryUpdate } from '@/services/categoryService'
import { FolderTree, Plus, Edit, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    description: '',
    display_order: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await CategoryService.getCategories()
      if (response.success && response.data) {
        setCategories(response.data)
      } else {
        toast.error(response.error || 'Kategoriler yüklenemedi')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setFormData({
      name: '',
      parent_id: '',
      description: '',
      display_order: 0
    })
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      parent_id: category.parent_id || '',
      description: category.description || '',
      display_order: category.display_order || 0
    })
    setIsModalOpen(true)
  }

  const handleDeleteCategory = (category: ProductCategory) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const categoryData: ProductCategoryInsert | ProductCategoryUpdate = {
        name: formData.name.trim(),
        parent_id: formData.parent_id || null,
        description: formData.description.trim() || null,
        display_order: formData.display_order || 0,
        is_active: true
      }

      let response
      if (selectedCategory) {
        response = await CategoryService.updateCategory(selectedCategory.id, categoryData)
        if (response.success) {
          toast.success('Kategori güncellendi')
        }
      } else {
        response = await CategoryService.createCategory(categoryData as ProductCategoryInsert)
        if (response.success) {
          toast.success('Kategori oluşturuldu')
        }
      }

      if (response.success) {
        setIsModalOpen(false)
        fetchCategories()
      } else {
        toast.error(response.error || 'İşlem başarısız')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return

    setIsSubmitting(true)
    try {
      const response = await CategoryService.deleteCategory(selectedCategory.id)
      if (response.success) {
        toast.success('Kategori silindi')
        setIsDeleteDialogOpen(false)
        fetchCategories()
      } else {
        toast.error(response.error || 'Silme işlemi başarısız')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || '-'
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
            <p className="text-gray-600 mt-1">Ürün kategorilerini yönetin</p>
          </div>
          <Button onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kategori
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                Kategoriler ({filteredCategories.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz kategori bulunmuyor.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori Adı</TableHead>
                      <TableHead>Üst Kategori</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead className="text-center">Sıra</TableHead>
                      <TableHead className="text-center">Durum</TableHead>
                      <TableHead className="text-center">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          {getCategoryName(category.parent_id)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {category.display_order || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kategori Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kategori adı"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_id">Üst Kategori</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Üst kategori seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ana Kategori</SelectItem>
                    {categories
                      .filter(c => c.id !== selectedCategory?.id)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori açıklaması (opsiyonel)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Görüntüleme Sırası</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kategoriyi Sil</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                <strong>{selectedCategory?.name}</strong> kategorisini silmek istediğinizden emin misiniz?
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                Not: Bu kategori altındaki ürünler etkilenmeyecektir.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Siliniyor...' : 'Sil'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default CategoriesPage
