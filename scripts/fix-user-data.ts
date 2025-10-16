/**
 * Script to fix mismatched or problematic user data
 * This script identifies and fixes:
 * - auth.users records without corresponding users table records
 * - users with is_active = false
 * - users with null branch_id
 * - users with invalid branch references
 * 
 * Usage: npx tsx scripts/fix-user-data.ts
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

interface UserIssue {
  type: 'MISSING_PROFILE' | 'NO_BRANCH' | 'INACTIVE' | 'INVALID_BRANCH'
  userId: string
  email: string
  details: string
}

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
    throw new Error('No branches found. Please create at least one branch first.')
  }

  return branches[0]
}

async function findMissingProfiles(): Promise<UserIssue[]> {
  console.log('\n🔍 Checking for auth.users without users profiles...')
  
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  if (!authUsers?.users) {
    return []
  }

  const issues: UserIssue[] = []

  for (const authUser of authUsers.users) {
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (!profile) {
      issues.push({
        type: 'MISSING_PROFILE',
        userId: authUser.id,
        email: authUser.email || 'unknown',
        details: 'Auth user exists but no users profile found'
      })
    }
  }

  return issues
}

async function findUsersWithoutBranch(): Promise<UserIssue[]> {
  console.log('🔍 Checking for users without branch assignment...')
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, branch_id')
    .is('branch_id', null)

  if (error) {
    console.error(`   ⚠️  Error querying users: ${error.message}`)
    return []
  }

  return (users || []).map(user => ({
    type: 'NO_BRANCH' as const,
    userId: user.id,
    email: user.email,
    details: 'User has NULL branch_id'
  }))
}

async function findInactiveUsers(): Promise<UserIssue[]> {
  console.log('🔍 Checking for inactive users...')
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, is_active')
    .eq('is_active', false)

  if (error) {
    console.error(`   ⚠️  Error querying users: ${error.message}`)
    return []
  }

  return (users || []).map(user => ({
    type: 'INACTIVE' as const,
    userId: user.id,
    email: user.email,
    details: 'User is marked as inactive (is_active = false)'
  }))
}

async function findUsersWithInvalidBranch(): Promise<UserIssue[]> {
  console.log('🔍 Checking for users with invalid branch references...')
  
  // Get all valid branch IDs
  const { data: branches } = await supabase
    .from('branches')
    .select('id')

  const validBranchIds = new Set((branches || []).map(b => b.id))

  // Get all users with branch_id
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, branch_id')
    .not('branch_id', 'is', null)

  if (error) {
    console.error(`   ⚠️  Error querying users: ${error.message}`)
    return []
  }

  return (users || [])
    .filter(user => !validBranchIds.has(user.branch_id))
    .map(user => ({
      type: 'INVALID_BRANCH' as const,
      userId: user.id,
      email: user.email,
      details: `User references non-existent branch: ${user.branch_id}`
    }))
}

async function fixMissingProfile(issue: UserIssue, branchId: string) {
  console.log(`   🔧 Creating missing profile for ${issue.email}...`)
  
  // Get auth user metadata
  const { data: authData } = await supabase.auth.admin.getUserById(issue.userId)
  
  const fullName = authData?.user?.user_metadata?.full_name || issue.email

  const { error } = await supabase
    .from('users')
    .insert({
      id: issue.userId,
      email: issue.email,
      full_name: fullName,
      role: 'cashier', // Default role
      branch_id: branchId,
      is_active: true
    })

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  console.log(`   ✅ Profile created for ${issue.email}`)
}

async function fixNoBranch(issue: UserIssue, branchId: string) {
  console.log(`   🔧 Assigning branch to ${issue.email}...`)
  
  const { error } = await supabase
    .from('users')
    .update({ 
      branch_id: branchId,
      updated_at: new Date().toISOString()
    })
    .eq('id', issue.userId)

  if (error) {
    throw new Error(`Failed to assign branch: ${error.message}`)
  }

  console.log(`   ✅ Branch assigned to ${issue.email}`)
}

async function fixInactive(issue: UserIssue) {
  console.log(`   ℹ️  User ${issue.email} is inactive`)
  console.log(`   ⚠️  Manual review recommended - not automatically activating`)
  // We don't automatically activate users as this might be intentional
}

async function fixInvalidBranch(issue: UserIssue, branchId: string) {
  console.log(`   🔧 Fixing invalid branch reference for ${issue.email}...`)
  
  const { error } = await supabase
    .from('users')
    .update({ 
      branch_id: branchId,
      updated_at: new Date().toISOString()
    })
    .eq('id', issue.userId)

  if (error) {
    throw new Error(`Failed to fix branch reference: ${error.message}`)
  }

  console.log(`   ✅ Branch reference fixed for ${issue.email}`)
}

async function main() {
  console.log('🔧 User Data Fix Script')
  console.log('=' .repeat(60))

  try {
    // Get default branch
    const defaultBranch = await getDefaultBranch()
    console.log(`\n📦 Using default branch: ${defaultBranch.name} (${defaultBranch.id})`)

    // Find all issues
    const missingProfiles = await findMissingProfiles()
    const noBranch = await findUsersWithoutBranch()
    const inactive = await findInactiveUsers()
    const invalidBranch = await findUsersWithInvalidBranch()

    const allIssues = [
      ...missingProfiles,
      ...noBranch,
      ...inactive,
      ...invalidBranch
    ]

    if (allIssues.length === 0) {
      console.log('\n✅ No issues found! All user data is in good shape.')
      return
    }

    // Report issues
    console.log('\n📋 Issues Found:')
    console.log('=' .repeat(60))
    
    const issuesByType = {
      MISSING_PROFILE: missingProfiles.length,
      NO_BRANCH: noBranch.length,
      INACTIVE: inactive.length,
      INVALID_BRANCH: invalidBranch.length
    }

    Object.entries(issuesByType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   ${type}: ${count} user(s)`)
      }
    })

    // Fix issues
    console.log('\n🔧 Fixing Issues:')
    console.log('=' .repeat(60))

    let fixedCount = 0
    let errorCount = 0

    for (const issue of allIssues) {
      try {
        switch (issue.type) {
          case 'MISSING_PROFILE':
            await fixMissingProfile(issue, defaultBranch.id)
            fixedCount++
            break
          case 'NO_BRANCH':
            await fixNoBranch(issue, defaultBranch.id)
            fixedCount++
            break
          case 'INACTIVE':
            await fixInactive(issue)
            // Not counted as fixed since we don't auto-activate
            break
          case 'INVALID_BRANCH':
            await fixInvalidBranch(issue, defaultBranch.id)
            fixedCount++
            break
        }
      } catch (error) {
        console.error(`   ❌ Error fixing ${issue.email}:`, error)
        errorCount++
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log('=' .repeat(60))
    console.log(`✅ Fixed: ${fixedCount} issue(s)`)
    console.log(`ℹ️  Inactive users (manual review needed): ${inactive.length}`)
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`)
    }

    if (inactive.length > 0) {
      console.log('\n⚠️  Note: Inactive users were not automatically activated.')
      console.log('   Please review these users manually and activate if needed.')
    }

    console.log('\n✨ User data fix complete!')

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
