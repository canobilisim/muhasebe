import { useState, useEffect } from 'react'
import { settingsService, type CompanySettings } from '@/services/settingsService'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/types/database'

type BranchUpdate = Database['public']['Tables']['branches']['Update']

export const useSettings = () => {
  const { branchId, userRole } = useAuthStore()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load company settings
  const loadSettings = async () => {
    if (!branchId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await settingsService.getCompanySettings(branchId)
      setSettings(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ayarlar yüklenirken hata oluştu'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Update company settings
  const updateSettings = async (updates: Partial<BranchUpdate>) => {
    if (!branchId) {
      setError('Şube bilgisi bulunamadı')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await settingsService.updateCompanySettings(branchId, updates)
      
      if (result.success) {
        // Reload settings to get updated data
        await loadSettings()
        return { success: true }
      } else {
        setError(result.error || 'Ayarlar güncellenirken hata oluştu')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ayarlar güncellenirken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Upload logo
  const uploadLogo = async (file: File) => {
    if (!branchId) {
      setError('Şube bilgisi bulunamadı')
      return { success: false }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await settingsService.uploadLogo(file, branchId)
      
      if (!result.success) {
        setError(result.error || 'Logo yüklenirken hata oluştu')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logo yüklenirken hata oluştu'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Get receipt templates
  const getReceiptTemplates = async () => {
    try {
      return await settingsService.getReceiptTemplates()
    } catch (err) {
      console.error('Error getting receipt templates:', err)
      return []
    }
  }

  // Load settings on mount and when branchId changes
  useEffect(() => {
    if (branchId) {
      loadSettings()
    }
  }, [branchId])

  // Check if user can edit settings
  const canEditSettings = userRole === 'admin' || userRole === 'manager'

  return {
    settings,
    isLoading,
    error,
    canEditSettings,
    loadSettings,
    updateSettings,
    uploadLogo,
    getReceiptTemplates,
    clearError: () => setError(null),
  }
}