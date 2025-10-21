import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Edit } from 'lucide-react'
import type { SaleWithDetails } from '@/types'

interface CustomerSalesTableProps {
  sales: SaleWithDetails[]
  onViewDetail: (sale: SaleWithDetails) => void
  onEdit?: (sale: SaleWithDetails) => void
}

export const CustomerSalesTable = ({ sales, onViewDetail, onEdit }: CustomerSalesTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Henüz alışveriş yapılmamış</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Satış No</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead className="text-right">Net Tutar</TableHead>
            <TableHead>Ödeme Tipi</TableHead>
            <TableHead>Vade Tarihi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow 
              key={sale.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onViewDetail(sale)}
            >
              <TableCell className="font-medium">
                {sale.sale_number}
              </TableCell>
              <TableCell>
                {formatDate(sale.sale_date)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(sale.total_amount || 0)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(sale.net_amount || 0)}
              </TableCell>
              <TableCell>
                {getPaymentTypeLabel(sale.payment_type)}
              </TableCell>
              <TableCell>
                {sale.due_date ? (
                  <span className={new Date(sale.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                    {formatDate(sale.due_date)}
                  </span>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(sale)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
