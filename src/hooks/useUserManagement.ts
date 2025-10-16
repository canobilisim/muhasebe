import { useState, useEffect } from 'react'
import { userService, type UserWithBranch } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']
type UserRole = Database['public']['Enums']['user_role']

export const useUserManagement = () => {
  const { userRole, branchId } = useAuthStore()
  const [users, setUsers] = useState<UserWithBranch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load users
  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let userData: UserWithBranch[] = []
      
      if (userRole === 'admin') {
        // Admin can see all users
        userData = await userService.getAllUsers()
      } else if (branchId) {
        // Other roles can only see users from their branch
        const branchUsers = await userService.getUsersByBranch(branchId)
        userData = branchUsers.map(user => ({ ...user, branch: undefined }))
      }

      setUsers(userData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcılar yüklenirken hata oluştu'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Create user
  const createUser = async (userData: UserInsert) => {
    if (!userService.canManageUsers(userRole || 'cashier')) {
      setError('Bu işlem için yetkiniz bulunmuyor')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await userService.createUser(userData)
      
      if (result.success) {
        await loadUsers() // Reload users list
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Kullanıcı oluşturulurken hata oluştu')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı oluşturulurken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Update user
  const updateUser = async (userId: string, updates: UserUpdate) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) {
      setError('Kullanıcı bulunamadı')
      return { success: false }
    }

    if (!userService.canManageRole(userRole || 'cashier', targetUser.role)) {
      setError('Bu kullanıcıyı düzenleme yetkiniz bulunmuyor')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await userService.updateUser(userId, updates)
      
      if (result.success) {
        await loadUsers() // Reload users list
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Kullanıcı güncellenirken hata oluştu')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı güncellenirken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle user status
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) {
      setError('Kullanıcı bulunamadı')
      return { success: false }
    }

    if (!userService.canManageRole(userRole || 'cashier', targetUser.role)) {
      setError('Bu kullanıcının durumunu değiştirme yetkiniz bulunmuyor')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await userService.toggleUserStatus(userId, isActive)
      
      if (result.success) {
        await loadUsers() // Reload users list
        return { success: true }
      } else {
        setError(result.error || 'Kullanıcı durumu değiştirilirken hata oluştu')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı durumu değiştirilirken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) {
      setError('Kullanıcı bulunamadı')
      return { success: false }
    }

    if (!userService.canManageRole(userRole || 'cashier', targetUser.role)) {
      setError('Bu kullanıcıyı silme yetkiniz bulunmuyor')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await userService.deleteUser(userId)
      
      if (result.success) {
        await loadUsers() // Reload users list
        return { success: true }
      } else {
        setError(result.error || 'Kullanıcı silinirken hata oluştu')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı silinirken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Invite user
  const inviteUser = async (email: string, role: UserRole, targetBranchId: string) => {
    if (!userService.canManageUsers(userRole || 'cashier')) {
      setError('Bu işlem için yetkiniz bulunmuyor')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await userService.inviteUser(email, role, targetBranchId)
      
      if (result.success) {
        await loadUsers() // Reload users list
        return { success: true }
      } else {
        setError(result.error || 'Kullanıcı davet edilirken hata oluştu')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı davet edilirken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Load users on mount
  useEffect(() => {
    if (userRole && (userRole === 'admin' || branchId)) {
      loadUsers()
    }
  }, [userRole, branchId])

  // Get available roles for current user
  const getAvailableRoles = () => {
    const allRoles = userService.getRoles()
    
    if (userRole === 'admin') {
      return allRoles
    } else if (userRole === 'manager') {
      return allRoles.filter(role => role.value === 'cashier')
    }
    
    return []
  }

  // Check permissions
  const canManageUsers = userService.canManageUsers(userRole || 'cashier')
  const canCreateUsers = canManageUsers
  const canInviteUsers = canManageUsers

  return {
    users,
    isLoading,
    error,
    canManageUsers,
    canCreateUsers,
    canInviteUsers,
    loadUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    inviteUser,
    getAvailableRoles,
    clearError: () => setError(null),
  }
}