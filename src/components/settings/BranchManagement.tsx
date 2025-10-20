import { useState, useEffect } from 'react'
import { settingsService } from '@/services/settingsService'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormattedInput } from '@/components/ui/formatted-input'
import { Building, Plus, Edit, Loader2, Save } from 'lucide-react'
import type { Database } from '@/types/database'

type Branch = Database['public']['Tables']['branches']['Row']
type BranchInsert = Database['public']['Tables']['branches']['Insert']

interface BranchFormData {
  name: string
  address: string
  phone: string
  tax_number: string
}

export const BranchManagement = () => {
  const { userRole } = useAuthStore()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBranchForm, setShowBranchForm] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    phone: '0',
    tax_number: '',
  })

  // Check if user can manage branches (admin only)
  const canManageBranches = userRole === 'admin'

  // Load branches
  const loadBranches = async () => {
    if (!canManageBranches) return

    setIsLoading(true)
    setError(null)

    try {
      const branchData = await settingsService.getAllBranches()
      setBranches(branchData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Şubeler yüklenirken hata oluştu'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Load branches on mount
  useEffect(() => {
    if (canManageBranches) {
      loadBranches()
    }
  }, [canManageBranches])

  // Reset form data when dialog opens/closes
  useEffect(() => {
    if (showBranchForm) {
      if (selectedBranch) {
        setFormData({
          name: selectedBranch.name,
          address: selectedBranch.address || '',
          phone: selectedBranch.phone || '0',
          tax_number: selectedBranch.tax_number || '',
        })
      } else {
        setFormData({
          name: '',
          address: '',
          phone: '0',
          tax_number: '',
        })
      }
    }
  }, [showBranchForm, selectedBranch])

  // Handle form input changes
  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Şube adı gereklidir')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let result

      if (selectedBranch) {
        // Update existing branch
        result = await settingsService.updateCompanySettings(selectedBranch.id, {
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          phone: formData.phone && formData.phone !== '0' ? formData.phone.trim() : null,
          tax_number: formData.tax_number.trim() || null,
        })
      } else {
        // Create new branch
        const branchData: BranchInsert = {
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          phone: formData.phone && formData.phone !== '0' ? formData.phone.trim() : null,
          tax_number: formData.tax_number.trim() || null,
        }
        result = await settingsService.createCompanySettings(branchData)
      }

      if (result.success) {
        setShowBranchForm(false)
        setSelectedBranch(null)
        await loadBranches() // Reload branches
      } else {
        setError(result.error || 'İşlem başarısız')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle edit branch
  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    setShowBranchForm(true)
  }

  // Handle create new branch
  const handleCreateBranch = () => {
    setSelectedBranch(null)
    setShowBranchForm(true)
  }

  if (!canManageBranches) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Şube yönetimi için admin yetkisine sahip olmanız gerekir.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Şube Yönetimi
            </CardTitle>
            <Button
              onClick={handleCreateBranch}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Şube
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Şubeler yükleniyor...</span>
            </div>
          ) : (
            /* Branches Table */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şube Adı</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Vergi No</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Henüz şube bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">
                          {branch.name}
                        </TableCell>
                        <TableCell>
                          {branch.address || '-'}
                        </TableCell>
                        <TableCell>
                          {branch.phone || '-'}
                        </TableCell>
                        <TableCell>
                          {branch.tax_number || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(branch.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBranch(branch)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch Form Dialog */}
      <Dialog open={showBranchForm} onOpenChange={setShowBranchForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBranch ? 'Şube Düzenle' : 'Yeni Şube'}
            </DialogTitle>
            <DialogDescription>
              {selectedBranch 
                ? 'Şube bilgilerini düzenleyin.' 
                : 'Yeni şube oluşturun.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Branch Name */}
            <div className="space-y-2">
              <Label htmlFor="branch-name">Şube Adı *</Label>
              <Input
                id="branch-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Şube adını girin"
                disabled={isSaving}
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="branch-address">Adres</Label>
              <Textarea
                id="branch-address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Şube adresini girin"
                disabled={isSaving}
                rows={3}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="branch-phone">Telefon</Label>
              <FormattedInput
                id="branch-phone"
                formatterType="phone"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                disabled={isSaving}
              />
            </div>

            {/* Tax Number */}
            <div className="space-y-2">
              <Label htmlFor="branch-tax">Vergi Numarası</Label>
              <Input
                id="branch-tax"
                type="text"
                value={formData.tax_number}
                onChange={(e) => handleInputChange('tax_number', e.target.value)}
                placeholder="Vergi numarasını girin"
                disabled={isSaving}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBranchForm(false)
                  setSelectedBranch(null)
                }}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Kaydediliyor...' : (selectedBranch ? 'Güncelle' : 'Oluştur')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}