// This file contains the Supabase database types
// Generated types are extended with custom interfaces in other type files

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_settings: {
        Row: {
          id: string
          api_key_encrypted: string
          environment: string
          is_active: boolean | null
          last_test_date: string | null
          last_test_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          api_key_encrypted: string
          environment: string
          is_active?: boolean | null
          last_test_date?: string | null
          last_test_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          api_key_encrypted?: string
          environment?: string
          is_active?: boolean | null
          last_test_date?: string | null
          last_test_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          tax_number: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          tax_number?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          tax_number?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          barcode: string
          name: string
          category: string | null
          category_id: string | null
          branch_id: string | null
          purchase_price: number
          sale_price: number
          sale_price_1: number | null
          sale_price_2: number | null
          sale_price_3: number | null
          stock_quantity: number
          critical_stock_level: number | null
          is_active: boolean | null
          show_in_fast_sale: boolean | null
          fast_sale_category_id: string | null
          fast_sale_order: number | null
          // New columns for advanced product management
          brand: string | null
          model: string | null
          color: string | null
          serial_number: string | null
          condition: string | null
          serial_number_tracking_enabled: boolean | null
          vat_rate: number | null
          is_vat_included: boolean | null
          unit: string | null
          description: string | null
          stock_tracking_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          barcode: string
          name: string
          category?: string | null
          category_id?: string | null
          branch_id?: string | null
          purchase_price?: number
          sale_price?: number
          sale_price_1?: number | null
          sale_price_2?: number | null
          sale_price_3?: number | null
          stock_quantity?: number
          critical_stock_level?: number | null
          is_active?: boolean | null
          show_in_fast_sale?: boolean | null
          fast_sale_category_id?: string | null
          fast_sale_order?: number | null
          brand?: string | null
          model?: string | null
          color?: string | null
          serial_number?: string | null
          condition?: string | null
          serial_number_tracking_enabled?: boolean | null
          vat_rate?: number | null
          is_vat_included?: boolean | null
          unit?: string | null
          description?: string | null
          stock_tracking_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          barcode?: string
          name?: string
          category?: string | null
          category_id?: string | null
          branch_id?: string | null
          purchase_price?: number
          sale_price?: number
          sale_price_1?: number | null
          sale_price_2?: number | null
          sale_price_3?: number | null
          stock_quantity?: number
          critical_stock_level?: number | null
          is_active?: boolean | null
          show_in_fast_sale?: boolean | null
          fast_sale_category_id?: string | null
          fast_sale_order?: number | null
          brand?: string | null
          model?: string | null
          color?: string | null
          serial_number?: string | null
          condition?: string | null
          serial_number_tracking_enabled?: boolean | null
          vat_rate?: number | null
          is_vat_included?: boolean | null
          unit?: string | null
          description?: string | null
          stock_tracking_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_serial_numbers: {
        Row: {
          id: string
          product_id: string
          serial_number: string
          status: string
          added_date: string | null
          sold_date: string | null
          sale_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          serial_number: string
          status?: string
          added_date?: string | null
          sold_date?: string | null
          sale_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          serial_number?: string
          status?: string
          added_date?: string | null
          sold_date?: string | null
          sale_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          branch_id: string | null
          user_id: string | null
          customer_id: string | null
          sale_number: string
          total_amount: number
          discount_amount: number | null
          tax_amount: number | null
          net_amount: number
          payment_type: Database["public"]["Enums"]["payment_type"]
          paid_amount: number | null
          change_amount: number | null
          notes: string | null
          due_date: string | null
          sale_date: string | null
          created_at: string | null
          updated_at: string | null
          // New columns for e-invoice
          customer_type: string | null
          customer_name: string | null
          vkn_tckn: string | null
          tax_office: string | null
          email: string | null
          phone: string | null
          address: string | null
          invoice_type: string | null
          invoice_date: string | null
          currency: string | null
          note: string | null
          subtotal: number | null
          total_vat_amount: number | null
          status: string | null
          invoice_uuid: string | null
          invoice_number: string | null
          error_message: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          branch_id?: string | null
          user_id?: string | null
          customer_id?: string | null
          sale_number: string
          total_amount?: number
          discount_amount?: number | null
          tax_amount?: number | null
          net_amount?: number
          payment_type: Database["public"]["Enums"]["payment_type"]
          paid_amount?: number | null
          change_amount?: number | null
          notes?: string | null
          due_date?: string | null
          sale_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          customer_type?: string | null
          customer_name?: string | null
          vkn_tckn?: string | null
          tax_office?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          invoice_type?: string | null
          invoice_date?: string | null
          currency?: string | null
          note?: string | null
          subtotal?: number | null
          total_vat_amount?: number | null
          status?: string | null
          invoice_uuid?: string | null
          invoice_number?: string | null
          error_message?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          branch_id?: string | null
          user_id?: string | null
          customer_id?: string | null
          sale_number?: string
          total_amount?: number
          discount_amount?: number | null
          tax_amount?: number | null
          net_amount?: number
          payment_type?: Database["public"]["Enums"]["payment_type"]
          paid_amount?: number | null
          change_amount?: number | null
          notes?: string | null
          due_date?: string | null
          sale_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          customer_type?: string | null
          customer_name?: string | null
          vkn_tckn?: string | null
          tax_office?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          invoice_type?: string | null
          invoice_date?: string | null
          currency?: string | null
          note?: string | null
          subtotal?: number | null
          total_vat_amount?: number | null
          status?: string | null
          invoice_uuid?: string | null
          invoice_number?: string | null
          error_message?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          discount_amount: number | null
          total_amount: number
          note: string | null
          is_miscellaneous: boolean | null
          created_at: string | null
          // New columns
          serial_number_id: string | null
          product_name: string | null
          barcode: string | null
          vat_rate: number | null
          vat_amount: number | null
        }
        Insert: {
          id?: string
          sale_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price: number
          discount_amount?: number | null
          total_amount: number
          note?: string | null
          is_miscellaneous?: boolean | null
          created_at?: string | null
          serial_number_id?: string | null
          product_name?: string | null
          barcode?: string | null
          vat_rate?: number | null
          vat_amount?: number | null
        }
        Update: {
          id?: string
          sale_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          discount_amount?: number | null
          total_amount?: number
          note?: string | null
          is_miscellaneous?: boolean | null
          created_at?: string | null
          serial_number_id?: string | null
          product_name?: string | null
          barcode?: string | null
          vat_rate?: number | null
          vat_amount?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          branch_id: string | null
          name: string
          phone: string | null
          email: string | null
          address: string | null
          tax_number: string | null
          credit_limit: number | null
          current_balance: number | null
          is_active: boolean | null
          customer_type: string | null
          tc_kimlik: string | null
          birth_date: string | null
          city: string | null
          district: string | null
          notes: string | null
          company_name: string | null
          contact_person: string | null
          tax_office: string | null
          trade_registry_no: string | null
          billing_address: string | null
          delivery_address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          branch_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          is_active?: boolean | null
          customer_type?: string | null
          tc_kimlik?: string | null
          birth_date?: string | null
          city?: string | null
          district?: string | null
          notes?: string | null
          company_name?: string | null
          contact_person?: string | null
          tax_office?: string | null
          trade_registry_no?: string | null
          billing_address?: string | null
          delivery_address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          branch_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          is_active?: boolean | null
          customer_type?: string | null
          tc_kimlik?: string | null
          birth_date?: string | null
          city?: string | null
          district?: string | null
          notes?: string | null
          company_name?: string | null
          contact_person?: string | null
          tax_office?: string | null
          trade_registry_no?: string | null
          billing_address?: string | null
          delivery_address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          branch_id: string | null
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          branch_id?: string | null
          email: string
          full_name: string
          role?: Database["public"]["Enums"]["user_role"]
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          branch_id?: string | null
          email?: string
          full_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      irsaliyeler: {
        Row: {
          id: number
          irsaliye_no: string
          cari_id: number
          cari_turu: string
          irsaliye_turu: string
          irsaliye_tarihi: string
          sevk_tarihi: string
          sevk_yeri: string | null
          durum: string
          toplam_miktar: number
          toplam_tutar: number
          pdf_url: string | null
          aciklama: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          irsaliye_no: string
          cari_id: number
          cari_turu: string
          irsaliye_turu: string
          irsaliye_tarihi?: string
          sevk_tarihi?: string
          sevk_yeri?: string | null
          durum?: string
          toplam_miktar?: number
          toplam_tutar?: number
          pdf_url?: string | null
          aciklama?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          irsaliye_no?: string
          cari_id?: number
          cari_turu?: string
          irsaliye_turu?: string
          irsaliye_tarihi?: string
          sevk_tarihi?: string
          sevk_yeri?: string | null
          durum?: string
          toplam_miktar?: number
          toplam_tutar?: number
          pdf_url?: string | null
          aciklama?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      irsaliye_urunleri: {
        Row: {
          id: number
          irsaliye_id: number
          urun_id: number
          urun_adi: string
          barkod: string | null
          miktar: number
          birim: string
          birim_fiyat: number | null
          tutar: number | null
          seri_no: string | null
          aciklama: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          irsaliye_id: number
          urun_id: number
          urun_adi: string
          barkod?: string | null
          miktar?: number
          birim?: string
          birim_fiyat?: number | null
          tutar?: number | null
          seri_no?: string | null
          aciklama?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          irsaliye_id?: number
          urun_id?: number
          urun_adi?: string
          barkod?: string | null
          miktar?: number
          birim?: string
          birim_fiyat?: number | null
          tutar?: number | null
          seri_no?: string | null
          aciklama?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      cariler: {
        Row: {
          id: number
          ad: string
          adres: string | null
          telefon: string | null
          vergi_no: string | null
          tip: string
          aktif: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          ad: string
          adres?: string | null
          telefon?: string | null
          vergi_no?: string | null
          tip: string
          aktif?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          ad?: string
          adres?: string | null
          telefon?: string | null
          vergi_no?: string | null
          tip?: string
          aktif?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      urunler: {
        Row: {
          id: number
          ad: string
          barkod: string | null
          stok_miktari: number
          birim: string | null
          satis_fiyati: number | null
          aktif: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          ad: string
          barkod?: string | null
          stok_miktari?: number
          birim?: string | null
          satis_fiyati?: number | null
          aktif?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          ad?: string
          barkod?: string | null
          stok_miktari?: number
          birim?: string | null
          satis_fiyati?: number | null
          aktif?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_product_stock: {
        Args: {
          product_id: number
          quantity_change: number
        }
        Returns: undefined
      }
      generate_irsaliye_no: {
        Args: {}
        Returns: string
      }
    }
    Enums: {
      movement_type: "income" | "expense" | "sale" | "opening" | "closing"
      payment_type: "cash" | "pos" | "credit" | "partial"
      user_role: "admin" | "manager" | "cashier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for convenience
export type UserRole = Database["public"]["Enums"]["user_role"]
export type PaymentType = Database["public"]["Enums"]["payment_type"]
export type MovementType = Database["public"]["Enums"]["movement_type"]

// Legacy type aliases for backward compatibility
export type PaymentStatus = 'pending' | 'completed' | 'cancelled'
