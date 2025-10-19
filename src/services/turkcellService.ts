import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

/**
 * Turkcell API Service
 * Handles all Turkcell-related database operations with branch isolation and error handling
 */
export class TurkcellServiceImpl {
  
  /**
   * Get current user's branch ID for branch isolation
   * @private
   */
  private static getCurrentBranchId(): string {
    const { branchId, isAuthenticated, profile } = useAuthStore.getState()
    
    console.log('TurkcellService - Auth State:', {
      branchId,
      isAuthenticated,
      profileBranchId: profile?.branch_id,
      hasProfile: !!profile
    })
    
    if (!isAuthenticated) {
      throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.')
    }
    
    if (!branchId && !profile?.branch_id) {
      throw new Error('Kullanıcı branch bilgisi bulunamadı. Lütfen tekrar giriş yapın.')
    }
    
    return branchId || profile?.branch_id || ''
  }

  /**
   * Format date to YYYY-MM-DD format
   * @private
   */
  private static formatDate(date?: string): string {
    if (date) {
      return new Date(date).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  }

  /**
   * Format month to YYYY-MM-01 format for target queries
   * @private
   */
  private static formatMonth(month?: string): string {
    const targetDate = month ? new Date(month) : new Date()
    const year = targetDate.getFullYear()
    const monthNum = targetDate.getMonth()
    return new Date(year, monthNum, 1).toISOString().split('T')[0]
  }

  /**
   * Get daily Turkcell transaction count for current branch
   * @param date - Target date (defaults to today)
   * @returns Promise with total transaction count
   */
  static async getDailyTransactions(date?: string): Promise<{ total: number }> {
    try {
      const branchId = this.getCurrentBranchId()
      const targetDate = this.formatDate(date)

      // Call the database function for daily count
      const { data, error } = await supabase.rpc('get_daily_turkcell_count', {
        branch_uuid: branchId,
        target_date: targetDate
      })

      if (error) {
        console.error('Error fetching daily Turkcell transactions:', error)
        throw new Error(`Günlük Turkcell işlem sayısı alınamadı: ${error.message}`)
      }

      return { total: data || 0 }
    } catch (error) {
      console.error('Error in getDailyTransactions:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Günlük Turkcell işlem sayısı alınırken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Get monthly Turkcell target for current branch
   * @param month - Target month (defaults to current month)
   * @returns Promise with monthly target count
   */
  static async getMonthlyTarget(month?: string): Promise<{ target: number }> {
    try {
      const branchId = this.getCurrentBranchId()
      const targetMonth = this.formatMonth(month)

      console.log('TurkcellService.getMonthlyTarget - Parameters:', {
        branchId,
        targetMonth,
        month
      })

      // Call the database function for monthly target
      const { data, error } = await supabase.rpc('get_monthly_turkcell_target', {
        branch_uuid: branchId,
        target_month_param: targetMonth
      })

      console.log('TurkcellService.getMonthlyTarget - Response:', {
        data,
        error,
        hasError: !!error
      })

      if (error) {
        console.error('Error fetching monthly Turkcell target:', error)
        
        // Check if it's an auth/permission error
        if (error.message?.includes('auth') || error.message?.includes('permission') || error.message?.includes('policy')) {
          throw new Error('Bu işlem için yetkiniz bulunmuyor. Lütfen giriş yapın.')
        }
        
        // For other errors, return 0 as fallback instead of throwing
        console.warn('Returning fallback value (0) due to error:', error.message)
        return { target: 0 }
      }

      return { target: data || 0 }
    } catch (error) {
      console.error('Error in getMonthlyTarget:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Aylık Turkcell hedefi alınırken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Set monthly Turkcell target for current branch
   * @param target - Target count (must be positive)
   * @param month - Target month (defaults to current month)
   * @returns Promise that resolves when target is set
   */
  static async setMonthlyTarget(target: number, month?: string): Promise<void> {
    try {
      // Validate target value
      if (!target || target <= 0) {
        throw new Error('Hedef değeri 0\'dan büyük bir sayı olmalıdır')
      }

      const branchId = this.getCurrentBranchId()
      const targetMonth = this.formatMonth(month)
      const { user } = useAuthStore.getState()

      if (!user) {
        throw new Error('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.')
      }

      // Call the database function to set monthly target
      const { data, error } = await supabase.rpc('set_monthly_turkcell_target', {
        branch_uuid: branchId,
        target_count_param: target,
        target_month_param: targetMonth,
        user_uuid: user.id
      })

      if (error) {
        console.error('Error setting monthly Turkcell target:', error)
        throw new Error(`Aylık Turkcell hedefi ayarlanamadı: ${error.message}`)
      }

      if (!data) {
        throw new Error('Hedef ayarlama işlemi başarısız oldu')
      }
    } catch (error) {
      console.error('Error in setMonthlyTarget:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Aylık Turkcell hedefi ayarlanırken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Get monthly Turkcell progress for current branch
   * @param month - Target month (defaults to current month)
   * @returns Promise with progress data (total, target, percentage)
   */
  static async getMonthlyProgress(month?: string): Promise<{
    progress: number
    total: number
    target: number
  }> {
    try {
      const branchId = this.getCurrentBranchId()
      const targetMonth = this.formatMonth(month)

      // Call the database function for monthly progress
      const { data, error } = await supabase.rpc('get_monthly_turkcell_progress', {
        branch_uuid: branchId,
        target_month_param: targetMonth
      })

      if (error) {
        console.error('Error fetching monthly Turkcell progress:', error)
        throw new Error(`Aylık Turkcell ilerleme durumu alınamadı: ${error.message}`)
      }

      // The function returns an array with one row
      const progressData = data?.[0]
      
      if (!progressData) {
        // Return default values if no data found
        return {
          progress: 0,
          total: 0,
          target: 0
        }
      }

      return {
        progress: Number(progressData.progress_percentage) || 0,
        total: progressData.total_count || 0,
        target: progressData.target_count || 0
      }
    } catch (error) {
      console.error('Error in getMonthlyProgress:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Aylık Turkcell ilerleme durumu alınırken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Refresh all Turkcell data (convenience method)
   * @param month - Target month for progress and target data
   * @param date - Target date for daily data
   * @returns Promise with all Turkcell data
   */
  static async refreshAllData(month?: string, date?: string): Promise<{
    dailyTotal: number
    monthlyTarget: number
    monthlyProgress: number
    monthlyTotal: number
  }> {
    try {
      // Fetch all data in parallel for better performance
      const [dailyResult, targetResult, progressResult] = await Promise.all([
        this.getDailyTransactions(date),
        this.getMonthlyTarget(month),
        this.getMonthlyProgress(month)
      ])

      return {
        dailyTotal: dailyResult.total,
        monthlyTarget: targetResult.target,
        monthlyProgress: progressResult.progress,
        monthlyTotal: progressResult.total
      }
    } catch (error) {
      console.error('Error in refreshAllData:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Turkcell verileri yenilenirken beklenmeyen bir hata oluştu')
    }
  }

  /**
   * Check if user has permission to set targets (admin or manager only)
   * @returns boolean indicating if user can set targets
   */
  static canSetTargets(): boolean {
    const { userRole } = useAuthStore.getState()
    return userRole === 'admin' || userRole === 'manager'
  }

  /**
   * Validate target value
   * @param target - Target value to validate
   * @returns validation result with error message if invalid
   */
  static validateTarget(target: number): { isValid: boolean; error?: string } {
    if (!target && target !== 0) {
      return { isValid: false, error: 'Hedef değeri gereklidir' }
    }

    if (typeof target !== 'number' || isNaN(target)) {
      return { isValid: false, error: 'Hedef değeri geçerli bir sayı olmalıdır' }
    }

    if (target <= 0) {
      return { isValid: false, error: 'Hedef değeri 0\'dan büyük olmalıdır' }
    }

    if (target > 10000) {
      return { isValid: false, error: 'Hedef değeri 10.000\'den küçük olmalıdır' }
    }

    if (!Number.isInteger(target)) {
      return { isValid: false, error: 'Hedef değeri tam sayı olmalıdır' }
    }

    return { isValid: true }
  }
}

// Export the service as default export for easier importing
export const TurkcellService = TurkcellServiceImpl
export default TurkcellServiceImpl