import { useState, useEffect, useCallback } from 'react'
import { CustomerService } from '@/services/customerService'
import type { Customer, CustomerFilter, PaginatedResponse } from '@/types'

export const useCustomers = (initialFilter: CustomerFilter = {}) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<CustomerFilter>(initialFilter)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 0,
    totalCount: 0
  })

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const result: PaginatedResponse<Customer> = await CustomerService.getCustomers(
        filter,
        page,
        pagination.pageSize
      )
      
      setCustomers(result.data)
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        totalCount: result.count
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müşteri listesi alınamadı')
    } finally {
      setLoading(false)
    }
  }, [filter, pagination.pageSize])

  const refreshCustomers = useCallback(() => {
    fetchCustomers(pagination.page)
  }, [fetchCustomers, pagination.page])

  const updateFilter = useCallback((newFilter: Partial<CustomerFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])

  const goToPage = useCallback((page: number) => {
    fetchCustomers(page)
  }, [fetchCustomers])

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1)
    }
  }, [pagination.page, pagination.totalPages, goToPage])

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1)
    }
  }, [pagination.page, goToPage])

  useEffect(() => {
    fetchCustomers(1)
  }, [filter])

  return {
    customers,
    loading,
    error,
    filter,
    pagination,
    updateFilter,
    refreshCustomers,
    goToPage,
    nextPage,
    prevPage
  }
}

export const useCustomer = (id?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomer = useCallback(async (customerId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await CustomerService.getCustomerById(customerId)
      setCustomer(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müşteri bilgisi alınamadı')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchCustomer(id)
    }
  }, [id, fetchCustomer])

  return {
    customer,
    loading,
    error,
    refetch: id ? () => fetchCustomer(id) : undefined
  }
}

export const useCustomerSearch = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCustomers([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const result = await CustomerService.searchCustomers(query)
      setCustomers(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müşteri araması yapılamadı')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setCustomers([])
    setError(null)
  }, [])

  return {
    customers,
    loading,
    error,
    searchCustomers,
    clearSearch
  }
}