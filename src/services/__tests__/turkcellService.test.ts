import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { TurkcellService } from '../turkcellService'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: {
        id: 'test-user-id'
      },
      branchId: 'test-branch-id'
    })
  }
}))

describe('TurkcellService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDailyTransactions', () => {
    it('should fetch daily transactions successfully', async () => {
      const mockData = 15
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await TurkcellService.getDailyTransactions()

      expect(result.total).toBe(15)
      expect(supabase.rpc).toHaveBeenCalledWith('get_daily_turkcell_count', {
        branch_uuid: 'test-branch-id',
        target_date: expect.any(String)
      })
    })

    it('should fetch daily transactions for specific date', async () => {
      const mockData = 10
      const testDate = '2024-01-15'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await TurkcellService.getDailyTransactions(testDate)

      expect(result.total).toBe(10)
      expect(supabase.rpc).toHaveBeenCalledWith('get_daily_turkcell_count', {
        branch_uuid: 'test-branch-id',
        target_date: testDate
      })
    })

    it('should return 0 when no transactions found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await TurkcellService.getDailyTransactions()

      expect(result.total).toBe(0)
    })

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Database connection failed' }
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(TurkcellService.getDailyTransactions()).rejects.toThrow('Günlük Turkcell işlem sayısı alınamadı: Database connection failed')
    })
  })

  describe('getMonthlyTarget', () => {
    it('should fetch monthly target successfully', async () => {
      const mockData = 100
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await TurkcellService.getMonthlyTarget()

      expect(result.target).toBe(100)
      expect(supabase.rpc).toHaveBeenCalledWith('get_monthly_turkcell_target', {
        branch_uuid: 'test-branch-id',
        target_month: expect.any(String)
      })
    })

    it('should fetch monthly target for specific month', async () => {
      const mockData = 150
      const testMonth = '2024-01-01'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await TurkcellService.getMonthlyTarget(testMonth)

      expect(result.target).toBe(150)
      expect(supabase.rpc).toHaveBeenCalledWith('get_monthly_turkcell_target', {
        branch_uuid: 'test-branch-id',
        target_month: testMonth
      })
    })

    it('should return 0 when no target found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await TurkcellService.getMonthlyTarget()

      expect(result.target).toBe(0)
    })

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Permission denied' }
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(TurkcellService.getMonthlyTarget()).rejects.toThrow('Aylık Turkcell hedefi alınamadı: Permission denied')
    })
  })

  describe('setMonthlyTarget', () => {
    it('should set monthly target successfully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null
      })

      await TurkcellService.setMonthlyTarget(200)

      expect(supabase.rpc).toHaveBeenCalledWith('set_monthly_turkcell_target', {
        branch_uuid: 'test-branch-id',
        target_count_param: 200,
        target_month_param: expect.any(String),
        user_uuid: 'test-user-id'
      })
    })

    it('should set monthly target for specific month', async () => {
      const testMonth = '2024-02-01'
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null
      })

      await TurkcellService.setMonthlyTarget(250, testMonth)

      expect(supabase.rpc).toHaveBeenCalledWith('set_monthly_turkcell_target', {
        branch_uuid: 'test-branch-id',
        target_count_param: 250,
        target_month_param: testMonth,
        user_uuid: 'test-user-id'
      })
    })

    it('should throw error when rpc fails', async () => {
      const mockError = { message: 'Constraint violation' }
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(TurkcellService.setMonthlyTarget(200)).rejects.toThrow('Aylık Turkcell hedefi ayarlanamadı: Constraint violation')
    })

    it('should validate positive target values', async () => {
      await expect(TurkcellService.setMonthlyTarget(-10)).rejects.toThrow('Hedef değeri 0\'dan büyük bir sayı olmalıdır')
      await expect(TurkcellService.setMonthlyTarget(0)).rejects.toThrow('Hedef değeri 0\'dan büyük bir sayı olmalıdır')
      
      expect(supabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('getMonthlyProgress', () => {
    it('should calculate monthly progress successfully', async () => {
      const mockData = [{
        progress_percentage: 45,
        total_count: 45,
        target_count: 100
      }]
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await TurkcellService.getMonthlyProgress()

      expect(result.total).toBe(45)
      expect(result.target).toBe(100)
      expect(result.progress).toBe(45)
      expect(supabase.rpc).toHaveBeenCalledWith('get_monthly_turkcell_progress', {
        branch_uuid: 'test-branch-id',
        target_month: expect.any(String)
      })
    })

    it('should calculate monthly progress for specific month', async () => {
      const testMonth = '2024-03-01'
      const mockData = [{
        progress_percentage: 50,
        total_count: 30,
        target_count: 60
      }]
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await TurkcellService.getMonthlyProgress(testMonth)

      expect(result.total).toBe(30)
      expect(result.target).toBe(60)
      expect(result.progress).toBe(50)
      expect(supabase.rpc).toHaveBeenCalledWith('get_monthly_turkcell_progress', {
        branch_uuid: 'test-branch-id',
        target_month: testMonth
      })
    })

    it('should handle no data found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null
      })

      const result = await TurkcellService.getMonthlyProgress()

      expect(result.total).toBe(0)
      expect(result.target).toBe(0)
      expect(result.progress).toBe(0)
    })

    it('should handle empty array', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null
      })

      const result = await TurkcellService.getMonthlyProgress()

      expect(result.total).toBe(0)
      expect(result.target).toBe(0)
      expect(result.progress).toBe(0)
    })

    it('should throw error when query fails', async () => {
      const mockError = { message: 'Network timeout' }
      
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(TurkcellService.getMonthlyProgress()).rejects.toThrow('Aylık Turkcell ilerleme durumu alınamadı: Network timeout')
    })
  })

  describe('validateTarget', () => {
    it('should validate positive integers correctly', () => {
      expect(TurkcellService.validateTarget(100)).toEqual({ isValid: true })
      expect(TurkcellService.validateTarget(1)).toEqual({ isValid: true })
      expect(TurkcellService.validateTarget(9999)).toEqual({ isValid: true })
    })

    it('should reject zero and negative numbers', () => {
      expect(TurkcellService.validateTarget(0)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri 0\'dan büyük olmalıdır' 
      })
      expect(TurkcellService.validateTarget(-10)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri 0\'dan büyük olmalıdır' 
      })
    })

    it('should reject non-numbers', () => {
      expect(TurkcellService.validateTarget(NaN)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri geçerli bir sayı olmalıdır' 
      })
      expect(TurkcellService.validateTarget(null as any)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri gereklidir' 
      })
      expect(TurkcellService.validateTarget(undefined as any)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri gereklidir' 
      })
    })

    it('should reject decimal numbers', () => {
      expect(TurkcellService.validateTarget(10.5)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri tam sayı olmalıdır' 
      })
    })

    it('should reject numbers too large', () => {
      expect(TurkcellService.validateTarget(10001)).toEqual({ 
        isValid: false, 
        error: 'Hedef değeri 10.000\'den küçük olmalıdır' 
      })
    })
  })
})