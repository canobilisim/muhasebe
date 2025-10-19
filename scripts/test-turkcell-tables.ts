/**
 * Script to test Turkcell tables functionality
 * This script verifies that the tables and functions work correctly
 * 
 * Usage: npx tsx scripts/test-turkcell-tables.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

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

async function testTurkcellTables() {
  console.log('🧪 Testing Turkcell Tables Functionality\n')
  console.log('='.repeat(60))

  let testsPassed = 0
  let totalTests = 0

  // Test 1: Check table structure
  console.log('📋 Test 1: Verifying table structure...')
  totalTests++
  
  try {
    // Test turkcell_transactions table
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('turkcell_transactions')
      .select('*')
      .limit(1)
    
    if (transactionsError && !transactionsError.message.includes('0 rows')) {
      console.log('❌ turkcell_transactions table error:', transactionsError.message)
    } else {
      console.log('✅ turkcell_transactions table accessible')
    }

    // Test turkcell_targets table
    const { data: targetsData, error: targetsError } = await supabase
      .from('turkcell_targets')
      .select('*')
      .limit(1)
    
    if (targetsError && !targetsError.message.includes('0 rows')) {
      console.log('❌ turkcell_targets table error:', targetsError.message)
    } else {
      console.log('✅ turkcell_targets table accessible')
      testsPassed++
    }
  } catch (error) {
    console.log('❌ Table structure test failed:', error)
  }

  // Test 2: Get sample branch and user for testing
  console.log('\n📋 Test 2: Finding test branch and user...')
  totalTests++
  
  let testBranchId: string | null = null
  let testUserId: string | null = null
  
  try {
    // Get first available branch
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id, name')
      .limit(1)
    
    if (branchError || !branches || branches.length === 0) {
      console.log('❌ No branches found. Please create a branch first.')
    } else {
      testBranchId = branches[0].id
      console.log(`✅ Found test branch: ${branches[0].name} (${testBranchId})`)
    }

    // Get first available user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, branch_id')
      .eq('is_active', true)
      .limit(1)
    
    if (userError || !users || users.length === 0) {
      console.log('❌ No active users found. Please create a user first.')
    } else {
      testUserId = users[0].id
      console.log(`✅ Found test user: ${users[0].full_name} (${testUserId})`)
      testsPassed++
    }
  } catch (error) {
    console.log('❌ Branch/User lookup failed:', error)
  }

  if (!testBranchId || !testUserId) {
    console.log('\n⚠️  Cannot continue with data tests without branch and user.')
    console.log('Please ensure you have at least one branch and one active user in your database.')
    return
  }

  // Test 3: Test helper functions
  console.log('\n📋 Test 3: Testing helper functions...')
  totalTests++
  
  try {
    // Test get_daily_turkcell_count function
    const { data: dailyCount, error: dailyError } = await supabase.rpc('get_daily_turkcell_count', {
      branch_uuid: testBranchId
    })
    
    if (dailyError) {
      console.log('❌ get_daily_turkcell_count function error:', dailyError.message)
    } else {
      console.log(`✅ get_daily_turkcell_count returned: ${dailyCount}`)
    }

    // Test get_monthly_turkcell_target function
    const { data: monthlyTarget, error: targetError } = await supabase.rpc('get_monthly_turkcell_target', {
      branch_uuid: testBranchId
    })
    
    if (targetError) {
      console.log('❌ get_monthly_turkcell_target function error:', targetError.message)
    } else {
      console.log(`✅ get_monthly_turkcell_target returned: ${monthlyTarget}`)
    }

    // Test get_monthly_turkcell_progress function
    const { data: progress, error: progressError } = await supabase.rpc('get_monthly_turkcell_progress', {
      branch_uuid: testBranchId
    })
    
    if (progressError) {
      console.log('❌ get_monthly_turkcell_progress function error:', progressError.message)
    } else {
      console.log(`✅ get_monthly_turkcell_progress returned:`, progress)
      testsPassed++
    }
  } catch (error) {
    console.log('❌ Helper functions test failed:', error)
  }

  // Test 4: Test data insertion and target setting
  console.log('\n📋 Test 4: Testing data operations...')
  totalTests++
  
  try {
    // Test setting monthly target
    const { data: setTargetResult, error: setTargetError } = await supabase.rpc('set_monthly_turkcell_target', {
      branch_uuid: testBranchId,
      target_count_param: 50,
      user_uuid: testUserId
    })
    
    if (setTargetError) {
      console.log('❌ set_monthly_turkcell_target function error:', setTargetError.message)
    } else {
      console.log('✅ Monthly target set successfully')
    }

    // Test inserting a transaction
    const { data: insertResult, error: insertError } = await supabase
      .from('turkcell_transactions')
      .insert({
        branch_id: testBranchId,
        user_id: testUserId,
        transaction_type: 'test',
        count: 5,
        description: 'Test transaction from script'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Transaction insertion error:', insertError.message)
    } else {
      console.log('✅ Test transaction inserted successfully')
      testsPassed++
    }
  } catch (error) {
    console.log('❌ Data operations test failed:', error)
  }

  // Test 5: Test sample data creation function
  console.log('\n📋 Test 5: Testing sample data creation...')
  totalTests++
  
  try {
    const { data: sampleResult, error: sampleError } = await supabase.rpc('create_sample_turkcell_data')
    
    if (sampleError) {
      console.log('❌ create_sample_turkcell_data function error:', sampleError.message)
    } else {
      console.log('✅ Sample data creation function works:')
      if (Array.isArray(sampleResult)) {
        sampleResult.forEach(result => {
          console.log(`   ${result.action}: ${result.details} (${result.status})`)
        })
      }
      testsPassed++
    }
  } catch (error) {
    console.log('❌ Sample data creation test failed:', error)
  }

  // Final results
  console.log('\n' + '='.repeat(60))
  console.log(`📊 Test Results: ${testsPassed}/${totalTests} tests passed`)
  
  if (testsPassed === totalTests) {
    console.log('🎉 All tests passed! Turkcell tables are working correctly.')
    console.log('\n📝 Next steps:')
    console.log('   1. Continue with task 2: Turkcell veri modelleri ve tipleri')
    console.log('   2. Implement the TypeScript types and interfaces')
  } else {
    console.log('⚠️  Some tests failed. Please check the migration and database setup.')
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Ensure the migration was applied correctly')
    console.log('   2. Check that you have at least one branch and user')
    console.log('   3. Verify your Supabase connection and permissions')
  }
}

// Run the tests
testTurkcellTables()