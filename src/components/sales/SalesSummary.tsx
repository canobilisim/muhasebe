import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SaleItem } from './SalesItemsTable';

interface SalesSummaryProps {
  items: SaleItem[];
}

export function SalesSummary({ items }: SalesSummaryProps) {
  // Memoize calculations for performance
  const { subtotal, totalVat, grandTotal } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const totalVat = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemVat = itemSubtotal * (item.vatRate / 100);
      return sum + itemVat;
    }, 0);

    const grandTotal = subtotal + totalVat;

    return { subtotal, totalVat, grandTotal };
  }, [items]);

  return (
    <div className="space-y-2" role="region" aria-label="Satış özeti ve toplam tutarlar">
      {/* Ara Toplam */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-gray-600" id="subtotal-label">Ara Toplam</span>
        <span className="font-medium" aria-labelledby="subtotal-label">
          {subtotal.toFixed(2)} ₺
        </span>
      </div>

      {/* Toplam KDV */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-gray-600" id="vat-label">Toplam KDV</span>
        <span className="font-medium" aria-labelledby="vat-label">
          {totalVat.toFixed(2)} ₺
        </span>
      </div>

      <hr className="my-2" />

      {/* Genel Toplam */}
      <div className="flex items-center justify-between py-2 bg-blue-50 px-3 rounded-lg" role="status" aria-live="polite">
        <span className="font-semibold text-gray-900" id="total-label">
          Genel Toplam
        </span>
        <span className="font-bold text-xl text-blue-600" aria-labelledby="total-label">
          {grandTotal.toFixed(2)} ₺
        </span>
      </div>

      {/* Item Count */}
      <div className="text-center text-xs text-gray-500 pt-1" aria-live="polite">
        {items.length} ürün
      </div>
    </div>
  );
}
