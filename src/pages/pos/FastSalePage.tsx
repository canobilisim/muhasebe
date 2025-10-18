import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Barcode, Search, Printer, PlusCircle, Trash2 } from 'lucide-react';
import { POSState, Product, Cart } from '@/types/pos';
import { Layout } from '@/components/layout/Layout';

const initialCart: Cart = {
  tabId: 'tab-1',
  customerLabel: 'Müşteri 1',
  lines: [],
  gross: 0,
  discountTotal: 0,
  net: 0,
};

const initialPresets = [
  { id: 'p-hd-nano', name: 'HD HAYALET NANO', price: 250.0, category: 'ANA' },
  { id: 'p-hd-nano2', name: 'HD NANO', price: 200.0, category: 'AKSESUAR' },
  { id: 'p-turkcell-line', name: 'TURKCELL YENİ HAT', price: 1100.0, category: 'TELEFON' },
  { id: 'p-sim-repl', name: 'YEDEK SIM KART', price: 200.0, category: 'TELEFON' },
  { id: 'p-prepay', name: 'ÖN ÖDEME', price: 1.0, category: 'TAMİR' },
  { id: 'p-paycell', name: 'PAYCELL KART', price: 20.0, category: 'AKSESUAR' },
  { id: 'p-kilif', name: 'TELEFON KILIFI', price: 50.0, category: 'AKSESUAR' },
  { id: 'p-sarj', name: 'ŞARJ ALETI', price: 150.0, category: 'AKSESUAR' },
  { id: 'p-kablo', name: 'USB KABLO', price: 75.0, category: 'AKSESUAR' },
  { id: 'p-kulaklik', name: 'KULAKLIK', price: 300.0, category: 'AKSESUAR' },
  { id: 'p-powerbank', name: 'POWERBANK', price: 400.0, category: 'AKSESUAR' },
  { id: 'p-ekran-koruyucu', name: 'EKRAN KORUYUCU', price: 80.0, category: 'AKSESUAR' },
  { id: 'p-tamir-1', name: 'EKRAN DEĞİŞİMİ', price: 800.0, category: 'TAMİR' },
  { id: 'p-tamir-2', name: 'BATARYA DEĞİŞİMİ', price: 350.0, category: 'TAMİR' },
  { id: 'p-tamir-3', name: 'KAMERA TAMİRİ', price: 450.0, category: 'TAMİR' },
  { id: 'p-tamir-4', name: 'ŞARJ SOKETI TAMİRİ', price: 250.0, category: 'TAMİR' },
  { id: 'p-tel-1', name: 'SAMSUNG A54', price: 12000.0, category: 'TELEFON' },
  { id: 'p-tel-2', name: 'IPHONE 13', price: 25000.0, category: 'TELEFON' },
  { id: 'p-tel-3', name: 'XIAOMI REDMI NOTE 12', price: 8500.0, category: 'TELEFON' },
  { id: 'p-2el-1', name: 'IPHONE 11 (2.EL)', price: 15000.0, category: '2. EL' },
];

const FastSalePage: React.FC = () => {
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
    categories: ['ANA', 'AKSESUAR', 'TAMİR', 'TELEFON', '2. EL'],
    quickAmounts: [20, 50, 100, 200],
    quickAdjustments: [-10, -10],
    selectedCategory: 'ANA',
    now: new Date().toLocaleString('tr-TR'),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        now: new Date().toLocaleString('tr-TR'),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleBarcodeScan = (barcode: string) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      barcode,
      name: `Ürün ${barcode}`,
      unitPrice: 100,
      qty: 1,
      discount: 0,
      currency: 'TRY',
      vatRate: 18,
      category: 'GENEL',
    };
    addToCart(newProduct);
  };

  const addToCart = (product: Product) => {
    setState(prev => {
      const activeCartIndex = prev.carts.findIndex(cart => cart.tabId === prev.activeCustomerTab);
      if (activeCartIndex === -1) return prev;

      const updatedCarts = [...prev.carts];
      const existingItemIndex = updatedCarts[activeCartIndex].lines.findIndex(
        item => item.barcode === product.barcode
      );

      if (existingItemIndex >= 0) {
        updatedCarts[activeCartIndex].lines[existingItemIndex].qty += 1;
      } else {
        updatedCarts[activeCartIndex].lines.push({
          ...product,
          lineTotal: product.unitPrice * product.qty,
        });
      }

      updatedCarts[activeCartIndex] = calculateCartTotals(updatedCarts[activeCartIndex]);

      return {
        ...prev,
        carts: updatedCarts,
      };
    });
  };

  const calculateCartTotals = (cart: Cart): Cart => {
    const gross = cart.lines.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
    const discountTotal = cart.lines.reduce((sum, item) => sum + (item.unitPrice * item.qty * item.discount), 0);
    const net = gross - discountTotal;

    return {
      ...cart,
      gross,
      discountTotal,
      net,
    };
  };

  const handlePayment = (type: 'cash' | 'pos' | 'openAccount' | 'split') => {
    console.log('Processing payment:', type);
    setState(prev => ({
      ...prev,
      paid: prev.net,
      change: 0,
    }));
  };

  const handleQuickAmount = (amount: number) => {
    setState(prev => ({
      ...prev,
      paid: Math.max(0, prev.paid + amount),
      change: Math.max(0, prev.paid + amount - prev.net),
    }));
  };

  const removeFromCart = (itemId: string) => {
    setState(prev => {
      const activeCartIndex = prev.carts.findIndex(cart => cart.tabId === prev.activeCustomerTab);
      if (activeCartIndex === -1) return prev;

      const updatedCarts = [...prev.carts];
      updatedCarts[activeCartIndex].lines = updatedCarts[activeCartIndex].lines.filter(
        item => item.id !== itemId
      );

      // Recalculate cart totals
      updatedCarts[activeCartIndex] = calculateCartTotals(updatedCarts[activeCartIndex]);

      return {
        ...prev,
        carts: updatedCarts,
      };
    });
  };

  const activeCart = state.carts.find(cart => cart.tabId === state.activeCustomerTab) || state.carts[0];

  return (
    <Layout title="Hızlı Satış" subtitle={state.activePriceList}>
      <div className="flex bg-gray-100 gap-4 p-4" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Left Column - Cart Area (2/3) */}
        <div className="w-2/3 flex flex-col bg-white rounded-lg shadow p-4" style={{ height: '100%' }}>
          {/* Top Bar */}
          <div className="flex gap-2 mb-3">
            <select
              className="border rounded px-3 py-2 text-sm w-32"
              value={state.activePriceList}
              onChange={(e) => setState(prev => ({ ...prev, activePriceList: e.target.value }))}
            >
              <option>Fiyat 1</option>
              <option>Fiyat 2</option>
              <option>Fiyat 3</option>
            </select>

            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün barkodunu okutunuz..."
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleBarcodeScan(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Ara
            </Button>

            <Button variant="outline">Fiyat Gör</Button>
            <Button variant="default">
              <Printer className="h-4 w-4 mr-2" />
              Yazdır
            </Button>
            <Button variant="default">
              <PlusCircle className="h-4 w-4 mr-2" />
              Ödeme Ekle
            </Button>
          </div>

          {/* Cart Tabs */}
          <Tabs
            value={state.activeCustomerTab}
            onValueChange={(value: string) => setState(prev => ({ ...prev, activeCustomerTab: value }))}
            className="mb-3"
          >
            <TabsList className="grid w-full grid-cols-5">
              {state.carts.map((cart) => (
                <TabsTrigger key={cart.tabId} value={cart.tabId}>
                  {cart.customerLabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Cart Items */}
          <div
            className="border rounded-lg bg-white flex-1"
            style={{
              minHeight: '0',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'scroll',
              overflowX: 'hidden'
            }}
          >
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                <TableRow>
                  <TableHead className="w-[50px]">Sil</TableHead>
                  <TableHead>Barkod</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead className="text-right">Birim Fiyat</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCart.lines.length > 0 ? (
                  activeCart.lines.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>{item.barcode}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toFixed(2)} ₺</TableCell>
                      <TableCell className="text-right">{(item.unitPrice * item.qty).toFixed(2)} ₺</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                      Sepet boş
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column - Payment & Products (1/3) */}
        <div className="w-1/3 flex flex-col" style={{ height: '100%' }}>
          {/* Payment Area */}
          <div className="flex flex-col bg-white rounded-lg shadow p-4 gap-3 mb-4">
            {/* Totals Row */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Ödenen</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-lg font-bold">{state.paid.toFixed(2)} ₺</div>
                </CardContent>
              </Card>
              <Card className="border-red-500">
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Tutar</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-lg font-bold text-red-500">{activeCart.net.toFixed(2)} ₺</div>
                </CardContent>
              </Card>
              <Card className="border-green-500">
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Para Üstü</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-lg font-bold text-green-500">
                    {Math.max(state.paid - activeCart.net, 0).toFixed(2)} ₺
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer and Time */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-1 text-sm flex-1">
                  <option>Müşteri Seç</option>
                </select>
                <Button variant="outline" size="sm">
                  Seç
                </Button>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{state.now}</span>
                <span>Limit: 0.00 Kalan: 0.00</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[...state.quickAmounts, 10, -10].map((amount, index) => (
                <Button
                  key={index}
                  variant={amount < 0 ? 'destructive' : 'outline'}
                  onClick={() => handleQuickAmount(amount)}
                  className="h-10 text-sm"
                >
                  {amount >= 0 ? `+${amount}` : amount}
                </Button>
              ))}
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="default"
                className="bg-green-500 hover:bg-green-600 h-14"
                onClick={() => handlePayment('cash')}
              >
                <div className="text-center text-sm">
                  <div>₺ (F8)</div>
                  <div>NAKİT</div>
                </div>
              </Button>
              <Button
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 h-14"
                onClick={() => handlePayment('pos')}
              >
                <div className="text-center text-sm">
                  <div>💳 (F9)</div>
                  <div>POS</div>
                </div>
              </Button>
              <Button
                variant="default"
                className="bg-yellow-500 hover:bg-yellow-600 h-14"
                onClick={() => handlePayment('openAccount')}
              >
                <div className="text-center text-sm">
                  <div>🧾 (F10)</div>
                  <div>AÇIK HESAP</div>
                </div>
              </Button>
              <Button
                variant="default"
                className="bg-purple-500 hover:bg-purple-600 h-14"
                onClick={() => handlePayment('split')}
              >
                <div className="text-center text-sm">
                  <div>🔀</div>
                  <div>PARÇALI</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Product Selection Area */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow p-4 gap-3" style={{ minHeight: '0' }}>
            {/* Category Tabs */}
            <Tabs
              value={state.selectedCategory}
              onValueChange={(value: string) => {
                setState(prev => ({ ...prev, selectedCategory: value }));
              }}
            >
              <TabsList className="grid w-full grid-cols-5">
                {state.categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
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
              {initialPresets
                .filter(preset => preset.category === state.selectedCategory || state.selectedCategory === 'ANA')
                .map((preset) => (
                  <div
                    key={preset.id}
                    className="p-2 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center text-sm"
                    onClick={() => {
                      const product: Product = {
                        id: preset.id,
                        barcode: preset.id,
                        name: preset.name,
                        unitPrice: preset.price,
                        qty: 1,
                        discount: 0,
                        currency: 'TRY',
                        vatRate: 18,
                        category: preset.category,
                      };
                      addToCart(product);
                    }}
                  >
                    <span>{preset.name}</span>
                    <span className="font-medium">{preset.price.toFixed(2)} ₺</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FastSalePage;
