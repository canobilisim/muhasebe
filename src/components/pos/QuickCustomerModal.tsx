import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { CustomerService } from '@/services/customerService';
import { showToast } from '@/lib/toast';
import { FormattedInput } from '@/components/ui/formatted-input';
import type { CustomerInsert } from '@/types';

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: { id: string; name: string; phone: string | null; current_balance: number; credit_limit: number }) => void;
  initialName?: string;
}

export const QuickCustomerModal = ({ isOpen, onClose, onCustomerCreated, initialName }: QuickCustomerModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName || '',
    phone: '0',
    email: '',
    address: '',
    credit_limit: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // initialName değiştiğinde formu güncelle
  useEffect(() => {
    if (initialName) {
      setFormData(prev => ({
        ...prev,
        name: initialName
      }));
    }
  }, [initialName]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Müşteri adı zorunludur';
    }

    if (formData.phone && formData.phone !== '0' && formData.phone.length !== 11) {
      newErrors.phone = 'Telefon numarası 11 haneli olmalıdır (0 ile başlayarak)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (formData.credit_limit < 0) {
      newErrors.credit_limit = 'Kredi limiti negatif olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const customerData: CustomerInsert = {
        name: formData.name.trim(),
        phone: formData.phone && formData.phone !== '0' ? formData.phone.trim() : null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        credit_limit: formData.credit_limit,
        current_balance: 0,
        is_active: true,
      };

      const newCustomer = await CustomerService.createCustomer(customerData);

      showToast.success(`${newCustomer.name} başarıyla eklendi`);

      // Call the callback with the new customer
      onCustomerCreated({
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        current_balance: newCustomer.current_balance || 0,
        credit_limit: newCustomer.credit_limit || 0,
      });

      // Reset form and close
      setFormData({
        name: '',
        phone: '0',
        email: '',
        address: '',
        credit_limit: 0,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast.error('Müşteri eklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        phone: '0',
        email: '',
        address: '',
        credit_limit: 0,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hızlı Müşteri Ekle</DialogTitle>
          <DialogDescription>
            Yeni müşteri bilgilerini girin. Kaydedildikten sonra otomatik olarak seçilecektir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Müşteri Adı *</Label>
            <FormattedInput
              id="name"
              formatterType="name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Örn: Ahmet Yılmaz"
              className={errors.name ? 'border-red-500' : ''}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <FormattedInput
              id="phone"
              formatterType="phone"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <FormattedInput
              id="email"
              formatterType="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              placeholder="Örn: ornek@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Müşteri adresi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Kredi Limiti (₺)</Label>
            <Input
              id="credit_limit"
              type="number"
              min="0"
              step="0.01"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
              className={errors.credit_limit ? 'border-red-500' : ''}
            />
            {errors.credit_limit && (
              <p className="text-sm text-red-600">{errors.credit_limit}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kaydet ve Seç
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
