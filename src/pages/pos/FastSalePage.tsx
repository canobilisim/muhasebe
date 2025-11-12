import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Barcode, Search, Printer, Trash2, Loader2, Plus, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import type { POSState, POSProduct as Product, POSCart as Cart } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { ProductService } from '@/services/productService';
import { CustomerService } from '@/services/customerService';
import { CustomerPaymentService } from '@/services/customerPaymentService';

// Yerel tarihi YYYY-MM-DD formatında döndürür
const getLocalDateString = () => {
  const now = new Date()
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
  return localDate.toISOString().split('T')[0]
}
import { showToast } from '@/lib/toast';
import { useFastSaleStore } from '@/stores/fastSaleStore';
import { QuickCustomerModal } from '@/components/pos/QuickCustomerModal';
import { SplitPaymentModal } from '@/components/pos/SplitPaymentModal';
import { ProductNotFoundModal } from '@/components/pos/ProductNotFoundModal';
import { QuickProductAddModal } from '@/components/pos/QuickProductAddModal';
import { formatNameToTitleCase } from '@/utils/inputFormatters';
import { SaleService } from '@/services/saleService';

const initialCart: Cart = {
  tabId: 'tab-1',
  customerLabel: 'Müşteri 1',
  lines: [],
  gross: 0,
  discountTotal: 0,
  net: 0,
};

const FastSalePage: React.FC = () => {
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'barcode' | 'product'>('barcode');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    barcode: string;
    name: string;
    sale_price: number;
    stock_quantity: number;
    category: string | null;
  }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceCheckBarcode, setPriceCheckBarcode] = useState('');
  const [priceCheckProduct, setPriceCheckProduct] = useState<{
    name: string;
    sale_price: number;
    barcode: string;
  } | null>(null);
  const [isPriceChecking, setIsPriceChecking] = useState(false);
  const priceCheckInputRef = useRef<HTMLInputElement>(null);

  // Customer selection state
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string | null; current_balance: number | null; credit_limit: number | null; is_active: boolean | null }>>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Record<string, { id: string; name: string; phone: string | null; current_balance: number; credit_limit: number; is_active: boolean } | null>>({
    'tab-1': null,
    'tab-2': null,
    'tab-3': null,
    'tab-4': null,
    'tab-5': null,
  });

  // Muhtelif ürün state
  const [miscItemNote, setMiscItemNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForItem, setNoteForItem] = useState<string | null>(null);

  // Satış notu state
  const [showSaleNoteModal, setShowSaleNoteModal] = useState(false);
  const [saleNote, setSaleNote] = useState('');

  // Vade tarihi state
  const [useDueDate, setUseDueDate] = useState(false);
  const [dueDate, setDueDate] = useState('');

  // Pasif müşteri onay modalı state
  const [showInactiveCustomerModal, setShowInactiveCustomerModal] = useState(false);
  const [pendingInactiveCustomer, setPendingInactiveCustomer] = useState<typeof customers[0] | null>(null);

  // Ödeme alma modalı state
  const [showPaymentReceiveModal, setShowPaymentReceiveModal] = useState(false);
  const [paymentReceiveAmount, setPaymentReceiveAmount] = useState('');
  const [paymentReceiveType, setPaymentReceiveType] = useState<'cash' | 'pos'>('cash');

  // Ürün bulunamadı modalı state
  const [showProductNotFoundModal, setShowProductNotFoundModal] = useState(false);
  const [showQuickProductAddModal, setShowQuickProductAddModal] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState('');

  // Use fast sale store instead of local state
  const {
    categories: fastSaleCategories,
    products: fastSaleProducts,
    isLoading: isLoadingFastSale,
    loadData: loadFastSaleData
  } = useFastSaleStore();
  const [state, setState] = useState<POSState>({
    activePriceList: 'Fiyat 1',
    activeCustomerTab: 'tab-1',
    discountValue: 0,
    discountType: '%',
    currency: 'TRY',
    paid: 0,
    total: 0,
    net: 0,
    change: 0,
    limit: 0,
    remaining: 0,
    carts: [
      { ...initialCart, tabId: 'tab-1', customerLabel: 'Müşteri 1' },
      { ...initialCart, tabId: 'tab-2', customerLabel: 'Müşteri 2' },
      { ...initialCart, tabId: 'tab-3', customerLabel: 'Müşteri 3' },
      { ...initialCart, tabId: 'tab-4', customerLabel: 'Müşteri 4' },
      { ...initialCart, tabId: 'tab-5', customerLabel: 'Müşteri 5' },
    ],
    catalog: [],
    categories: [],
    selectedCategory: '',
    now: new Date().toLocaleString('tr-TR'),
  });

  // Load fast sale data on mount (if not already loaded)
  useEffect(() => {
    loadFastSaleData();
  }, [loadFastSaleData]);

  // Set categories when fast sale data is loaded
  useEffect(() => {
    if (fastSaleCategories.length > 0) {
      const categoryNames = fastSaleCategories.map(c => c.name);
      setState(prev => ({
        ...prev,
        categories: categoryNames,
        selectedCategory: prev.selectedCategory || categoryNames[0] || '',
      }));
    }
  }, [fastSaleCategories]);

  // Auto focus on barcode input when page loads
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Helper function to get price based on selected price list
  const getPriceByList = (product: { sale_price_1?: number | null; sale_price_2?: number | null }): number => {
    const priceList = state.activePriceList;

    if (priceList === 'Fiyat 2') {
      return product.sale_price_2 || product.sale_price_1 || 0;
    }

    // Default to Fiyat 1
    return product.sale_price_1 || 0;
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev: POSState) => ({
        ...prev,
        now: new Date().toLocaleString('tr-TR'),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-dropdown-container')) {
        setShowDropdown(false);
      }
      if (!target.closest('.customer-dropdown-container')) {
        setShowCustomerDropdown(false);
      }
    };

    if (showDropdown || showCustomerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, showCustomerDropdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'F8':
          handlePayment('cash');
          break;
        case 'F9':
          handlePayment('pos');
          break;
        case 'F10':
          handlePayment('openAccount');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle barcode scan (only numbers)
  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode.trim()) {
      showToast.error('Lütfen barkod giriniz');
      return;
    }

    setIsSearching(true);

    try {
      const barcodeResult = await ProductService.searchByBarcode(barcode.trim());

      if (barcodeResult.success && barcodeResult.data) {
        const dbProduct = barcodeResult.data;

        if (dbProduct.stock_quantity <= 0) {
          showToast.error(`${dbProduct.name} stokta yok!`);
          setIsSearching(false);
          return;
        }

        const posProduct: Product = {
          id: dbProduct.id,
          barcode: dbProduct.barcode,
          name: dbProduct.name,
          unitPrice: getPriceByList(dbProduct),
          qty: 1,
          discount: 0,
          currency: 'TRY',
          vatRate: 18,
          category: dbProduct.category || 'GENEL',
        };

        addToCart(posProduct);
        showToast.success(`${dbProduct.name} sepete eklendi`);

        if (barcodeInputRef.current) {
          barcodeInputRef.current.value = '';
          barcodeInputRef.current.focus();
        }
        setSearchQuery('');
      } else {
        // Ürün bulunamadı - modal göster
        setNotFoundBarcode(barcode.trim());
        setShowProductNotFoundModal(true);
      }
    } catch (error) {
      console.error('Error searching product:', error);
      showToast.error('Ürün arama sırasında hata oluştu');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle product search with dropdown
  const handleProductSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (query.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);

    try {
      const searchResult = await ProductService.searchProducts(query.trim(), 10);

      if (searchResult.success && searchResult.data) {
        setSearchResults(searchResult.data);
        setShowDropdown(searchResult.data.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Select product from dropdown
  const selectProduct = (dbProduct: typeof searchResults[0]) => {
    if (dbProduct.stock_quantity <= 0) {
      showToast.error(`${dbProduct.name} stokta yok!`);
      return;
    }

    const posProduct: Product = {
      id: dbProduct.id,
      barcode: dbProduct.barcode,
      name: dbProduct.name,
      unitPrice: getPriceByList(dbProduct as any),
      qty: 1,
      discount: 0,
      currency: 'TRY',
      vatRate: 18,
      category: dbProduct.category || 'GENEL',
    };

    addToCart(posProduct);
    showToast.success(`${dbProduct.name} sepete eklendi`);

    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);

    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = '';
      barcodeInputRef.current.focus();
    }
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    const newMode = searchMode === 'barcode' ? 'product' : 'barcode';
    setSearchMode(newMode);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);

    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = '';
      barcodeInputRef.current.focus();
    }

    showToast.info(newMode === 'barcode' ? 'Barkod okuma modu' : 'Ürün arama modu');
  };

  // Customer search
  const handleCustomerSearch = async (query: string) => {
    // Otomatik Title Case formatla
    const formattedQuery = formatNameToTitleCase(query);
    setCustomerSearchQuery(formattedQuery);

    if (formattedQuery.length < 2) {
      setCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    setIsSearchingCustomers(true);

    try {
      const results = await CustomerService.searchCustomers(formattedQuery.trim());
      setCustomers(results);
      setShowCustomerDropdown(results.length > 0);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomers([]);
      setShowCustomerDropdown(false);
      showToast.error('Müşteri arama sırasında hata oluştu');
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  // Select customer
  const selectCustomer = async (customer: typeof customers[0]) => {
    // Pasif müşteri kontrolü - modal göster
    if (customer.is_active === false) {
      setPendingInactiveCustomer(customer);
      setShowInactiveCustomerModal(true);
      return;
    }

    // Aktif müşteri - direkt seç
    completeCustomerSelection(customer);
  };

  // Pasif müşteri onaylandığında
  const handleInactiveCustomerConfirm = async (activateCustomer: boolean) => {
    if (!pendingInactiveCustomer) return;

    const customer = pendingInactiveCustomer;

    if (activateCustomer) {
      try {
        // Müşteriyi aktif et
        await CustomerService.updateCustomer(customer.id, { is_active: true });
        showToast.success(`${customer.name} aktif edildi`);
        customer.is_active = true;
      } catch (error) {
        showToast.error('Müşteri aktif edilemedi');
        setShowInactiveCustomerModal(false);
        setPendingInactiveCustomer(null);
        return;
      }
    }

    // Müşteriyi seç
    completeCustomerSelection(customer);
    setShowInactiveCustomerModal(false);
    setPendingInactiveCustomer(null);
  };

  // Müşteri seçimini tamamla
  const completeCustomerSelection = (customer: typeof customers[0]) => {
    const activeTab = state.activeCustomerTab;
    setSelectedCustomers(prev => ({
      ...prev,
      [activeTab]: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        current_balance: customer.current_balance || 0,
        credit_limit: customer.credit_limit || 0,
        is_active: customer.is_active ?? true,
      }
    }));

    // Update cart label
    setState(prev => ({
      ...prev,
      carts: prev.carts.map(cart =>
        cart.tabId === activeTab
          ? { ...cart, customerLabel: customer.name }
          : cart
      ),
      limit: customer.credit_limit || 0,
      remaining: (customer.credit_limit || 0) - (customer.current_balance || 0),
    }));

    setCustomerSearchQuery('');
    setCustomers([]);
    setShowCustomerDropdown(false);
    showToast.success(`${customer.name} seçildi`);
  };

  // Clear customer selection
  const clearCustomer = () => {
    const activeTab = state.activeCustomerTab;
    const tabIndex = state.carts.findIndex(c => c.tabId === activeTab);

    setSelectedCustomers(prev => ({
      ...prev,
      [activeTab]: null
    }));

    setState(prev => ({
      ...prev,
      carts: prev.carts.map(cart =>
        cart.tabId === activeTab
          ? { ...cart, customerLabel: `Müşteri ${tabIndex + 1}` }
          : cart
      ),
      limit: 0,
      remaining: 0,
    }));

    showToast.info('Müşteri seçimi temizlendi');
  };

  // Handle new customer created
  const handleCustomerCreated = (customer: { id: string; name: string; phone: string | null; current_balance: number; credit_limit: number; is_active?: boolean }) => {
    // Automatically select the newly created customer
    selectCustomer({ ...customer, is_active: customer.is_active ?? true });
  };

  // Handle product not found modal actions
  const handleProductNotFoundClose = () => {
    setShowProductNotFoundModal(false);
    setNotFoundBarcode('');
    // Focus back to barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handleAddNewProduct = () => {
    setShowProductNotFoundModal(false);
    setShowQuickProductAddModal(true);
  };

  // Handle product added from quick add modal
  const handleProductAdded = (product: any) => {
    // Convert to POS product and add to cart
    const posProduct: Product = {
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      unitPrice: getPriceByList(product),
      qty: 1,
      discount: 0,
      currency: 'TRY',
      vatRate: 18,
      category: product.category || 'GENEL',
    };

    addToCart(posProduct);
    showToast.success(`${product.name} sepete eklendi`);

    // Clear search and focus back to barcode input
    setSearchQuery('');
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = '';
      barcodeInputRef.current.focus();
    }
  };

  const handleQuickProductAddClose = () => {
    setShowQuickProductAddModal(false);
    setNotFoundBarcode('');
    // Focus back to barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Open price check modal
  const openPriceModal = () => {
    setShowPriceModal(true);
    setPriceCheckBarcode('');
    setPriceCheckProduct(null);
    setTimeout(() => {
      priceCheckInputRef.current?.focus();
    }, 100);
  };

  // Check product price
  const handlePriceCheck = async (barcode: string) => {
    if (!barcode.trim()) {
      showToast.error('Lütfen barkod giriniz');
      return;
    }

    setIsPriceChecking(true);

    try {
      const result = await ProductService.searchByBarcode(barcode.trim());

      if (result.success && result.data) {
        setPriceCheckProduct({
          name: result.data.name,
          sale_price: result.data.sale_price,
          barcode: result.data.barcode,
        });
      } else {
        showToast.error('Ürün bulunamadı');
        setPriceCheckProduct(null);
      }
    } catch (error) {
      console.error('Error checking price:', error);
      showToast.error('Fiyat sorgulanırken hata oluştu');
      setPriceCheckProduct(null);
    } finally {
      setIsPriceChecking(false);
    }
  };

  // Print receipt
  const handlePrint = () => {
    const activeCart = state.carts.find((cart: Cart) => cart.tabId === state.activeCustomerTab) || state.carts[0];

    if (activeCart.lines.length === 0) {
      showToast.error('Sepette ürün yok!');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=300,height=600');

    if (!printWindow) {
      showToast.error('Yazdırma penceresi açılamadı. Pop-up engelleyiciyi kontrol edin.');
      return;
    }

    const now = new Date();
    const receiptNumber = `FIS-${now.getTime()}`;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fiş - ${receiptNumber}</title>
        <style>
          @media print {
            @page {
              size: 56mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            width: 56mm;
            margin: 0 auto;
            padding: 5mm;
            font-size: 10pt;
            line-height: 1.3;
          }
          
          .center {
            text-align: center;
          }
          
          .bold {
            font-weight: bold;
          }
          
          .large {
            font-size: 12pt;
          }
          
          .separator {
            border-top: 1px dashed #000;
            margin: 3mm 0;
          }
          
          .row {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
          }
          
          .item {
            margin: 2mm 0;
          }
          
          .item-name {
            font-weight: bold;
          }
          
          .total-section {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 2px solid #000;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
            font-size: 11pt;
          }
          
          .grand-total {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 2mm;
          }
        </style>
      </head>
      <body>
        <div class="center bold large">
          HESAPONDA
        </div>
        <div class="center">
          Adres Bilgisi
        </div>
        <div class="center">
          Tel: 0555 555 55 55
        </div>
        <div class="center">
          Vergi No: 1234567890
        </div>
        
        <div class="separator"></div>
        
        <div class="center bold">
          SATIŞ FİŞİ
        </div>
        <div class="row">
          <span>Fiş No:</span>
          <span>${receiptNumber}</span>
        </div>
        <div class="row">
          <span>Tarih:</span>
          <span>${now.toLocaleString('tr-TR')}</span>
        </div>
        <div class="row">
          <span>Müşteri:</span>
          <span>${activeCart.customerLabel}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="bold">ÜRÜNLER</div>
        ${activeCart.lines.map((item: Product) => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="row">
              <span>${item.qty} x ${item.unitPrice.toFixed(2)} ₺</span>
              <span class="bold">${(item.unitPrice * item.qty).toFixed(2)} ₺</span>
            </div>
          </div>
        `).join('')}
        
        <div class="separator"></div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Ara Toplam:</span>
            <span>${activeCart.gross.toFixed(2)} ₺</span>
          </div>
          ${activeCart.discountTotal > 0 ? `
          <div class="total-row">
            <span>İndirim:</span>
            <span>-${activeCart.discountTotal.toFixed(2)} ₺</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>KDV (%18):</span>
            <span>${(activeCart.net * 0.18).toFixed(2)} ₺</span>
          </div>
          <div class="separator"></div>
          <div class="total-row grand-total">
            <span>TOPLAM:</span>
            <span>${activeCart.net.toFixed(2)} ₺</span>
          </div>
        </div>
        
        <div class="separator"></div>
        
        <div class="center bold">
          Teşekkür Ederiz!
        </div>
        <div class="center">
          İyi Günler Dileriz
        </div>
        
        <div style="height: 10mm;"></div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    showToast.success('Fiş yazdırılıyor...');
  };

  const addToCart = (product: Product) => {
    setState((prev: POSState) => {
      const activeCartIndex = prev.carts.findIndex((cart: Cart) => cart.tabId === prev.activeCustomerTab);
      if (activeCartIndex === -1) {
        console.error('Active cart not found:', prev.activeCustomerTab);
        return prev;
      }

      // Deep copy carts array to avoid mutation
      const updatedCarts = prev.carts.map((cart, index) => {
        if (index !== activeCartIndex) {
          return cart; // Return unchanged cart
        }

        // Copy the active cart's lines array
        const updatedLines = [...cart.lines];
        const existingItemIndex = updatedLines.findIndex(
          (item: Product) => item.id === product.id
        );

        if (existingItemIndex >= 0) {
          // Increase quantity if product already in cart (immutable update)
          updatedLines[existingItemIndex] = {
            ...updatedLines[existingItemIndex],
            qty: updatedLines[existingItemIndex].qty + 1,
            lineTotal: updatedLines[existingItemIndex].unitPrice * (updatedLines[existingItemIndex].qty + 1),
          };
        } else {
          // Add new product to cart
          updatedLines.push({
            ...product,
            lineTotal: product.unitPrice * product.qty,
          });
        }

        // Return updated cart with new lines
        const updatedCart = {
          ...cart,
          lines: updatedLines,
        };

        return calculateCartTotals(updatedCart);
      });

      console.log('Cart updated:', {
        activeTab: prev.activeCustomerTab,
        cartIndex: activeCartIndex,
        itemsCount: updatedCarts[activeCartIndex].lines.length,
        allCarts: updatedCarts.map(c => ({ tabId: c.tabId, items: c.lines.length }))
      });

      return {
        ...prev,
        carts: updatedCarts,
      };
    });
  };

  const calculateCartTotals = (cart: Cart): Cart => {
    const gross = cart.lines.reduce((sum: number, item: Product) => sum + (item.unitPrice * item.qty), 0);
    const discountTotal = cart.lines.reduce((sum: number, item: Product) => sum + (item.unitPrice * item.qty * item.discount), 0);
    const net = gross - discountTotal;

    return {
      ...cart,
      gross,
      discountTotal,
      net,
    };
  };

  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePayment = async (type: 'cash' | 'pos' | 'openAccount' | 'split') => {
    if (type === 'split') {
      setShowSplitPaymentModal(true);
      return;
    }

    const paymentType = type === 'openAccount' ? 'credit' : type;
    await processSale(paymentType, activeCart.net, 0);
  };

  const handleSplitPayment = async (payments: { cash: number; pos: number; credit: number }) => {
    await processSale('partial', payments.cash + payments.pos, 0, payments);
  };

  const processSale = async (
    paymentType: 'cash' | 'pos' | 'credit' | 'partial',
    paidAmount: number,
    changeAmount: number,
    splitPayments?: { cash: number; pos: number; credit: number }
  ) => {
    if (activeCart.lines.length === 0) {
      showToast.error('Sepette ürün yok!');
      return;
    }

    const activeCustomer = selectedCustomers[state.activeCustomerTab];

    // Açık hesap için müşteri kontrolü
    if ((paymentType === 'credit' || (splitPayments && splitPayments.credit > 0)) && !activeCustomer) {
      showToast.error('Açık hesap için müşteri seçmelisiniz!');
      return;
    }

    // Pasif müşteri ile açık hesap kontrolü
    if ((paymentType === 'credit' || (splitPayments && splitPayments.credit > 0)) && activeCustomer && !activeCustomer.is_active) {
      showToast.error('Pasif müşteri ile açık hesap satış yapılamaz!');
      return;
    }

    setIsProcessingPayment(true);

    // Optimistic update - Sepeti hemen temizle
    clearCart();
    setShowSplitPaymentModal(false);
    setSaleNote(''); // Satış notunu temizle
    setUseDueDate(false); // Vade tarihi checkbox'ını temizle
    setDueDate(''); // Vade tarihini temizle
    showToast.success('Satış kaydediliyor...');

    try {
      // Arka planda kaydet
      await SaleService.createSale({
        customerId: activeCustomer?.id || null,
        items: activeCart.lines.map(item => ({
          productId: item.isMiscellaneous ? null : item.id,
          quantity: item.qty,
          unitPrice: item.unitPrice,
          discount: item.discount,
          note: item.note,
          isMiscellaneous: item.isMiscellaneous,
        })),
        totalAmount: activeCart.gross,
        discountAmount: activeCart.discountTotal,
        netAmount: activeCart.net,
        paymentType: paymentType,
        paidAmount,
        changeAmount,
        cashAmount: splitPayments?.cash || (paymentType === 'cash' ? paidAmount : 0),
        posAmount: splitPayments?.pos || (paymentType === 'pos' ? paidAmount : 0),
        creditAmount: splitPayments?.credit || (paymentType === 'credit' ? activeCart.net : 0),
        notes: saleNote || undefined,
        dueDate: (useDueDate && dueDate && (paymentType === 'credit' || paymentType === 'partial')) ? dueDate : null,
      });

      showToast.success('Satış başarıyla kaydedildi!');
    } catch (error) {
      console.error('Sale error:', error);
      showToast.error('Satış kaydedilirken hata oluştu!');
      // Hata durumunda kullanıcı zaten yeni işleme başlamış olabilir
      // Bu yüzden sepeti geri yüklemiyoruz
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const clearCart = () => {
    setState((prev: POSState) => {
      const updatedCarts = prev.carts.map((cart) => {
        if (cart.tabId === prev.activeCustomerTab) {
          return {
            ...cart,
            lines: [],
            gross: 0,
            discountTotal: 0,
            net: 0,
          };
        }
        return cart;
      });

      return {
        ...prev,
        carts: updatedCarts,
        paid: 0,
        change: 0,
      };
    });
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    setState((prev: POSState) => {
      const updatedCarts = prev.carts.map((cart, index) => {
        if (index !== prev.carts.findIndex(c => c.tabId === prev.activeCustomerTab)) {
          return cart;
        }

        const updatedLines = cart.lines.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              qty: newQty,
              lineTotal: item.unitPrice * newQty,
            };
          }
          return item;
        });

        const updatedCart = {
          ...cart,
          lines: updatedLines,
        };

        return calculateCartTotals(updatedCart);
      });

      return {
        ...prev,
        carts: updatedCarts,
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setState((prev: POSState) => {
      const activeCartIndex = prev.carts.findIndex((cart: Cart) => cart.tabId === prev.activeCustomerTab);
      if (activeCartIndex === -1) return prev;

      // Deep copy carts array to avoid mutation
      const updatedCarts = prev.carts.map((cart, index) => {
        if (index !== activeCartIndex) {
          return cart; // Return unchanged cart
        }

        // Filter out the removed item (creates new array)
        const updatedLines = cart.lines.filter(
          (item: Product) => item.id !== itemId
        );

        // Return updated cart with new lines
        const updatedCart = {
          ...cart,
          lines: updatedLines,
        };

        return calculateCartTotals(updatedCart);
      });

      console.log('Item removed from cart:', {
        activeTab: prev.activeCustomerTab,
        cartIndex: activeCartIndex,
        itemsCount: updatedCarts[activeCartIndex].lines.length,
      });

      return {
        ...prev,
        carts: updatedCarts,
      };
    });
  };

  // Muhtelif ürün ekleme - direkt 0₺ olarak ekle
  const addMiscellaneousItem = () => {
    const miscItem: Product = {
      id: `misc-${Date.now()}`,
      barcode: 'MUHTELIF',
      name: 'Muhtelif Ürün',
      unitPrice: 0,
      qty: 1,
      lineTotal: 0,
      isMiscellaneous: true,
      discount: 0,
      currency: 'TRY',
      vatRate: 0,
      category: 'Muhtelif',
    };

    addToCart(miscItem);
    showToast.success('Muhtelif ürün eklendi');
  };

  // Ödeme alma işlemi
  const handlePaymentReceive = async () => {
    const amount = parseFloat(paymentReceiveAmount);

    if (!amount || amount <= 0) {
      showToast.error('Lütfen geçerli bir tutar girin');
      return;
    }

    const activeCustomer = selectedCustomers[state.activeCustomerTab];
    if (!activeCustomer) {
      showToast.error('Müşteri seçmelisiniz!');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Ödeme kaydı oluştur
      await CustomerPaymentService.createPayment({
        customer_id: activeCustomer.id,
        amount: amount,
        payment_type: paymentReceiveType,
        payment_date: new Date().toISOString(),
        notes: null
      });

      // Müşteri bakiyesini güncelle
      await CustomerService.updateCustomer(activeCustomer.id, {
        current_balance: (activeCustomer.current_balance || 0) - amount
      });

      // Seçili müşterinin bakiyesini güncelle
      setSelectedCustomers(prev => ({
        ...prev,
        [state.activeCustomerTab]: {
          ...activeCustomer,
          current_balance: (activeCustomer.current_balance || 0) - amount
        }
      }));

      // State'i güncelle
      setState(prev => ({
        ...prev,
        remaining: prev.remaining + amount
      }));

      setShowPaymentReceiveModal(false);
      setPaymentReceiveAmount('');
      setPaymentReceiveType('cash');
      showToast.success(`${amount.toFixed(2)} ₺ ödeme alındı`);
    } catch (error) {
      console.error('Payment receive error:', error);
      showToast.error('Ödeme kaydedilirken bir hata oluştu');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Not kaydetme
  const saveItemNote = () => {
    if (!noteForItem) return;

    setState((prev: POSState) => {
      const updatedCarts = prev.carts.map((cart, index) => {
        if (index !== prev.carts.findIndex(c => c.tabId === prev.activeCustomerTab)) {
          return cart;
        }

        const updatedLines = cart.lines.map(item => {
          if (item.id === noteForItem) {
            return {
              ...item,
              note: miscItemNote || undefined,
            };
          }
          return item;
        });

        return {
          ...cart,
          lines: updatedLines,
        };
      });

      return {
        ...prev,
        carts: updatedCarts,
      };
    });

    setShowNoteModal(false);
    setNoteForItem(null);
    setMiscItemNote('');
    showToast.success('Not kaydedildi');
  };

  // Fiyat güncelleme
  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return;

    setState((prev: POSState) => {
      const updatedCarts = prev.carts.map((cart, index) => {
        if (index !== prev.carts.findIndex(c => c.tabId === prev.activeCustomerTab)) {
          return cart;
        }

        const updatedLines = cart.lines.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              unitPrice: newPrice,
              lineTotal: newPrice * item.qty,
            };
          }
          return item;
        });

        const updatedCart = {
          ...cart,
          lines: updatedLines,
        };

        return calculateCartTotals(updatedCart);
      });

      return {
        ...prev,
        carts: updatedCarts,
      };
    });
  };

  // Not gösterme/düzenleme
  const openNoteModal = (itemId: string) => {
    const item = activeCart.lines.find(l => l.id === itemId);
    if (item && item.isMiscellaneous) {
      setNoteForItem(itemId);
      setMiscItemNote(item.note || '');
      setShowNoteModal(true);
    }
  };

  // Memoize active cart to ensure proper re-rendering
  const activeCart = useMemo(() => {
    const cart = state.carts.find((cart: Cart) => cart.tabId === state.activeCustomerTab) || state.carts[0];
    console.log('Active cart recalculated:', {
      tabId: cart.tabId,
      label: cart.customerLabel,
      itemsCount: cart.lines.length,
      items: cart.lines.map(l => ({ name: l.name, qty: l.qty }))
    });
    return cart;
  }, [state.activeCustomerTab, state.carts]);

  return (
    <Layout title="Hızlı Satış" subtitle={state.activePriceList}>
      <div className="flex flex-col lg:flex-row bg-gray-100 gap-4 p-2 sm:p-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Left Column - Cart Area (2/3) */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-lg shadow p-2 sm:p-4" style={{ height: '100%' }}>
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <select
              className="border rounded px-3 py-2 text-sm w-full sm:w-32"
              value={state.activePriceList}
              onChange={(e) => setState((prev: POSState) => ({ ...prev, activePriceList: e.target.value }))}
            >
              <option>Fiyat 1</option>
              <option>Fiyat 2</option>
            </select>

            <div className="relative flex-1 search-dropdown-container">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                ref={barcodeInputRef}
                placeholder={searchMode === 'barcode' ? 'Barkod okutunuz...' : 'Ürün adı yazınız (min 3 karakter)...'}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  if (searchMode === 'product') {
                    handleProductSearch(value);
                  } else {
                    setSearchQuery(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    if (searchMode === 'barcode') {
                      handleBarcodeScan(searchQuery);
                    } else if (searchMode === 'product' && selectedIndex >= 0 && searchResults[selectedIndex]) {
                      e.preventDefault();
                      selectProduct(searchResults[selectedIndex]);
                    }
                  }
                  if (e.key === 'Escape') {
                    setShowDropdown(false);
                    setSelectedIndex(-1);
                  }
                  if (e.key === 'ArrowDown' && searchMode === 'product' && searchResults.length > 0) {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
                  }
                  if (e.key === 'ArrowUp' && searchMode === 'product' && searchResults.length > 0) {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                  }
                }}
                onFocus={() => {
                  if (searchMode === 'product' && searchQuery.length >= 3 && searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
              />

              {/* Dropdown for search results */}
              {showDropdown && searchMode === 'product' && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((product, index) => (
                    <div
                      key={product.id}
                      className={`p-3 cursor-pointer border-b last:border-b-0 flex justify-between items-center ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      onClick={() => selectProduct(product)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          Barkod: {product.barcode} | Stok: {product.stock_quantity}
                          {product.category && ` | ${product.category}`}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-green-600 ml-4">
                        {product.sale_price.toFixed(2)} ₺
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={searchMode === 'product' ? 'default' : 'outline'}
                className="flex-1 sm:flex-none"
                onClick={toggleSearchMode}
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{searchMode === 'barcode' ? 'Ara' : 'Barkod'}</span>
              </Button>

              <Button
                variant="outline"
                className="hidden md:inline-flex"
                onClick={openPriceModal}
              >
                Fiyat Gör
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={addMiscellaneousItem}
                title="Muhtelif Ürün Ekle"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!selectedCustomers[state.activeCustomerTab]) {
                    showToast.error('Ödeme almak için müşteri seçmelisiniz!');
                    return;
                  }
                  setShowPaymentReceiveModal(true);
                }}
                title="Ödeme Al"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSaleNoteModal(true)}
                title="Satış Notu"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={handlePrint}
                title="Yazdır"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cart Tabs */}
          <Tabs
            value={state.activeCustomerTab}
            onValueChange={(value: string) => {
              console.log('Switching to tab:', value);
              setState((prev: POSState) => {
                const newCart = prev.carts.find(c => c.tabId === value);
                console.log('New cart items:', newCart?.lines.length || 0);
                return { ...prev, activeCustomerTab: value };
              });
            }}
            className="mb-3"
          >
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
              {state.carts.map((cart: Cart) => (
                <TabsTrigger key={cart.tabId} value={cart.tabId} className="text-xs sm:text-sm">
                  {cart.customerLabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Cart Items */}
          <div
            className="border rounded-lg bg-white flex-1 overflow-x-auto"
            style={{
              minHeight: '0',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'scroll'
            }}
          >
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                <TableRow>
                  <TableHead className="w-[40px] sm:w-[50px] text-center">Sil</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Barkod</TableHead>
                  <TableHead className="text-center">Ürün</TableHead>
                  <TableHead className="text-center">Miktar</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Birim Fiyat</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCart.lines.length > 0 ? (
                  activeCart.lines.map((item: Product) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="hover:bg-red-50 text-red-600 hover:text-red-700 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center text-xs">{item.barcode}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">
                        <div className="flex items-center justify-center gap-1">
                          {item.name}
                          {item.isMiscellaneous && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openNoteModal(item.id)}
                              className="h-6 w-6 p-0"
                              title={item.note || 'Not ekle'}
                            >
                              <FileText className={`h-3 w-3 ${item.note ? 'text-blue-600' : 'text-gray-400'}`} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            updateQuantity(item.id, newQty);
                          }}
                          className="w-16 h-8 text-center text-sm p-1 mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-xs sm:text-sm">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value) || 0;
                            updateItemPrice(item.id, newPrice);
                          }}
                          className="w-24 h-8 text-right text-sm p-1 ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm font-medium">{(item.unitPrice * item.qty).toFixed(2)} ₺</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500 text-sm">
                      Sepet boş
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column - Payment & Products (1/3) */}
        <div className="w-full lg:w-1/3 flex flex-col" style={{ height: '100%' }}>
          {/* Payment Area */}
          <div className="flex flex-col bg-white rounded-lg shadow p-2 sm:p-4 gap-3 mb-4">
            {/* Totals Row */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              <Card>
                <CardHeader className="p-1 sm:p-2 pb-0.5 sm:pb-1">
                  <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Ödenen</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 pt-0">
                  <div className="text-sm sm:text-lg font-bold">{state.paid.toFixed(2)} ₺</div>
                </CardContent>
              </Card>
              <Card className="border-red-500">
                <CardHeader className="p-1 sm:p-2 pb-0.5 sm:pb-1">
                  <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Tutar</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 pt-0">
                  <div className="text-sm sm:text-lg font-bold text-red-500">{activeCart.net.toFixed(2)} ₺</div>
                </CardContent>
              </Card>
              <Card className="border-green-500">
                <CardHeader className="p-1 sm:p-2 pb-0.5 sm:pb-1">
                  <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Para Üstü</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 pt-0">
                  <div className="text-sm sm:text-lg font-bold text-green-500">
                    {Math.max(state.paid - activeCart.net, 0).toFixed(2)} ₺
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer and Time */}
            <div className="flex flex-col gap-2">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1 customer-dropdown-container">
                  <Input
                    placeholder="Müşteri ara (ad veya telefon)..."
                    className="text-xs sm:text-sm pr-8"
                    value={customerSearchQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => {
                      if (customerSearchQuery.length >= 2 && customers.length > 0) {
                        setShowCustomerDropdown(true);
                      }
                    }}
                  />
                  {isSearchingCustomers && (
                    <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}

                  {/* Customer Dropdown */}
                  {showCustomerDropdown && customers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {customers.map((customer) => (
                        <div
                          key={customer.id}
                          className={`p-2 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 ${customer.is_active === false ? 'bg-gray-100' : ''}`}
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{customer.name}</div>
                            {customer.is_active === false && (
                              <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded">Pasif</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span>{customer.phone || 'Telefon yok'}</span>
                            {customer.current_balance && customer.current_balance > 0 && (
                              <span className="text-red-600">Borç: {customer.current_balance.toFixed(2)} ₺</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCustomers[state.activeCustomerTab] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={clearCustomer}
                  >
                    Temizle
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setShowQuickCustomerModal(true);
                      setShowCustomerDropdown(false);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Yeni
                  </Button>
                )}
              </div>

              {/* Selected Customer Info */}
              {selectedCustomers[state.activeCustomerTab] && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs space-y-2">
                  <div>
                    <div className="font-medium text-blue-900">
                      {selectedCustomers[state.activeCustomerTab]!.name}
                    </div>
                    <div className="text-blue-700 flex justify-between mt-1">
                      <span>{selectedCustomers[state.activeCustomerTab]!.phone || 'Telefon yok'}</span>
                      {selectedCustomers[state.activeCustomerTab]!.current_balance > 0 && (
                        <span className="text-red-600 font-medium">
                          Borç: {selectedCustomers[state.activeCustomerTab]!.current_balance.toFixed(2)} ₺
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vade Tarihi Seçimi */}
                  <div className="border-t border-blue-200 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useDueDate}
                        onChange={(e) => {
                          setUseDueDate(e.target.checked);
                          if (!e.target.checked) {
                            setDueDate('');
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-blue-900 font-medium">Vade Tarihi Belirle</span>
                    </label>
                    <p className="text-[10px] text-blue-700 mt-1">
                      * Sadece açık hesap ve karma ödemelerde geçerlidir
                    </p>

                    {useDueDate && (
                      <div className="mt-2">
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={getLocalDateString()}
                          className="text-xs h-8"
                          placeholder="Vade tarihi seçin"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between text-[10px] sm:text-xs text-muted-foreground gap-1">
                <span>{state.now}</span>
                <span>
                  Limit: {state.limit.toFixed(2)} ₺ | Kalan: {state.remaining.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Paid Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Alınan Tutar</label>
              <Input
                type="number"
                placeholder="0.00"
                className="text-lg h-12 text-right font-bold"
                value={state.paid || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setState((prev: POSState) => ({
                    ...prev,
                    paid: value,
                    change: Math.max(0, value - activeCart.net),
                  }));
                }}
                onFocus={(e) => e.target.select()}
              />
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <Button
                variant="default"
                className="bg-green-500 hover:bg-green-600 h-12 sm:h-14"
                onClick={() => handlePayment('cash')}
                disabled={isProcessingPayment || activeCart.lines.length === 0}
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-center text-xs sm:text-sm">
                    <div>₺ (F8)</div>
                    <div>NAKİT</div>
                  </div>
                )}
              </Button>
              <Button
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 h-12 sm:h-14"
                onClick={() => handlePayment('pos')}
                disabled={isProcessingPayment || activeCart.lines.length === 0}
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-center text-xs sm:text-sm">
                    <div>💳 (F9)</div>
                    <div>POS</div>
                  </div>
                )}
              </Button>
              <Button
                variant="default"
                className="bg-yellow-500 hover:bg-yellow-600 h-12 sm:h-14"
                onClick={() => handlePayment('openAccount')}
                disabled={isProcessingPayment || activeCart.lines.length === 0}
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-center text-xs sm:text-sm">
                    <div>🧾 (F10)</div>
                    <div>AÇIK HESAP</div>
                  </div>
                )}
              </Button>
              <Button
                variant="default"
                className="h-12 sm:h-14 text-white"
                style={{ backgroundColor: '#9333ea' }}
                onClick={() => handlePayment('split')}
                disabled={isProcessingPayment || activeCart.lines.length === 0}
              >
                {isProcessingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="text-center text-xs sm:text-sm">
                    <div>🔀</div>
                    <div>PARÇALI</div>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Product Selection Area */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow p-2 sm:p-4 gap-2 sm:gap-3" style={{ minHeight: '0' }}>
            {/* Category Tabs */}
            <Tabs
              value={state.selectedCategory}
              onValueChange={(value: string) => {
                setState((prev: POSState) => ({ ...prev, selectedCategory: value }));
              }}
            >
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                {state.categories.map((category: string) => (
                  <TabsTrigger key={category} value={category} className="text-[10px] sm:text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Product Presets */}
            <div
              className="border rounded flex-1"
              style={{
                overflowY: 'scroll',
                overflowX: 'hidden',
                minHeight: '0',
                maxHeight: 'calc(100vh - 300px)'
              }}
            >
              {isLoadingFastSale ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : fastSaleProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <p className="text-sm">Hızlı satış ürünü bulunamadı</p>
                  <p className="text-xs mt-1">Ürün yönetiminden ekleyebilirsiniz</p>
                </div>
              ) : (
                fastSaleProducts
                  .filter(product => {
                    const selectedCat = fastSaleCategories.find(c => c.name === state.selectedCategory);
                    return selectedCat ? product.category_id === selectedCat.id : false;
                  })
                  .map((product) => (
                    <div
                      key={product.id}
                      className="p-2 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center text-xs sm:text-sm"
                      onClick={() => {
                        const price = getPriceByList(product);
                        const posProduct: Product = {
                          id: product.id,
                          barcode: product.barcode,
                          name: product.name,
                          unitPrice: price,
                          qty: 1,
                          discount: 0,
                          currency: 'TRY',
                          vatRate: 18,
                          category: product.category_name,
                        };
                        addToCart(posProduct);
                      }}
                    >
                      <span className="truncate mr-2">{product.name}</span>
                      <span className="font-medium whitespace-nowrap">{getPriceByList(product).toFixed(2)} ₺</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price Check Modal */}
      <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Fiyat Sorgula</DialogTitle>
            <DialogDescription>
              Ürün barkodunu okutarak fiyat bilgisini sorgulayabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Barcode Input */}
            <div className="relative">
              {isPriceChecking ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <Input
                ref={priceCheckInputRef}
                placeholder="Barkod okutunuz..."
                className="pl-11 text-lg h-12"
                disabled={isPriceChecking}
                value={priceCheckBarcode}
                onChange={(e) => setPriceCheckBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && priceCheckBarcode.trim()) {
                    handlePriceCheck(priceCheckBarcode);
                    setPriceCheckBarcode('');
                  }
                }}
              />
            </div>

            {/* Product Info Display */}
            {priceCheckProduct && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center space-y-3 border-2 border-blue-200">
                <div className="text-gray-700 font-medium text-lg">
                  {priceCheckProduct.name}
                </div>
                <div className="text-blue-600 font-bold text-5xl">
                  {priceCheckProduct.sale_price.toFixed(2)} ₺
                </div>
                <div className="text-gray-500 text-sm">
                  Barkod: {priceCheckProduct.barcode}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!priceCheckProduct && !isPriceChecking && (
              <div className="text-center py-8 text-gray-400">
                <Barcode className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Barkod okutarak fiyat sorgulayın</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Customer Modal */}
      <QuickCustomerModal
        isOpen={showQuickCustomerModal}
        onClose={() => {
          setShowQuickCustomerModal(false);
          setCustomerSearchQuery('');
        }}
        onCustomerCreated={handleCustomerCreated}
        initialName={customerSearchQuery}
      />

      {/* Split Payment Modal */}
      <SplitPaymentModal
        isOpen={showSplitPaymentModal}
        onClose={() => setShowSplitPaymentModal(false)}
        totalAmount={activeCart.net}
        hasCustomer={!!selectedCustomers[state.activeCustomerTab]}
        onConfirm={handleSplitPayment}
      />

      {/* Ürün Notu Modal - Küçük ve basit */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ürün Notu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="Not girin..."
              value={miscItemNote}
              onChange={(e) => setMiscItemNote(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveItemNote();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNoteModal(false);
                setNoteForItem(null);
                setMiscItemNote('');
              }}
            >
              İptal
            </Button>
            <Button onClick={saveItemNote}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Satış Notu Modal */}
      <Dialog open={showSaleNoteModal} onOpenChange={setShowSaleNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Satış Notu</DialogTitle>
            <DialogDescription>
              Bu not satış kaydına eklenecektir
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Satış ile ilgili notlarınızı buraya yazın..."
              value={saleNote}
              onChange={(e) => setSaleNote(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSaleNoteModal(false);
              }}
            >
              İptal
            </Button>
            <Button onClick={() => {
              setShowSaleNoteModal(false);
              showToast.success('Satış notu kaydedildi');
            }}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ödeme Alma Modal */}
      <Dialog open={showPaymentReceiveModal} onOpenChange={setShowPaymentReceiveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Al</DialogTitle>
            <DialogDescription>
              {selectedCustomers[state.activeCustomerTab]?.name} için ödeme kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-receive-amount">Ödeme Tutarı (₺)</Label>
              <Input
                id="payment-receive-amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentReceiveAmount}
                onChange={(e) => setPaymentReceiveAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
              {selectedCustomers[state.activeCustomerTab] && selectedCustomers[state.activeCustomerTab]!.current_balance > 0 && (
                <p className="text-sm text-gray-500">
                  Güncel Borç: {selectedCustomers[state.activeCustomerTab]!.current_balance.toFixed(2)} ₺
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ödeme Tipi</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={paymentReceiveType === 'cash' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentReceiveType('cash')}
                >
                  Nakit
                </Button>
                <Button
                  type="button"
                  variant={paymentReceiveType === 'pos' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentReceiveType('pos')}
                >
                  Kredi Kartı
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentReceiveModal(false);
                setPaymentReceiveAmount('');
                setPaymentReceiveType('cash');
              }}
              disabled={isProcessingPayment}
            >
              İptal
            </Button>
            <Button
              onClick={handlePaymentReceive}
              disabled={isProcessingPayment || !paymentReceiveAmount || parseFloat(paymentReceiveAmount) <= 0}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Ödemeyi Kaydet'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pasif Müşteri Onay Modal */}
      <Dialog open={showInactiveCustomerModal} onOpenChange={(open) => {
        if (!open) {
          setShowInactiveCustomerModal(false);
          setPendingInactiveCustomer(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Müşteri Pasif Durumda
            </DialogTitle>
            <DialogDescription>
              <strong>{pendingInactiveCustomer?.name}</strong> müşterisi pasif durumda.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">Önemli Uyarı</p>
                  <p className="text-sm text-yellow-800">
                    Pasif müşteriler ile açık hesap (veresiye) satış yapılamaz.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Ne yapmak istersiniz?</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Aktif Et:</strong> Müşteri aktif edilir ve tüm işlemler yapılabilir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold">•</span>
                  <span><strong>Pasif Kalsın:</strong> Müşteri seçilir ancak açık hesap satış yapılamaz</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleInactiveCustomerConfirm(false)}
            >
              Pasif Kalsın
            </Button>
            <Button
              onClick={() => handleInactiveCustomerConfirm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Aktif Et
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ürün Bulunamadı Modal */}
      <ProductNotFoundModal
        isOpen={showProductNotFoundModal}
        onClose={handleProductNotFoundClose}
        onAddNewProduct={handleAddNewProduct}
        barcode={notFoundBarcode}
      />

      {/* Hızlı Ürün Ekleme Modal */}
      <QuickProductAddModal
        isOpen={showQuickProductAddModal}
        onClose={handleQuickProductAddClose}
        onProductAdded={handleProductAdded}
        barcode={notFoundBarcode}
      />
    </Layout>
  );
};

export default FastSalePage;
