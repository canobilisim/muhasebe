/**
 * VAT (KDV) calculation utilities
 * Handles VAT included/excluded price calculations
 */

export interface VatCalculationResult {
  vatExcluded: number
  vatIncluded: number
  vatAmount: number
}

/**
 * Calculate VAT excluded and included prices
 * @param price - The base price
 * @param vatRate - VAT rate as percentage (0-100)
 * @param isVatIncluded - Whether the price already includes VAT
 * @returns Object with vatExcluded, vatIncluded, and vatAmount
 */
export function calculateVatPrices(
  price: number,
  vatRate: number,
  isVatIncluded: boolean
): VatCalculationResult {
  if (price < 0) {
    throw new Error('Fiyat negatif olamaz')
  }

  if (vatRate < 0 || vatRate > 100) {
    throw new Error('KDV oranı 0-100 arası olmalıdır')
  }

  if (isVatIncluded) {
    // Price is VAT included, calculate excluded
    const vatExcluded = price / (1 + vatRate / 100)
    const vatAmount = price - vatExcluded
    return {
      vatExcluded: Number(vatExcluded.toFixed(2)),
      vatIncluded: price,
      vatAmount: Number(vatAmount.toFixed(2))
    }
  } else {
    // Price is VAT excluded, calculate included
    const vatAmount = price * (vatRate / 100)
    const vatIncluded = price + vatAmount
    return {
      vatExcluded: price,
      vatIncluded: Number(vatIncluded.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2))
    }
  }
}

/**
 * Calculate VAT amount from a price
 * @param price - The base price
 * @param vatRate - VAT rate as percentage (0-100)
 * @param isVatIncluded - Whether the price already includes VAT
 * @returns VAT amount
 */
export function calculateVatAmount(
  price: number,
  vatRate: number,
  isVatIncluded: boolean
): number {
  const result = calculateVatPrices(price, vatRate, isVatIncluded)
  return result.vatAmount
}

/**
 * Calculate VAT excluded price from VAT included price
 * @param vatIncludedPrice - Price with VAT included
 * @param vatRate - VAT rate as percentage (0-100)
 * @returns VAT excluded price
 */
export function calculateVatExcluded(
  vatIncludedPrice: number,
  vatRate: number
): number {
  const result = calculateVatPrices(vatIncludedPrice, vatRate, true)
  return result.vatExcluded
}

/**
 * Calculate VAT included price from VAT excluded price
 * @param vatExcludedPrice - Price without VAT
 * @param vatRate - VAT rate as percentage (0-100)
 * @returns VAT included price
 */
export function calculateVatIncluded(
  vatExcludedPrice: number,
  vatRate: number
): number {
  const result = calculateVatPrices(vatExcludedPrice, vatRate, false)
  return result.vatIncluded
}

/**
 * Calculate total from multiple items with VAT
 * @param items - Array of items with price, quantity, and vatRate
 * @param isVatIncluded - Whether prices include VAT
 * @returns Object with subtotal, totalVat, and grandTotal
 */
export function calculateTotalWithVat(
  items: Array<{ price: number; quantity: number; vatRate: number }>,
  isVatIncluded: boolean = false
): { subtotal: number; totalVat: number; grandTotal: number } {
  let subtotal = 0
  let totalVat = 0

  items.forEach(item => {
    const itemTotal = item.price * item.quantity
    const vatCalc = calculateVatPrices(itemTotal, item.vatRate, isVatIncluded)
    
    subtotal += vatCalc.vatExcluded
    totalVat += vatCalc.vatAmount
  })

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalVat: Number(totalVat.toFixed(2)),
    grandTotal: Number((subtotal + totalVat).toFixed(2))
  }
}
