import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
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
import { SupplierService } from '@/services/supplierService'
import { showToast } from '@/lib/toast'
import {
  ArrowLeft,
  Truck,
  Phone,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Building2,
  Landmark
} from 'lucide-react'
import type { Supplier } from '@/types/supplier'

const SupplierDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    totalAmount: 0,
    creditPurchases: 0,
    creditAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      loadSupplierData()
    }
  }, [id])

  const loadSupplierData = async () => {
    if (!id) return

    setLoading(true)
    try {
      const [supplierData, purchasesData, summaryData] = await Promise.all([
        SupplierService.getSupplierById(id),
        SupplierService.getSupplierPurchases(id),
        SupplierService.getSupplierSummary(id)
      ])
      
      setSupplier(supplierData)
      setPurchases(purchasesData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading supplier data:', error)
      showToast.error('Tedarikçi bilgileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!supplier) return

    setIsDeleting(true)
    try {
      await SupplierService.deleteSupplier(supplier.id)
      showToast.success('Tedarikçi başarıyla silindi')
      navigate('/suppliers')
    } catch (error) {
      console.error('Delete error:', error)
      showToast.error('Tedarikçi silinirken bir hata oluştu')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout title="Tedarikçi Detayı" subtitle="Yükleniyor...">
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      </Layout>
    )
  }

  if (!supplier) {
    return (
      <Layout title="Tedarikçi Detayı" subtitle="Tedarikçi bulunamadı">
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tedarikçi Bulunamadı</h3>
            <p className="text-gray-500 mb-6">İstediğiniz tedarikçi kaydı bulunamadı.</p>
            <Button onClick={() => navigate('/suppliers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tedarikçi Listesine Dön
            </Button>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout
      title={supplier.name}
      subtitle="Tedarikçi detay bilgileri"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Güncel Bakiye
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${(supplier.current_balance ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(supplier.current_balance ?? 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Limit: {formatCurrency(supplier.credit_limit ?? 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Alışveriş
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.totalPurchases} işlem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Vadeli Alışlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.creditAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.creditPurchases} işlem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Durum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="text-base">
                {supplier.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tedarikçi Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İletişim Bilgileri */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  İletişim Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Yetkili Kişi:</span>
                    <p className="font-medium">{supplier.contact_person || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefon:</span>
                    <p className="font-medium">{supplier.phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">E-posta:</span>
                    <p className="font-medium">{supplier.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adres Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">İl/İlçe:</span>
                    <p className="font-medium">
                      {supplier.city && supplier.district 
                        ? `${supplier.city} / ${supplier.district}`
                        : supplier.city || supplier.district || '-'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Adres:</span>
                    <p className="font-medium">{supplier.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Vergi Bilgileri */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Vergi Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Vergi Numarası:</span>
                    <p className="font-medium">{supplier.tax_number || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vergi Dairesi:</span>
                    <p className="font-medium">{supplier.tax_office || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ticaret Sicil No:</span>
                    <p className="font-medium">{supplier.trade_registry_no || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Banka Bilgileri */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4" />
                  Banka Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Banka:</span>
                    <p className="font-medium">{supplier.bank_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">IBAN:</span>
                    <p className="font-medium font-mono text-xs">{supplier.iban || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Hesap No:</span>
                    <p className="font-medium">{supplier.account_number || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alış İşlemleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Alış İşlemleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Henüz alış işlemi bulunmuyor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fatura No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ödeme Tipi</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Tutar</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Ödenen</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Kalan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{purchase.purchase_number}</td>
                        <td className="py-3 px-4">
                          {purchase.purchase_date && new Date(purchase.purchase_date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.payment_type === 'cash' 
                              ? 'bg-green-100 text-green-800'
                              : purchase.payment_type === 'pos'
                              ? 'bg-blue-100 text-blue-800'
                              : purchase.payment_type === 'credit'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {purchase.payment_type === 'cash' && 'Nakit'}
                            {purchase.payment_type === 'pos' && 'Kredi Kartı'}
                            {purchase.payment_type === 'credit' && 'Vadeli'}
                            {purchase.payment_type === 'partial' && 'Kısmi'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(purchase.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600">
                          {formatCurrency(purchase.paid_amount || 0)}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600">
                          {formatCurrency(purchase.remaining_amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notlar */}
        {supplier.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tedarikçi Silme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{supplier.name}</span> tedarikçisini kalıcı olarak silmek istediğinizden emin misiniz?
              <br /><br />
              <span className="text-red-600 font-semibold">⚠️ Bu işlem geri alınamaz!</span>
              <br /><br />
              Tedarikçiye ait tüm kayıtlar silinecek:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Alış faturaları</li>
                <li>Ödeme kayıtları</li>
                <li>İşlem geçmişi</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

export default SupplierDetailPage
