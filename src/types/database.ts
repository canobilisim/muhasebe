export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_turkcell_count: {
        Args: { branch_uuid: string; target_date?: string }
        Returns: number
      }
      get_monthly_turkcell_progress: {
        Args: { branch_uuid: string; target_month_param?: string }
        Returns: {
          progress_percentage: number
          target_count: number
          total_count: number
        }[]
      }
      get_monthly_turkcell_target: {
        Args: { branch_uuid: string; target_month_param?: string }
        Returns: number
      }
      set_monthly_turkcell_target: {
        Args: {
          branch_uuid: string
          target_count_param: number
          target_month_param?: string
          user_uuid?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Turkcell specific types
export type TurkcellTransaction = Database['public']['Tables']['turkcell_transactions']['Row']
export type TurkcellTransactionInsert = Database['public']['Tables']['turkcell_transactions']['Insert']
export type TurkcellTransactionUpdate = Database['public']['Tables']['turkcell_transactions']['Update']

export type TurkcellTarget = Database['public']['Tables']['turkcell_targets']['Row']
export type TurkcellTargetInsert = Database['public']['Tables']['turkcell_targets']['Insert']
export type TurkcellTargetUpdate = Database['public']['Tables']['turkcell_targets']['Update']

// Helper function types
export type TurkcellProgressResult = {
  total_count: number
  target_count: number
  progress_percentage: number
}