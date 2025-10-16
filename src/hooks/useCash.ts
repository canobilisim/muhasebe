import { useState, useEffect } from 'react'
import { cashService, type DailyCashSummary, type CashMovementWithDetails } from '@/services/cashService'
import type { Database } from '@/types/database'

type CashMovement = Database['public']['Tables']['cash_movements']['Row']

export const useCash = (selectedDate?: string) => {
  const [movements, setMovements] = useState<CashMovementWithDetails[]>([])
  const [summary, setSummary] = useState<DailyCashSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCashOpened, setIsCashOpened] = useState(false)
  const [isCashClosed, setIsCashClosed] = useState(false)

  const currentDate = selectedDate || new Date().toISOString().split('T')[0]

  const fetchCashData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [movementsData, summaryData, openingStatus, closingStatus] = await Promise.all([
        cashService.getDailyCashMovements(currentDate),
        cashService.getDailyCashSummary(currentDate),
        cashService.checkDailyCashOpening(currentDate),
        cashService.checkDailyCashClosing(currentDate)
      ])

      setMovements(movementsData)
      setSummary(summaryData)
      setIsCashOpened(openingStatus)
      setIsCashClosed(closingStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kasa verileri yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const openDailyCash = async (amount: number, description?: string): Promise<CashMovement> => {
    try {
      setError(null)
      const result = await cashService.openDailyCash(amount, description)
      await fetchCashData() // Verileri yenile
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kasa açılırken hata oluştu'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const closeDailyCash = async (amount: number, description?: string): Promise<CashMovement> => {
    try {
      setError(null)
      const result = await cashService.closeDailyCash(amount, description)
      await fetchCashData() // Verileri yenile
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kasa kapatılırken hata oluştu'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const addIncome = async (amount: number, description: string, referenceNumber?: string): Promise<CashMovement> => {
    try {
      setError(null)
      const result = await cashService.addIncome(amount, description, referenceNumber)
      await fetchCashData() // Verileri yenile
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gelir kaydedilirken hata oluştu'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const addExpense = async (amount: number, description: string, referenceNumber?: string): Promise<CashMovement> => {
    try {
      setError(null)
      const result = await cashService.addExpense(amount, description, referenceNumber)
      await fetchCashData() // Verileri yenile
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gider kaydedilirken hata oluştu'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchCashData()
  }, [currentDate])

  return {
    movements,
    summary,
    isLoading,
    error,
    isCashOpened,
    isCashClosed,
    openDailyCash,
    closeDailyCash,
    addIncome,
    addExpense,
    refetch: fetchCashData
  }
}