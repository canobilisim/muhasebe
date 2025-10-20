import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@/types';
import type { FastSaleCategory, FastSaleCategoryInsert, FastSaleCategoryUpdate } from '@/types';

export class FastSaleCategoryService {
  /**
   * Tüm hızlı satış kategorilerini getir
   */
  static async getAll(): Promise<ApiResponse<FastSaleCategory[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: 'Kullanıcı oturumu bulunamadı', success: false };
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', userData.user.id)
        .single();

      if (!userProfile?.branch_id) {
        return { data: null, error: 'Kullanıcı şubesi bulunamadı', success: false };
      }

      const { data, error } = await supabase
        .from('fast_sale_categories')
        .select('*')
        .eq('branch_id', userProfile.branch_id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching fast sale categories:', error);
        return { data: null, error: error.message, success: false };
      }

      return { data: data || [], error: null, success: true };
    } catch (error) {
      console.error('Error in getAll:', error);
      return { data: null, error: 'Kategoriler yüklenirken hata oluştu', success: false };
    }
  }

  /**
   * ID'ye göre kategori getir
   */
  static async getById(id: string): Promise<ApiResponse<FastSaleCategory>> {
    try {
      const { data, error } = await supabase
        .from('fast_sale_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching category:', error);
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error in getById:', error);
      return { data: null, error: 'Kategori yüklenirken hata oluştu', success: false };
    }
  }

  /**
   * Yeni kategori oluştur
   */
  static async create(category: Omit<FastSaleCategoryInsert, 'branch_id'>): Promise<ApiResponse<FastSaleCategory>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: 'Kullanıcı oturumu bulunamadı', success: false };
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', userData.user.id)
        .single();

      if (!userProfile?.branch_id) {
        return { data: null, error: 'Kullanıcı şubesi bulunamadı', success: false };
      }

      const { data, error } = await supabase
        .from('fast_sale_categories')
        .insert({
          ...category,
          branch_id: userProfile.branch_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error in create:', error);
      return { data: null, error: 'Kategori oluşturulurken hata oluştu', success: false };
    }
  }

  /**
   * Kategori güncelle
   */
  static async update(id: string, updates: FastSaleCategoryUpdate): Promise<ApiResponse<FastSaleCategory>> {
    try {
      const { data, error } = await supabase
        .from('fast_sale_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error in update:', error);
      return { data: null, error: 'Kategori güncellenirken hata oluştu', success: false };
    }
  }

  /**
   * Kategori sil
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('fast_sale_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        return { data: null, error: error.message, success: false };
      }

      return { data: null, error: null, success: true };
    } catch (error) {
      console.error('Error in delete:', error);
      return { data: null, error: 'Kategori silinirken hata oluştu', success: false };
    }
  }
}
