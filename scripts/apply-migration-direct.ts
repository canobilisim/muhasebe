/**
 * Script to apply migration by executing SQL statements directly
 * Uses Supabase REST API to execute SQL
 * 
 * Usage: npx tsx scripts/apply-migration-direct.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
})

async function executeSQLDirect(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Use the REST API to execute SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      return { success: false, error: await response.text() }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

async function applyMigrationDirect() {
  console.log('🚀 Applying Auth Fixes Migration (Direct Method)\n')
  console.log('='.repeat(60))

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '004_auth_fixes.sql')
    console.log(`📄 Reading migration file: ${migrationPath}`)
    
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`)

    // Try to execute via direct SQL
    console.log('⚙️  Attempting direct SQL execution...\n')
    
    const result = await executeSQLDirect(migrationSQL)
    
    if (!result.success) {
      console.log('⚠️  Direct SQL execution not available.\n')
      console.log('This is normal - Supabase requires migrations to be applied via:')
      console.log('1. Supabase Dashboard SQL Editor')
      console.log('2. Supabase CLI')
      console.log('3. Database client (psql, pgAdmin, etc.)\n')
      
      console.log('📋 Please follow these steps:\n')
      console.log('**Method 1: Supabase Dashboard (Easiest)**')
      console.log('1. Open: https://supabase.com/dashboard/project/aooqwdinoxnawxmhttwj/sql')
      console.log('2. Click "New Query"')
      console.log('3. Copy the entire contents of: supabase/migrations/004_auth_fixes.sql')
      console.log('4. Paste into the SQL editor')
      console.log('5. Click "Run" (or press Cmd/Ctrl + Enter)')
      console.log('6. Wait for "Success" message\n')
      
      console.log('**Method 2: Supabase CLI**')
      console.log('```bash')
      console.log('npm install -g supabase')
      console.log('supabase link --project-ref aooqwdinoxnawxmhttwj')
      console.log('supabase db push')
      console.log('```\n')
      
      console.log('='.repeat(60))
      console.log('📝 After applying the migration, verify with:')
      console.log('   npx tsx scripts/validate-migration.ts\n')
      
      return false
    }

    console.log('✅ Migration applied successfully!\n')
    return true

  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}

async function main() {
  await applyMigrationDirect()
}

// Run the script
main()
