import { useState, useMemo, useCallback } from 'react'
import { debounce } from '@/lib/performance'

interface UseOptimizedSearchOptions {
  debounceMs?: number
  minSearchLength?: number
}

export const useOptimizedSearch = <T>(
  items: T[],
  searchFields: (keyof T)[],
  options: UseOptimizedSearchOptions = {}
) => {
  const { debounceMs = 300, minSearchLength = 2 } = options
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounced search term update
  const debouncedSetSearch = useMemo(
    () => debounce((term: string) => {
      setDebouncedSearchTerm(term)
    }, debounceMs),
    [debounceMs]
  )

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
    debouncedSetSearch(term)
  }, [debouncedSetSearch])

  // Memoized filtered results
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return items
    }

    const searchLower = debouncedSearchTerm.toLowerCase()
    
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchLower)
        }
        return false
      })
    )
  }, [items, debouncedSearchTerm, searchFields, minSearchLength])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  return {
    searchTerm,
    filteredItems,
    handleSearchChange,
    clearSearch,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}