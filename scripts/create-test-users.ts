/**
 * Script to create test users in Supabase
 * This script creates both auth.users and users table records
 * 
 * Usage: npx tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - VITE_SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file')
  process.exit(1)
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestUser {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'manager' | 'cashier'
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@demo.com',
    password: '123456',
    full_name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'manager@demo.com',
    password: '123456',
    full_name: 'Manager User',
    role: 'manager'
  },
  {
    email: 'cashier@demo.com',
    password: '123456',
    full_name: 'Cashier User',
    role: 'cashier'
  }
]

async function getDefaultBranch() {
  const { data: branches, error } = await supabase
    .from('branches')
    .select('id, name')
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    throw new Error(`Failed to fetch branches: ${error.message}`)
  }

  if (!branches || branches.length === 0) {
    // Create default branch
    console.log('📦 No branches found, creating default branch...')
    const { data: newBranch, error: createError } = await supabase
      .from('branches')
      .insert({
        name: 'Ana Şube',
        address: 'Test Adresi',
        phone: '0555 555 5555'
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create default branch: ${createError.message}`)
    }

    console.log(`✅ Created default branch: ${newBranch.name}`)
    return newBranch.id
  }

  console.log(`📦 Using existing branch: ${branches[0].name}`)
  return branches[0].id
}

async function createTestUser(user: TestUser, branchId: string) {
  console.log(`\n👤 Creating user: ${user.email}`)

  try {
    // Check if user already exists in auth.users
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers?.users.find(u => u.email === user.email)

    let authUserId: string

    if (existingAuthUser) {
      console.log(`   ℹ️  Auth user already exists (ID: ${existingAuthUser.id})`)
      authUserId = existingAuthUser.id

      // Update password if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { password: user.password }
      )

      if (updateError) {
        console.log(`   ⚠️  Could not update password: ${updateError.message}`)
      } else {
        console.log(`   ✅ Password updated`)
      }
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for test users
        user_metadata: {
          full_name: user.full_name
        }
      })

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Auth user created but no user data returned')
      }

      authUserId = authData.user.id
      console.log(`   ✅ Auth user created (ID: ${authUserId})`)
    }

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          branch_id: branchId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUserId)

      if (updateError) {
        throw new Error(`Failed to update user profile: ${updateError.message}`)
      }

      console.log(`   ✅ User profile updated (Role: ${user.role})`)
    } else {
      // Create new profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          branch_id: branchId,
          is_active: true
        })

      if (profileError) {
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      console.log(`   ✅ User profile created (Role: ${user.role})`)
    }

    console.log(`   ✅ User ${user.email} is ready to use`)
    return { success: true, email: user.email, role: user.role }

  } catch (error) {
    console.error(`   ❌ Error creating user ${user.email}:`, error)
    return { success: false, email: user.email, error: String(error) }
  }
}

async function main() {
  console.log('🚀 Creating test users for Cano Ön Muhasebe\n')
  console.log('=' .repeat(60))

  try {
    // Get or create default branch
    const branchId = await getDefaultBranch()

    // Create all test users
    const results = []
    for (const user of TEST_USERS) {
      const result = await createTestUser(user, branchId)
      results.push(result)
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log('=' .repeat(60))

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`✅ Successfully created/updated: ${successful.length} users`)
    successful.forEach(r => {
      console.log(`   - ${r.email} (${r.role})`)
    })

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length} users`)
      failed.forEach(r => {
        console.log(`   - ${r.email}: ${r.error}`)
      })
    }

    console.log('\n📝 Test Credentials:')
    console.log('   Email: admin@demo.com / manager@demo.com / cashier@demo.com')
    console.log('   Password: 123456')
    console.log('\n✨ Test users are ready to use!')

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
