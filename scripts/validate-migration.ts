/**
 * Script to validate database migrations and test user setup
 * This script validates all aspects of task 8
 * 
 * Usage: npx tsx scripts/validate-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Create clients
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

interface ValidationResult {
  test: string
  passed: boolean
  message: string
  details?: any
}

const results: ValidationResult[] = []

function logTest(test: string, passed: boolean, message: string, details?: any) {
  results.push({ test, passed, message, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${test}: ${message}`)
  if (details && !passed) {
    console.log('   Details:', JSON.stringify(details, null, 2))
  }
}

async function validateTriggerExists() {
  console.log('\n📋 Validating trigger existence...')
  
  try {
    const { data, error } = await supabaseService.rpc('pg_get_triggerdef', {
      trigger_oid: 'on_auth_user_created'
    }).single()

    if (error) {
      // Try alternative method
      const { data: triggers, error: triggerError } = await supabaseService
        .from('pg_trigger')
        .select('*')
        .eq('tgname', 'on_auth_user_created')

      if (triggerError || !triggers || triggers.length === 0) {
        logTest('Trigger Exists', false, 'Trigger on_auth_user_created not found')
        return false
      }
    }

    logTest('Trigger Exists', true, 'Trigger on_auth_user_created is installed')
    return true
  } catch (error) {
    logTest('Trigger Exists', false, 'Could not verify trigger', error)
    return false
  }
}

async function validateFunctionsExist() {
  console.log('\n📋 Validating functions existence...')
  
  const functions = [
    'handle_new_auth_user',
    'fix_missing_user_profiles',
    'diagnose_user_issues'
  ]

  let allExist = true

  for (const funcName of functions) {
    try {
      // Try to call the function to see if it exists
      const { error } = await supabaseService.rpc(funcName as any)
      
      // If function doesn't exist, we'll get a specific error
      if (error && error.message.includes('does not exist')) {
        logTest(`Function: ${funcName}`, false, 'Function not found')
        allExist = false
      } else {
        logTest(`Function: ${funcName}`, true, 'Function exists')
      }
    } catch (error) {
      logTest(`Function: ${funcName}`, false, 'Could not verify function', error)
      allExist = false
    }
  }

  return allExist
}

async function validateTestUsersExist() {
  console.log('\n👥 Validating test users...')
  
  const testEmails = ['admin@demo.com', 'manager@demo.com', 'cashier@demo.com']
  const expectedRoles = { 'admin@demo.com': 'admin', 'manager@demo.com': 'manager', 'cashier@demo.com': 'cashier' }
  
  let allValid = true

  for (const email of testEmails) {
    try {
      // Check auth.users
      const { data: authUsers } = await supabaseService.auth.admin.listUsers()
      const authUser = authUsers?.users.find(u => u.email === email)

      if (!authUser) {
        logTest(`Auth User: ${email}`, false, 'Not found in auth.users')
        allValid = false
        continue
      }

      // Check users table
      const { data: userProfile, error } = await supabaseService
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error || !userProfile) {
        logTest(`User Profile: ${email}`, false, 'Not found in users table')
        allValid = false
        continue
      }

      // Validate role
      const expectedRole = expectedRoles[email as keyof typeof expectedRoles]
      if (userProfile.role !== expectedRole) {
        logTest(`User Role: ${email}`, false, `Expected ${expectedRole}, got ${userProfile.role}`)
        allValid = false
        continue
      }

      // Validate is_active
      if (!userProfile.is_active) {
        logTest(`User Active: ${email}`, false, 'User is not active')
        allValid = false
        continue
      }

      // Validate branch_id
      if (!userProfile.branch_id) {
        logTest(`User Branch: ${email}`, false, 'User has no branch assignment')
        allValid = false
        continue
      }

      logTest(`User Complete: ${email}`, true, `Valid ${expectedRole} user with branch`)
    } catch (error) {
      logTest(`User: ${email}`, false, 'Error validating user', error)
      allValid = false
    }
  }

  return allValid
}

async function validateLoginCredentials() {
  console.log('\n🔐 Validating login credentials...')
  
  const testUsers = [
    { email: 'admin@demo.com', password: '123456', role: 'admin' },
    { email: 'manager@demo.com', password: '123456', role: 'manager' },
    { email: 'cashier@demo.com', password: '123456', role: 'cashier' }
  ]

  let allValid = true

  for (const user of testUsers) {
    try {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (error) {
        logTest(`Login: ${user.email}`, false, `Login failed: ${error.message}`)
        allValid = false
        continue
      }

      if (!data.user) {
        logTest(`Login: ${user.email}`, false, 'No user data returned')
        allValid = false
        continue
      }

      // Sign out
      await supabaseAnon.auth.signOut()

      logTest(`Login: ${user.email}`, true, `Successfully logged in as ${user.role}`)
    } catch (error) {
      logTest(`Login: ${user.email}`, false, 'Error during login', error)
      allValid = false
    }
  }

  return allValid
}

async function validateRLSPolicies() {
  console.log('\n🔒 Validating RLS policies...')
  
  try {
    // Test 1: Anon key should NOT be able to query users without auth
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('*')
      .limit(1)

    if (!anonError && anonData && anonData.length > 0) {
      logTest('RLS: Anon Access', false, 'Anon key can access users table without auth (RLS not enforced)')
      return false
    }

    logTest('RLS: Anon Access', true, 'Anon key correctly blocked from users table')

    // Test 2: Service role should bypass RLS
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('users')
      .select('*')
      .limit(1)

    if (serviceError) {
      logTest('RLS: Service Role', false, 'Service role cannot access users table', serviceError)
      return false
    }

    logTest('RLS: Service Role', true, 'Service role correctly bypasses RLS')

    // Test 3: Authenticated user should see their own data
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@demo.com',
      password: '123456'
    })

    if (authError || !authData.user) {
      logTest('RLS: Auth Access', false, 'Could not authenticate for RLS test')
      return false
    }

    const { data: userData, error: userError } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    await supabaseAnon.auth.signOut()

    if (userError || !userData) {
      logTest('RLS: Auth Access', false, 'Authenticated user cannot access their profile', userError)
      return false
    }

    logTest('RLS: Auth Access', true, 'Authenticated user can access their profile')
    return true

  } catch (error) {
    logTest('RLS: General', false, 'Error testing RLS policies', error)
    return false
  }
}

async function validateBranchAssignments() {
  console.log('\n🏢 Validating branch assignments...')
  
  try {
    const { data: users, error } = await supabaseService
      .from('users')
      .select(`
        id,
        email,
        branch_id,
        branches:branch_id (
          id,
          name
        )
      `)

    if (error) {
      logTest('Branch Assignments', false, 'Could not query users', error)
      return false
    }

    if (!users || users.length === 0) {
      logTest('Branch Assignments', false, 'No users found')
      return false
    }

    let allValid = true
    for (const user of users) {
      if (!user.branch_id) {
        logTest(`Branch: ${user.email}`, false, 'User has no branch_id')
        allValid = false
        continue
      }

      if (!user.branches) {
        logTest(`Branch: ${user.email}`, false, 'Branch reference is invalid')
        allValid = false
        continue
      }

      logTest(`Branch: ${user.email}`, true, `Assigned to branch: ${(user.branches as any).name}`)
    }

    return allValid
  } catch (error) {
    logTest('Branch Assignments', false, 'Error validating branches', error)
    return false
  }
}

async function validateTriggerFunctionality() {
  console.log('\n⚙️  Validating trigger functionality...')
  
  try {
    // Create a test auth user to see if trigger creates profile
    const testEmail = `test-${Date.now()}@trigger-test.com`
    
    const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email: testEmail,
      password: '123456',
      email_confirm: true
    })

    if (authError || !authData.user) {
      logTest('Trigger Test', false, 'Could not create test auth user', authError)
      return false
    }

    // Wait a moment for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if users profile was created
    const { data: userProfile, error: profileError } = await supabaseService
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // Clean up test user
    await supabaseService.auth.admin.deleteUser(authData.user.id)

    if (profileError || !userProfile) {
      logTest('Trigger Test', false, 'Trigger did not create user profile', profileError)
      return false
    }

    if (!userProfile.branch_id) {
      logTest('Trigger Test', false, 'Trigger created profile but no branch_id')
      return false
    }

    if (userProfile.role !== 'cashier') {
      logTest('Trigger Test', false, `Trigger created profile with wrong role: ${userProfile.role}`)
      return false
    }

    logTest('Trigger Test', true, 'Trigger successfully creates user profiles with defaults')
    return true

  } catch (error) {
    logTest('Trigger Test', false, 'Error testing trigger', error)
    return false
  }
}

async function main() {
  console.log('🔍 Validating Database Migrations - Task 8\n')
  console.log('='.repeat(60))

  try {
    // Run all validations
    await validateFunctionsExist()
    await validateTriggerExists()
    await validateTriggerFunctionality()
    await validateTestUsersExist()
    await validateLoginCredentials()
    await validateRLSPolicies()
    await validateBranchAssignments()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Validation Summary')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length

    console.log(`\n✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${failed}/${total}`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.test}: ${r.message}`)
      })
      console.log('\n⚠️  Some validations failed. Please review the errors above.')
      process.exit(1)
    } else {
      console.log('\n✨ All validations passed! Migration is successful.')
      console.log('\n📝 Test Credentials:')
      console.log('   Email: admin@demo.com / manager@demo.com / cashier@demo.com')
      console.log('   Password: 123456')
    }

  } catch (error) {
    console.error('\n❌ Fatal error during validation:', error)
    process.exit(1)
  }
}

// Run the script
main()
