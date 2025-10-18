/**
 * Script to apply the auth fixes migration to Supabase
 * This script reads and executes the SQL migration file
 * 
 * Usage: npx tsx scripts/apply-migration.ts
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
  auth: { autoRefreshToken: false, persistSession: false }
})

async function applyMigration() {
  console.log('🚀 Applying Auth Fixes Migration\n')
  console.log('='.repeat(60))

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '004_auth_fixes.sql')
    console.log(`📄 Reading migration file: ${migrationPath}`)
    
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`)

    // Split the SQL into individual statements
    // We need to execute them separately because some statements depend on others
    console.log('⚙️  Executing migration...\n')

    // Execute the entire migration as one transaction
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      // Note: This requires the SQL to be executed via Supabase dashboard or CLI
      console.log('⚠️  Cannot execute SQL directly via RPC.')
      console.log('📋 Please apply this migration using one of these methods:\n')
      console.log('1. Supabase Dashboard:')
      console.log('   - Go to SQL Editor in your Supabase dashboard')
      console.log('   - Copy the contents of supabase/migrations/004_auth_fixes.sql')
      console.log('   - Paste and run the SQL\n')
      console.log('2. Supabase CLI:')
      console.log('   - Install Supabase CLI: npm install -g supabase')
      console.log('   - Run: supabase db push\n')
      console.log('3. Manual execution:')
      console.log('   - Connect to your database using psql or another client')
      console.log('   - Execute the migration file\n')
      
      console.log('Migration file location: supabase/migrations/004_auth_fixes.sql')
      console.log('\n' + '='.repeat(60))
      console.log('📝 After applying the migration, run:')
      console.log('   npx tsx scripts/validate-migration.ts')
      
      return false
    }

    console.log('✅ Migration applied successfully!\n')
    return true

  } catch (error) {
    console.error('❌ Error applying migration:', error)
    
    console.log('\n📋 Manual Application Required:')
    console.log('Please apply the migration manually using Supabase Dashboard:')
    console.log('1. Go to: https://supabase.com/dashboard/project/[your-project]/sql')
    console.log('2. Copy contents from: supabase/migrations/004_auth_fixes.sql')
    console.log('3. Paste and execute the SQL')
    console.log('4. Run validation: npx tsx scripts/validate-migration.ts')
    
    return false
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration was applied...\n')

  try {
    // Check if the trigger function exists
    const { data: funcData, error: funcError } = await supabase.rpc('handle_new_auth_user')
    
    if (funcError && !funcError.message.includes('does not exist')) {
      console.log('✅ Function handle_new_auth_user exists')
    } else if (funcError && funcError.message.includes('does not exist')) {
      console.log('❌ Function handle_new_auth_user not found')
      return false
    }

    // Check if diagnostic function exists
    const { data: diagData, error: diagError } = await supabase.rpc('diagnose_user_issues')
    
    if (!diagError || diagError.message.includes('returned')) {
      console.log('✅ Function diagnose_user_issues exists')
    } else {
      console.log('❌ Function diagnose_user_issues not found')
      return false
    }

    console.log('\n✅ Migration appears to be applied successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run: npx tsx scripts/create-test-users.ts')
    console.log('   2. Run: npx tsx scripts/validate-migration.ts')
    
    return true

  } catch (error) {
    console.error('❌ Error verifying migration:', error)
    return false
  }
}

async function main() {
  const applied = await applyMigration()
  
  if (applied) {
    await verifyMigration()
  }
}

// Run the script
main()
