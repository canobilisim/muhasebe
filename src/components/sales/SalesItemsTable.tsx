import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  serialNumberId?: string;
  serialNumber?: string;
}

interface SalesItemsTableProps {
  items: SaleItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function SalesItemsTable({
  items,
  onQuantityChange,
  onRemoveItem,
}: SalesItemsTableProps) {
  // Calculate item total: quantity × unitPrice × (1 + vatRate/100)
  const calculateItemTotal = (item: SaleItem): number => {
    return item.quantity * item.unitPrice * (1 + item.vatRate / 100);
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity > 0) {
      onQuantityChange(itemId, quantity);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Satış Kalemleri</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Sepette ürün bulunmuyor. Ürün eklemek için barkod okutun veya ürün adı yazın.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Barkod</TableHead>
                <TableHead className="w-32">Miktar</TableHead>
                <TableHead className="text-right">Birim Fiyat</TableHead>
                <TableHead className="text-right">KDV (%)</TableHead>
                <TableHead className="text-right">Toplam</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.serialNumber && (
                        <p className="text-xs text-gray-500">
                          S/N: {item.serialNumber}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.barcode}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-24"
                      disabled={!!item.serialNumberId} // Disable for serial numbered items
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice.toFixed(2)} ₺
                  </TableCell>
                  <TableCell className="text-right">%{item.vatRate}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {calculateItemTotal(item).toFixed(2)} ₺
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
