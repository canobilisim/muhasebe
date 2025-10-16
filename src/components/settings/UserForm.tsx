import { useState, useEffect } from 'react'
import { useUserManagement } from '@/hooks/useUserManagement'
import { settingsService } from '@/services/settingsService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { Loader2, Save } from 'lucide-react'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserRole = Database['public']['Enums']['user_role']
type Branch = Database['public']['Tables']['branches']['Row']

interface UserFormProps {
  user?: User | null
  onSuccess: () => void
  onCancel: () => void
}

interface UserFormData {
  full_name: string
  email: string
  role: UserRole
  branch_id: string
  is_active: boolean
}

export const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
  const { createUser, updateUser, getAvailableRoles } = useUserManagement()
  
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    role: 'cashier',
    branch_id: '',
    is_active: true,
  })

  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id || '',
        is_active: user.is_active,
      })
    } else {
      setFormData({
        full_name: '',
        email: '',
        role: 'cashier',
        branch_id: '',
        is_active: true,
      })
    }
  }, [user])

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchData = await settingsService.getAllBranches()
        setBranches(branchData)
        
        // Set default branch if creating new user and only one branch exists
        if (!user && branchData.length === 1) {
          setFormData(prev => ({ ...prev, branch_id: branchData[0].id }))
        }
      } catch (err) {
        console.error('Error loading branches:', err)
      }
    }
    loadBranches()
  }, [user])

  // Handle form input changes
  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setError('Ad soyad gereklidir')
      return false
    }

    if (!formData.email.trim()) {
      setError('E-posta gereklidir')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin')
      return false
    }

    if (!formData.branch_id) {
      setError('Şube seçimi gereklidir')
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      let result

      if (user) {
        // Update existing user
        result = await updateUser(user.id, {
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          branch_id: formData.branch_id,
          is_active: formData.is_active,
        })
      } else {
        // Create new user
        result = await createUser({
          id: crypto.randomUUID(), // Temporary ID, will be replaced by Supabase Auth
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          branch_id: formData.branch_id,
          is_active: formData.is_active,
        })
      }

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'İşlem başarısız')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const availableRoles = getAvailableRoles()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Ad Soyad *</Label>
        <Input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          placeholder="Kullanıcının adını ve soyadını girin"
          disabled={isLoading}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">E-posta *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="E-posta adresini girin"
          disabled={isLoading || !!user} // Disable email editing for existing users
          required
        />
        {user && (
          <p className="text-sm text-gray-500">
            Mevcut kullanıcılar için e-posta değiştirilemez
          </p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Rol *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) => handleInputChange('role', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Rol seçin" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Branch */}
      <div className="space-y-2">
        <Label htmlFor="branch_id">Şube *</Label>
        <Select
          value={formData.branch_id}
          onValueChange={(value) => handleInputChange('branch_id', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Şube seçin" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status (only for editing existing users) */}
      {user && (
        <div className="space-y-2">
          <Label htmlFor="is_active">Durum</Label>
          <Select
            value={formData.is_active.toString()}
            onValueChange={(value) => handleInputChange('is_active', value === 'true')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Form Actions */}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isLoading ? 'Kaydediliyor...' : (user ? 'Güncelle' : 'Oluştur')}
        </Button>
      </DialogFooter>
    </form>
  )
}