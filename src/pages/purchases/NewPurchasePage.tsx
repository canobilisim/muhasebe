import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, FileText, Truck, Calendar, DollarSign } from 'lucide-react';
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
import { SupplierSelectionModal } from '@/components/suppliers/SupplierSelectionModal';
import type { Supplier } from '@/types/supplier';
import { ProductNotFoundModal } from '@/components/sales/ProductNotFoundModal';
import { PurchaseService, type PurchaseItemInput } from '@/services/purchaseService';
import type { Product } from '@/types/product';
import { useAuthStore } from '@/stores/authStore';

export default function NewPurchasePage() {
    const navigate = useNavigate();
    const { user, branchId } = useAuthStore();

    // Sale items state
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

    // Product not found modal state
    const [productNotFoundModalOpen, setProductNotFoundModalOpen] = useState(false);
    const [notFoundBarcode, setNotFoundBarcode] = useState('');

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Supplier selection state
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);

    // Invoice details state - Fixed for purchase invoice
    const [invoiceType] = useState('Alış Faturası'); // Fixed value
    const [currency, setCurrency] = useState('₺ Türk Lirası');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [paymentType, setPaymentType] = useState<'cash' | 'pos' | 'credit' | 'partial'>('cash');
    const [dueDate, setDueDate] = useState('');
    const [invoiceNote, setInvoiceNote] = useState('');

    // Delivery references state
    const [deliveryReferences, setDeliveryReferences] = useState<string[]>([]);

    // Handle product selection from search
    const handleProductSelect = async (product: Product) => {
        // For purchases, we don't need to select serial numbers
        // Serial numbers will be added when products are received
        // Just add product directly to cart
        addProductToCart(product);
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
                unitPrice: product.purchase_price || product.sale_price_1 || 0, // Use purchase price for purchases
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
    const handleRemoveItem = (itemId: string) => {
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

    // Validate form (only items and supplier required for purchase)
    const validatePurchaseForm = (): boolean => {
        // Check if there are items
        if (saleItems.length === 0) {
            showErrorToast('Sepette en az bir ürün olmalıdır');
            return false;
        }

        // Validate supplier selection
        if (!selectedSupplier) {
            showErrorToast('Lütfen bir tedarikçi seçiniz');
            return false;
        }

        return true;
    };

    // Handle purchase submission
    const handleSubmit = async () => {
        // Validate
        if (!validatePurchaseForm()) {
            return;
        }

        if (!user || !branchId || !selectedSupplier) {
            showErrorToast('Kullanıcı bilgileri alınamadı');
            return;
        }

        setIsSubmitting(true);

        try {
            const { subtotal, totalVat, grandTotal } = calculateTotals();

            // Prepare purchase items
            const items: PurchaseItemInput[] = saleItems.map((item) => ({
                product_id: item.productId,
                product_name: item.productName,
                barcode: item.barcode,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_rate: item.vatRate,
                tax_amount: (item.quantity * item.unitPrice * item.vatRate) / 100,
                total_amount: item.quantity * item.unitPrice * (1 + item.vatRate / 100),
            }));

            // Calculate paid and remaining amounts based on payment type
            let paidAmount = 0;
            let remainingAmount = 0;

            if (paymentType === 'cash' || paymentType === 'pos') {
                paidAmount = grandTotal;
                remainingAmount = 0;
            } else if (paymentType === 'credit') {
                paidAmount = 0;
                remainingAmount = grandTotal;
            }

            // Prepare purchase input
            const purchaseInput = {
                supplier_id: selectedSupplier.id,
                purchase_date: invoiceDate,
                invoice_number: invoiceNumber || undefined,
                payment_type: paymentType,
                due_date: dueDate || undefined,
                notes: invoiceNote || undefined,
                items,
                subtotal,
                tax_amount: totalVat,
                total_amount: grandTotal,
                paid_amount: paidAmount,
                remaining_amount: remainingAmount,
            };

            // Create purchase
            const result = await PurchaseService.createPurchase(purchaseInput, branchId, user.id);

            if (result.success) {
                showSuccessToast('Alış faturası başarıyla oluşturuldu');
                navigate('/purchases/list');
            } else {
                showErrorToast(result.error || 'Alış faturası oluşturulamadı');
            }
        } catch (error) {
            console.error('Error creating purchase:', error);
            showErrorToast('Alış faturası oluşturulurken hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <Layout
            title="Yeni Alış Faturası"
            subtitle="Tedarikçilerden alış yapımında düzenlenen fatura"
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
                        {/* Supplier Selection */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Tedarikçi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedSupplier ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <Truck className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900">{selectedSupplier.name}</p>
                                                <p className="text-sm text-green-700">
                                                    {selectedSupplier.company_name || selectedSupplier.phone || selectedSupplier.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSupplierModalOpen(true)}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            Değiştir
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setSupplierModalOpen(true)}
                                    >
                                        <Truck className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-500">Tedarikçi Seç</span>
                                        <span className="text-gray-400">Aramak için tıklayın</span>
                                        <Button variant="ghost" size="sm" className="ml-auto">
                                            <Truck className="h-4 w-4" />
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
                                <div>
                                    <Label htmlFor="invoiceNumber" className="text-sm">Fatura Numarası</Label>
                                    <Input
                                        id="invoiceNumber"
                                        placeholder="Fatura numarası (opsiyonel)"
                                        className="h-8"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="invoiceType" className="text-sm">Fatura Tipi</Label>
                                        <Select value={invoiceType} disabled>
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Alış Faturası">Alış Faturası</SelectItem>
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

                                <div>
                                    <Label htmlFor="paymentType" className="text-sm">Ödeme Tipi</Label>
                                    <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Nakit</SelectItem>
                                            <SelectItem value="pos">Kredi Kartı</SelectItem>
                                            <SelectItem value="credit">Vadeli</SelectItem>
                                            <SelectItem value="partial">Kısmi Ödeme</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                className="w-full h-12 text-lg gap-2 bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                <Receipt className="h-5 w-5" />
                                {isSubmitting ? 'İşleniyor...' : 'Alış Faturasını Kaydet'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate('/purchases/list')}
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

            {/* Product Not Found Modal */}
            <ProductNotFoundModal
                isOpen={productNotFoundModalOpen}
                barcode={notFoundBarcode}
                onClose={() => setProductNotFoundModalOpen(false)}
                onProductCreated={handleProductCreated}
            />

            {/* Supplier Selection Modal */}
            <SupplierSelectionModal
                isOpen={supplierModalOpen}
                onClose={() => setSupplierModalOpen(false)}
                onSelect={(supplier) => {
                    setSelectedSupplier(supplier);
                }}
                onCreateNew={() => {
                    setSupplierModalOpen(false);
                    navigate('/suppliers/new');
                }}
            />
        </Layout>
    );
}