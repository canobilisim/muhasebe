import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, ShoppingCart, Wallet, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import type { CustomerTransaction } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface CustomerTransactionsTableProps {
  transactions: CustomerTransaction[]
  onViewSaleDetail?: (transaction: CustomerTransaction) => void
  onViewPaymentDetail?: (transaction: CustomerTransaction) => void
  onDeleteSale?: (transaction: CustomerTransaction) => void
  onDeletePayment?: (transaction: CustomerTransaction) => void
}

export const CustomerTransactionsTable = ({ 
  transactions, 
  onViewSaleDetail,
  onViewPaymentDetail,
  onDeleteSale,
  onDeletePayment
}: CustomerTransactionsTableProps) => {
  const { isAdmin } = useAuth()
  const showDeleteButton = isAdmin()
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(Math.abs(amount))
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Henüz işlem yapılmamış</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tarih</TableHead>
            <TableHead className="w-[100px]">İşlem Tipi</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead className="w-[120px]">Ödeme Tipi</TableHead>
            <TableHead className="text-right w-[120px]">Tutar</TableHead>
            <TableHead className="text-right w-[120px]">Bakiye</TableHead>
            {showDeleteButton && <TableHead className="w-[60px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const isSale = transaction.type === 'sale'
            const isPayment = transaction.type === 'payment'
            
            return (
              <TableRow 
                key={transaction.id}
                className={`cursor-pointer hover:bg-gray-50 ${isPayment ? 'bg-green-50/30' : ''}`}
                onClick={() => {
                  if (isSale && onViewSaleDetail) {
                    onViewSaleDetail(transaction)
                  } else if (isPayment && onViewPaymentDetail) {
                    onViewPaymentDetail(transaction)
                  }
                }}
              >
                <TableCell className="text-sm">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>
                  {isSale ? (
                    <Badge variant="default" className="gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      Satış
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                      <Wallet className="w-3 h-3" />
                      Ödeme
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {getPaymentTypeLabel(transaction.paymentType)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isSale ? (
                      <>
                        {transaction.paymentType === 'credit' ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-red-600">
                              +{formatCurrency(transaction.amount)}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-600">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-600">
                          -{formatCurrency(transaction.amount)}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${
                    (transaction.balance || 0) > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(transaction.balance || 0)}
                  </span>
                </TableCell>
                {showDeleteButton && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (isSale && onDeleteSale) {
                          onDeleteSale(transaction)
                        } else if (isPayment && onDeletePayment) {
                          onDeletePayment(transaction)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
