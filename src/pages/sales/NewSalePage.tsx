import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { 
  showErrorToast, 
  showSuccessToast
} from '@/utils/errorHandling';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductSearchInput } from '@/components/sales/ProductSearchInput';
import { type SaleItem } from '@/components/sales/SalesItemsTable';
import { CustomerSelectionModal } from '@/components/sales/CustomerSelectionModal';

import type { CustomerInfoFormData } from '@/utils/validationSchemas';
import { SerialNumberSelectionModal } from '@/components/sales/SerialNumberSelectionModal';
import { ProductNotFoundModal } from '@/components/sales/ProductNotFoundModal';
import { createSale } from '@/services/salesService';
import { SerialNumberService } from '@/services/serialNumberService';
import type { Product, SerialNumber } from '@/types/product';
import type { CreateSaleInput, SaleItemInput } from '@/types/sales';
import { useAuthStore } from '@/stores/authStore';

export default function NewSalePage() {
  const navigate = useNavigate();
  const { user, branchId } = useAuthStore();
  
  // Sale items state
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  
  // Serial number selection modal state
  const [serialNumberModalOpen, setSerialNumberModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableSerialNumbers, setAvailableSerialNumbers] = useState<SerialNumber[]>([]);
  
  // Product not found modal state
  const [productNotFoundModalOpen, setProductNotFoundModalOpen] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState('');
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer form data (captured via onChange callback)
  const [customerData, setCustomerData] = useState<CustomerInfoFormData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  // Invoice details state
  const [invoiceType, setInvoiceType] = useState('Satış Faturası');
  const [currency, setCurrency] = useState('₺ Türk Lirası');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  
  // Delivery references state
  const [deliveryReferences, setDeliveryReferences] = useState<string[]>([]);

  // Handle product selection from search
  const handleProductSelect = async (product: Product) => {
    // Check if product has serial number tracking
    if (product.serial_number_tracking_enabled) {
      // Load available serial numbers
      const result = await SerialNumberService.getAvailableSerialNumbers(product.id);
      
      if (result.success && result.data && result.data.length > 0) {
        setSelectedProduct(product);
        setAvailableSerialNumbers(result.data);
        setSerialNumberModalOpen(true);
      } else {
        showErrorToast('Bu ürün için mevcut seri numarası bulunmuyor');
      }
    } else {
      // Add product directly to cart
      addProductToCart(product);
    }
  };

  // Handle product not found
  const handleProductNotFound = (barcode: string) => {
    setNotFoundBarcode(barcode);
    setProductNotFoundModalOpen(true);
  };

  // Handle product created from not found modal
  const handleProductCreated = (product: Product) => {
    addProductToCart(product);
  };

  // Handle serial number selection
  const handleSerialNumberSelect = async (serialNumber: SerialNumber) => {
    if (!selectedProduct) return;

    // Reserve the serial number
    const reserveResult = await SerialNumberService.reserveSerialNumber(serialNumber.id);
    
    if (!reserveResult.success) {
      showErrorToast('Seri numarası rezerve edilemedi');
      return;
    }

    // Add to cart with serial number
    const newItem: SaleItem = {
      id: `${Date.now()}-${Math.random()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      barcode: selectedProduct.barcode,
      quantity: 1, // Serial numbered items always have quantity 1
      unitPrice: selectedProduct.sale_price || 0,
      vatRate: selectedProduct.vat_rate || 0,
      serialNumberId: serialNumber.id,
      serialNumber: serialNumber.serial_number,
    };

    setSaleItems((prev) => [...prev, newItem]);
    showSuccessToast('Ürün sepete eklendi');

    // Close modal and reset state
    setSerialNumberModalOpen(false);
    setSelectedProduct(null);
    setAvailableSerialNumbers([]);
  };

  // Add product to cart (without serial number)
  const addProductToCart = (product: Product) => {
    // Check if product already exists in cart
    const existingItemIndex = saleItems.findIndex(
      (item) => item.productId === product.id && !item.serialNumberId
    );

    if (existingItemIndex >= 0) {
      // Increase quantity
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSaleItems(updatedItems);
      showSuccessToast('Ürün miktarı artırıldı');
    } else {
      // Add new item
      const newItem: SaleItem = {
        id: `${Date.now()}-${Math.random()}`,
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        quantity: 1,
        unitPrice: product.sale_price || 0,
        vatRate: product.vat_rate || 0,
      };

      setSaleItems((prev) => [...prev, newItem]);
      showSuccessToast('Ürün sepete eklendi');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSaleItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    const item = saleItems.find((i) => i.id === itemId);
    
    // Release serial number if it was reserved
    if (item?.serialNumberId) {
      await SerialNumberService.releaseSerialNumber(item.serialNumberId);
    }

    setSaleItems((prev) => prev.filter((item) => item.id !== itemId));
    showSuccessToast('Ürün sepetten çıkarıldı');
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const totalVat = saleItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemVat = itemSubtotal * (item.vatRate / 100);
      return sum + itemVat;
    }, 0);

    const grandTotal = subtotal + totalVat;

    return { subtotal, totalVat, grandTotal };
  };



  // Validate form (only items and customer required for sale)
  const validateSaleForm = (): boolean => {
    // Check if there are items
    if (saleItems.length === 0) {
      showErrorToast('Sepette en az bir ürün olmalıdır');
      return false;
    }

    // Validate customer data
    if (!customerData) {
      showErrorToast('Müşteri bilgilerini doldurunuz');
      return false;
    }

    return true;
  };

  // Handle sale submission (without invoice)
  const handleSubmit = async () => {
    // Validate
    if (!validateSaleForm()) {
      return;
    }

    if (!user || !branchId) {
      showErrorToast('Kullanıcı bilgileri alınamadı');
      return;
    }

    setIsSubmitting(true);

    try {
      const { subtotal, totalVat, grandTotal } = calculateTotals();

      // Prepare sale items
      const items: SaleItemInput[] = saleItems.map((item) => ({
        product_id: item.productId,
        serial_number_id: item.serialNumberId,
        product_name: item.productName,
        barcode: item.barcode,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        vat_rate: item.vatRate,
        vat_amount: (item.quantity * item.unitPrice * item.vatRate) / 100,
        total_amount: item.quantity * item.unitPrice * (1 + item.vatRate / 100),
      }));

      // Prepare sale input (without invoice info for now)
      const saleInput: CreateSaleInput = {
        customer: {
          customer_type: customerData!.customerType,
          customer_name: customerData!.customerName,
          vkn_tckn: customerData!.vknTckn,
          tax_office: customerData!.taxOffice,
          email: customerData!.email,
          phone: customerData!.phone,
          address: customerData!.address,
        },
        invoice: {
          invoice_type: 'E_ARSIV',
          invoice_date: new Date().toISOString().split('T')[0],
          currency: 'TRY',
          payment_type: 'NAKIT',
          note: '',
        },
        items,
        subtotal,
        total_vat_amount: totalVat,
        total_amount: grandTotal,
      };

      // Create sale
      const result = await createSale(saleInput, branchId, user.id);

      if (result.success) {
        showSuccessToast('Satış başarıyla tamamlandı');
        navigate('/sales/list');
      } else {
        showErrorToast(result.error || 'Satış oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      showErrorToast(error, 'Satış oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup: Release reserved serial numbers on unmount
  useEffect(() => {
    return () => {
      // Release all reserved serial numbers
      saleItems.forEach((item) => {
        if (item.serialNumberId) {
          SerialNumberService.releaseSerialNumber(item.serialNumberId);
        }
      });
    };
  }, []);

  return (
    <Layout
      title="Yeni Satış Faturası"
      subtitle="Müşterilerinize satış yapımında düzenlenen standart fatura"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Receipt className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Kalem</p>
              <p className="text-lg font-bold text-orange-900">{saleItems.length} Adet</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Ara Toplam</p>
              <p className="text-lg font-bold text-blue-900">₺{calculateTotals().subtotal.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">KDV</p>
              <p className="text-lg font-bold text-purple-900">₺{calculateTotals().totalVat.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Toplam</p>
              <p className="text-lg font-bold text-green-900">₺{calculateTotals().grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Müşteri / Tedarikçi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{selectedCustomer.name}</p>
                        <p className="text-sm text-green-700">
                          {selectedCustomer.email || selectedCustomer.phone || selectedCustomer.vkn_tckn}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomerModalOpen(true)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Değiştir
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setCustomerModalOpen(true)}
                  >
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Müşteri Seç</span>
                    <span className="text-gray-400">Aramak için tıklayın</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <User className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products and Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ürün ve Hizmetler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Search */}
                <ProductSearchInput
                  onProductSelect={handleProductSelect}
                  onProductNotFound={handleProductNotFound}
                />
                
                {/* Products Table */}
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
                    <div className="col-span-3">Ürün/Hizmet</div>
                    <div className="col-span-1 text-center">Miktar</div>
                    <div className="col-span-1 text-center">Birim</div>
                    <div className="col-span-2 text-center">Birim Fiyat</div>
                    <div className="col-span-1 text-center">İndirim</div>
                    <div className="col-span-1 text-center">KDV (%)</div>
                    <div className="col-span-2 text-center">Tutar</div>
                    <div className="col-span-1 text-center"></div>
                  </div>
                  
                  {saleItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Ürün seç</p>
                      <p className="text-sm">Ürün/hizmet alanına yazmaya başlayarak arama yapabilir, miktar ve fiyat değiştirerek anlık hesaplama görebilirsiniz</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {saleItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center">
                          <div className="col-span-3">
                            <p className="font-medium">{item.productName}</p>
                            {item.serialNumber && (
                              <p className="text-xs text-gray-500">SN: {item.serialNumber}</p>
                            )}
                          </div>
                          <div className="col-span-1">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                              className="text-center"
                              min="1"
                              disabled={!!item.serialNumberId}
                            />
                          </div>
                          <div className="col-span-1 text-center text-sm">Adet</div>
                          <div className="col-span-2 text-center">₺{item.unitPrice.toFixed(2)}</div>
                          <div className="col-span-1 text-center">-</div>
                          <div className="col-span-1 text-center">%{item.vatRate}</div>
                          <div className="col-span-2 text-center font-medium">
                            ₺{(item.quantity * item.unitPrice * (1 + item.vatRate / 100)).toFixed(2)}
                          </div>
                          <div className="col-span-1 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Satır Ekle
                </Button>
                
                <p className="text-sm text-blue-600">
                  <strong>İpucu:</strong> Ürün/hizmet alanına yazmaya başlayarak arama yapabilir, miktar ve fiyat değiştirerek anlık hesaplama görebilirsiniz
                </p>
              </CardContent>
            </Card>

            {/* Delivery References */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">İrsaliye Referansları</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveryReferences.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-4">İrsaliye referansı eklenmedi.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {deliveryReferences.map((ref, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{ref}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeliveryReferences(prev => prev.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  İrsaliye Ekle
                </Button>
              </CardContent>
            </Card>

            {/* Document Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Belge Açıklaması</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Fatura açıklaması girin... (Opsiyonel)"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Invoice Details & Actions */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fatura Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="invoiceType" className="text-sm">Fatura Tipi</Label>
                    <Select value={invoiceType} onValueChange={setInvoiceType}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Satış Faturası">Satış Faturası</SelectItem>
                        <SelectItem value="E-Arşiv">E-Arşiv</SelectItem>
                        <SelectItem value="E-Fatura">E-Fatura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-sm">Para Birimi</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₺ Türk Lirası">₺ Türk Lirası</SelectItem>
                        <SelectItem value="$ USD">$ USD</SelectItem>
                        <SelectItem value="€ EUR">€ EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="invoiceDate" className="text-sm">Fatura Tarihi</Label>
                    <Input
                      type="date"
                      className="h-8"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dueDate" className="text-sm">Vade Tarihi</Label>
                    <Input
                      type="date"
                      className="h-8"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || saleItems.length === 0}
                className="w-full h-12 text-lg gap-2 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Receipt className="h-5 w-5" />
                {isSubmitting ? 'İşleniyor...' : 'Faturayı Kaydet'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/sales/list')}
                disabled={isSubmitting}
                className="w-full"
              >
                İptal
              </Button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                İndirim/Vergi
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Sık Kullanılanlar
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* Serial Number Selection Modal */}
      {selectedProduct && (
        <SerialNumberSelectionModal
          isOpen={serialNumberModalOpen}
          product={selectedProduct}
          availableSerialNumbers={availableSerialNumbers}
          onSelect={handleSerialNumberSelect}
          onCancel={() => {
            setSerialNumberModalOpen(false);
            setSelectedProduct(null);
            setAvailableSerialNumbers([]);
          }}
        />
      )}

      {/* Product Not Found Modal */}
      <ProductNotFoundModal
        isOpen={productNotFoundModalOpen}
        barcode={notFoundBarcode}
        onClose={() => setProductNotFoundModalOpen(false)}
        onProductCreated={handleProductCreated}
      />

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          // Convert to CustomerInfoFormData format
          setCustomerData({
            customerType: customer.customer_type === 'INDIVIDUAL' ? 'Bireysel' : 'Kurumsal',
            customerName: customer.name,
            vknTckn: customer.vkn_tckn || '',
            taxOffice: customer.tax_office || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
          });
        }}
        onCreateNew={() => {
          setCustomerModalOpen(false);
          // TODO: Open new customer creation modal
        }}
      />
    </Layout>
  );
}
