// Core application types and interfaces
import type { Database, UserRole, PaymentType, PaymentStatus, MovementType } from './database'

// Re-export database types
export type { Database, UserRole, PaymentType, PaymentStatus, MovementType, Json } from './database'

// Re-export enum constants
export {
  UserRole as UserRoleEnum,
  PaymentType as PaymentTypeEnum,
  PaymentStatus as PaymentStatusEnum,
  MovementType as MovementTypeEnum,
  UserRoleLabels,
  PaymentTypeLabels,
  PaymentStatusLabels,
  MovementTypeLabels,
  PaymentStatusColors,
  MovementTypeColors,
  getUserRoleLabel,
  getPaymentTypeLabel,
  getPaymentStatusLabel,
  getMovementTypeLabel,
  isValidUserRole,
  isValidPaymentType,
  isValidPaymentStatus,
  isValidMovementType
} from './enums'

// Re-export supabase types
export type {
  SupabaseClient,
  AuthUser,
  AuthSession,
  DatabaseError,
  QueryResult,
  QueryBuilder,
  RPCResponse,
  RealtimeChannel,
  RealtimePayload,
  StorageError,
  FileObject,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate
} from './supabase'

// Re-export Turkcell types
export type {
  TurkcellTransaction,
  TurkcellTransactionInsert,
  TurkcellTransactionUpdate,
  TurkcellTarget,
  TurkcellTargetInsert,
  TurkcellTargetUpdate,
  DailyTurkcellCountResponse,
  MonthlyTurkcellTargetResponse,
  MonthlyTurkcellProgressResponse,
  SetTurkcellTargetResponse,
  TurkcellState,
  TurkcellDailyCardProps,
  TurkcellMonthlyCardProps,
  TargetSettingsFormProps,
  TurkcellService,
  TurkcellTargetForm,
  TurkcellTargetFormErrors,
  TurkcellTransactionWithDetails,
  TurkcellTargetWithDetails,
  TurkcellSummary,
  TurkcellTransactionFilter,
  TurkcellTargetFilter,
  TurkcellTransactionTypeValue
} from './turkcell'

// Re-export Turkcell constants and utilities
export {
  TurkcellTransactionType,
  TurkcellTransactionTypeLabels,
  getTurkcellTransactionTypeLabel,
  isValidTurkcellTransactionType
} from './turkcell'

// Re-export POS types
export type {
  Product as POSProduct,
  Cart as POSCart,
  POSState
} from './pos'

// Table types
export type Branch = Database['public']['Tables']['branches']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type CashMovement = Database['public']['Tables']['cash_movements']['Row']
export type FastSaleCategory = Database['public']['Tables']['fast_sale_categories']['Row']
export type CustomerPayment = Database['public']['Tables']['customer_payments']['Row']

export type BranchInsert = Database['public']['Tables']['branches']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductCategory = Database['public']['Tables']['product_categories']['Row']
export type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']
export type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert']
export type CashMovementInsert = Database['public']['Tables']['cash_movements']['Insert']
export type FastSaleCategoryInsert = Database['public']['Tables']['fast_sale_categories']['Insert']
export type CustomerPaymentInsert = Database['public']['Tables']['customer_payments']['Insert']

export type BranchUpdate = Database['public']['Tables']['branches']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type SaleUpdate = Database['public']['Tables']['sales']['Update']
export type SaleItemUpdate = Database['public']['Tables']['sale_items']['Update']
export type CashMovementUpdate = Database['public']['Tables']['cash_movements']['Update']
export type FastSaleCategoryUpdate = Database['public']['Tables']['fast_sale_categories']['Update']
export type CustomerPaymentUpdate = Database['public']['Tables']['customer_payments']['Update']

// Extended types
export type CustomerPaymentWithDetails = CustomerPayment & {
  customer?: Customer
  user?: User
}

// Birleşik müşteri işlem tipi (satış veya ödeme)
export type CustomerTransaction = {
  id: string
  type: 'sale' | 'payment'
  date: string
  amount: number
  paymentType: string
  description: string
  balance?: number
  sale?: SaleWithDetails
  payment?: CustomerPaymentWithDetails
}
export type ProductWithStock = Product & {
  isLowStock: boolean
  stockStatus: 'critical' | 'low' | 'normal'
}

export type ProductWithFastSale = Product & {
  fast_sale_category?: FastSaleCategory
}

export type FastSaleProduct = {
  id: string
  barcode: string
  name: string
  sale_price: number
  category_name: string
  category_id: string
  display_order: number
}

export type CustomerWithBalance = Customer & {
  overdueAmount: number
  isOverdue: boolean
}

export type SaleWithDetails = Sale & {
  items: SaleItemWithProduct[]
  customer?: Customer
  user?: User
}

export type SaleItemWithProduct = SaleItem & {
  product?: Product
}

export type CashMovementWithDetails = CashMovement & {
  sale?: Sale
  user?: User
}

// POS types - USING INTERFACE FOR BETTER COMPATIBILITY
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

// Dashboard types
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
  showInFastSale?: boolean
  fastSaleCategoryId?: string
  fastSaleOrder?: number
}

export interface FastSaleCategoryForm {
  name: string
  displayOrder: number
  isActive: boolean
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

// API types
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

// Filter types
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

// UI types
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
