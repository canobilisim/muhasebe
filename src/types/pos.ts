export interface Product {
  id: string;
  barcode: string;
  name: string;
  unitPrice: number;
  qty: number;
  discount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  vatRate: number;
  category: string;
}

export interface CartLine extends Omit<Product, 'id' | 'barcode'> {
  id: string;
  barcode: string;
  lineTotal: number;
}

export interface Cart {
  tabId: string;
  customerLabel: string;
  lines: CartLine[];
  gross: number;
  discountTotal: number;
  net: number;
}

export interface Payment {
  type: 'cash' | 'pos' | 'openAccount' | 'split';
  amount: number;
  currency: string;
  posInfo?: {
    bank: string;
    installment: number;
  };
}

export interface POSState {
  activePriceList: string;
  activeCustomerTab: string;
  discountValue: number;
  discountType: '%' | '₺';
  currency: 'TRY' | 'USD' | 'EUR';
  paid: number;
  total: number;
  net: number;  // Added net property
  change: number;
  limit: number;
  remaining: number;
  carts: Cart[];
  catalog: Product[];
  categories: string[];
  quickAmounts: number[];
  quickAdjustments: number[];
  selectedCategory: string;
  now: string;
}
