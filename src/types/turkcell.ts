// Turkcell Dashboard Type Definitions
// Types for Turkcell transaction tracking and target management

// ============================================================================
// Database Table Types
// ============================================================================

// Turkcell Transaction types (based on turkcell_transactions table)
export interface TurkcellTransaction {
  id: string
  branch_id: string | null
  user_id: string | null
  transaction_date: string // DATE format: YYYY-MM-DD
  transaction_type: string
  count: number
  description: string | null
  reference_number: string | null
  created_at: string
  updated_at: string
}

export interface TurkcellTransactionInsert {
  id?: string
  branch_id?: string | null
  user_id?: string | null
  transaction_date?: string
  transaction_type?: string
  count?: number
  description?: string | null
  reference_number?: string | null
  created_at?: string
  updated_at?: string
}

export interface TurkcellTransactionUpdate {
  id?: string
  branch_id?: string | null
  user_id?: string | null
  transaction_date?: string
  transaction_type?: string
  count?: number
  description?: string | null
  reference_number?: string | null
  created_at?: string
  updated_at?: string
}

// Turkcell Target types (based on turkcell_targets table)
export interface TurkcellTarget {
  id: string
  branch_id: string | null
  user_id: string | null
  target_month: string // DATE format: YYYY-MM-01
  target_count: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface TurkcellTargetInsert {
  id?: string
  branch_id?: string | null
  user_id?: string | null
  target_month: string
  target_count: number
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface TurkcellTargetUpdate {
  id?: string
  branch_id?: string | null
  user_id?: string | null
  target_month?: string
  target_count?: number
  description?: string | null
  created_at?: string
  updated_at?: string
}

// ============================================================================
// Database Response Types
// ============================================================================

// Response type for get_daily_turkcell_count function
export interface DailyTurkcellCountResponse {
  count: number
}

// Response type for get_monthly_turkcell_target function
export interface MonthlyTurkcellTargetResponse {
  target: number
}

// Response type for get_monthly_turkcell_progress function
export interface MonthlyTurkcellProgressResponse {
  total_count: number
  target_count: number
  progress_percentage: number
}

// Response type for set_monthly_turkcell_target function
export interface SetTurkcellTargetResponse {
  success: boolean
}

// ============================================================================
// Store Interface Types
// ============================================================================

// Main Turkcell store state interface
export interface TurkcellState {
  // Data state
  totalToday: number
  monthlyTarget: number
  monthlyProgress: number
  monthlyTotal: number
  
  // UI state
  loading: boolean
  error: string | null
  
  // Actions
  fetchDailyTransactions: (date?: string) => Promise<void>
  fetchMonthlyTarget: (month?: string) => Promise<void>
  fetchMonthlyProgress: (month?: string) => Promise<void>
  updateMonthlyTarget: (target: number, month?: string) => Promise<void>
  refreshData: () => Promise<void>
  clearError: () => void
}

// ============================================================================
// Component Props Types
// ============================================================================

// Props for TurkcellDailyCard component
export interface TurkcellDailyCardProps {
  totalToday: number
  loading?: boolean
  error?: string | null
}

// Props for TurkcellMonthlyCard component
export interface TurkcellMonthlyCardProps {
  monthlyProgress: number
  monthlyTarget: number
  monthlyTotal: number
  loading?: boolean
  error?: string | null
}

// Props for TargetSettingsForm component
export interface TargetSettingsFormProps {
  currentTarget: number
  onTargetUpdate: (newTarget: number) => Promise<void>
  loading?: boolean
  error?: string | null
}

// ============================================================================
// API Service Types
// ============================================================================

// Service interface for Turkcell operations
export interface TurkcellService {
  // Daily transactions
  getDailyTransactions(date?: string): Promise<{ total: number }>
  
  // Monthly targets
  getMonthlyTarget(month?: string): Promise<{ target: number }>
  setMonthlyTarget(target: number, month?: string): Promise<void>
  
  // Progress calculation
  getMonthlyProgress(month?: string): Promise<{
    progress: number
    total: number
    target: number
  }>
}

// ============================================================================
// Form Types
// ============================================================================

// Form data for target settings
export interface TurkcellTargetForm {
  target: number
  month?: string
}

// Form validation schema type
export interface TurkcellTargetFormErrors {
  target?: string
  month?: string
}

// ============================================================================
// Utility Types
// ============================================================================

// Extended transaction type with user and branch details
export interface TurkcellTransactionWithDetails extends TurkcellTransaction {
  user?: {
    id: string
    full_name: string
    email: string
  }
  branch?: {
    id: string
    name: string
  }
}

// Extended target type with user and branch details
export interface TurkcellTargetWithDetails extends TurkcellTarget {
  user?: {
    id: string
    full_name: string
    email: string
  }
  branch?: {
    id: string
    name: string
  }
}

// Summary type for dashboard display
export interface TurkcellSummary {
  dailyCount: number
  monthlyTotal: number
  monthlyTarget: number
  progressPercentage: number
  isTargetSet: boolean
}

// Filter types for queries
export interface TurkcellTransactionFilter {
  startDate?: string
  endDate?: string
  transactionType?: string
  userId?: string
  branchId?: string
}

export interface TurkcellTargetFilter {
  startMonth?: string
  endMonth?: string
  userId?: string
  branchId?: string
}

// ============================================================================
// Constants and Enums
// ============================================================================

// Transaction types enum
export const TurkcellTransactionType = {
  GENERAL: 'general',
  ACTIVATION: 'activation',
  RECHARGE: 'recharge',
  PACKAGE: 'package',
  OTHER: 'other'
} as const

export type TurkcellTransactionTypeValue = typeof TurkcellTransactionType[keyof typeof TurkcellTransactionType]

// Transaction type labels for UI
export const TurkcellTransactionTypeLabels: Record<TurkcellTransactionTypeValue, string> = {
  [TurkcellTransactionType.GENERAL]: 'Genel İşlem',
  [TurkcellTransactionType.ACTIVATION]: 'Hat Aktivasyonu',
  [TurkcellTransactionType.RECHARGE]: 'Kontör Yükleme',
  [TurkcellTransactionType.PACKAGE]: 'Paket İşlemi',
  [TurkcellTransactionType.OTHER]: 'Diğer'
}

// Helper function to get transaction type label
export const getTurkcellTransactionTypeLabel = (type: string): string => {
  return TurkcellTransactionTypeLabels[type as TurkcellTransactionTypeValue] || 'Bilinmeyen'
}

// Helper function to validate transaction type
export const isValidTurkcellTransactionType = (type: string): type is TurkcellTransactionTypeValue => {
  return Object.values(TurkcellTransactionType).includes(type as TurkcellTransactionTypeValue)
}