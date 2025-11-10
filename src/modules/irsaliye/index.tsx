import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import {
    Plus,
    Save,
    FileText,
    Receipt,
    Truck,
    User,
    Calendar,
    Package,
    DollarSign,
    Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { IrsaliyeFormData, IrsaliyeUrunuForm, CariInfo } from '@/types/irsaliye';
import { useIrsaliyeStore } from '@/stores/irsaliyeStore';

const YeniIrsaliye: React.FC = () => {
    const {
        cariList,
        urunList,
        isLoading,
        error,
        loadCariList,
        loadUrunList,
        searchUrunByBarkod,
        createIrsaliye,
        generateNextIrsaliyeNo,
        generatePDF,
        clearError
    } = useIrsaliyeStore();

    const [formData, setFormData] = useState<IrsaliyeFormData>({
        cari_turu: 'Müşteri',
        cari_id: null,
        irsaliye_turu: 'Satış',
        irsaliye_no: '',
        irsaliye_tarihi: new Date().toISOString().split('T')[0],
        sevk_tarihi: new Date().toISOString().split('T')[0],
        sevk_yeri: '',
        durum: 'Taslak',
        aciklama: '',
        urunler: []
    });

    const [selectedCari, setSelectedCari] = useState<CariInfo | null>(null);
    const [currentUrunRow, setCurrentUrunRow] = useState<IrsaliyeUrunuForm>({
        urun_id: null,
        urun_adi: '',
        barkod: '',
        miktar: 1,
        birim: 'Adet',
        birim_fiyat: 0,
        tutar: 0,
        seri_no: '',
        aciklama: ''
    });
    const [urunSearchTerm, setUrunSearchTerm] = useState('');

    const barkodInputRef = useRef<HTMLInputElement>(null);

    // İlk yükleme
    useEffect(() => {
        initializeForm();
        loadCariList();
    }, []);

    // Cari türü değiştiğinde cari listesini yenile
    useEffect(() => {
        loadCariList();
    }, [formData.cari_turu]);

    const initializeForm = async () => {
        try {
            const nextNo = await generateNextIrsaliyeNo();
            setFormData(prev => ({ ...prev, irsaliye_no: nextNo }));
        } catch (error) {
            toast.error('İrsaliye numarası oluşturulamadı');
        }
    };

    // Cari seçimi değiştiğinde
    const handleCariSelect = (cariId: string) => {
        const cari = cariList.find(c => c.id.toString() === cariId);
        if (cari) {
            setSelectedCari(cari);
            setFormData(prev => ({
                ...prev,
                cari_id: cari.id,
                sevk_yeri: cari.adres || ''
            }));
        }
    };

    // Ürün arama
    const handleUrunSearch = async (searchTerm: string) => {
        setUrunSearchTerm(searchTerm);
        if (searchTerm.length >= 2) {
            await loadUrunList(searchTerm);
        }
    };

    // Barkod ile ürün arama
    const handleBarkodSearch = async (barkod: string) => {
        if (barkod.length >= 3) {
            const urun = await searchUrunByBarkod(barkod);
            if (urun) {
                setCurrentUrunRow(prev => ({
                    ...prev,
                    urun_id: urun.id,
                    urun_adi: urun.ad,
                    barkod: urun.barkod || '',
                    birim_fiyat: urun.satis_fiyati || 0,
                    tutar: prev.miktar * (urun.satis_fiyati || 0)
                }));
                toast.success(`Ürün bulundu: ${urun.ad}`);
            } else {
                toast.warning('Barkod bulunamadı');
            }
        }
    };

    // Ürün ekleme
    const handleUrunEkle = () => {
        if (!currentUrunRow.urun_adi || currentUrunRow.miktar <= 0) {
            toast.error('Ürün adı ve miktar zorunludur');
            return;
        }

        // Stok kontrolü (sadece satış irsaliyesi için)
        if (formData.irsaliye_turu === 'Satış' && currentUrunRow.urun_id) {
            const urun = urunList.find(u => u.id === currentUrunRow.urun_id);
            if (urun && urun.stok_miktari < currentUrunRow.miktar) {
                toast.error(`Yetersiz stok! Mevcut: ${urun.stok_miktari} ${currentUrunRow.birim}`);
                return;
            }
        }

        const yeniUrun: IrsaliyeUrunuForm = {
            ...currentUrunRow,
            tutar: currentUrunRow.miktar * currentUrunRow.birim_fiyat
        };

        setFormData(prev => ({
            ...prev,
            urunler: [...prev.urunler, yeniUrun]
        }));

        // Formu temizle
        setCurrentUrunRow({
            urun_id: null,
            urun_adi: '',
            barkod: '',
            miktar: 1,
            birim: 'Adet',
            birim_fiyat: 0,
            tutar: 0,
            seri_no: '',
            aciklama: ''
        });
        setUrunSearchTerm('');

        // Barkod inputuna odaklan
        setTimeout(() => {
            barkodInputRef.current?.focus();
        }, 100);
    };

    // Ürün silme
    const handleUrunSil = (index: number) => {
        setFormData(prev => ({
            ...prev,
            urunler: prev.urunler.filter((_, i) => i !== index)
        }));
    };

    // Toplamları hesapla
    const toplamlar = {
        kalem: formData.urunler.length,
        miktar: formData.urunler.reduce((sum, urun) => sum + urun.miktar, 0),
        tutar: formData.urunler.reduce((sum, urun) => sum + (urun.tutar || 0), 0)
    };

    // Kaydet
    const handleKaydet = async () => {
        if (!formData.cari_id) {
            toast.error('Cari seçimi zorunludur');
            return;
        }

        if (formData.urunler.length === 0) {
            toast.error('En az bir ürün eklemelisiniz');
            return;
        }

        try {
            const savedIrsaliye = await createIrsaliye(formData);
            toast.success(`İrsaliye başarıyla kaydedildi: ${savedIrsaliye.irsaliye_no}`);

            // Formu sıfırla
            await initializeForm();
            setFormData(prev => ({
                ...prev,
                cari_id: null,
                sevk_yeri: '',
                aciklama: '',
                urunler: []
            }));
            setSelectedCari(null);
        } catch (error) {
            toast.error('Kaydetme sırasında hata oluştu');
        }
    };

    // PDF oluştur
    const handlePDFOlustur = async () => {
        if (!formData.cari_id || formData.urunler.length === 0) {
            toast.error('Önce irsaliye bilgilerini tamamlayın');
            return;
        }

        try {
            // Önce kaydet
            const savedIrsaliye = await createIrsaliye(formData);
            toast.success('İrsaliye kaydedildi');

            // Sonra PDF oluştur
            const pdfUrl = await generatePDF(savedIrsaliye.id!);
            toast.success('PDF başarıyla oluşturuldu');

            // PDF'i yeni sekmede aç
            window.open(pdfUrl, '_blank');

            // Formu sıfırla
            await initializeForm();
            setFormData(prev => ({
                ...prev,
                cari_id: null,
                sevk_yeri: '',
                aciklama: '',
                urunler: []
            }));
            setSelectedCari(null);
        } catch (error) {
            toast.error('PDF oluşturma sırasında hata oluştu');
        }
    };

    // Faturaya dönüştür
    const handleFaturayaDonustur = () => {
        if (!formData.cari_id || formData.urunler.length === 0) {
            toast.error('Önce irsaliye bilgilerini tamamlayın');
            return;
        }

        toast.info('Faturaya dönüştürülüyor...');
        // Fatura sayfasına yönlendirme veya modal açma işlemi
    };

    // Klavye kısayolları
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                handleKaydet();
            } else if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                handlePDFOlustur();
            } else if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                barkodInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [formData]);

    // Enter tuşu ile yeni satır ekleme
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.currentTarget === barkodInputRef.current) {
                // Barkod arama
                handleBarkodSearch(currentUrunRow.barkod);
            } else {
                // Ürün ekle
                handleUrunEkle();
            }
        }
    };

    // Hata mesajını göster
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error]);

    return (
        <Layout
            title="Yeni İrsaliye"
            subtitle="Mal sevkiyatı ve teslim işlemleri için irsaliye düzenleme"
        >
            <div className="space-y-6">
                {/* Header Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Hash className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 font-medium">İrsaliye No</p>
                            <p className="text-lg font-bold text-blue-900">{formData.irsaliye_no}</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 font-medium">Kalem</p>
                            <p className="text-lg font-bold text-green-900">{toplamlar.kalem} Adet</p>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Truck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Toplam Miktar</p>
                            <p className="text-lg font-bold text-purple-900">{toplamlar.miktar}</p>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Toplam Tutar</p>
                            <p className="text-lg font-bold text-orange-900">₺{toplamlar.tutar.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cari Seçimi */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {formData.cari_turu === 'Müşteri' ? 'Müşteri' : 'Tedarikçi'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCari ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <User className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900">{selectedCari.ad}</p>
                                                <p className="text-sm text-green-700">
                                                    {selectedCari.telefon || selectedCari.vergi_no || 'Bilgi yok'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedCari(null);
                                                setFormData(prev => ({ ...prev, cari_id: null, sevk_yeri: '' }));
                                            }}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            Değiştir
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cari_turu">Cari Türü *</Label>
                                                <Select
                                                    value={formData.cari_turu}
                                                    onValueChange={(value: string) =>
                                                        setFormData(prev => ({ ...prev, cari_turu: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Müşteri">Müşteri</SelectItem>
                                                        <SelectItem value="Tedarikçi">Tedarikçi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cari_sec">Cari Seç *</Label>
                                                <Select onValueChange={handleCariSelect}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Cari seçiniz..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cariList.map(cari => (
                                                            <SelectItem key={cari.id} value={cari.id.toString()}>
                                                                {cari.ad}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ürün Girişi */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Ürün ve Hizmetler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Ürün Ekleme Formu */}
                                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
                                    <div className="space-y-2">
                                        <Label>Barkod / Ürün Adı *</Label>
                                        <div className="relative">
                                            <Input
                                                ref={barkodInputRef}
                                                value={currentUrunRow.barkod || urunSearchTerm}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCurrentUrunRow(prev => ({ ...prev, barkod: value }));
                                                    handleUrunSearch(value);
                                                }}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Barkod okut veya ürün ara..."
                                            />
                                            {urunList.length > 0 && urunSearchTerm && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                                    {urunList.map(urun => (
                                                        <div
                                                            key={urun.id}
                                                            className="p-2 hover:bg-muted cursor-pointer border-b"
                                                            onClick={() => {
                                                                setCurrentUrunRow(prev => ({
                                                                    ...prev,
                                                                    urun_id: urun.id,
                                                                    urun_adi: urun.ad,
                                                                    barkod: urun.barkod || '',
                                                                    birim_fiyat: urun.satis_fiyati || 0,
                                                                    tutar: prev.miktar * (urun.satis_fiyati || 0)
                                                                }));
                                                                setUrunSearchTerm('');
                                                            }}
                                                        >
                                                            <div className="font-medium">{urun.ad}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Barkod: {urun.barkod || 'Yok'} | Stok: {urun.stok_miktari} {urun.birim || 'Adet'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Miktar *</Label>
                                        <Input
                                            type="number"
                                            value={currentUrunRow.miktar}
                                            onChange={(e) =>
                                                setCurrentUrunRow(prev => ({ ...prev, miktar: Number(e.target.value) }))
                                            }
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Birim</Label>
                                        <Select
                                            value={currentUrunRow.birim}
                                            onValueChange={(value: string) =>
                                                setCurrentUrunRow(prev => ({ ...prev, birim: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Adet">Adet</SelectItem>
                                                <SelectItem value="Kg">Kg</SelectItem>
                                                <SelectItem value="Kutu">Kutu</SelectItem>
                                                <SelectItem value="Litre">Litre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Birim Fiyat</Label>
                                        <Input
                                            type="number"
                                            value={currentUrunRow.birim_fiyat}
                                            onChange={(e) =>
                                                setCurrentUrunRow(prev => ({ ...prev, birim_fiyat: Number(e.target.value) }))
                                            }
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Seri/Lot No</Label>
                                        <Input
                                            value={currentUrunRow.seri_no}
                                            onChange={(e) =>
                                                setCurrentUrunRow(prev => ({ ...prev, seri_no: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Açıklama</Label>
                                        <Input
                                            value={currentUrunRow.aciklama}
                                            onChange={(e) =>
                                                setCurrentUrunRow(prev => ({ ...prev, aciklama: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <Button onClick={handleUrunEkle} className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ekle
                                        </Button>
                                    </div>
                                </div>

                                {/* Ürün Tablosu */}
                                <div className="border rounded-lg">
                                    <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
                                        <div className="col-span-3">Ürün/Hizmet</div>
                                        <div className="col-span-1 text-center">Miktar</div>
                                        <div className="col-span-1 text-center">Birim</div>
                                        <div className="col-span-2 text-center">Birim Fiyat</div>
                                        <div className="col-span-2 text-center">Tutar</div>
                                        <div className="col-span-2 text-center">Seri/Lot</div>
                                        <div className="col-span-1 text-center"></div>
                                    </div>

                                    {formData.urunler.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>Ürün seç</p>
                                            <p className="text-sm">Ürün/hizmet alanına yazmaya başlayarak arama yapabilir, miktar ve fiyat değiştirerek anlık hesaplama görebilirsiniz</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {formData.urunler.map((urun, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center">
                                                    <div className="col-span-3">
                                                        <p className="font-medium">{urun.urun_adi}</p>
                                                        {urun.barkod && (
                                                            <p className="text-xs text-gray-500">Barkod: {urun.barkod}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 text-center">{urun.miktar}</div>
                                                    <div className="col-span-1 text-center text-sm">{urun.birim}</div>
                                                    <div className="col-span-2 text-center">₺{urun.birim_fiyat?.toFixed(2) || '0.00'}</div>
                                                    <div className="col-span-2 text-center font-medium">
                                                        ₺{urun.tutar?.toFixed(2) || '0.00'}
                                                    </div>
                                                    <div className="col-span-2 text-center text-sm">{urun.seri_no || '-'}</div>
                                                    <div className="col-span-1 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUrunSil(index)}
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
                    </div>

                    {/* Right Column - İrsaliye Details & Actions */}
                    <div className="space-y-6">
                        {/* İrsaliye Detayları */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    İrsaliye Detayları
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="irsaliye_turu" className="text-sm">İrsaliye Türü</Label>
                                        <Select
                                            value={formData.irsaliye_turu}
                                            onValueChange={(value: string) =>
                                                setFormData(prev => ({ ...prev, irsaliye_turu: value }))
                                            }
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Satış">Satış</SelectItem>
                                                <SelectItem value="Alış">Alış</SelectItem>
                                                <SelectItem value="İade">İade</SelectItem>
                                                <SelectItem value="Transfer">Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="durum" className="text-sm">Durum</Label>
                                        <Select
                                            value={formData.durum}
                                            onValueChange={(value: string) =>
                                                setFormData(prev => ({ ...prev, durum: value }))
                                            }
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Taslak">Taslak</SelectItem>
                                                <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                                                <SelectItem value="Faturalandı">Faturalandı</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="irsaliye_tarihi" className="text-sm">İrsaliye Tarihi</Label>
                                        <Input
                                            type="date"
                                            className="h-8"
                                            value={formData.irsaliye_tarihi}
                                            onChange={(e) =>
                                                setFormData(prev => ({ ...prev, irsaliye_tarihi: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="sevk_tarihi" className="text-sm">Sevk Tarihi</Label>
                                        <Input
                                            type="date"
                                            className="h-8"
                                            value={formData.sevk_tarihi}
                                            onChange={(e) =>
                                                setFormData(prev => ({ ...prev, sevk_tarihi: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="sevk_yeri" className="text-sm">Sevk Yeri</Label>
                                    <Input
                                        className="h-8"
                                        value={formData.sevk_yeri}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, sevk_yeri: e.target.value }))
                                        }
                                        placeholder="Teslimat adresi..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Açıklama */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Belge Açıklaması</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={formData.aciklama}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, aciklama: e.target.value }))
                                    }
                                    placeholder="İrsaliye ile ilgili notlar... (Opsiyonel)"
                                    rows={2}
                                    className="text-sm"
                                />
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleKaydet}
                                disabled={isLoading}
                                className="w-full h-12 text-lg gap-2 bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                <Save className="h-5 w-5" />
                                {isLoading ? 'Kaydediliyor...' : 'İrsaliyeyi Kaydet (F2)'}
                            </Button>

                            <Button
                                onClick={handlePDFOlustur}
                                variant="outline"
                                className="w-full h-12 text-lg gap-2"
                                size="lg"
                            >
                                <FileText className="h-5 w-5" />
                                PDF Yazdır (Ctrl+P)
                            </Button>

                            <Button
                                onClick={handleFaturayaDonustur}
                                variant="secondary"
                                className="w-full h-12 text-lg gap-2"
                                size="lg"
                            >
                                <Receipt className="h-5 w-5" />
                                Faturaya Dönüştür
                            </Button>
                        </div>

                        {/* Additional Actions */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                                Şablon Kaydet
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                                Sık Kullanılanlar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default YeniIrsaliye;