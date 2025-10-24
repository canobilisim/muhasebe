export interface Check {
  id: string
  checkNo: string
  bank: string
  customer: string
  amount: number
  dueDate: string
  status: 'pending' | 'collected' | 'bounced' | 'cancelled'
  operations: string[]
  createdAt: string
  updatedAt: string
}

export interface PromissoryNote {
  id: string
  noteNo: string
  debtor: string
  customer: string
  amount: number
  dueDate: string
  status: 'pending' | 'collected' | 'defaulted' | 'cancelled'
  operations: string[]
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FinancialMovement {
  id: string
  transactionDate: string
  customerSupplier: string
  transactionType: 'income' | 'expense'
  paymentMethod: 'cash' | 'bank-transfer' | 'credit-card' | 'check' | 'promissory-note' | 'on-account'
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  dueDate?: string
  status: 'pending' | 'completed' | 'cancelled'
  description?: string
  referenceDocNo?: string
  categoryId?: string
  operations: string[]
  createdAt: string
  updatedAt: string
}

export type PaymentMethod = 'cash' | 'bank-transfer' | 'credit-card' | 'check' | 'promissory-note' | 'on-account'
export type TransactionType = 'income' | 'expense'
export type Currency = 'TRY' | 'USD' | 'EUR'