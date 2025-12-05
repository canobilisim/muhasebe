// Supplier interface
export interface Supplier {
  id: string
  branch_id: string | null
  name: string
  company_name: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  district: string | null
  tax_number: string | null
  tax_office: string | null
  trade_registry_no: string | null
  credit_limit: number | null
  current_balance: number | null
  bank_name: string | null
  iban: string | null
  account_number: string | null
  notes: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

// Supplier insert type
export type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>

// Supplier update type
export type SupplierUpdate = Partial<SupplierInsert>

// Supplier filter
export interface SupplierFilter {
  search?: string
  isActive?: boolean
  hasBalance?: boolean
}

// Paginated response
export interface PaginatedSupplierResponse {
  data: Supplier[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
