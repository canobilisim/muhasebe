import { useState, useEffect } from 'react';
import { Search, User, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  vkn_tckn?: string;
  tax_office?: string;
  address?: string;
  customer_type: 'INDIVIDUAL' | 'CORPORATE';
  is_active: boolean;
}

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  onCreateNew: () => void;
}

export function CustomerSelectionModal({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
}: CustomerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockCustomers: Customer[] = [
          {
            id: '1',
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com',
            phone: '0532 123 45 67',
            vkn_tckn: '12345678901',
            customer_type: 'INDIVIDUAL',
            is_active: true,
          },
          {
            id: '2',
            name: 'ABC Teknoloji Ltd. Şti.',
            email: 'info@abcteknoloji.com',
            phone: '0212 123 45 67',
            vkn_tckn: '1234567890',
            tax_office: 'Beşiktaş',
            customer_type: 'CORPORATE',
            is_active: true,
          },
          {
            id: '3',
            name: 'Fatma Demir',
            email: 'fatma@example.com',
            phone: '0533 987 65 43',
            vkn_tckn: '98765432109',
            customer_type: 'INDIVIDUAL',
            is_active: true,
          },
        ];
        setCustomers(mockCustomers);
        setFilteredCustomers(mockCustomers);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.vkn_tckn?.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onClose();
    setSearchTerm('');
  };

  const handleClose = () => {
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Müşteri Seç
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Müşteri adı, email, telefon veya VKN/TCKN ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create New Customer Button */}
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            Yeni Müşteri Ekle
          </Button>

          {/* Customer List */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Müşteriler yükleniyor...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Müşteri bulunamadı</p>
                <p className="text-sm">Arama kriterlerinizi değiştirin veya yeni müşteri ekleyin</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelect(customer)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <Badge variant={customer.customer_type === 'CORPORATE' ? 'default' : 'secondary'}>
                            {customer.customer_type === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          {customer.email && (
                            <p className="flex items-center gap-1">
                              <span>📧</span> {customer.email}
                            </p>
                          )}
                          {customer.phone && (
                            <p className="flex items-center gap-1">
                              <span>📞</span> {customer.phone}
                            </p>
                          )}
                          {customer.vkn_tckn && (
                            <p className="flex items-center gap-1">
                              <span>🆔</span> {customer.vkn_tckn}
                              {customer.tax_office && ` - ${customer.tax_office}`}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        Seç
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}