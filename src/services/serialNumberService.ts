import { supabase } from '@/lib/supabase'
import { SerialNumber, SerialNumberInsert, SerialNumberUpdate } from '@/types/product'
import { ApiResponse } from '@/types'

export class SerialNumberService {
  /**
   * Add a single serial number to a product
   * Includes duplicate check
   */
  static async addSerialNumber(
    productId: string,
    serialNumber: string
  ): Promise<ApiResponse<SerialNumber>> {
    try {
      // Check for duplicate serial number
      const { data: existing, error: checkError } = await supabase
        .from('product_serial_numbers')
        .select('id')
        .eq('serial_number', serialNumber)
        .maybeSingle()

      if (checkError) throw checkError

      if (existing) {
        return {
          data: null,
          error: 'Bu seri numarası zaten eklenmiş',
          success: false
        }
      }

      // Insert new serial number
      const serialNumberData: SerialNumberInsert = {
        product_id: productId,
        serial_number: serialNumber,
        status: 'available',
        added_date: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('product_serial_numbers')
        .insert(serialNumberData)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error adding serial number:', error)
      return {
        data: null,
        error: 'Seri numarası eklenirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Add multiple serial numbers to a product in bulk
   * Validates each serial number and skips duplicates
   */
  static async bulkAddSerialNumbers(
    productId: string,
    serialNumbers: string[]
  ): Promise<ApiResponse<{
    successful: SerialNumber[]
    failed: Array<{ serialNumber: string; reason: string }>
  }>> {
    try {
      const successful: SerialNumber[] = []
      const failed: Array<{ serialNumber: string; reason: string }> = []

      // Check for duplicates in the database
      const { data: existingSerialNumbers, error: checkError } = await supabase
        .from('product_serial_numbers')
        .select('serial_number')
        .in('serial_number', serialNumbers)

      if (checkError) throw checkError

      const existingSet = new Set(existingSerialNumbers?.map(sn => sn.serial_number) || [])

      // Filter out duplicates and prepare insert data
      const uniqueSerialNumbers = serialNumbers.filter((sn, index, self) => {
        // Check for duplicates within the input array
        if (self.indexOf(sn) !== index) {
          failed.push({ serialNumber: sn, reason: 'Listede tekrar ediyor' })
          return false
        }

        // Check for duplicates in database
        if (existingSet.has(sn)) {
          failed.push({ serialNumber: sn, reason: 'Bu seri numarası zaten eklenmiş' })
          return false
        }

        return true
      })

      // Insert valid serial numbers
      if (uniqueSerialNumbers.length > 0) {
        const insertData: SerialNumberInsert[] = uniqueSerialNumbers.map(sn => ({
          product_id: productId,
          serial_number: sn,
          status: 'available',
          added_date: new Date().toISOString()
        }))

        const { data, error } = await supabase
          .from('product_serial_numbers')
          .insert(insertData)
          .select()

        if (error) throw error

        if (data) {
          successful.push(...data)
        }
      }

      return {
        data: { successful, failed },
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error bulk adding serial numbers:', error)
      return {
        data: null,
        error: 'Toplu seri numarası eklenirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Remove a serial number
   * Only allows removal if status is 'available'
   */
  static async removeSerialNumber(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if serial number can be removed (must be available)
      const { data: serialNumber, error: checkError } = await supabase
        .from('product_serial_numbers')
        .select('status')
        .eq('id', id)
        .single()

      if (checkError) throw checkError

      if (serialNumber.status !== 'available') {
        return {
          data: false,
          error: 'Sadece mevcut durumundaki seri numaraları silinebilir',
          success: false
        }
      }

      // Delete the serial number
      const { error } = await supabase
        .from('product_serial_numbers')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error removing serial number:', error)
      return {
        data: false,
        error: 'Seri numarası silinirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get all available (unsold) serial numbers for a product
   */
  static async getAvailableSerialNumbers(productId: string): Promise<ApiResponse<SerialNumber[]>> {
    try {
      const { data, error } = await supabase
        .from('product_serial_numbers')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'available')
        .order('added_date', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting available serial numbers:', error)
      return {
        data: [],
        error: 'Mevcut seri numaraları getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get all serial numbers for a product (all statuses)
   */
  static async getSerialNumbers(productId: string): Promise<ApiResponse<SerialNumber[]>> {
    try {
      const { data, error } = await supabase
        .from('product_serial_numbers')
        .select('*')
        .eq('product_id', productId)
        .order('added_date', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting serial numbers:', error)
      return {
        data: [],
        error: 'Seri numaraları getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Reserve a serial number for a sale (marks as 'reserved')
   * Used when adding to cart before completing the sale
   */
  static async reserveSerialNumber(id: string): Promise<ApiResponse<SerialNumber>> {
    try {
      // Check if serial number is available
      const { data: serialNumber, error: checkError } = await supabase
        .from('product_serial_numbers')
        .select('status')
        .eq('id', id)
        .single()

      if (checkError) throw checkError

      if (serialNumber.status !== 'available') {
        return {
          data: null,
          error: 'Bu seri numarası mevcut değil',
          success: false
        }
      }

      // Update status to reserved
      const updateData: SerialNumberUpdate = {
        status: 'reserved'
      }

      const { data, error } = await supabase
        .from('product_serial_numbers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error reserving serial number:', error)
      return {
        data: null,
        error: 'Seri numarası rezerve edilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Release a reserved serial number (marks back as 'available')
   * Used when removing from cart or cancelling a sale
   */
  static async releaseSerialNumber(id: string): Promise<ApiResponse<SerialNumber>> {
    try {
      const updateData: SerialNumberUpdate = {
        status: 'available'
      }

      const { data, error } = await supabase
        .from('product_serial_numbers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error releasing serial number:', error)
      return {
        data: null,
        error: 'Seri numarası serbest bırakılırken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Mark a serial number as sold
   * Records the sale date and sale ID
   */
  static async markSerialNumberAsSold(
    id: string,
    saleId: string
  ): Promise<ApiResponse<SerialNumber>> {
    try {
      const updateData: SerialNumberUpdate = {
        status: 'sold',
        sold_date: new Date().toISOString(),
        sale_id: saleId
      }

      const { data, error } = await supabase
        .from('product_serial_numbers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error marking serial number as sold:', error)
      return {
        data: null,
        error: 'Seri numarası satıldı olarak işaretlenirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Get serial number count by status for a product
   */
  static async getSerialNumberCounts(productId: string): Promise<ApiResponse<{
    total: number
    available: number
    reserved: number
    sold: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('product_serial_numbers')
        .select('status')
        .eq('product_id', productId)

      if (error) throw error

      const counts = {
        total: data?.length || 0,
        available: 0,
        reserved: 0,
        sold: 0
      }

      data?.forEach(sn => {
        if (sn.status === 'available') counts.available++
        else if (sn.status === 'reserved') counts.reserved++
        else if (sn.status === 'sold') counts.sold++
      })

      return {
        data: counts,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error getting serial number counts:', error)
      return {
        data: null,
        error: 'Seri numarası sayıları getirilirken hata oluştu',
        success: false
      }
    }
  }

  /**
   * Check if a serial number exists (duplicate check)
   */
  static async checkSerialNumberExists(serialNumber: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('product_serial_numbers')
        .select('id')
        .eq('serial_number', serialNumber)
        .maybeSingle()

      if (error) throw error

      return {
        data: !!data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Error checking serial number:', error)
      return {
        data: false,
        error: 'Seri numarası kontrolü sırasında hata oluştu',
        success: false
      }
    }
  }
}
