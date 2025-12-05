import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { ButtonLoading } from '@/components/ui'
import { Edit, Trash2, Phone, Mail, Truck } from 'lucide-react'
import { SupplierService } from '@/services/supplierService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { Supplier } from '@/types'

interface SupplierTableProps {
  suppliers: Supplier[]
  onRefresh: () => void
}

export const SupplierTable = ({ 
  suppliers, 
  onRefresh
}: SupplierTableProps) => {
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const { handleError, showSuccess } = useErrorHandler()

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return

    setDeletingId(supplierToDelete.id)
    try {
      await SupplierService.deleteSupplier(supplierToDelete.id)
      showSuccess('Tedarikçi ve tüm kayıtları başarıyla silindi')
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
      onRefresh()
    } catch (error) {
      handleError(error, 'Tedarikçi silinirken bir hata oluştu')
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-'
    return phone
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz tedarikçi bulunmuyor
        </h3>
        <p className="text-gray-500 mb-6">
          İlk tedarikçinizi eklemek için "Yeni Tedarikçi" butonuna tıklayın.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tedarikçi Adı</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>Vergi No</TableHead>
              <TableHead className="text-right">Kredi Limiti</TableHead>
              <TableHead className="text-right">Bakiye</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow 
                key={supplier.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
              >
                <TableCell className="font-medium align-top">
                  <div>
                    <div className="font-semibold">
                      {supplier.name}
                    </div>
                    {supplier.contact_person && (
                      <div className="text-sm text-gray-500 mt-1">
                        Yetkili: {supplier.contact_person}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  {supplier.company_name || '-'}
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-1">
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {formatPhone(supplier.phone)}
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {supplier.email}
                      </div>
                    )}
                    {!supplier.phone && !supplier.email && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  {supplier.tax_number || '-'}
                </TableCell>
                <TableCell className="text-right align-top">
                  {formatCurrency(supplier.credit_limit ?? 0)}
                </TableCell>
                <TableCell className="text-right align-top">
                  <span className={(supplier.current_balance ?? 0) > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                    {formatCurrency(supplier.current_balance ?? 0)}
                  </span>
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                    {supplier.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right align-top">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(supplier)}
                      disabled={deletingId === supplier.id}
                    >
                      {deletingId === supplier.id ? (
                        <ButtonLoading text="" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Silme Onay Dialogu */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tedarikçi Silme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{supplierToDelete?.name}</span> tedarikçisini kalıcı olarak silmek istediğinizden emin misiniz?
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
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingId === supplierToDelete?.id}
            >
              {deletingId === supplierToDelete?.id ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
