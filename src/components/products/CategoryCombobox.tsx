import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryService } from '@/services/categoryService'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

interface CategoryComboboxProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function CategoryCombobox({ value, onChange, disabled }: CategoryComboboxProps) {
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const { branchId } = useAuthStore()

    // Load categories
    const loadCategories = async () => {
        try {
            const result = await CategoryService.getCategories()
            if (result.success && result.data) {
                setCategories(result.data.map(cat => ({ id: cat.id, name: cat.name })))
            }
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    // Add new category
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Kategori adı boş olamaz')
            return
        }

        if (!branchId) {
            toast.error('Branch ID bulunamadı')
            return
        }

        try {
            const result = await CategoryService.createCategory({
                name: newCategoryName.trim(),
                branch_id: branchId,
                is_active: true
            })

            if (result.success && result.data) {
                toast.success('Kategori eklendi')
                setCategories(prev => [...prev, { id: result.data!.id, name: result.data!.name }])
                onChange(result.data.name)
                setNewCategoryName('')
                setShowAddDialog(false)
            } else {
                toast.error(result.error || 'Kategori eklenemedi')
            }
        } catch (error) {
            console.error('Error adding category:', error)
            toast.error('Kategori eklenirken hata oluştu')
        }
    }

    return (
        <>
            <div className="flex gap-2">
                <Select
                    value={value || ''}
                    onValueChange={onChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                    disabled={disabled}
                    className="h-9 px-3 gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Ekle
                </Button>
            </div>

            {/* Add Category Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Kategori Ekle</DialogTitle>
                        <DialogDescription>
                            Yeni bir ürün kategorisi oluşturun
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-category-name">Kategori Adı</Label>
                            <Input
                                id="new-category-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Kategori adını girin"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddCategory()
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleAddCategory}>Ekle</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
