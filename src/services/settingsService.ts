import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Branch = Database['public']['Tables']['branches']['Row']
type BranchInsert = Database['public']['Tables']['branches']['Insert']
type BranchUpdate = Database['public']['Tables']['branches']['Update']

export interface CompanySettings {
  id: string
  name: string
  address: string | null
  phone: string | null
  tax_number: string | null
  logo_url?: string | null
  receipt_template?: string | null
  created_at: string
  updated_at: string
}

class SettingsService {
  // Get company/branch information
  async getCompanySettings(branchId: string): Promise<CompanySettings | null> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single()

      if (error) {
        console.error('Error fetching company settings:', error)
        return null
      }

      return {
        ...data,
        logo_url: null, // Will be implemented with file storage
        receipt_template: null, // Will be implemented with templates
      }
    } catch (error) {
      console.error('Error in getCompanySettings:', error)
      return null
    }
  }

  // Update company/branch information
  async updateCompanySettings(
    branchId: string, 
    settings: Partial<BranchUpdate>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('branches')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', branchId)

      if (error) {
        console.error('Error updating company settings:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateCompanySettings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      return { success: false, error: errorMessage }
    }
  }

  // Create initial company/branch settings
  async createCompanySettings(
    settings: BranchInsert
  ): Promise<{ success: boolean; data?: Branch; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert(settings)
        .select()
        .single()

      if (error) {
        console.error('Error creating company settings:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in createCompanySettings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      return { success: false, error: errorMessage }
    }
  }

  // Get all branches (for admin users)
  async getAllBranches(): Promise<Branch[]> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching branches:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllBranches:', error)
      return []
    }
  }

  // Upload company logo (placeholder for future implementation)
  async uploadLogo(file: File, branchId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    // TODO: Implement file upload to Supabase Storage
    console.log('Logo upload not implemented yet', file, branchId)
    return { success: false, error: 'Logo yükleme özelliği henüz aktif değil' }
  }

  // Get receipt templates (placeholder for future implementation)
  async getReceiptTemplates(): Promise<string[]> {
    // TODO: Implement receipt template management
    return ['Standart Fiş', 'Detaylı Fiş', 'Minimal Fiş']
  }
}

export const settingsService = new SettingsService()