// Enum definitions for the application
// These should match the database enum types

export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier'
} as const

export const PaymentType = {
  CASH: 'cash',
  POS: 'pos',
  CREDIT: 'credit',
  PARTIAL: 'partial'
} as const



export const MovementType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  SALE: 'sale',
  OPENING: 'opening',
  CLOSING: 'closing'
} as const

// Display labels for enums (Turkish)
export const UserRoleLabels = {
  [UserRole.ADMIN]: 'Yönetici',
  [UserRole.MANAGER]: 'Müdür',
  [UserRole.CASHIER]: 'Kasiyer'
} as const

export const PaymentTypeLabels = {
  [PaymentType.CASH]: 'Nakit',
  [PaymentType.POS]: 'POS',
  [PaymentType.CREDIT]: 'Açık Hesap',
  [PaymentType.PARTIAL]: 'Parçalı Ödeme'
} as const



export const MovementTypeLabels = {
  [MovementType.INCOME]: 'Gelir',
  [MovementType.EXPENSE]: 'Gider',
  [MovementType.SALE]: 'Satış',
  [MovementType.OPENING]: 'Açılış',
  [MovementType.CLOSING]: 'Kapanış'
} as const

// Color mappings for UI


export const MovementTypeColors = {
  [MovementType.INCOME]: 'success',
  [MovementType.EXPENSE]: 'destructive',
  [MovementType.SALE]: 'primary',
  [MovementType.OPENING]: 'secondary',
  [MovementType.CLOSING]: 'secondary'
} as const

// Helper functions
export const getUserRoleLabel = (role: keyof typeof UserRole | string): string => {
  return UserRoleLabels[role as keyof typeof UserRoleLabels] || role
}

export const getPaymentTypeLabel = (type: keyof typeof PaymentType | string): string => {
  return PaymentTypeLabels[type as keyof typeof PaymentTypeLabels] || type
}



export const getMovementTypeLabel = (type: keyof typeof MovementType | string): string => {
  return MovementTypeLabels[type as keyof typeof MovementTypeLabels] || type
}

// Validation helpers
export const isValidUserRole = (role: string): role is keyof typeof UserRole => {
  return Object.values(UserRole).includes(role as any)
}

export const isValidPaymentType = (type: string): type is keyof typeof PaymentType => {
  return Object.values(PaymentType).includes(type as any)
}



export const isValidMovementType = (type: string): type is keyof typeof MovementType => {
  return Object.values(MovementType).includes(type as any)
}