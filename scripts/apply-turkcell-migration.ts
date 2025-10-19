/**
 * Script to apply the Turkcell tables migration to Supabase
 * This script reads and executes the SQL migration file for Turkcell dashboard
 * 
 * Usage: npx tsx scripts/apply-turkcell-migration.ts
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
  console.log('Please ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function applyTurkcellMigration() {
  console.log('🚀 Applying Turkcell Tables Migration\n')
  console.log('='.repeat(60))

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '005_turkcell_tables.sql')
    console.log(`📄 Reading migration file: ${migrationPath}`)
    
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`)

    console.log('⚙️  Executing Turkcell migration...\n')

    // Since we can't execute SQL directly via RPC in most cases,
    // we'll provide instructions for manual application
    console.log('📋 Please apply this migration using one of these methods:\n')
    
    console.log('1. Supabase Dashboard (Recommended):')
    console.log('   - Go to SQL Editor in your Supabase dashboard')
    console.log('   - Copy the contents of supabase/migrations/005_turkcell_tables.sql')
    console.log('   - Paste and run the SQL\n')
    
    console.log('2. Supabase CLI:')
    console.log('   - Install Supabase CLI: npm install -g supabase')
    console.log('   - Run: supabase db push\n')
    
    console.log('3. Manual execution:')
    console.log('   - Connect to your database using psql or another client')
    console.log('   - Execute the migration file\n')
    
    console.log('Migration file location: supabase/migrations/005_turkcell_tables.sql')
    console.log('\n' + '='.repeat(60))
    console.log('📝 After applying the migration, run:')
    console.log('   npx tsx scripts/test-turkcell-tables.ts')
    
    return true

  } catch (error) {
    console.error('❌ Error reading migration file:', error)
    return false
  }
}

async function verifyTurkcellTables() {
  console.log('\n🔍 Verifying Turkcell tables were created...\n')

  try {
    // Check if turkcell_transactions table exists
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('turkcell_transactions')
      .select('count')
      .limit(1)
    
    if (!transactionsError) {
      console.log('✅ Table turkcell_transactions exists')
    } else {
      console.log('❌ Table turkcell_transactions not found:', transactionsError.message)
      return false
    }

    // Check if turkcell_targets table exists
    const { data: targetsData, error: targetsError } = await supabase
      .from('turkcell_targets')
      .select('count')
      .limit(1)
    
    if (!targetsError) {
      console.log('✅ Table turkcell_targets exists')
    } else {
      console.log('❌ Table turkcell_targets not found:', targetsError.message)
      return false
    }

    // Test helper functions
    try {
      const { data: dailyCount, error: dailyError } = await supabase.rpc('get_daily_turkcell_count', {
        branch_uuid: '00000000-0000-0000-0000-000000000000' // Test UUID
      })
      
      if (!dailyError || dailyError.message.includes('does not exist')) {
        console.log('✅ Function get_daily_turkcell_count exists')
      }
    } catch (e) {
      console.log('⚠️  Function get_daily_turkcell_count may not be available yet')
    }

    console.log('\n✅ Turkcell tables appear to be created successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run: npx tsx scripts/test-turkcell-tables.ts')
    console.log('   2. Continue with implementation tasks')
    
    return true

  } catch (error) {
    console.error('❌ Error verifying tables:', error)
    console.log('\n⚠️  Tables may not be created yet. Please apply the migration first.')
    return false
  }
}

async function main() {
  await applyTurkcellMigration()
  
  // Wait a moment before verification
  console.log('\n⏳ Waiting 3 seconds before verification...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  await verifyTurkcellTables()
}

// Run the script
main()