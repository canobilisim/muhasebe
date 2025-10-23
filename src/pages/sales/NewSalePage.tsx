import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { 
  showErrorToast, 
  showSuccessToast
} from '@/utils/errorHandling';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CustomerInfoForm } from '@/components/sales/CustomerInfoForm';
import { ProductSearchInput } from '@/components/sales/ProductSearchInput';
import { SalesItemsTable, type SaleItem } from '@/components/sales/SalesItemsTable';
import { InvoiceInfoForm } from '@/components/sales/InvoiceInfoForm';
import type { CustomerInfoFormData, InvoiceInfoFormData } from '@/utils/validationSchemas';
import { SalesSummary } from '@/components/sales/SalesSummary';
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
  
  // Customer and invoice form data (captured via onChange callbacks)
  const [customerData, setCustomerData] = useState<CustomerInfoFormData | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceInfoFormData | null>(null);

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
        invoice: invoiceData ? {
          invoice_type: invoiceData.invoiceType,
          invoice_date: invoiceData.invoiceDate,
          currency: invoiceData.currency,
          payment_type: invoiceData.paymentType,
          note: invoiceData.note,
        } : {
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
      title="Yeni Satış"
      subtitle="Yeni satış oluştur ve fatura kes"
    >
      <div className="space-y-6">
        {/* Customer Information */}
        <CustomerInfoForm
          onChange={setCustomerData}
          defaultValues={customerData || undefined}
        />

        {/* Product Search */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Ürün Ekle</h3>
          <ProductSearchInput
            onProductSelect={handleProductSelect}
            onProductNotFound={handleProductNotFound}
          />
        </div>

        {/* Sales Items Table */}
        <SalesItemsTable
          items={saleItems}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
        />

        {/* Sales Summary */}
        <SalesSummary items={saleItems} />

        {/* Invoice Information (Optional) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">E-Fatura Bilgisi</h4>
              <p className="text-sm text-blue-700">
                Satış tamamlandıktan sonra satış listesinden e-fatura kesebilirsiniz. 
                Fatura bilgileri opsiyoneldir ve satış işlemini etkilemez.
              </p>
            </div>
          </div>
        </div>

        {/* Optional Invoice Information */}
        <details className="bg-white rounded-lg border border-gray-200">
          <summary className="px-6 py-4 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            Fatura Bilgileri (Opsiyonel)
          </summary>
          <div className="px-6 pb-6">
            <InvoiceInfoForm
              onChange={setInvoiceData}
              defaultValues={invoiceData || undefined}
            />
          </div>
        </details>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sales/list')}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || saleItems.length === 0}
            className="gap-2"
          >
            <Receipt className="h-4 w-4" />
            {isSubmitting ? 'İşleniyor...' : 'Satışı Tamamla'}
          </Button>
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
    </Layout>
  );
}
