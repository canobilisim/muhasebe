import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { config, validateConfig } from './config'

// Validate configuration on startup
validateConfig()

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      // Use localStorage for persistent sessions
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Make supabase available globally for debugging (development only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).supabase = supabase
}