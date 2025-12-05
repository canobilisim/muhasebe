export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: \"13.0.5\"
  }
  public: {
    Tables: {
      suppliers: {
        Row: {
          account_number: string | null
          address: string | null
          bank_name: string | null
          branch_id: string | null
          city: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          district: string | null
          email: string | null
          iban: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          tax_number: string | null
          tax_office: string | null
          trade_registry_no: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          branch_id?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          district?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          tax_number?: string | null
          tax_office?: string | null
          trade_registry_no?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          branch_id?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          district?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          tax_number?: string | null
          tax_office?: string | null
          trade_registry_no?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          branch_id: string | null
          created_at: string | null
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_amount: number | null
          payment_type: string | null
          purchase_date: string | null
          purchase_number: string
          remaining_amount: number | null
          subtotal: number | null
          supplier_id: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_type?: string | null
          purchase_date?: string | null
          purchase_number: string
          remaining_amount?: number | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_type?: string | null
          purchase_date?: string | null
          purchase_number?: string
          remaining_amount?: number | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          barcode: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          note: string | null
          product_id: string | null
          product_name: string | null
          purchase_id: string | null
          quantity: number | null
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          unit_price: number | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          note?: string | null
          product_id?: string | null
          product_name?: string | null
          purchase_id?: string | null
          quantity?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Update: {
          barcode?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          note?: string | null
          product_id?: string | null
          product_name?: string | null
          purchase_id?: string | null
          quantity?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Relationships: []
      }
    }
  }
}
