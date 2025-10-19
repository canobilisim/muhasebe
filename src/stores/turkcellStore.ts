import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { TurkcellService } from '@/services/turkcellService'
import type { TurkcellState } from '@/types/turkcell'

/**
 * Turkcell Zustand Store
 * Manages Turkcell transaction data, monthly targets, and progress tracking
 * with branch isolation and error handling
 */
export const useTurkcellStore = create<TurkcellState>()(
  devtools(
    (set, get) => ({
      // Initial data state
      totalToday: 0,
      monthlyTarget: 0,
      monthlyProgress: 0,
      monthlyTotal: 0,
      
      // Initial UI state
      loading: false,
      error: null,
      
      // Actions
      fetchDailyTransactions: async (date?: string) => {
        const state = get()
        
        // Prevent multiple simultaneous requests
        if (state.loading) {
          return
        }
        
        set({ loading: true, error: null })
        
        try {
          const result = await TurkcellService.getDailyTransactions(date)
          
          // Ensure we always have a valid number with fallback value (0)
          const safeTotal = typeof result.total === 'number' && !isNaN(result.total) ? result.total : 0
          
          set({ 
            totalToday: safeTotal,
            loading: false 
          })
        } catch (error) {
          console.error('Error fetching daily transactions:', error)
          
          // Enhanced error message based on error type
          let errorMessage = 'Günlük işlem sayısı alınırken hata oluştu'
          
          if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = 'Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.'
            } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
              errorMessage = 'Bu işlem için yetkiniz bulunmuyor.'
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            error: errorMessage,
            loading: false,
            // Always set fallback value (0) as per requirements
            totalToday: 0
          })
        }
      },

      fetchMonthlyTarget: async (month?: string) => {
        const state = get()
        
        // Prevent multiple simultaneous requests
        if (state.loading) {
          return
        }
        
        set({ loading: true, error: null })
        
        try {
          const result = await TurkcellService.getMonthlyTarget(month)
          
          // Ensure we always have a valid number with fallback value (0)
          const safeTarget = typeof result.target === 'number' && !isNaN(result.target) ? result.target : 0
          
          set({ 
            monthlyTarget: safeTarget,
            loading: false 
          })
        } catch (error) {
          console.error('Error fetching monthly target:', error)
          
          // Enhanced error message based on error type
          let errorMessage = 'Aylık hedef alınırken hata oluştu'
          
          if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = 'Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.'
            } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
              errorMessage = 'Bu işlem için yetkiniz bulunmuyor.'
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            error: errorMessage,
            loading: false,
            // Always set fallback value (0) as per requirements
            monthlyTarget: 0
          })
        }
      },

      fetchMonthlyProgress: async (month?: string) => {
        const state = get()
        
        // Prevent multiple simultaneous requests
        if (state.loading) {
          return
        }
        
        set({ loading: true, error: null })
        
        try {
          const result = await TurkcellService.getMonthlyProgress(month)
          
          // Ensure we always have valid numbers with fallback values (0)
          const safeProgress = typeof result.progress === 'number' && !isNaN(result.progress) ? result.progress : 0
          const safeTotal = typeof result.total === 'number' && !isNaN(result.total) ? result.total : 0
          const safeTarget = typeof result.target === 'number' && !isNaN(result.target) ? result.target : 0
          
          set({ 
            monthlyProgress: safeProgress,
            monthlyTotal: safeTotal,
            monthlyTarget: safeTarget, // Update target as well from progress data
            loading: false 
          })
        } catch (error) {
          console.error('Error fetching monthly progress:', error)
          
          // Enhanced error message based on error type
          let errorMessage = 'Aylık ilerleme durumu alınırken hata oluştu'
          
          if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = 'Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.'
            } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
              errorMessage = 'Bu işlem için yetkiniz bulunmuyor.'
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            error: errorMessage,
            loading: false,
            // Always set fallback values (0) as per requirements
            monthlyProgress: 0,
            monthlyTotal: 0
          })
        }
      },

      updateMonthlyTarget: async (target: number, month?: string) => {
        const state = get()
        
        // Prevent multiple simultaneous requests
        if (state.loading) {
          return
        }
        
        // Validate target value
        const validation = TurkcellService.validateTarget(target)
        if (!validation.isValid) {
          set({ error: validation.error })
          return
        }
        
        set({ loading: true, error: null })
        
        try {
          await TurkcellService.setMonthlyTarget(target, month)
          
          // Update local state with new target
          set({ 
            monthlyTarget: target,
            loading: false 
          })
          
          // Recalculate progress with new target
          await get().fetchMonthlyProgress(month)
        } catch (error) {
          console.error('Error updating monthly target:', error)
          
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Aylık hedef güncellenirken hata oluştu'
          
          set({ 
            error: errorMessage,
            loading: false
          })
        }
      },

      refreshData: async () => {
        const state = get()
        
        // Prevent multiple simultaneous requests
        if (state.loading) {
          return
        }
        
        set({ loading: true, error: null })
        
        try {
          // Fetch all data in parallel for better performance
          const result = await TurkcellService.refreshAllData()
          
          // Ensure we always have valid numbers with fallback values (0)
          const safeDailyTotal = typeof result.dailyTotal === 'number' && !isNaN(result.dailyTotal) ? result.dailyTotal : 0
          const safeMonthlyTarget = typeof result.monthlyTarget === 'number' && !isNaN(result.monthlyTarget) ? result.monthlyTarget : 0
          const safeMonthlyProgress = typeof result.monthlyProgress === 'number' && !isNaN(result.monthlyProgress) ? result.monthlyProgress : 0
          const safeMonthlyTotal = typeof result.monthlyTotal === 'number' && !isNaN(result.monthlyTotal) ? result.monthlyTotal : 0
          
          set({
            totalToday: safeDailyTotal,
            monthlyTarget: safeMonthlyTarget,
            monthlyProgress: safeMonthlyProgress,
            monthlyTotal: safeMonthlyTotal,
            loading: false
          })
        } catch (error) {
          console.error('Error refreshing Turkcell data:', error)
          
          // Enhanced error message based on error type
          let errorMessage = 'Turkcell verileri yenilenirken hata oluştu'
          
          if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = 'Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.'
            } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
              errorMessage = 'Bu işlem için yetkiniz bulunmuyor.'
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            error: errorMessage,
            loading: false,
            // Always set fallback values (0) as per requirements
            totalToday: 0,
            monthlyTarget: 0,
            monthlyProgress: 0,
            monthlyTotal: 0
          })
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'turkcell-store'
    }
  )
)

// Export store for easier importing
export default useTurkcellStore