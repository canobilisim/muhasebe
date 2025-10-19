import { useCallback, useEffect } from 'react'
import { useTurkcellStore } from '@/stores/turkcellStore'

/**
 * Custom hook for Turkcell operations
 * Wraps the Turkcell store and provides easy-to-use interface for components
 * 
 * Features:
 * - Automatic data fetching on mount
 * - Simplified API for components
 * - Error handling and loading states
 * - Memoized callbacks for performance
 */
export const useTurkcell = () => {
  // Get all store state and actions
  const {
    // Data state
    totalToday,
    monthlyTarget,
    monthlyProgress,
    monthlyTotal,
    
    // UI state
    loading,
    error,
    
    // Actions
    fetchDailyTransactions,
    fetchMonthlyTarget,
    fetchMonthlyProgress,
    updateMonthlyTarget,
    refreshData,
    clearError
  } = useTurkcellStore()

  // Memoized callbacks to prevent unnecessary re-renders
  const handleFetchDailyTransactions = useCallback(
    (date?: string) => fetchDailyTransactions(date),
    [fetchDailyTransactions]
  )

  const handleFetchMonthlyTarget = useCallback(
    (month?: string) => fetchMonthlyTarget(month),
    [fetchMonthlyTarget]
  )

  const handleFetchMonthlyProgress = useCallback(
    (month?: string) => fetchMonthlyProgress(month),
    [fetchMonthlyProgress]
  )

  const handleUpdateMonthlyTarget = useCallback(
    (target: number, month?: string) => updateMonthlyTarget(target, month),
    [updateMonthlyTarget]
  )

  const handleRefreshData = useCallback(
    () => refreshData(),
    [refreshData]
  )

  const handleClearError = useCallback(
    () => clearError(),
    [clearError]
  )

  // Initialize data on mount
  useEffect(() => {
    // Only fetch if we don't have data yet and not currently loading
    if (!loading && totalToday === 0 && monthlyTarget === 0) {
      handleRefreshData()
    }
  }, [loading, totalToday, monthlyTarget, handleRefreshData])

  // Computed values for easier component usage
  const isTargetSet = monthlyTarget > 0
  const progressPercentage = isTargetSet && monthlyTotal > 0 
    ? Math.round((monthlyTotal / monthlyTarget) * 100)
    : 0

  // Helper functions for common operations
  const isDailyDataLoaded = totalToday > 0 || (!loading && !error)
  const isMonthlyDataLoaded = (monthlyTarget > 0 || monthlyTotal >= 0) || (!loading && !error)
  const hasError = Boolean(error)

  return {
    // Data state - easy access for components
    data: {
      totalToday,
      monthlyTarget,
      monthlyProgress,
      monthlyTotal,
      progressPercentage,
      isTargetSet
    },

    // UI state
    ui: {
      loading,
      error,
      hasError,
      isDailyDataLoaded,
      isMonthlyDataLoaded
    },

    // Actions - simplified interface
    actions: {
      // Data fetching
      fetchDailyTransactions: handleFetchDailyTransactions,
      fetchMonthlyTarget: handleFetchMonthlyTarget,
      fetchMonthlyProgress: handleFetchMonthlyProgress,
      
      // Data updates
      updateMonthlyTarget: handleUpdateMonthlyTarget,
      
      // Utility actions
      refreshData: handleRefreshData,
      clearError: handleClearError
    },

    // Convenience methods for common use cases
    helpers: {
      // Check if we have any data
      hasData: isDailyDataLoaded || isMonthlyDataLoaded,
      
      // Check if we need to show loading state
      shouldShowLoading: loading && totalToday === 0 && monthlyTarget === 0,
      
      // Check if we should show error state
      shouldShowError: hasError && !loading,
      
      // Get formatted progress text
      getProgressText: () => {
        if (!isTargetSet) return 'Hedef belirlenmemiş'
        return `${monthlyTotal} / ${monthlyTarget} (${progressPercentage}%)`
      },
      
      // Get status message
      getStatusMessage: () => {
        if (loading) return 'Veriler yükleniyor...'
        if (hasError) return error
        if (!isTargetSet) return 'Aylık hedef belirlenmemiş'
        if (progressPercentage >= 100) return 'Hedef tamamlandı! 🎉'
        if (progressPercentage >= 80) return 'Hedefe çok yakın!'
        if (progressPercentage >= 50) return 'İyi gidiyorsun!'
        return 'Hedefe doğru ilerliyorsun'
      }
    }
  }
}

/**
 * Hook for daily transactions only
 * Lighter version for components that only need daily data
 */
export const useTurkcellDaily = () => {
  const { data, ui, actions } = useTurkcell()
  
  return {
    totalToday: data.totalToday,
    loading: ui.loading,
    error: ui.error,
    fetchDailyTransactions: actions.fetchDailyTransactions,
    refreshData: actions.refreshData,
    clearError: actions.clearError
  }
}

/**
 * Hook for monthly targets only
 * Lighter version for components that only need monthly data
 */
export const useTurkcellMonthly = () => {
  const { data, ui, actions, helpers } = useTurkcell()
  
  return {
    monthlyTarget: data.monthlyTarget,
    monthlyProgress: data.monthlyProgress,
    monthlyTotal: data.monthlyTotal,
    progressPercentage: data.progressPercentage,
    isTargetSet: data.isTargetSet,
    loading: ui.loading,
    error: ui.error,
    fetchMonthlyTarget: actions.fetchMonthlyTarget,
    fetchMonthlyProgress: actions.fetchMonthlyProgress,
    updateMonthlyTarget: actions.updateMonthlyTarget,
    refreshData: actions.refreshData,
    clearError: actions.clearError,
    getProgressText: helpers.getProgressText,
    getStatusMessage: helpers.getStatusMessage
  }
}

// Export default hook
export default useTurkcell