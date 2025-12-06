import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';
import { SerialNumberService } from '@/services/serialNumberService';
import { showToast } from '@/lib/toast';
import type { SerialNumber } from '@/types/product';

interface SerialNumberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (serialNumber: SerialNumber) => void;
  productId: string;
  productName: string;
}

export const SerialNumberSelectionModal: React.FC<SerialNumberSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  productId,
  productName,
}) => {
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [filteredSerialNumbers, setFilteredSerialNumbers] = useState<SerialNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<SerialNumber | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load available serial numbers when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      loadSerialNumbers();
      // Focus on search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when modal closes
      setSearchQuery('');
      setSelectedSerialNumber(null);
    }
  }, [isOpen, productId]);

  // Filter serial numbers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSerialNumbers(serialNumbers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = serialNumbers.filter(sn =>
      sn.serial_number.toLowerCase().includes(query)
    );
    setFilteredSerialNumbers(filtered);

    // Auto-select if exact match found
    if (filtered.length === 1 && filtered[0].serial_number.toLowerCase() === query) {
      setSelectedSerialNumber(filtered[0]);
    }
  }, [searchQuery, serialNumbers]);

  const loadSerialNumbers = async () => {
    setIsLoading(true);
    try {
      const result = await SerialNumberService.getAvailableSerialNumbers(productId);
      if (result.success && result.data) {
        setSerialNumbers(result.data);
        setFilteredSerialNumbers(result.data);
        
        if (result.data.length === 0) {
          showToast.error('Bu ürün için müsait seri numarası yok!');
        }
      } else {
        showToast.error(result.error || 'Seri numaraları yüklenemedi');
        setSerialNumbers([]);
        setFilteredSerialNumbers([]);
      }
    } catch (error) {
      console.error('Error loading serial numbers:', error);
      showToast.error('Seri numaraları yüklenirken hata oluştu');
      setSerialNumbers([]);
      setFilteredSerialNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (serialNumber: SerialNumber) => {
    setSelectedSerialNumber(serialNumber);
  };

  const handleConfirm = () => {
    if (!selectedSerialNumber) {
      showToast.error('Lütfen bir seri numarası seçin');
      return;
    }
    onSelect(selectedSerialNumber);
    onClose();
  };

  const handleCancel = () => {
    setSelectedSerialNumber(null);
    setSearchQuery('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedSerialNumber) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seri Numarası Seçimi</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">{productName}</span> için müsait seri numarası seçin
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Seri numarası ara veya barkod okut..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>

          {/* Serial Numbers List */}
          <div className="border rounded-lg flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredSerialNumbers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p className="text-sm">
                  {searchQuery ? 'Seri numarası bulunamadı' : 'Müsait seri numarası yok'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Seri Numarası</TableHead>
                    <TableHead>Eklenme Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSerialNumbers.map((sn) => (
                    <TableRow
                      key={sn.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedSerialNumber?.id === sn.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelect(sn)}
                    >
                      <TableCell className="text-center">
                        {selectedSerialNumber?.id === sn.id && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{sn.serial_number}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {sn.added_date ? new Date(sn.added_date).toLocaleDateString('tr-TR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Info Text */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <p>
              💡 <strong>İpucu:</strong> Barkod okuyucu ile seri numarasını okutabilir veya listeden seçebilirsiniz.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button variant="outline" onClick={handleCancel}>
              İptal
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedSerialNumber || isLoading}
            >
              Seç ve Sepete Ekle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
