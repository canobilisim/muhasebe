import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, CreditCard, FileText } from 'lucide-react';

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  hasCustomer: boolean;
  onConfirm: (payments: { cash: number; pos: number; credit: number }) => void;
}

export const SplitPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  hasCustomer,
  onConfirm,
}: SplitPaymentModalProps) => {
  const [cashAmount, setCashAmount] = useState(0);
  const [posAmount, setPosAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);

  // Nakit değiştiğinde kalan tutarı hesapla
  useEffect(() => {
    const remaining = totalAmount - cashAmount;
    if (hasCustomer) {
      // Müşteri varsa: Kalan = POS + Açık Hesap
      setCreditAmount(Math.max(0, remaining - posAmount));
    } else {
      // Müşteri yoksa: Kalan = POS, Açık Hesap = 0
      setPosAmount(Math.max(0, remaining));
      setCreditAmount(0);
    }
  }, [cashAmount, totalAmount, hasCustomer]);

  // POS değiştiğinde (sadece müşteri varsa)
  useEffect(() => {
    if (hasCustomer) {
      const remaining = totalAmount - cashAmount - posAmount;
      setCreditAmount(Math.max(0, remaining));
    }
  }, [posAmount, cashAmount, totalAmount, hasCustomer]);

  // Modal açıldığında başlangıç değerlerini ayarla
  useEffect(() => {
    if (isOpen) {
      setCashAmount(0);
      if (hasCustomer) {
        setPosAmount(0);
        setCreditAmount(totalAmount);
      } else {
        setPosAmount(totalAmount);
        setCreditAmount(0);
      }
    }
  }, [isOpen, totalAmount, hasCustomer]);

  const handleConfirm = () => {
    const total = cashAmount + posAmount + creditAmount;
    if (Math.abs(total - totalAmount) > 0.01) {
      return;
    }
    onConfirm({ cash: cashAmount, pos: posAmount, credit: creditAmount });
    handleClose();
  };

  const handleClose = () => {
    setCashAmount(0);
    setPosAmount(0);
    setCreditAmount(0);
    onClose();
  };

  const totalPaid = cashAmount + posAmount + creditAmount;
  const isValid = Math.abs(totalPaid - totalAmount) < 0.01;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Parçalı Ödeme</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Toplam Tutar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Toplam Tutar</div>
            <div className="text-2xl font-bold text-blue-900">
              {totalAmount.toFixed(2)} ₺
            </div>
          </div>

          {/* Nakit */}
          <div className="space-y-2">
            <Label htmlFor="cash" className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-green-600" />
              Nakit
            </Label>
            <Input
              id="cash"
              type="number"
              min="0"
              step="0.01"
              value={cashAmount || ''}
              onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="text-lg"
            />
          </div>

          {/* POS */}
          <div className="space-y-2">
            <Label htmlFor="pos" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              POS {!hasCustomer && '(Otomatik)'}
            </Label>
            <Input
              id="pos"
              type="number"
              min="0"
              step="0.01"
              value={posAmount.toFixed(2)}
              onChange={(e) => setPosAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="text-lg"
              readOnly={!hasCustomer}
              disabled={!hasCustomer}
            />
          </div>

          {/* Açık Hesap */}
          {hasCustomer && (
            <div className="space-y-2">
              <Label htmlFor="credit" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-600" />
                Açık Hesap
              </Label>
              <Input
                id="credit"
                type="number"
                value={creditAmount.toFixed(2)}
                readOnly
                disabled
                className="text-lg bg-gray-50"
              />
            </div>
          )}

          {/* Özet */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Toplam Ödeme:</span>
              <span className={`font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {totalPaid.toFixed(2)} ₺
              </span>
            </div>
            {!isValid && (
              <div className="text-xs text-red-600">
                Toplam ödeme tutarı ile satış tutarı eşleşmiyor!
              </div>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Onayla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SplitPaymentModal;
