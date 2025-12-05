import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/ui/loading'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { CustomerService } from '@/services/customerService'
import { SaleService } from '@/services/saleService'
import { CustomerPaymentService } from '@/services/customerPaymentService'
import { showToast } from '@/lib/toast'
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    TrendingUp,
    FileText,
    Edit,
    Printer,
    Calendar,
    Loader2,
    Trash2
} from 'lucide-react'
import type { Customer, SaleWithDetails } from '@/types'
import { CustomerTransactionsTable, SaleDetailModal, CustomerModal, PaymentDetailModal } from '@/components/customers'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Yerel saati datetime-local input formatında döndürür
const getLocalDateTimeString = () => {
    const now = new Date()
    // Timezone offset'ini hesapla ve yerel saate çevir
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    return localDate.toISOString().slice(0, 16)
}

const CustomerDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [sales, setSales] = useState<SaleWithDetails[]>([])
    const [transactions, setTransactions] = useState<any[]>([])
    const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<any>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [showOverdueOnly, setShowOverdueOnly] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paymentType, setPaymentType] = useState<'cash' | 'pos'>('cash')
    const [paymentDate, setPaymentDate] = useState(getLocalDateTimeString())
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<any>(null)

    useEffect(() => {
        if (id) {
            loadCustomerData(id)
        }
    }, [id])

    // Modal açıldığında güncel saati set et
    useEffect(() => {
        if (showPaymentModal) {
            setPaymentDate(getLocalDateTimeString())
        }
    }, [showPaymentModal])

    const loadCustomerData = async (customerId: string) => {
        try {
            setLoading(true)
            setError(null)

            // Müşteri bilgilerini, satışlarını ve işlemlerini paralel yükle
            const [customerData, salesData, transactionsData] = await Promise.all([
                CustomerService.getCustomerById(customerId),
                SaleService.getCustomerSales(customerId),
                CustomerService.getCustomerTransactions(customerId)
            ])

            setCustomer(customerData)
            setSales(salesData)
            setTransactions(transactionsData)
        } catch (err) {
            console.error('Error loading customer data:', err)
            setError('Müşteri bilgileri yüklenirken bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleViewSaleDetail = (transaction: any) => {
        if (transaction.sale) {
            setSelectedSale(transaction.sale)
        }
    }

    const handleViewPaymentDetail = (transaction: any) => {
        if (transaction.payment) {
            setSelectedPayment(transaction.payment)
        }
    }

    const handleClosePaymentDetail = () => {
        setSelectedPayment(null)
    }

    const handleCloseSaleDetail = () => {
        setSelectedSale(null)
    }



    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const filteredTransactions = getFilteredTransactions()
        const totalSales = filteredTransactions
            .filter(t => t.type === 'sale' && t.paymentType === 'credit')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
        const totalPayments = filteredTransactions
            .filter(t => t.type === 'payment')
            .reduce((sum, t) => sum + (t.amount || 0), 0)

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Hesap Ekstresi - ${customer?.name}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .customer-info {
                        margin-bottom: 30px;
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 5px;
                    }
                    .customer-info p {
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #333;
                        color: white;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .sale-row {
                        background-color: #fff5f5;
                    }
                    .payment-row {
                        background-color: #f0fff4;
                    }
                    .credit-amount {
                        color: #dc2626;
                        font-weight: bold;
                    }
                    .payment-amount {
                        color: #16a34a;
                        font-weight: bold;
                    }
                    .total {
                        margin-top: 20px;
                        text-align: right;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                    }
                    @media print {
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>HESAP EKSTRESİ</h1>
                    <p>Yazdırma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</p>
                </div>

                <div class="customer-info">
                    <h3>Müşteri Bilgileri</h3>
                    <p><strong>Müşteri Adı:</strong> ${customer?.name}</p>
                    ${customer?.phone ? `<p><strong>Telefon:</strong> ${customer.phone}</p>` : ''}
                    ${customer?.email ? `<p><strong>E-posta:</strong> ${customer.email}</p>` : ''}
                    ${customer?.address ? `<p><strong>Adres:</strong> ${customer.address}</p>` : ''}
                    ${startDate || endDate ? `<p><strong>Tarih Aralığı:</strong> ${startDate ? new Date(startDate).toLocaleDateString('tr-TR') : 'Başlangıç'} - ${endDate ? new Date(endDate).toLocaleDateString('tr-TR') : 'Bitiş'}</p>` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>İşlem Tipi</th>
                            <th>Açıklama</th>
                            <th>Ödeme Tipi</th>
                            <th class="text-right">Tutar</th>
                            <th class="text-right">Bakiye</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions.map(transaction => `
                            <tr class="${transaction.type === 'sale' ? 'sale-row' : 'payment-row'}">
                                <td>${transaction.date ? new Date(transaction.date).toLocaleDateString('tr-TR') : '-'}</td>
                                <td><strong>${transaction.type === 'sale' ? 'Satış' : 'Ödeme'}</strong></td>
                                <td>${transaction.description}</td>
                                <td>${getPaymentTypeLabel(transaction.paymentType)}</td>
                                <td class="text-right">
                                    ${transaction.type === 'sale' 
                                        ? (transaction.paymentType === 'credit' 
                                            ? `<span class="credit-amount">+${formatCurrency(transaction.amount || 0)}</span>` 
                                            : `<span>${formatCurrency(transaction.amount || 0)}</span>`)
                                        : `<span class="payment-amount">-${formatCurrency(transaction.amount || 0)}</span>`
                                    }
                                </td>
                                <td class="text-right"><strong>${formatCurrency(transaction.balance || 0)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total">
                    <p>Toplam İşlem: ${filteredTransactions.length}</p>
                    <p>Toplam Veresiye Satış: ${formatCurrency(totalSales)}</p>
                    <p>Toplam Ödeme: ${formatCurrency(totalPayments)}</p>
                    <p>Güncel Bakiye: ${formatCurrency(customer?.current_balance || 0)}</p>
                </div>

                <div class="footer">
                    <p>Bu belge elektronik ortamda oluşturulmuştur.</p>
                </div>
            </body>
            </html>
        `

        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    const getPaymentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            cash: 'Nakit',
            pos: 'Kredi Kartı',
            credit: 'Veresiye',
            partial: 'Karma'
        }
        return labels[type] || type
    }



    const getFilteredSales = () => {
        let filtered = showOverdueOnly ? overdueSales : sales

        if (startDate) {
            filtered = filtered.filter(sale =>
                sale.sale_date && new Date(sale.sale_date) >= new Date(startDate)
            )
        }

        if (endDate) {
            filtered = filtered.filter(sale =>
                sale.sale_date && new Date(sale.sale_date) <= new Date(endDate)
            )
        }

        return filtered
    }

    const getFilteredTransactions = () => {
        let filtered = transactions

        if (startDate) {
            filtered = filtered.filter(t =>
                t.date && new Date(t.date) >= new Date(startDate)
            )
        }

        if (endDate) {
            filtered = filtered.filter(t =>
                t.date && new Date(t.date) <= new Date(endDate)
            )
        }

        return filtered
    }

    const handleEdit = () => {
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
    }

    const handleSaveCustomer = () => {
        if (id) {
            loadCustomerData(id)
        }
        setIsEditModalOpen(false)
    }

    const handleDelete = () => {
        setShowDeleteConfirm(true)
    }

    const handleFirstDeleteConfirm = () => {
        setShowDeleteConfirm(false)
        const hasTransactions = transactions.length > 0
        if (hasTransactions) {
            setShowSecondDeleteConfirm(true)
        } else {
            performDelete()
        }
    }

    const handleSecondDeleteConfirm = () => {
        setShowSecondDeleteConfirm(false)
        performDelete()
    }

    const performDelete = async () => {
        if (!customer) return

        setIsDeleting(true)
        try {
            await CustomerService.deleteCustomer(customer.id)
            showToast.success('Müşteri ve tüm kayıtları başarıyla silindi')
            navigate('/customers')
        } catch (error) {
            console.error('Delete error:', error)
            showToast.error('Müşteri silinirken bir hata oluştu')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteSale = (transaction: any) => {
        setTransactionToDelete(transaction)
        setShowDeleteTransactionConfirm(true)
    }

    const handleDeletePayment = (transaction: any) => {
        setTransactionToDelete(transaction)
        setShowDeleteTransactionConfirm(true)
    }

    const confirmDeleteTransaction = async () => {
        if (!transactionToDelete || !id) return

        setIsDeleting(true)
        try {
            if (transactionToDelete.type === 'sale') {
                // Satış sil
                await SaleService.deleteSale(transactionToDelete.id)
                showToast.success('Satış kaydı silindi')
            } else {
                // Ödeme sil
                await CustomerPaymentService.deletePayment(transactionToDelete.id)
                showToast.success('Ödeme kaydı silindi')
            }

            // Müşteri bakiyesini yeniden hesapla
            await CustomerService.recalculateCustomerBalance(id)
            
            // Sayfayı yenile
            await loadCustomerData(id)
            setShowDeleteTransactionConfirm(false)
            setTransactionToDelete(null)
        } catch (error) {
            console.error('Delete transaction error:', error)
            showToast.error('İşlem silinirken bir hata oluştu')
        } finally {
            setIsDeleting(false)
        }
    }

    const handlePayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Lütfen geçerli bir tutar girin')
            return
        }

        if (!customer) return

        setIsProcessingPayment(true)

        try {
            // Ödeme kaydı oluştur
            await CustomerPaymentService.createPayment({
                customer_id: customer.id,
                amount: parseFloat(paymentAmount),
                payment_type: paymentType,
                payment_date: new Date(paymentDate).toISOString(),
                notes: null
            })

            // Müşteri bakiyesini güncelle
            await CustomerService.updateCustomer(customer.id, {
                current_balance: (customer.current_balance || 0) - parseFloat(paymentAmount)
            })

            // Sayfayı yenile
            if (id) {
                await loadCustomerData(id)
            }

            setShowPaymentModal(false)
            setPaymentAmount('')
            setPaymentType('cash')
            setPaymentDate(getLocalDateTimeString())
        } catch (error) {
            console.error('Payment error:', error)
            showToast.error('Ödeme kaydedilirken bir hata oluştu')
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <Layout title="Müşteri Detayı">
                <div className="flex justify-center items-center h-64">
                    <Loading />
                </div>
            </Layout>
        )
    }

    if (error || !customer) {
        return (
            <Layout title="Müşteri Detayı">
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error || 'Müşteri bulunamadı'}</p>
                            <Button onClick={() => navigate('/customers')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Müşteri Listesine Dön
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Layout>
        )
    }

    const totalPurchases = sales.reduce((sum, sale) => sum + (sale.net_amount || 0), 0)
    const lastPurchaseDate = sales.length > 0 ? sales[0].sale_date : null
    const overdueSales = sales.filter(sale =>
        sale.payment_type === 'credit' &&
        sale.due_date &&
        new Date(sale.due_date) < new Date()
    )
    const overdueAmount = overdueSales.reduce((sum, sale) => sum + (sale.net_amount || 0), 0)

    return (
        <Layout
            title="Müşteri Detayı"
            subtitle={customer.name}
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => navigate('/customers')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>
                    <Button onClick={() => {
                        setShowPaymentModal(true)
                        setPaymentDate(getLocalDateTimeString())
                    }}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Ödeme Al
                    </Button>
                </div>

                {/* Customer Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Balance Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Güncel Bakiye
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col">
                                <p className={`text-2xl font-bold ${(customer.current_balance ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(customer.current_balance ?? 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Limit: {formatCurrency(customer.credit_limit ?? 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Purchases Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Toplam Alışveriş
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold">{formatCurrency(totalPurchases)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {sales.length} işlem
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overdue Card */}
                    <Card
                        className={`cursor-pointer transition-colors ${showOverdueOnly ? 'ring-2 ring-red-500' : 'hover:bg-gray-50'}`}
                        onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Vadesi Geçen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(overdueAmount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {overdueSales.length} işlem
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Last Purchase Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Son Alışveriş
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col">
                                <p className="text-base font-semibold">
                                    {lastPurchaseDate ? formatDate(lastPurchaseDate) : 'Henüz yok'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {lastPurchaseDate ? 'Tarih' : 'Alışveriş yapılmadı'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Details */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Müşteri Bilgileri
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleEdit}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Düzenle
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-x-12 gap-y-4">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-sm text-gray-500">Müşteri Adı</span>
                                    <p className="font-semibold">{customer.name}</p>
                                </div>
                            </div>

                            {customer.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <span className="text-sm text-gray-500">Telefon</span>
                                        <p className="font-medium">{customer.phone}</p>
                                    </div>
                                </div>
                            )}

                            {customer.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <span className="text-sm text-gray-500">E-posta</span>
                                        <p className="font-medium">{customer.email}</p>
                                    </div>
                                </div>
                            )}

                            {customer.address && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <span className="text-sm text-gray-500">Adres</span>
                                        <p className="font-medium">{customer.address}</p>
                                    </div>
                                </div>
                            )}

                            {customer.tax_number && (
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <span className="text-sm text-gray-500">Vergi Numarası</span>
                                        <p className="font-medium">{customer.tax_number}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Hesap Hareketleri
                                {getFilteredTransactions().length > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {getFilteredTransactions().length} işlem
                                    </Badge>
                                )}
                            </CardTitle>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-9 w-40"
                                        placeholder="Başlangıç"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-9 w-40"
                                        placeholder="Bitiş"
                                    />
                                </div>

                                {(startDate || endDate) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setStartDate('')
                                            setEndDate('')
                                        }}
                                    >
                                        Temizle
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    disabled={getFilteredTransactions().length === 0}
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Yazdır
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <CustomerTransactionsTable
                            transactions={getFilteredTransactions()}
                            onViewSaleDetail={handleViewSaleDetail}
                            onViewPaymentDetail={handleViewPaymentDetail}
                            onDeleteSale={handleDeleteSale}
                            onDeletePayment={handleDeletePayment}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Sale Detail Modal */}
            {selectedSale && (
                <SaleDetailModal
                    sale={selectedSale}
                    isOpen={!!selectedSale}
                    onClose={handleCloseSaleDetail}
                />
            )}

            {/* Customer Edit Modal */}
            <CustomerModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                customer={customer || undefined}
                onSave={handleSaveCustomer}
            />

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={(open) => {
                setShowPaymentModal(open)
                if (!open) {
                    // Modal kapatıldığında state'leri reset et
                    setPaymentAmount('')
                    setPaymentType('cash')
                    setPaymentDate(getLocalDateTimeString())
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ödeme Al</DialogTitle>
                        <DialogDescription>
                            {customer?.name} için ödeme kaydı oluşturun
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment-amount">Ödeme Tutarı (₺)</Label>
                            <Input
                                id="payment-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                            />
                            {customer && (customer.current_balance ?? 0) > 0 && (
                                <p className="text-sm text-gray-500">
                                    Güncel Borç: {formatCurrency(customer.current_balance ?? 0)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment-type">Ödeme Tipi</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={paymentType === 'cash' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setPaymentType('cash')}
                                >
                                    Nakit
                                </Button>
                                <Button
                                    type="button"
                                    variant={paymentType === 'pos' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setPaymentType('pos')}
                                >
                                    Kredi Kartı
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment-date">Tarih ve Saat</Label>
                            <Input
                                id="payment-date"
                                type="datetime-local"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPaymentModal(false)
                                setPaymentAmount('')
                                setPaymentType('cash')
                                setPaymentDate(getLocalDateTimeString())
                            }}
                            disabled={isProcessingPayment}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
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

            {/* Payment Detail Modal */}
            <PaymentDetailModal
                payment={selectedPayment}
                isOpen={!!selectedPayment}
                onClose={handleClosePaymentDetail}
            />

            {/* Delete Confirmation Modals */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Müşteri Silme Onayı</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="font-semibold">{customer?.name}</span> müşterisini kalıcı olarak silmek istediğinizden emin misiniz?
                            {transactions.length > 0 && (
                                <>
                                    <br /><br />
                                    <span className="text-red-600 font-semibold">⚠️ UYARI:</span> Bu müşteriye ait <span className="font-semibold">{transactions.length} adet işlem kaydı</span> da otomatik olarak silinecektir:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Satış kayıtları</li>
                                        <li>Ödeme kayıtları</li>
                                        <li>İşlem geçmişi</li>
                                    </ul>
                                </>
                            )}
                            <br />
                            <span className="text-red-600 font-semibold">Bu işlem geri alınamaz!</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleFirstDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Devam Et
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showSecondDeleteConfirm} onOpenChange={setShowSecondDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Son Onay - Kalıcı Silme</AlertDialogTitle>
                        <AlertDialogDescription>
                            Müşteri ve tüm ilgili kayıtların kalıcı olarak silineceğini onaylıyor musunuz?
                            <br /><br />
                            <span className="text-red-600 font-semibold">⚠️ Bu işlem GERİ ALINAMAZ!</span>
                            <br /><br />
                            Silinecek veriler:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Müşteri bilgileri</li>
                                <li>Tüm satış kayıtları</li>
                                <li>Tüm ödeme kayıtları</li>
                                <li>İşlem geçmişi</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSecondDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Transaction Delete Confirmation */}
            <AlertDialog open={showDeleteTransactionConfirm} onOpenChange={setShowDeleteTransactionConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {transactionToDelete?.type === 'sale' ? 'Satış' : 'Ödeme'} Kaydını Sil
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu {transactionToDelete?.type === 'sale' ? 'satış' : 'ödeme'} kaydını kalıcı olarak silmek istediğinizden emin misiniz?
                            <br /><br />
                            <span className="text-red-600 font-semibold">Bu işlem geri alınamaz!</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            disabled={isDeleting}
                            onClick={() => {
                                setShowDeleteTransactionConfirm(false)
                                setTransactionToDelete(null)
                            }}
                        >
                            İptal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteTransaction}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    )
}

export default CustomerDetailPage
