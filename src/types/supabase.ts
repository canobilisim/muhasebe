// Supabase specific types and utilities
import { supabase } from '@/lib/supabase'

// Supabase client type
export type SupabaseClient = typeof supabase

// Auth types
export type AuthUser = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}

// Database operation types
export type DatabaseError = {
  message: string
  details: string
  hint: string
  code: string
}

export type QueryResult<T> = {
  data: T | null
  error: DatabaseError | null
  count?: number | null
}

export type QueryBuilder<T> = ReturnType<typeof supabase.from<T>>

// RPC function types
export type RPCResponse<T> = {
  data: T | null
  error: DatabaseError | null
}

// Real-time subscription types
export type RealtimeChannel = ReturnType<typeof supabase.channel>

export type RealtimePayload<T = any> = {
  schema: string
  table: string
  commit_timestamp: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
  errors: any[]
}

// Storage types
export type StorageError = {
  message: string
  statusCode?: string
}

export type FileObject = {
  name: string
  bucket_id: string
  owner: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: Record<string, any>
}

// Re-export database types
export type { Database } from './database'
import type { Database } from './database'

// Helper type for table names
export type TableName = keyof Database['public']['Tables']

// Helper type for getting table row type
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']

// Helper type for getting table insert type
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']

// Helper type for getting table update type
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']