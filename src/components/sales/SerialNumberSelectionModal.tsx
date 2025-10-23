import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Product, SerialNumber } from '@/types/product';
import { Badge } from '@/components/ui/badge';

interface SerialNumberSelectionModalProps {
  isOpen: boolean;
  product: Product;
  availableSerialNumbers: SerialNumber[];
  onSelect: (serialNumber: SerialNumber) => void;
  onCancel: () => void;
}

export function SerialNumberSelectionModal({
  isOpen,
  product,
  availableSerialNumbers,
  onSelect,
  onCancel,
}: SerialNumberSelectionModalProps) {
  const [selectedSerialNumberId, setSelectedSerialNumberId] = useState<string | null>(null);

  const handleConfirm = () => {
    const selectedSerialNumber = availableSerialNumbers.find(
      (sn) => sn.id === selectedSerialNumberId
    );
    
    if (selectedSerialNumber) {
      onSelect(selectedSerialNumber);
      setSelectedSerialNumberId(null);
    }
  };

  const handleCancel = () => {
    setSelectedSerialNumberId(null);
    onCancel();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Mevcut</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-500">Rezerve</Badge>;
      case 'sold':
        return <Badge className="bg-gray-500">Satıldı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seri Numarası Seçimi</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{product.name}</span> için satılacak seri numarasını seçiniz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {availableSerialNumbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Bu ürün için mevcut seri numarası bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Mevcut Seri Numaraları ({availableSerialNumbers.length} adet)</Label>
              {availableSerialNumbers.map((serialNumber) => (
                <label
                  key={serialNumber.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSerialNumberId === serialNumber.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="radio"
                      name="serialNumber"
                      value={serialNumber.id}
                      checked={selectedSerialNumberId === serialNumber.id}
                      onChange={(e) => setSelectedSerialNumberId(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {serialNumber.serial_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        Eklenme: {formatDate(serialNumber.added_date)}
                      </p>
                    </div>
                  </div>
                  <div>{getStatusBadge(serialNumber.status)}</div>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedSerialNumberId || availableSerialNumbers.length === 0}
          >
            Seç ve Sepete Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
