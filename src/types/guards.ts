// Type guards and validation utilities
import type { Database } from './database'
import type { 
  UserRole, 
  PaymentType, 
  PaymentStatus, 
  MovementType
} from './database'

// Extract types directly to avoid circular dependency
type Product = Database['public']['Tables']['products']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type Sale = Database['public']['Tables']['sales']['Row']
type User = Database['public']['Tables']['users']['Row']

// Type guards for enums
export const isUserRole = (value: any): value is UserRole => {
  return typeof value === 'string' && ['admin', 'manager', 'cashier'].includes(value)
}

export const isPaymentType = (value: any): value is PaymentType => {
  return typeof value === 'string' && ['cash', 'pos', 'credit', 'partial'].includes(value)
}

export const isPaymentStatus = (value: any): value is PaymentStatus => {
  return typeof value === 'string' && ['paid', 'pending', 'overdue'].includes(value)
}

export const isMovementType = (value: any): value is MovementType => {
  return typeof value === 'string' && ['income', 'expense', 'sale', 'opening', 'closing'].includes(value)
}

// Type guards for objects
export const isProduct = (value: any): value is Product => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.barcode === 'string' &&
    typeof value.name === 'string' &&
    typeof value.sale_price === 'number' &&
    typeof value.stock_quantity === 'number'
  )
}

export const isCustomer = (value: any): value is Customer => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  )
}

export const isSale = (value: any): value is Sale => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.sale_number === 'string' &&
    typeof value.net_amount === 'number' &&
    isPaymentType(value.payment_type) &&
    isPaymentStatus(value.payment_status)
  )
}

export const isUser = (value: any): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.full_name === 'string' &&
    isUserRole(value.role)
  )
}

// Validation functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const isValidBarcode = (barcode: string): boolean => {
  return barcode.length >= 8 && barcode.length <= 50 && /^[0-9]+$/.test(barcode)
}

export const isValidTaxNumber = (taxNumber: string): boolean => {
  return taxNumber.length === 10 && /^[0-9]+$/.test(taxNumber)
}

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price)
}

export const isValidQuantity = (quantity: number): boolean => {
  return quantity > 0 && Number.isInteger(quantity)
}

// Business logic validators
export const canUserAccessBranch = (user: User, branchId: string): boolean => {
  return user.role === 'admin' || user.branch_id === branchId
}

export const canUserManageUsers = (user: User): boolean => {
  return user.role === 'admin' || user.role === 'manager'
}

export const canUserDeleteRecords = (user: User): boolean => {
  return user.role === 'admin' || user.role === 'manager'
}

export const isProductLowStock = (product: Product): boolean => {
  return product.stock_quantity <= product.critical_stock_level
}

export const isCustomerOverdue = (customer: Customer): boolean => {
  return customer.current_balance > 0
}

export const canCustomerMakeCredit = (customer: Customer, amount: number): boolean => {
  return customer.current_balance + amount <= customer.credit_limit
}

// Array type guards
export const isProductArray = (value: any): value is Product[] => {
  return Array.isArray(value) && value.every(isProduct)
}

export const isCustomerArray = (value: any): value is Customer[] => {
  return Array.isArray(value) && value.every(isCustomer)
}

export const isSaleArray = (value: any): value is Sale[] => {
  return Array.isArray(value) && value.every(isSale)
}

// Utility type predicates
export const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => {
  return key in obj
}

export const isNonNull = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}

export const isNonEmpty = (value: string | null | undefined): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}