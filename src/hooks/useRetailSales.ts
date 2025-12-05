import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  getRetailSales,
  getRetailSalesSummary,
  getRetailSaleById,
  deleteRetailSale,
  updateRetailSale,
  type RetailSalesFilter,
  type RetailSalesSummary
} from '@/services/retailSalesService'
import type { SaleWithDetails } from '@/types/sales'
import { toast } from '@/lib/toast'

export function useRetailSales() {
  const { branchId } = useAuthStore()
  const [sales, setSales] = useState<SaleWithDetails[]>([])
  const [summary, setSummary] = useState<RetailSalesSummary>({
    totalSales: 0,
    totalAmount: 0,
    averageAmount: 0,
    totalItems: 0,
    cashSales: 0,
    posSales: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Satışları yükle
  const loadSales = useCallback(async (filter?: RetailSalesFilter) => {
    if (!branchId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getRetailSales(branchId, filter)
      setSales(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Satışlar yüklenemedi'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId])

  // Özet bilgileri yükle
  const loadSummary = useCallback(async (startDate?: string, endDate?: string) => {
    if (!branchId) return

    try {
      const data = await getRetailSalesSummary(branchId, startDate, endDate)
      setSummary(data)
    } catch (err) {
      console.error('Özet bilgiler yüklenemedi:', err)
    }
  }, [branchId])

  // Satış detayı getir
  const getSaleDetail = useCallback(async (saleId: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getRetailSaleById(saleId)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Satış detayı yüklenemedi'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Satış sil
  const deleteSale = useCallback(async (saleId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteRetailSale(saleId)

      if (result.success) {
        toast.success('Satış başarıyla silindi')
        // Listeyi yenile
        await loadSales()
        await loadSummary()
        return true
      } else {
        throw new Error(result.error || 'Satış silinemedi')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Satış silinemedi'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadSales, loadSummary])

  // Satış güncelle
  const updateSale = useCallback(async (saleId: string, updates: any) => {
    setLoading(true)
    setError(null)

    try {
      const result = await updateRetailSale(saleId, updates)

      if (result.success) {
        toast.success('Satış başarıyla güncellendi')
        // Listeyi yenile
        await loadSales()
        return true
      } else {
        throw new Error(result.error || 'Satış güncellenemedi')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Satış güncellenemedi'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadSales])

  // İlk yükleme kaldırıldı - sayfa kendi filtresiyle yükleyecek

  return {
    sales,
    summary,
    loading,
    error,
    loadSales,
    loadSummary,
    getSaleDetail,
    deleteSale,
    updateSale
  }
}
