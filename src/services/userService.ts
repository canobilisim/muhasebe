import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']
type Branch = Database['public']['Tables']['branches']['Row']
type UserRole = Database['public']['Enums']['user_role']

export interface UserWithBranch extends User {
  branch?: Branch
}

class UserService {
  // Get all users (admin only)
  async getAllUsers(): Promise<UserWithBranch[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          branch:branches(*)
        `)
        .order('full_name')

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
    }
  }

  // Get users by branch
  async getUsersByBranch(branchId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('branch_id', branchId)
        .order('full_name')

      if (error) {
        console.error('Error fetching users by branch:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUsersByBranch:', error)
      return []
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  // Create new user
  async createUser(userData: UserInsert): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in createUser:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      return { success: false, error: errorMessage }
    }
  }

  // Update user
  async updateUser(
    userId: string, 
    updates: UserUpdate
  ): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in updateUser:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      return { success: false, error: errorMessage }
    }
  }

  // Delete user (soft delete by setting is_active to false)
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in deleteUser:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      return { success: false, error: errorMessage }
    }
  }

  // Activate/deactivate user
  async toggleUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        console.error('Error toggling user status:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in toggleUserStatus:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      return { success: false, error: errorMessage }
    }
  }

  // Get available roles
  getRoles(): { value: UserRole; label: string }[] {
    return [
      { value: 'admin', label: 'Yönetici' },
      { value: 'manager', label: 'Müdür' },
      { value: 'cashier', label: 'Kasiyer' },
    ]
  }

  // Check if user can manage other users
  canManageUsers(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  // Check if user can manage specific role
  canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
    if (currentUserRole === 'admin') return true
    if (currentUserRole === 'manager' && targetRole === 'cashier') return true
    return false
  }

  // Invite user via email (placeholder for future implementation)
  async inviteUser(email: string, role: UserRole, branchId: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement user invitation via Supabase Auth
    console.log('User invitation not implemented yet', email, role, branchId)
    return { success: false, error: 'Kullanıcı davet özelliği henüz aktif değil' }
  }
}

export const userService = new UserService()