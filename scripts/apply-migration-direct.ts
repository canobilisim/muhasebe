/**
 * Direct migration application script
 * Applies the Turkcell migration by executing SQL statements directly
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function applyMigrationDirect() {
  console.log('🚀 Applying Turkcell Migration Directly\n')

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '005_turkcell_tables.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    console.log('📄 Migration file loaded')
    console.log('⚙️  Executing SQL...\n')

    // Split SQL into statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      if (statement.trim() === ';') continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.log(`❌ Statement ${i + 1} failed:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} error:`, err)
        errorCount++
      }
    }

    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} failed`)
    
    if (errorCount === 0) {
      console.log('🎉 Migration applied successfully!')
      return true
    } else {
      console.log('⚠️  Migration completed with some errors')
      return false
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return false
  }
}

applyMigrationDirect()