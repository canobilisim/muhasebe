import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SerialNumberService } from '../serialNumberService'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('SerialNumberService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addSerialNumber', () => {
    it('yeni seri numarası ekler', async () => {
      const mockSerialNumber = {
        id: '123',
        product_id: 'prod-1',
        serial_number: 'SN001',
        status: 'available',
        added_date: new Date().toISOString()
      }

      // Mock duplicate check (no existing)
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })

      // Mock insert
      const mockInsert = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockSerialNumber, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
        insert: mockInsert,
        single: mockSingle
      } as any)

      const result = await SerialNumberService.addSerialNumber('prod-1', 'SN001')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSerialNumber)
      expect(result.error).toBeNull()
    })

    it('duplicate seri numarası için hata döner', async () => {
      // Mock duplicate check (existing found)
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockMaybeSingle = vi.fn().mockResolvedValue({ 
        data: { id: 'existing-id' }, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle
      } as any)

      const result = await SerialNumberService.addSerialNumber('prod-1', 'SN001')

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBe('Bu seri numarası zaten eklenmiş')
    })

    it('veritabanı hatası için hata döner', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockMaybeSingle = vi.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Database error') 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle
      } as any)

      const result = await SerialNumberService.addSerialNumber('prod-1', 'SN001')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Seri numarası eklenirken hata oluştu')
    })
  })

  describe('bulkAddSerialNumbers', () => {
    it('çoklu seri numarası ekler', async () => {
      const mockSerialNumbers = [
        { id: '1', serial_number: 'SN001', status: 'available' },
        { id: '2', serial_number: 'SN002', status: 'available' }
      ]

      // Mock duplicate check
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null })

      // Mock insert
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelectAfterInsert = vi.fn().mockResolvedValue({ 
        data: mockSerialNumbers, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        in: mockIn,
        insert: mockInsert
      } as any)

      mockSelect.mockReturnValue({
        in: mockIn
      } as any)

      mockInsert.mockReturnValue({
        select: mockSelectAfterInsert
      } as any)

      const result = await SerialNumberService.bulkAddSerialNumbers('prod-1', ['SN001', 'SN002'])

      expect(result.success).toBe(true)
      expect(result.data?.successful).toHaveLength(2)
      expect(result.data?.failed).toHaveLength(0)
    })

    it('duplicate seri numaralarını filtreler', async () => {
      // Mock duplicate check (one existing)
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({ 
        data: [{ serial_number: 'SN001' }], 
        error: null 
      })

      // Mock insert for remaining
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelectAfterInsert = vi.fn().mockResolvedValue({ 
        data: [{ id: '2', serial_number: 'SN002', status: 'available' }], 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        in: mockIn,
        insert: mockInsert
      } as any)

      mockSelect.mockReturnValue({
        in: mockIn
      } as any)

      mockInsert.mockReturnValue({
        select: mockSelectAfterInsert
      } as any)

      const result = await SerialNumberService.bulkAddSerialNumbers('prod-1', ['SN001', 'SN002'])

      expect(result.success).toBe(true)
      expect(result.data?.successful).toHaveLength(1)
      expect(result.data?.failed).toHaveLength(1)
      expect(result.data?.failed[0].reason).toBe('Bu seri numarası zaten eklenmiş')
    })

    it('listede tekrar eden seri numaralarını filtreler', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null })

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelectAfterInsert = vi.fn().mockResolvedValue({ 
        data: [{ id: '1', serial_number: 'SN001', status: 'available' }], 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        in: mockIn,
        insert: mockInsert
      } as any)

      mockSelect.mockReturnValue({
        in: mockIn
      } as any)

      mockInsert.mockReturnValue({
        select: mockSelectAfterInsert
      } as any)

      const result = await SerialNumberService.bulkAddSerialNumbers('prod-1', ['SN001', 'SN001'])

      expect(result.success).toBe(true)
      expect(result.data?.successful).toHaveLength(1)
      expect(result.data?.failed).toHaveLength(1)
      expect(result.data?.failed[0].reason).toBe('Listede tekrar ediyor')
    })
  })

  describe('removeSerialNumber', () => {
    it('available durumundaki seri numarasını siler', async () => {
      // Mock status check
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { status: 'available' }, 
        error: null 
      })

      // Mock delete
      const mockDelete = vi.fn().mockReturnThis()
      const mockEqDelete = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        delete: mockDelete
      } as any)

      mockDelete.mockReturnValue({
        eq: mockEqDelete
      } as any)

      const result = await SerialNumberService.removeSerialNumber('123')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('sold durumundaki seri numarasını silmez', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { status: 'sold' }, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      } as any)

      const result = await SerialNumberService.removeSerialNumber('123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sadece mevcut durumundaki seri numaraları silinebilir')
    })
  })

  describe('getAvailableSerialNumbers', () => {
    it('mevcut seri numaralarını getirir', async () => {
      const mockSerialNumbers = [
        { id: '1', serial_number: 'SN001', status: 'available' },
        { id: '2', serial_number: 'SN002', status: 'available' }
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockSerialNumbers, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder
      } as any)

      const result = await SerialNumberService.getAvailableSerialNumbers('prod-1')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('boş liste döner', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder
      } as any)

      const result = await SerialNumberService.getAvailableSerialNumbers('prod-1')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })

  describe('reserveSerialNumber', () => {
    it('available seri numarasını rezerve eder', async () => {
      const mockSerialNumber = {
        id: '123',
        serial_number: 'SN001',
        status: 'reserved'
      }

      // Mock status check
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { status: 'available' }, 
        error: null 
      })

      // Mock update
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEqUpdate = vi.fn().mockReturnThis()
      const mockSelectUpdate = vi.fn().mockReturnThis()
      const mockSingleUpdate = vi.fn().mockResolvedValue({ 
        data: mockSerialNumber, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate
      } as any)

      mockUpdate.mockReturnValue({
        eq: mockEqUpdate
      } as any)

      mockEqUpdate.mockReturnValue({
        select: mockSelectUpdate
      } as any)

      mockSelectUpdate.mockReturnValue({
        single: mockSingleUpdate
      } as any)

      const result = await SerialNumberService.reserveSerialNumber('123')

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('reserved')
    })

    it('sold seri numarasını rezerve etmez', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { status: 'sold' }, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      } as any)

      const result = await SerialNumberService.reserveSerialNumber('123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bu seri numarası mevcut değil')
    })
  })

  describe('markSerialNumberAsSold', () => {
    it('seri numarasını satıldı olarak işaretler', async () => {
      const mockSerialNumber = {
        id: '123',
        serial_number: 'SN001',
        status: 'sold',
        sold_date: new Date().toISOString(),
        sale_id: 'sale-1'
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: mockSerialNumber, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle
      } as any)

      mockUpdate.mockReturnValue({
        eq: mockEq
      } as any)

      mockEq.mockReturnValue({
        select: mockSelect
      } as any)

      mockSelect.mockReturnValue({
        single: mockSingle
      } as any)

      const result = await SerialNumberService.markSerialNumberAsSold('123', 'sale-1')

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('sold')
      expect(result.data?.sale_id).toBe('sale-1')
    })
  })

  describe('getSerialNumberCounts', () => {
    it('seri numarası sayılarını hesaplar', async () => {
      const mockSerialNumbers = [
        { status: 'available' },
        { status: 'available' },
        { status: 'reserved' },
        { status: 'sold' },
        { status: 'sold' }
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: mockSerialNumbers, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq
      } as any)

      const result = await SerialNumberService.getSerialNumberCounts('prod-1')

      expect(result.success).toBe(true)
      expect(result.data?.total).toBe(5)
      expect(result.data?.available).toBe(2)
      expect(result.data?.reserved).toBe(1)
      expect(result.data?.sold).toBe(2)
    })

    it('boş ürün için sıfır sayılar döner', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq
      } as any)

      const result = await SerialNumberService.getSerialNumberCounts('prod-1')

      expect(result.success).toBe(true)
      expect(result.data?.total).toBe(0)
      expect(result.data?.available).toBe(0)
      expect(result.data?.reserved).toBe(0)
      expect(result.data?.sold).toBe(0)
    })
  })

  describe('checkSerialNumberExists', () => {
    it('mevcut seri numarası için true döner', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockMaybeSingle = vi.fn().mockResolvedValue({ 
        data: { id: '123' }, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle
      } as any)

      const result = await SerialNumberService.checkSerialNumberExists('SN001')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('mevcut olmayan seri numarası için false döner', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockMaybeSingle = vi.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle
      } as any)

      const result = await SerialNumberService.checkSerialNumberExists('SN999')

      expect(result.success).toBe(true)
      expect(result.data).toBe(false)
    })
  })
})
