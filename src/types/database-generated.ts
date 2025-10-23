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
