import { useState, memo } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react'
import { CustomerService } from '@/services/customerService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { Customer } from '@/types'

interface CustomerTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onRefresh: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
}

export const CustomerTable = memo(({ customers, onEdit, onRefresh }: CustomerTableProps) => {
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const { handleError, showSuccess } = useErrorHandler()

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return
    setDeletingId(customerToDelete.id)
    try {
      await CustomerService.deleteCustomer(customerToDelete.id)
      showSuccess('Müşteri ve tüm kayıtları başarıyla silindi')
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
      onRefresh()
    } catch (error) {
      handleError(error, 'Müşteri silinirken bir hata oluştu')
    } finally {
      setDeletingId(null)
    }
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-2">Müşteri bulunamadı</p>
        <p className="text-sm text-muted-foreground">Yeni müşteri eklemek için yukarıdaki butonu kullanın</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-left">Müşteri Adı</TableHead>
            <TableHead className="font-semibold text-left">İletişim</TableHead>
            <TableHead className="font-semibold text-left">Vergi No</TableHead>
            <TableHead className="font-semibold text-left">Kredi Limiti</TableHead>
            <TableHead className="font-semibold text-left">Bakiye</TableHead>
            <TableHead className="font-semibold text-left">Durum</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <TableCell className="text-left">
                <div className="font-semibold">{customer.name}</div>
                {customer.address && (
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{customer.address}</div>
                )}
              </TableCell>
              <TableCell className="text-left">
                <div className="text-sm">
                  {customer.phone && <div>{customer.phone}</div>}
                  {customer.email && <div className="text-muted-foreground truncate max-w-[150px]">{customer.email}</div>}
                  {!customer.phone && !customer.email && <span className="text-muted-foreground">-</span>}
                </div>
              </TableCell>
              <TableCell className="text-left">
                <span className="text-sm">{customer.tax_number || '-'}</span>
              </TableCell>
              <TableCell className="text-left">
                <span className="text-sm">{formatCurrency(customer.credit_limit ?? 0)}</span>
              </TableCell>
              <TableCell className="text-left">
                <span className={`font-semibold ${(customer.current_balance ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(customer.current_balance ?? 0)}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <Badge variant={customer.is_active ? 'default' : 'secondary'} className={customer.is_active ? 'bg-green-600' : ''}>
                  {customer.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />Detaylar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer)}>
                      <Edit className="mr-2 h-4 w-4" />Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{customerToDelete?.name}</strong> adlı müşteriyi silmek istediğinize emin misiniz?
              <br /><br />Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={deletingId === customerToDelete?.id}>
              {deletingId === customerToDelete?.id ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

CustomerTable.displayName = 'CustomerTable'
