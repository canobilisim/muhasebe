#!/usr/bin/env tsx
/**
 * Authentication Diagnostic Script
 * Bu script kimlik doğrulama sistemindeki sorunları tespit eder
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load .env file
config()

interface DiagnosticResult {
  timestamp: string
  environment: {
    supabaseUrl: string | undefined
    hasAnonKey: boolean
    hasServiceRoleKey: boolean
    nodeEnv: string | undefined
  }
  connection: {
    anonKeyConnection: { success: boolean; error?: string }
    serviceRoleConnection: { success: boolean; error?: string }
  }
  database: {
    tables: { name: string; exists: boolean; rowCount?: number }[]
    functions: { name: string; exists: boolean }[]
    triggers: { name: string; exists: boolean; table?: string }[]
  }
  users: {
    authUsersCount: number
    usersTableCount: number
    mismatchedUsers: string[]
    userDetails: Array<{
      id: string
      email: string
      hasProfile: boolean
      isActive: boolean | null
      hasBranch: boolean | null
      role: string | null
    }>
  }
  rls: {
    policies: Array<{ table: string; policy: string; roles: string[] }>
    testResults: Array<{ test: string; success: boolean; error?: string }>
  }
  issues: string[]
  recommendations: string[]
}

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const result: DiagnosticResult = {
  timestamp: new Date().toISOString(),
  environment: {
    supabaseUrl: SUPABASE_URL,
    hasAnonKey: !!ANON_KEY,
    hasServiceRoleKey: !!SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  },
  connection: {
    anonKeyConnection: { success: false },
    serviceRoleConnection: { success: false },
  },
  database: {
    tables: [],
    functions: [],
    triggers: [],
  },
  users: {
    authUsersCount: 0,
    usersTableCount: 0,
    mismatchedUsers: [],
    userDetails: [],
  },
  rls: {
    policies: [],
    testResults: [],
  },
  issues: [],
  recommendations: [],
}

console.log('🔍 Kimlik Doğrulama Tanılama Başlatılıyor...\n')

// 1. Environment Variables Kontrolü
console.log('📋 1. Environment Variables Kontrolü')
if (!SUPABASE_URL) {
  result.issues.push('VITE_SUPABASE_URL tanımlı değil')
  console.log('❌ VITE_SUPABASE_URL tanımlı değil')
} else {
  console.log('✅ VITE_SUPABASE_URL:', SUPABASE_URL)
}

if (!ANON_KEY) {
  result.issues.push('VITE_SUPABASE_ANON_KEY tanımlı değil')
  console.log('❌ VITE_SUPABASE_ANON_KEY tanımlı değil')
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY: [MEVCUT]')
}

if (!SERVICE_ROLE_KEY) {
  result.issues.push('VITE_SUPABASE_SERVICE_ROLE_KEY tanımlı değil (diagnostic için gerekli)')
  console.log('⚠️  VITE_SUPABASE_SERVICE_ROLE_KEY tanımlı değil')
} else {
  console.log('✅ VITE_SUPABASE_SERVICE_ROLE_KEY: [MEVCUT]')
}

if (!SUPABASE_URL || !ANON_KEY) {
  console.log('\n❌ Kritik environment variables eksik. Devam edilemiyor.')
  process.exit(1)
}

// Supabase clients oluştur
const anonClient = createClient(SUPABASE_URL, ANON_KEY)
const serviceClient = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : null

// 2. Bağlantı Testleri
console.log('\n🔌 2. Supabase Bağlantı Testleri')

// Anon key ile bağlantı testi
try {
  const { data, error } = await anonClient.from('branches').select('count').limit(1)
  if (error) throw error
  result.connection.anonKeyConnection = { success: true }
  console.log('✅ Anon key ile bağlantı başarılı')
} catch (error: any) {
  result.connection.anonKeyConnection = {
    success: false,
    error: error.message,
  }
  result.issues.push(`Anon key bağlantı hatası: ${error.message}`)
  console.log('❌ Anon key ile bağlantı başarısız:', error.message)
}

// Service role key ile bağlantı testi
if (serviceClient) {
  try {
    const { data, error } = await serviceClient.from('branches').select('count').limit(1)
    if (error) throw error
    result.connection.serviceRoleConnection = { success: true }
    console.log('✅ Service role key ile bağlantı başarılı')
  } catch (error: any) {
    result.connection.serviceRoleConnection = {
      success: false,
      error: error.message,
    }
    result.issues.push(`Service role bağlantı hatası: ${error.message}`)
    console.log('❌ Service role key ile bağlantı başarısız:', error.message)
  }
} else {
  console.log('⚠️  Service role key yok, bazı testler atlanacak')
}

// 3. Database Schema Doğrulama
console.log('\n📊 3. Database Schema Doğrulama')

if (serviceClient) {
  // Tabloları kontrol et
  const expectedTables = [
    'branches',
    'users',
    'products',
    'customers',
    'sales',
    'sale_items',
    'cash_movements',
  ]

  for (const tableName of expectedTables) {
    try {
      const { count, error } = await serviceClient
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      result.database.tables.push({
        name: tableName,
        exists: true,
        rowCount: count || 0,
      })
      console.log(`✅ Tablo "${tableName}": ${count || 0} kayıt`)
    } catch (error: any) {
      result.database.tables.push({ name: tableName, exists: false })
      result.issues.push(`Tablo "${tableName}" bulunamadı veya erişilemedi`)
      console.log(`❌ Tablo "${tableName}": Hata - ${error.message}`)
    }
  }

  // Function'ları kontrol et
  const expectedFunctions = [
    'get_user_branch_id',
    'is_admin',
    'generate_sale_number',
    'get_low_stock_products',
    'get_daily_sales_summary',
  ]

  console.log('\n📦 Function Kontrolü')
  for (const funcName of expectedFunctions) {
    try {
      const { data, error } = await serviceClient.rpc(funcName as any)
      result.database.functions.push({ name: funcName, exists: !error })
      if (error && !error.message.includes('required argument')) {
        console.log(`⚠️  Function "${funcName}": ${error.message}`)
      } else {
        console.log(`✅ Function "${funcName}": Mevcut`)
      }
    } catch (error: any) {
      result.database.functions.push({ name: funcName, exists: false })
      console.log(`❌ Function "${funcName}": Bulunamadı`)
    }
  }

  // Trigger'ları kontrol et
  console.log('\n⚡ Trigger Kontrolü')
  try {
    const { data: triggers, error } = await serviceClient
      .from('pg_trigger')
      .select('tgname, tgrelid')
      .limit(100)

    if (error) {
      console.log('⚠️  Trigger bilgisi alınamadı (pg_trigger erişim hatası)')
    } else if (triggers) {
      // Auth.users -> users sync trigger'ı ara
      const authSyncTrigger = triggers.find((t: any) =>
        t.tgname.includes('sync') || t.tgname.includes('user')
      )
      if (authSyncTrigger) {
        result.database.triggers.push({
          name: authSyncTrigger.tgname,
          exists: true,
        })
        console.log(`✅ Auth sync trigger bulundu: ${authSyncTrigger.tgname}`)
      } else {
        result.issues.push('Auth.users -> users sync trigger bulunamadı')
        console.log('❌ Auth.users -> users sync trigger bulunamadı')
      }
    }
  } catch (error: any) {
    console.log('⚠️  Trigger kontrolü yapılamadı:', error.message)
  }
}

// 4. User Data Verification
console.log('\n👥 4. Kullanıcı Verisi Doğrulama')

if (serviceClient) {
  try {
    // auth.users sayısı
    const { data: authUsers, error: authError } = await serviceClient.auth.admin.listUsers()

    if (authError) throw authError

    result.users.authUsersCount = authUsers.users.length
    console.log(`✅ auth.users tablosunda ${authUsers.users.length} kullanıcı`)

    // users tablosu sayısı
    const { count: usersCount, error: usersError } = await serviceClient
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    result.users.usersTableCount = usersCount || 0
    console.log(`✅ users tablosunda ${usersCount || 0} kullanıcı`)

    // Karşılaştırma
    if (authUsers.users.length !== usersCount) {
      result.issues.push(
        `auth.users (${authUsers.users.length}) ve users (${usersCount}) sayıları eşleşmiyor`
      )
      console.log(
        `⚠️  auth.users (${authUsers.users.length}) ve users (${usersCount}) sayıları eşleşmiyor`
      )
    }

    // Her kullanıcı için detaylı kontrol
    console.log('\n📋 Kullanıcı Detayları:')
    for (const authUser of authUsers.users) {
      const { data: userProfile, error: profileError } = await serviceClient
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      const userDetail = {
        id: authUser.id,
        email: authUser.email || 'N/A',
        hasProfile: !!userProfile,
        isActive: userProfile?.is_active || null,
        hasBranch: !!userProfile?.branch_id || null,
        role: userProfile?.role || null,
      }

      result.users.userDetails.push(userDetail)

      if (!userProfile) {
        result.users.mismatchedUsers.push(authUser.email || authUser.id)
        result.issues.push(`Kullanıcı ${authUser.email} için users kaydı yok`)
        console.log(`❌ ${authUser.email}: users kaydı YOK`)
      } else {
        const issues = []
        if (!userProfile.is_active) issues.push('inactive')
        if (!userProfile.branch_id) issues.push('branch yok')

        if (issues.length > 0) {
          console.log(`⚠️  ${authUser.email}: ${issues.join(', ')}`)
        } else {
          console.log(`✅ ${authUser.email}: ${userProfile.role}, branch: ${userProfile.branch_id?.substring(0, 8)}...`)
        }
      }
    }
  } catch (error: any) {
    result.issues.push(`Kullanıcı doğrulama hatası: ${error.message}`)
    console.log('❌ Kullanıcı doğrulama hatası:', error.message)
  }
}

// 5. RLS Policy Testleri
console.log('\n🔒 5. RLS Policy Testleri')

if (serviceClient) {
  // Service role ile bypass testi
  try {
    const { data, error } = await serviceClient.from('users').select('*').limit(1)

    if (error) throw error

    result.rls.testResults.push({
      test: 'Service role bypass',
      success: true,
    })
    console.log('✅ Service role RLS bypass çalışıyor')
  } catch (error: any) {
    result.rls.testResults.push({
      test: 'Service role bypass',
      success: false,
      error: error.message,
    })
    result.issues.push(`Service role RLS bypass hatası: ${error.message}`)
    console.log('❌ Service role RLS bypass hatası:', error.message)
  }
}

// Anon key ile enforcement testi
try {
  const { data, error } = await anonClient.from('users').select('*').limit(1)

  if (error) {
    // RLS tarafından engellenmiş olmalı
    result.rls.testResults.push({
      test: 'Anon key RLS enforcement',
      success: true,
    })
    console.log('✅ Anon key RLS enforcement çalışıyor (beklenen davranış)')
  } else {
    result.rls.testResults.push({
      test: 'Anon key RLS enforcement',
      success: false,
      error: 'RLS bypass edildi (güvenlik riski)',
    })
    result.issues.push('Anon key ile users tablosuna erişim sağlandı (RLS sorunu)')
    console.log('⚠️  Anon key ile users tablosuna erişim sağlandı (RLS sorunu olabilir)')
  }
} catch (error: any) {
  result.rls.testResults.push({
    test: 'Anon key RLS enforcement',
    success: false,
    error: error.message,
  })
  console.log('❌ Anon key RLS testi hatası:', error.message)
}

// 6. Öneriler Oluştur
console.log('\n💡 6. Öneriler Oluşturuluyor')

if (result.users.mismatchedUsers.length > 0) {
  result.recommendations.push(
    'Auth.users ve users tablosu senkronizasyonu için trigger oluşturun'
  )
  result.recommendations.push('Eksik users kayıtlarını manuel olarak oluşturun')
}

if (result.users.userDetails.some((u) => !u.isActive)) {
  result.recommendations.push('Inactive kullanıcıları aktif hale getirin veya silin')
}

if (result.users.userDetails.some((u) => !u.hasBranch)) {
  result.recommendations.push('Branch ataması olmayan kullanıcılara branch atayın')
}

if (!SERVICE_ROLE_KEY) {
  result.recommendations.push(
    'VITE_SUPABASE_SERVICE_ROLE_KEY ekleyin (sadece development için)'
  )
}

if (result.database.functions.some((f) => !f.exists)) {
  result.recommendations.push('Eksik database function\'ları oluşturun')
}

if (result.issues.length === 0) {
  result.recommendations.push('Sistem sağlıklı görünüyor. Login akışını test edin.')
}

// 7. Rapor Dosyası Oluştur
console.log('\n📄 7. Rapor Dosyası Oluşturuluyor')

const reportContent = `
# Kimlik Doğrulama Tanılama Raporu
Tarih: ${new Date(result.timestamp).toLocaleString('tr-TR')}

## 1. Environment Variables
- Supabase URL: ${result.environment.supabaseUrl || 'YOK'}
- Anon Key: ${result.environment.hasAnonKey ? 'MEVCUT' : 'YOK'}
- Service Role Key: ${result.environment.hasServiceRoleKey ? 'MEVCUT' : 'YOK'}
- Node Environment: ${result.environment.nodeEnv || 'N/A'}

## 2. Bağlantı Durumu
- Anon Key Bağlantısı: ${result.connection.anonKeyConnection.success ? '✅ Başarılı' : '❌ Başarısız'}
${result.connection.anonKeyConnection.error ? `  Hata: ${result.connection.anonKeyConnection.error}` : ''}
- Service Role Bağlantısı: ${result.connection.serviceRoleConnection.success ? '✅ Başarılı' : '❌ Başarısız'}
${result.connection.serviceRoleConnection.error ? `  Hata: ${result.connection.serviceRoleConnection.error}` : ''}

## 3. Database Schema
### Tablolar
${result.database.tables.map((t) => `- ${t.name}: ${t.exists ? `✅ ${t.rowCount} kayıt` : '❌ Bulunamadı'}`).join('\n')}

### Functions
${result.database.functions.map((f) => `- ${f.name}: ${f.exists ? '✅ Mevcut' : '❌ Bulunamadı'}`).join('\n')}

### Triggers
${result.database.triggers.length > 0 ? result.database.triggers.map((t) => `- ${t.name}: ✅ Mevcut`).join('\n') : '⚠️  Trigger bilgisi alınamadı'}

## 4. Kullanıcı Verileri
- auth.users: ${result.users.authUsersCount} kullanıcı
- users tablosu: ${result.users.usersTableCount} kullanıcı
- Eşleşmeyen kullanıcılar: ${result.users.mismatchedUsers.length > 0 ? result.users.mismatchedUsers.join(', ') : 'Yok'}

### Kullanıcı Detayları
${result.users.userDetails.map((u) => `
- ${u.email}
  - Profile: ${u.hasProfile ? '✅' : '❌'}
  - Active: ${u.isActive ? '✅' : '❌'}
  - Branch: ${u.hasBranch ? '✅' : '❌'}
  - Role: ${u.role || 'N/A'}
`).join('\n')}

## 5. RLS Policy Testleri
${result.rls.testResults.map((t) => `- ${t.test}: ${t.success ? '✅ Başarılı' : '❌ Başarısız'}${t.error ? ` (${t.error})` : ''}`).join('\n')}

## 6. Tespit Edilen Sorunlar
${result.issues.length > 0 ? result.issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n') : '✅ Sorun tespit edilmedi'}

## 7. Öneriler
${result.recommendations.map((r, idx) => `${idx + 1}. ${r}`).join('\n')}

---
Rapor JSON formatında: auth-diagnostic-report.json
`

const reportPath = path.join(process.cwd(), 'auth-diagnostic-report.txt')
const jsonPath = path.join(process.cwd(), 'auth-diagnostic-report.json')

fs.writeFileSync(reportPath, reportContent)
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2))

console.log(`\n✅ Rapor oluşturuldu: ${reportPath}`)
console.log(`✅ JSON rapor: ${jsonPath}`)

// Özet
console.log('\n' + '='.repeat(60))
console.log('📊 ÖZET')
console.log('='.repeat(60))
console.log(`Toplam Sorun: ${result.issues.length}`)
console.log(`Toplam Öneri: ${result.recommendations.length}`)

if (result.issues.length > 0) {
  console.log('\n⚠️  ÖNCELİKLİ SORUNLAR:')
  result.issues.slice(0, 5).forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue}`)
  })
}

console.log('\n✅ Tanılama tamamlandı!')
