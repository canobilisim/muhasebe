import { useState, useEffect, useCallback } from 'react'
import { SupplierService } from '@/services/supplierService'
import type { Supplier, SupplierFilter } from '@/types'

interface UseSuppliersOptions {
  search?: string
  isActive?: boolean
  hasBalance?: boolean
  pageSize?: number
}

interface PaginationState {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export const useSuppliers = (options: UseSuppliersOptions = {}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: options.pageSize || 20,
    totalCount: 0,
    totalPages: 0
  })

  const loadSuppliers = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const filter: SupplierFilter = {
        search: options.search,
        isActive: options.isActive,
        hasBalance: options.hasBalance
      }

      const response = await SupplierService.getSuppliers(
        filter,
        page,
        pagination.pageSize
      )

      setSuppliers(response.data)
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        totalCount: response.count,
        totalPages: response.totalPages
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tedarikçiler yüklenirken bir hata oluştu')
      console.error('Error loading suppliers:', err)
    } finally {
      setLoading(false)
    }
  }, [options.search, options.isActive, options.hasBalance, pagination.pageSize])

  const refreshSuppliers = useCallback(() => {
    loadSuppliers(pagination.page)
  }, [loadSuppliers, pagination.page])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadSuppliers(page)
    }
  }, [loadSuppliers, pagination.totalPages])

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      loadSuppliers(pagination.page + 1)
    }
  }, [loadSuppliers, pagination.page, pagination.totalPages])

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      loadSuppliers(pagination.page - 1)
    }
  }, [loadSuppliers, pagination.page])

  const updateFilter = useCallback((newFilter: Partial<UseSuppliersOptions>) => {
    // Filter değiştiğinde ilk sayfaya dön
    loadSuppliers(1)
  }, [loadSuppliers])

  useEffect(() => {
    loadSuppliers(1)
  }, []) // Sadece mount'ta çalış

  return {
    suppliers,
    loading,
    error,
    pagination,
    refreshSuppliers,
    goToPage,
    nextPage,
    prevPage,
    updateFilter
  }
}
