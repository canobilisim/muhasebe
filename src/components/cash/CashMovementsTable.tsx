import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, DollarSign, Receipt } from 'lucide-react'
import type { CashMovementWithDetails } from '@/services/cashService'

interface CashMovementsTableProps {
  movements: CashMovementWithDetails[]
  isLoading?: boolean
}

const getMovementTypeInfo = (type: string) => {
  switch (type) {
    case 'opening':
      return {
        label: 'Açılış',
        icon: Wallet,
        color: 'bg-blue-100 text-blue-800',
        textColor: 'text-blue-600'
      }
    case 'closing':
      return {
        label: 'Kapanış',
        icon: Wallet,
        color: 'bg-gray-100 text-gray-800',
        textColor: 'text-gray-600'
      }
    case 'income':
      return {
        label: 'Gelir',
        icon: TrendingUp,
        color: 'bg-green-100 text-green-800',
        textColor: 'text-green-600'
      }
    case 'expense':
      return {
        label: 'Gider',
        icon: TrendingDown,
        color: 'bg-red-100 text-red-800',
        textColor: 'text-red-600'
      }
    case 'sale':
      return {
        label: 'Satış',
        icon: Receipt,
        color: 'bg-purple-100 text-purple-800',
        textColor: 'text-purple-600'
      }
    default:
      return {
        label: 'Diğer',
        icon: DollarSign,
        color: 'bg-gray-100 text-gray-800',
        textColor: 'text-gray-600'
      }
  }
}

export const CashMovementsTable = ({ movements, isLoading }: CashMovementsTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kasa Hareketleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kasa Hareketleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Henüz kasa hareketi bulunmuyor</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kasa Hareketleri</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Saat</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Referans</TableHead>
              <TableHead>Kullanıcı</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const typeInfo = getMovementTypeInfo(movement.movement_type)
              const Icon = typeInfo.icon
              const isNegative = movement.movement_type === 'expense'

              return (
                <TableRow key={movement.id}>
                  <TableCell className="font-mono text-sm">
                    {new Date(movement.created_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={typeInfo.color}>
                      <Icon className="w-3 h-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={movement.description || ''}>
                      {movement.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {movement.reference_number || movement.sale_number || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {movement.user_name || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                      {isNegative ? '-' : '+'}{formatCurrency(movement.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}