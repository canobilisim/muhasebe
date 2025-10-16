// Database type definitions for Supabase
// Auto-generated types based on database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types
export type UserRole = 'admin' | 'manager' | 'cashier'
export type PaymentType = 'cash' | 'pos' | 'credit' | 'partial'
export type PaymentStatus = 'paid' | 'pending' | 'overdue'
export type MovementType = 'income' | 'expense' | 'sale' | 'opening' | 'closing'

// Database table interfaces
export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          tax_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          tax_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          tax_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          branch_id: string | null
          email: string
          full_name: string
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          branch_id?: string | null
          email: string
          full_name: string
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          email?: string
          full_name?: string
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          branch_id: string | null
          barcode: string
          name: string
          category: string | null
          purchase_price: number
          sale_price: number
          stock_quantity: number
          critical_stock_level: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          barcode: string
          name: string
          category?: string | null
          purchase_price?: number
          sale_price?: number
          stock_quantity?: number
          critical_stock_level?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          barcode?: string
          name?: string
          category?: string | null
          purchase_price?: number
          sale_price?: number
          stock_quantity?: number
          critical_stock_level?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
          credit_limit: number
          current_balance: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          credit_limit?: number
          current_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          tax_number?: string | null
          credit_limit?: number
          current_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          branch_id: string | null
          user_id: string | null
          customer_id: string | null
          sale_number: string
          total_amount: number
          discount_amount: number
          tax_amount: number
          net_amount: number
          payment_type: PaymentType
          payment_status: PaymentStatus
          paid_amount: number
          change_amount: number
          notes: string | null
          sale_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          user_id?: string | null
          customer_id?: string | null
          sale_number?: string
          total_amount?: number
          discount_amount?: number
          tax_amount?: number
          net_amount?: number
          payment_type: PaymentType
          payment_status?: PaymentStatus
          paid_amount?: number
          change_amount?: number
          notes?: string | null
          sale_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          user_id?: string | null
          customer_id?: string | null
          sale_number?: string
          total_amount?: number
          discount_amount?: number
          tax_amount?: number
          net_amount?: number
          payment_type?: PaymentType
          payment_status?: PaymentStatus
          paid_amount?: number
          change_amount?: number
          notes?: string | null
          sale_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          discount_amount: number
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price: number
          discount_amount?: number
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          discount_amount?: number
          total_amount?: number
          created_at?: string
        }
      }
      cash_movements: {
        Row: {
          id: string
          branch_id: string | null
          user_id: string | null
          sale_id: string | null
          movement_type: MovementType
          amount: number
          description: string | null
          reference_number: string | null
          movement_date: string
          created_at: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          user_id?: string | null
          sale_id?: string | null
          movement_type: MovementType
          amount: number
          description?: string | null
          reference_number?: string | null
          movement_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          user_id?: string | null
          sale_id?: string | null
          movement_type?: MovementType
          amount?: number
          description?: string | null
          reference_number?: string | null
          movement_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_branch_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_sale_number: {
        Args: {
          branch_uuid: string
        }
        Returns: string
      }
      get_low_stock_products: {
        Args: {
          branch_uuid: string
        }
        Returns: {
          id: string
          barcode: string
          name: string
          stock_quantity: number
          critical_stock_level: number
        }[]
      }
      get_daily_sales_summary: {
        Args: {
          branch_uuid: string
          target_date?: string
        }
        Returns: {
          total_sales: number
          total_amount: number
          cash_sales: number
          pos_sales: number
          credit_sales: number
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      payment_type: PaymentType
      payment_status: PaymentStatus
      movement_type: MovementType
    }
  }
}

export default Database