export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_settings: {
        Row: {
          api_key_encrypted: string
          created_at: string | null
          environment: string
          id: string
          is_active: boolean | null
          last_test_date: string | null
          last_test_status: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string | null
          environment: string
          id?: string
          is_active?: boolean | null
          last_test_date?: string | null
          last_test_status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string | null
          environment?: string
          id?: string
          is_active?: boolean | null
          last_test_date?: string | null
          last_test_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_movements: {
        Row: {
          amount: number
          branch_id: string | null
          created_at: string | null
          description: string | null
          id: string
          movement_date: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          reference_number: string | null
          sale_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          movement_date?: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          reference_number?: string | null
          sale_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          movement_date?: string | null
          movement_type?: Database["public"]["Enums"]["movement_type"]
          reference_number?: string | null
          sale_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_payments: {
        Row: {
          amount: number
          branch_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_number: string | null
          payment_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_number?: string | null
          payment_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_number?: string | null
          payment_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          billing_address: string | null
          birth_date: string | null
          branch_id: string | null
          city: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          customer_type: string | null
          delivery_address: string | null
          district: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          tax_number: string | null
          tax_office: string | null
          tc_kimlik: string | null
          trade_registry_no: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          billing_address?: string | null
          birth_date?: string | null
          branch_id?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          customer_type?: string | null
          delivery_address?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          tax_number?: string | null
          tax_office?: string | null
          tc_kimlik?: string | null
          trade_registry_no?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          billing_address?: string | null
          birth_date?: string | null
          branch_id?: string | null
          city?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          customer_type?: string | null
          delivery_address?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          tax_number?: string | null
          tax_office?: string | null
          tc_kimlik?: string | null
          trade_registry_no?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      fast_sale_categories: {
        Row: {
          branch_id: string | null
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fast_sale_categories_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          branch_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_serial_numbers: {
        Row: {
          added_date: string | null
          created_at: string | null
          id: string
          product_id: string
          sale_id: string | null
          serial_number: string
          sold_date: string | null
          status: string
        }
        Insert: {
          added_date?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          sale_id?: string | null
          serial_number: string
          sold_date?: string | null
          status?: string
        }
        Update: {
          added_date?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          sale_id?: string | null
          serial_number?: string
          sold_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_serial_numbers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_serial_numbers_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string
          branch_id: string | null
          brand: string | null
          category: string | null
          category_id: string | null
          color: string | null
          condition: string | null
          created_at: string | null
          critical_stock_level: number | null
          description: string | null
          fast_sale_category_id: string | null
          fast_sale_order: number | null
          id: string
          is_active: boolean | null
          is_vat_included: boolean | null
          model: string | null
          name: string
          purchase_price: number
          sale_price_1: number
          sale_price_2: number | null
          serial_number: string | null
          serial_number_tracking_enabled: boolean | null
          show_in_fast_sale: boolean | null
          stock_quantity: number
          stock_tracking_enabled: boolean | null
          unit: string | null
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          barcode: string
          branch_id?: string | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          critical_stock_level?: number | null
          description?: string | null
          fast_sale_category_id?: string | null
          fast_sale_order?: number | null
          id?: string
          is_active?: boolean | null
          is_vat_included?: boolean | null
          model?: string | null
          name: string
          purchase_price?: number
          sale_price_1?: number
          sale_price_2?: number | null
          serial_number?: string | null
          serial_number_tracking_enabled?: boolean | null
          show_in_fast_sale?: boolean | null
          stock_quantity?: number
          stock_tracking_enabled?: boolean | null
          unit?: string | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          barcode?: string
          branch_id?: string | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          critical_stock_level?: number | null
          description?: string | null
          fast_sale_category_id?: string | null
          fast_sale_order?: number | null
          id?: string
          is_active?: boolean | null
          is_vat_included?: boolean | null
          model?: string | null
          name?: string
          purchase_price?: number
          sale_price_1?: number
          sale_price_2?: number | null
          serial_number?: string | null
          serial_number_tracking_enabled?: boolean | null
          show_in_fast_sale?: boolean | null
          stock_quantity?: number
          stock_tracking_enabled?: boolean | null
          unit?: string | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_fast_sale_category_id_fkey"
            columns: ["fast_sale_category_id"]
            isOneToOne: false
            referencedRelation: "fast_sale_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          barcode: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          is_miscellaneous: boolean | null
          note: string | null
          product_id: string | null
          product_name: string | null
          quantity: number
          sale_id: string | null
          serial_number_id: string | null
          total_amount: number
          unit_price: number
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_miscellaneous?: boolean | null
          note?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          sale_id?: string | null
          serial_number_id?: string | null
          total_amount: number
          unit_price: number
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          barcode?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_miscellaneous?: boolean | null
          note?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          sale_id?: string | null
          serial_number_id?: string | null
          total_amount?: number
          unit_price?: number
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_serial_number_id_fkey"
            columns: ["serial_number_id"]
            isOneToOne: false
            referencedRelation: "product_serial_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          address: string | null
          branch_id: string | null
          change_amount: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          customer_id: string | null
          customer_name: string | null
          customer_type: string | null
          discount_amount: number | null
          due_date: string | null
          email: string | null
          error_message: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          invoice_type: string | null
          invoice_uuid: string | null
          net_amount: number
          note: string | null
          notes: string | null
          paid_amount: number | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          phone: string | null
          sale_date: string | null
          sale_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_office: string | null
          total_amount: number
          total_vat_amount: number | null
          updated_at: string | null
          user_id: string | null
          vkn_tckn: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_type?: string | null
          discount_amount?: number | null
          due_date?: string | null
          email?: string | null
          error_message?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          invoice_uuid?: string | null
          net_amount?: number
          note?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          phone?: string | null
          sale_date?: string | null
          sale_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_office?: string | null
          total_amount?: number
          total_vat_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          vkn_tckn?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_type?: string | null
          discount_amount?: number | null
          due_date?: string | null
          email?: string | null
          error_message?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          invoice_uuid?: string | null
          net_amount?: number
          note?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          phone?: string | null
          sale_date?: string | null
          sale_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_office?: string | null
          total_amount?: number
          total_vat_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          vkn_tckn?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      turkcell_targets: {
        Row: {
          branch_id: string | null
          created_at: string | null
          description: string | null
          id: string
          target_count: number
          target_month: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          target_count: number
          target_month: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          target_count?: number
          target_month?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turkcell_targets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turkcell_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      turkcell_transactions: {
        Row: {
          branch_id: string | null
          count: number
          created_at: string | null
          description: string | null
          id: string
          reference_number: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          count?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          count?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turkcell_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turkcell_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          branch_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      movement_type: "income" | "expense" | "sale" | "opening" | "closing"
      payment_type: "cash" | "pos" | "credit" | "partial"
      turkcell_transaction_type:
        | "postpaid_transfer"
        | "prepaid_transfer"
        | "new_line"
        | "payment_type_change"
        | "data_package"
        | "device_with_line"
        | "device_cash"
        | "sim_change"
        | "number_change"
      user_role: "admin" | "manager" | "cashier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
