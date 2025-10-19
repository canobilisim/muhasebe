import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useTurkcellStore } from '../turkcellStore'
import { TurkcellService } from '@/services/turkcellService'

// Mock the turkcell service
vi.mock('@/services/turkcellService', () => ({
  TurkcellService: {
    getDailyTransactions: vi.fn(),
    getMonthlyTarget: vi.fn(),
    setMonthlyTarget: vi.fn(),
    getMonthlyProgress: vi.fn(),
    refreshAllData: vi.fn(),
    validateTarget: vi.fn(),
  },
}))

// Mock the auth store
vi.mock('../authStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: {
        id: 'test-user-id'
      },
      branchId: 'test-branch-id'
    })
  }
}))

describe('TurkcellStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTurkcellStore.setState({
      totalToday: 0,
      monthlyTarget: 0,
      monthlyProgress: 0,
      loading: false,
      error: null,
    })
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useTurkcellStore.getState()
      
      expect(state.totalToday).toBe(0)
      expect(state.monthlyTarget).toBe(0)
      expect(state.monthlyProgress).toBe(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })
  })

  describe('fetchDailyTransactions', () => {
    it('should fetch daily transactions successfully', async () => {
      const mockResponse = { total: 15 }
      vi.mocked(TurkcellService.getDailyTransactions).mockResolvedValue(mockResponse)

      const { fetchDailyTransactions } = useTurkcellStore.getState()
      
      await fetchDailyTransactions()
      
      const state = useTurkcellStore.getState()
      expect(state.totalToday).toBe(15)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(TurkcellService.getDailyTransactions).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch daily transactions error', async () => {
      const mockError = new Error('Network error')
      vi.mocked(TurkcellService.getDailyTransactions).mockRejectedValue(mockError)

      const { fetchDailyTransactions } = useTurkcellStore.getState()
      
      await fetchDailyTransactions()
      
      const state = useTurkcellStore.getState()
      expect(state.totalToday).toBe(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
    })

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      vi.mocked(TurkcellService.getDailyTransactions).mockReturnValue(promise)

      const { fetchDailyTransactions } = useTurkcellStore.getState()
      
      const fetchPromise = fetchDailyTransactions()
      
      // Check loading state is true during fetch
      expect(useTurkcellStore.getState().loading).toBe(true)
      
      // Resolve the promise
      resolvePromise!({ total: 10 })
      await fetchPromise
      
      // Check loading state is false after fetch
      expect(useTurkcellStore.getState().loading).toBe(false)
    })
  })

  describe('fetchMonthlyTarget', () => {
    it('should fetch monthly target successfully', async () => {
      const mockResponse = { target: 100 }
      vi.mocked(TurkcellService.getMonthlyTarget).mockResolvedValue(mockResponse)

      const { fetchMonthlyTarget } = useTurkcellStore.getState()
      
      await fetchMonthlyTarget()
      
      const state = useTurkcellStore.getState()
      expect(state.monthlyTarget).toBe(100)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(TurkcellService.getMonthlyTarget).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch monthly target error', async () => {
      const mockError = new Error('Database error')
      vi.mocked(TurkcellService.getMonthlyTarget).mockRejectedValue(mockError)

      const { fetchMonthlyTarget } = useTurkcellStore.getState()
      
      await fetchMonthlyTarget()
      
      const state = useTurkcellStore.getState()
      expect(state.monthlyTarget).toBe(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Database error')
    })
  })

  describe('updateMonthlyTarget', () => {
    it('should update monthly target successfully', async () => {
      vi.mocked(TurkcellService.validateTarget).mockReturnValue({ isValid: true })
      vi.mocked(TurkcellService.setMonthlyTarget).mockResolvedValue(undefined)
      vi.mocked(TurkcellService.getMonthlyProgress).mockResolvedValue({ progress: 50, total: 75, target: 150 })

      const { updateMonthlyTarget } = useTurkcellStore.getState()
      
      await updateMonthlyTarget(150)
      
      const state = useTurkcellStore.getState()
      expect(state.monthlyTarget).toBe(150)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(TurkcellService.setMonthlyTarget).toHaveBeenCalledWith(150, undefined)
    })

    it('should handle update monthly target error', async () => {
      vi.mocked(TurkcellService.validateTarget).mockReturnValue({ isValid: true })
      const mockError = new Error('Update failed')
      vi.mocked(TurkcellService.setMonthlyTarget).mockRejectedValue(mockError)

      const { updateMonthlyTarget } = useTurkcellStore.getState()
      
      await updateMonthlyTarget(150)
      
      const state = useTurkcellStore.getState()
      expect(state.monthlyTarget).toBe(0) // Should not update on error
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Update failed')
    })

    it('should validate target values', async () => {
      vi.mocked(TurkcellService.validateTarget).mockReturnValue({ 
        isValid: false, 
        error: 'Hedef değeri 0\'dan büyük olmalıdır' 
      })

      const { updateMonthlyTarget } = useTurkcellStore.getState()
      
      await updateMonthlyTarget(-10)
      
      const state = useTurkcellStore.getState()
      expect(state.error).toBe('Hedef değeri 0\'dan büyük olmalıdır')
      expect(TurkcellService.setMonthlyTarget).not.toHaveBeenCalled()
    })
  })

  describe('fetchMonthlyProgress', () => {
    it('should fetch monthly progress correctly', async () => {
      const mockProgressResponse = { 
        progress: 75, 
        total: 75, 
        target: 100 
      }
      vi.mocked(TurkcellService.getMonthlyProgress).mockResolvedValue(mockProgressResponse)

      const { fetchMonthlyProgress } = useTurkcellStore.getState()
      
      await fetchMonthlyProgress()
      
      const state = useTurkcellStore.getState()
      expect(state.monthlyProgress).toBe(75)
      expect(state.monthlyTotal).toBe(75)
      expect(state.monthlyTarget).toBe(100)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle fetch progress error', async () => {
      const mockError = new Error('Calculation failed')
      vi.mocked(TurkcellService.getMonthlyProgress).mockRejectedValue(mockError)

      const { fetchMonthlyProgress } = useTurkcellStore.getState()
      
      await fetchMonthlyProgress()
      
      const state = useTurkcellStore.getState()
      expect(state.monthlyProgress).toBe(0)
      expect(state.monthlyTotal).toBe(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Calculation failed')
    })
  })

  describe('refreshData', () => {
    it('should refresh all data successfully', async () => {
      const mockRefreshResponse = {
        dailyTotal: 20,
        monthlyTarget: 200,
        monthlyProgress: 50,
        monthlyTotal: 100
      }
      vi.mocked(TurkcellService.refreshAllData).mockResolvedValue(mockRefreshResponse)

      const { refreshData } = useTurkcellStore.getState()
      
      await refreshData()
      
      const state = useTurkcellStore.getState()
      expect(state.totalToday).toBe(20)
      expect(state.monthlyTarget).toBe(200)
      expect(state.monthlyProgress).toBe(50)
      expect(state.monthlyTotal).toBe(100)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle refresh error', async () => {
      const mockError = new Error('Refresh failed')
      vi.mocked(TurkcellService.refreshAllData).mockRejectedValue(mockError)

      const { refreshData } = useTurkcellStore.getState()
      
      await refreshData()
      
      const state = useTurkcellStore.getState()
      expect(state.totalToday).toBe(0)
      expect(state.monthlyTarget).toBe(0)
      expect(state.monthlyProgress).toBe(0)
      expect(state.monthlyTotal).toBe(0)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Refresh failed')
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      // Set an error first
      useTurkcellStore.setState({ error: 'Test error' })
      
      const { clearError } = useTurkcellStore.getState()
      clearError()
      
      const state = useTurkcellStore.getState()
      expect(state.error).toBe(null)
    })
  })
})