import { useState } from 'react';
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
import { useAuthStore } from '@/stores/authStore';
import { MustasilFisService } from '@/services/mustasilFisService';
import type {
    MustasilItem,
    MustasilData
} from '@/types/mustasilFis';
import {
    BIRIM_OPTIONS,
    STOPAJ_OPTIONS,
    PAYMENT_TYPE_OPTIONS
} from '@/types/mustasilFis';

export default function NewMustasilFisPage() {
    const navigate = useNavigate();
    const { user, branchId } = useAuthStore();

    // Müstasil fişi kalemleri
    const [mustasilItems, setMustasilItems] = useState<MustasilItem[]>([]);

    // Form durumları
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Müstasil bilgileri
    const [mustasilData, setMustasilData] = useState<MustasilData>({
        mustasil_adi: '',
        tc_no: '',
        adres: '',
        iban: ''
    });

    // Fiş detayları
    const [currency, setCurrency] = useState('₺ Türk Lirası');
    const [fisDate, setFisDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentType, setPaymentType] = useState('Nakit');
    const [fisNote, setFisNote] = useState('');

    // Yeni ürün ekleme formu
    const [newItem, setNewItem] = useState({
        urun_adi: '',
        miktar: 1,
        birim: 'Kg',
        birim_fiyat: 0,
        stopaj_orani: 2
    });

    // Seçenekler
    const birimOptions = [...BIRIM_OPTIONS];
    const stopajOptions = [...STOPAJ_OPTIONS];
    const paymentTypeOptions = [...PAYMENT_TYPE_OPTIONS];

    // Hesaplama fonksiyonları
    const calculateItemTotals = (miktar: number, birimFiyat: number, stopajOrani: number) => {
        const brutTutar = miktar * birimFiyat;
        const stopajTutari = (brutTutar * stopajOrani) / 100;
        const netOdenecek = brutTutar - stopajTutari;

        return { brutTutar, stopajTutari, netOdenecek };
    };

    // Genel toplamları hesapla
    const calculateTotals = () => {
        const brutToplam = mustasilItems.reduce((sum, item) => sum + item.brut_tutar, 0);
        const stopajToplam = mustasilItems.reduce((sum, item) => sum + item.stopaj_tutari, 0);
        const netToplam = mustasilItems.reduce((sum, item) => sum + item.net_odenecek, 0);

        return { brutToplam, stopajToplam, netToplam };
    };

    // Yeni ürün ekle
    const handleAddItem = () => {
        if (!newItem.urun_adi.trim()) {
            showErrorToast('Ürün adı boş olamaz');
            return;
        }

        if (newItem.miktar <= 0 || newItem.birim_fiyat <= 0) {
            showErrorToast('Miktar ve birim fiyat sıfırdan büyük olmalıdır');
            return;
        }

        const { brutTutar, stopajTutari, netOdenecek } = calculateItemTotals(
            newItem.miktar,
            newItem.birim_fiyat,
            newItem.stopaj_orani
        );

        const item: MustasilItem = {
            id: `${Date.now()}-${Math.random()}`,
            urun_adi: newItem.urun_adi,
            miktar: newItem.miktar,
            birim: newItem.birim,
            birim_fiyat: newItem.birim_fiyat,
            stopaj_orani: newItem.stopaj_orani,
            brut_tutar: brutTutar,
            stopaj_tutari: stopajTutari,
            net_odenecek: netOdenecek
        };

        setMustasilItems(prev => [...prev, item]);

        // Formu temizle
        setNewItem({
            urun_adi: '',
            miktar: 1,
            birim: 'Kg',
            birim_fiyat: 0,
            stopaj_orani: 2
        });

        showSuccessToast('Ürün eklendi');
    };

    // Ürün sil
    const handleRemoveItem = (itemId: string) => {
        setMustasilItems(prev => prev.filter(item => item.id !== itemId));
        showSuccessToast('Ürün silindi');
    };

    // Ürün güncelle
    const handleUpdateItem = (itemId: string, field: keyof MustasilItem, value: any) => {
        setMustasilItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;

            const updatedItem = { ...item, [field]: value };

            // Eğer miktar, birim fiyat veya stopaj oranı değiştiyse hesaplamaları güncelle
            if (field === 'miktar' || field === 'birim_fiyat' || field === 'stopaj_orani') {
                const { brutTutar, stopajTutari, netOdenecek } = calculateItemTotals(
                    field === 'miktar' ? value : item.miktar,
                    field === 'birim_fiyat' ? value : item.birim_fiyat,
                    field === 'stopaj_orani' ? value : item.stopaj_orani
                );

                updatedItem.brut_tutar = brutTutar;
                updatedItem.stopaj_tutari = stopajTutari;
                updatedItem.net_odenecek = netOdenecek;
            }

            return updatedItem;
        }));
    };

    // Form validasyonu
    const validateForm = (): boolean => {
        if (mustasilItems.length === 0) {
            showErrorToast('En az bir ürün eklemelisiniz');
            return false;
        }

        if (!mustasilData.mustasil_adi.trim()) {
            showErrorToast('Müstasil adı boş olamaz');
            return false;
        }

        if (!mustasilData.tc_no.trim()) {
            showErrorToast('T.C. Kimlik No boş olamaz');
            return false;
        }

        if (mustasilData.tc_no.length !== 11) {
            showErrorToast('T.C. Kimlik No 11 hane olmalıdır');
            return false;
        }

        if (!mustasilData.adres.trim()) {
            showErrorToast('Adres boş olamaz');
            return false;
        }

        return true;
    };

    // Müstasil fişini kaydet
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user || !branchId) {
            showErrorToast('Kullanıcı bilgileri alınamadı');
            return;
        }

        setIsSubmitting(true);

        try {
            const { brutToplam, stopajToplam, netToplam } = calculateTotals();

            // Müstasil fişi verilerini hazırla
            const mustasilFisData = {
                mustasil_adi: mustasilData.mustasil_adi,
                tc_no: mustasilData.tc_no,
                adres: mustasilData.adres,
                iban: mustasilData.iban || undefined,
                urun_listesi: mustasilItems,
                brut_tutar: brutToplam,
                stopaj_tutar: stopajToplam,
                net_tutar: netToplam,
                odeme_turu: paymentType,
                odeme_tarihi: paymentDate || undefined,
                fis_tarihi: fisDate,
                aciklama: fisNote || undefined,
                branch_id: branchId,
                created_by: user.id
            };

            // Müstasil fişi kaydet
            const result = await MustasilFisService.createMustasilFis(mustasilFisData);

            if (result.success) {
                showSuccessToast('Müstasil fişi başarıyla oluşturuldu');

                // PDF oluştur
                if (result.data?.id) {
                    await MustasilFisService.generatePDF(result.data.id);
                }

                // Ana sayfaya yönlendir (şimdilik)
                navigate('/dashboard');
            } else {
                showErrorToast(result.error || 'Müstasil fişi oluşturulamadı');
            }

        } catch (error) {
            console.error('Error creating mustasil fis:', error);
            showErrorToast('Müstasil fişi oluşturulurken hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout
            title="Yeni Müstasil Fişi"
            subtitle="Vergiden muaf üreticilerden alınan ürünlerin kaydı"
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
                            <p className="text-lg font-bold text-orange-900">{mustasilItems.length} Adet</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Brüt Toplam</p>
                            <p className="text-lg font-bold text-blue-900">₺{calculateTotals().brutToplam.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Stopaj Toplam</p>
                            <p className="text-lg font-bold text-purple-900">₺{calculateTotals().stopajToplam.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 font-medium">Net Ödenecek</p>
                            <p className="text-lg font-bold text-green-900">₺{calculateTotals().netToplam.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Müstasil Selection */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Müstasil Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="mustasil_adi">Müstasil Adı Soyadı *</Label>
                                        <Input
                                            id="mustasil_adi"
                                            value={mustasilData.mustasil_adi}
                                            onChange={(e) => setMustasilData(prev => ({ ...prev, mustasil_adi: e.target.value }))}
                                            placeholder="Ad Soyad"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="tc_no">T.C. Kimlik No *</Label>
                                        <Input
                                            id="tc_no"
                                            value={mustasilData.tc_no}
                                            onChange={(e) => setMustasilData(prev => ({ ...prev, tc_no: e.target.value }))}
                                            placeholder="11 haneli T.C. No"
                                            maxLength={11}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="adres">Adres *</Label>
                                    <Textarea
                                        id="adres"
                                        value={mustasilData.adres}
                                        onChange={(e) => setMustasilData(prev => ({ ...prev, adres: e.target.value }))}
                                        placeholder="Tam adres"
                                        rows={2}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="iban">IBAN (Opsiyonel)</Label>
                                    <Input
                                        id="iban"
                                        value={mustasilData.iban}
                                        onChange={(e) => setMustasilData(prev => ({ ...prev, iban: e.target.value }))}
                                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products and Services */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Ürün ve Hizmetler</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Yeni Ürün Ekleme Formu */}
                                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border">
                                    <div className="col-span-3">
                                        <Input
                                            placeholder="Ürün adı"
                                            value={newItem.urun_adi}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, urun_adi: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Input
                                            type="number"
                                            placeholder="Miktar"
                                            value={newItem.miktar}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, miktar: Number(e.target.value) }))}
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Select
                                            value={newItem.birim}
                                            onValueChange={(value) => setNewItem(prev => ({ ...prev, birim: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {birimOptions.map(birim => (
                                                    <SelectItem key={birim} value={birim}>{birim}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Birim fiyat"
                                            value={newItem.birim_fiyat}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, birim_fiyat: Number(e.target.value) }))}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Select
                                            value={newItem.stopaj_orani.toString()}
                                            onValueChange={(value) => setNewItem(prev => ({ ...prev, stopaj_orani: Number(value) }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stopajOptions.map(oran => (
                                                    <SelectItem key={oran} value={oran.toString()}>%{oran}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2">
                                        <Button onClick={handleAddItem} className="w-full">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ekle
                                        </Button>
                                    </div>
                                </div>

                                {/* Products Table */}
                                <div className="border rounded-lg">
                                    <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
                                        <div className="col-span-2">Ürün Adı</div>
                                        <div className="col-span-1 text-center">Miktar</div>
                                        <div className="col-span-1 text-center">Birim</div>
                                        <div className="col-span-1 text-center">Birim Fiyat</div>
                                        <div className="col-span-1 text-center">Stopaj (%)</div>
                                        <div className="col-span-2 text-center">Brüt Tutar</div>
                                        <div className="col-span-2 text-center">Stopaj Tutarı</div>
                                        <div className="col-span-1 text-center">Net Ödenecek</div>
                                        <div className="col-span-1 text-center"></div>
                                    </div>

                                    {mustasilItems.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>Ürün ekleyin</p>
                                            <p className="text-sm">Yukarıdaki formu kullanarak ürün ekleyebilirsiniz</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {mustasilItems.map((item) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center">
                                                    <div className="col-span-2">
                                                        <Input
                                                            value={item.urun_adi}
                                                            onChange={(e) => handleUpdateItem(item.id, 'urun_adi', e.target.value)}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            value={item.miktar}
                                                            onChange={(e) => handleUpdateItem(item.id, 'miktar', Number(e.target.value))}
                                                            className="text-center text-sm"
                                                            min="0.01"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <Select
                                                            value={item.birim}
                                                            onValueChange={(value) => handleUpdateItem(item.id, 'birim', value)}
                                                        >
                                                            <SelectTrigger className="text-sm">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {birimOptions.map(birim => (
                                                                    <SelectItem key={birim} value={birim}>{birim}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            value={item.birim_fiyat}
                                                            onChange={(e) => handleUpdateItem(item.id, 'birim_fiyat', Number(e.target.value))}
                                                            className="text-center text-sm"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <Select
                                                            value={item.stopaj_orani.toString()}
                                                            onValueChange={(value) => handleUpdateItem(item.id, 'stopaj_orani', Number(value))}
                                                        >
                                                            <SelectTrigger className="text-sm">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {stopajOptions.map(oran => (
                                                                    <SelectItem key={oran} value={oran.toString()}>%{oran}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-2 text-center text-sm font-medium">
                                                        ₺{item.brut_tutar.toFixed(2)}
                                                    </div>
                                                    <div className="col-span-2 text-center text-sm font-medium text-red-600">
                                                        ₺{item.stopaj_tutari.toFixed(2)}
                                                    </div>
                                                    <div className="col-span-1 text-center text-sm font-medium text-green-600">
                                                        ₺{item.net_odenecek.toFixed(2)}
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

                                <p className="text-sm text-blue-600">
                                    <strong>İpucu:</strong> Stopaj oranları: %2 (Tarım), %4 (Hayvancılık), %8 (Diğer)
                                </p>
                            </CardContent>
                        </Card>

                        {/* Document Description */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Makbuz Notu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Makbuz notu girin... (Opsiyonel)"
                                    value={fisNote}
                                    onChange={(e) => setFisNote(e.target.value)}
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Fiş Details & Actions */}
                    <div className="space-y-6">
                        {/* Fiş Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Fiş Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="currency">Para Birimi</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="₺ Türk Lirası">₺ Türk Lirası</SelectItem>
                                            <SelectItem value="$ USD">$ USD</SelectItem>
                                            <SelectItem value="€ EUR">€ EUR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="fisDate">Fiş Tarihi *</Label>
                                    <Input
                                        type="date"
                                        value={fisDate}
                                        onChange={(e) => setFisDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="paymentDate">Ödeme Tarihi</Label>
                                    <Input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="paymentType">Ödeme Türü</Label>
                                    <Select value={paymentType} onValueChange={setPaymentType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentTypeOptions.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || mustasilItems.length === 0}
                                className="w-full h-12 text-lg gap-2 bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                <Receipt className="h-5 w-5" />
                                {isSubmitting ? 'İşleniyor...' : 'Müstasil Fişini Kaydet'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                İptal
                            </Button>
                        </div>

                        {/* Additional Actions */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                                PDF Yazdır
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                                Önizleme
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}