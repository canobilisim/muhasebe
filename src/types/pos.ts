// POS Fast Sale Page Types

export interface Product {
  id: string
  barcode: string
  name: string
  unitPrice: number
  qty: number
  discount: number
  currency: string
  vatRate: number
  category: string
  lineTotal?: number
  isMiscellaneous?: boolean
  note?: string
}

export interface Cart {
  tabId: string
  customerLabel: string
  lines: Product[]
  gross: number
  discountTotal: number
  net: number
}

export interface POSState {
  activePriceList: string
  activeCustomerTab: string
  discountValue: number
  discountType: string
  currency: string
  paid: number
  total: number
  net: number
  change: number
  limit: number
  remaining: number
  carts: Cart[]
  catalog: Product[]
  categories: string[]
  selectedCategory: string
  now: string
}
