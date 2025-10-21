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
import { SkeletonTable, EmptyCustomers, ButtonLoading } from '@/components/ui'
import { Edit, Trash2, Phone, Mail } from 'lucide-react'
import { CustomerService } from '@/services/customerService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { Customer } from '@/types'

interface CustomerTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onRefresh: () => void
  onAddCustomer?: () => void
  isLoading?: boolean
}

export const CustomerTable = ({ 
  customers, 
  onEdit, 
  onRefresh, 
  onAddCustomer,
  isLoading = false 
}: CustomerTableProps) => {
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { handleError, showSuccess } = useErrorHandler()

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`"${customer.name}" müşterisini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeletingId(customer.id)
    try {
      await CustomerService.deleteCustomer(customer.id)
      showSuccess('Müşteri başarıyla silindi')
      onRefresh()
    } catch (error) {
      handleError(error, 'Müşteri silinirken bir hata oluştu')
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

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <SkeletonTable rows={5} columns={7} />
      </div>
    )
  }

  // Show empty state
  if (customers.length === 0) {
    return <EmptyCustomers onAddCustomer={onAddCustomer} />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri Adı</TableHead>
            <TableHead>İletişim</TableHead>
            <TableHead>Vergi No</TableHead>
            <TableHead className="text-right">Kredi Limiti</TableHead>
            <TableHead className="text-right">Bakiye</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <TableCell className="font-medium align-top">
                <div>
                  <div className="font-semibold">
                    {customer.name}
                  </div>
                  {customer.address && (
                    <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                      {customer.address}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="space-y-1">
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3" />
                      {formatPhone(customer.phone)}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </div>
                  )}
                  {!customer.phone && !customer.email && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="align-top">
                {customer.tax_number || '-'}
              </TableCell>
              <TableCell className="text-right align-top">
                {formatCurrency(customer.credit_limit ?? 0)}
              </TableCell>
              <TableCell className="text-right align-top">
                <span className={(customer.current_balance ?? 0) > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  {formatCurrency(customer.current_balance ?? 0)}
                </span>
              </TableCell>
              <TableCell className="align-top">
                <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                  {customer.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </TableCell>
              <TableCell className="text-right align-top">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(customer)}
                    disabled={deletingId === customer.id}
                  >
                    {deletingId === customer.id ? (
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
  )
}