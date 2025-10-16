// Core application types and interfaces
// Business logic types based on database schema

import { Database } from './database'

// Re-export all types
export * from './database'
export * from './enums'
export * from './supabase'
export * from './guards'

// Extract table types for easier use
export type Branch = Database['public']['Tables']['branches']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type CashMovement = Database['public']['Tables']['cash_movements']['Row']

// Insert types for forms
export type BranchInsert = Database['public']['Tables']['branches']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert']
export type CashMovementInsert = Database['public']['Tables']['cash_movements']['Insert']

// Update types for forms
export type BranchUpdate = Database['public']['Tables']['branches']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type SaleUpdate = Database['public']['Tables']['sales']['Update']
export type SaleItemUpdate = Database['public']['Tables']['sale_items']['Update']
export type CashMovementUpdate = Database['public']['Tables']['cash_movements']['Update']

// Re-export enums
export type { UserRole, PaymentType, PaymentStatus, MovementType } from './database'

// Extended types with relationships
export interface ProductWithStock extends Product {
  isLowStock: boolean
  stockStatus: 'critical' | 'low' | 'normal'
}

export interface CustomerWithBalance extends Customer {
  overdueAmount: number
  isOverdue: boolean
}

export interface SaleWithDetails extends Sale {
  items: SaleItemWithProduct[]
  customer?: Customer
  user?: User
}

export interface SaleItemWithProduct extends SaleItem {
  product?: Product
}

export interface CashMovementWithDetails extends CashMovement {
  sale?: Sale
  user?: User
}

// POS specific types
export interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  discountAmount: number
  totalAmount: number
}

export interface Cart {
  items: CartItem[]
  totalAmount: number
  discountAmount: number
  taxAmount: number
  netAmount: number
}

export interface PaymentInfo {
  type: PaymentType
  paidAmount: number
  changeAmount: number
  customerId?: string
}

// Dashboard and reporting types
export interface DailySummary {
  totalSales: number
  totalAmount: number
  cashSales: number
  posSales: number
  creditSales: number
}

export interface SalesReport {
  period: string
  totalSales: number
  totalAmount: number
  averageTicket: number
  topProducts: ProductSalesReport[]
}

export interface ProductSalesReport {
  product: Product
  quantitySold: number
  totalAmount: number
  profit: number
}

export interface CustomerReport {
  customer: Customer
  totalPurchases: number
  totalAmount: number
  lastPurchaseDate: string
  outstandingBalance: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface ProductForm {
  barcode: string
  name: string
  category: string
  purchasePrice: number
  salePrice: number
  stockQuantity: number
  criticalStockLevel: number
}

export interface CustomerForm {
  name: string
  phone: string
  email: string
  address: string
  taxNumber: string
  creditLimit: number
}

export interface CashMovementForm {
  movementType: MovementType
  amount: number
  description: string
  referenceNumber: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Search and filter types
export interface ProductFilter {
  category?: string
  isActive?: boolean
  isLowStock?: boolean
  search?: string
}

export interface CustomerFilter {
  isActive?: boolean
  hasBalance?: boolean
  search?: string
}

export interface SalesFilter {
  startDate?: string
  endDate?: string
  paymentType?: PaymentType
  paymentStatus?: PaymentStatus
  customerId?: string
  userId?: string
}

export interface CashMovementFilter {
  startDate?: string
  endDate?: string
  movementType?: MovementType
  userId?: string
}

// UI state types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface TableState<T> extends LoadingState {
  data: T[]
  selectedItems: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  totalCount: number
}

// Settings types
export interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  taxNumber: string
  logo?: string
  receiptTemplate?: string
}

export interface SystemSettings {
  currency: string
  taxRate: number
  receiptPrinter: string
  autoBackup: boolean
  lowStockAlert: boolean
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}