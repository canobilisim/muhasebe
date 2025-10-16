import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import type { CartItem } from '@/types'

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export const CartItemComponent = memo<CartItemProps>(({ item, onUpdateQuantity, onRemove }) => {
  const handleDecrement = useCallback(() => {
    onUpdateQuantity(item.product.id, item.quantity - 1)
  }, [item.product.id, item.quantity, onUpdateQuantity])

  const handleIncrement = useCallback(() => {
    onUpdateQuantity(item.product.id, item.quantity + 1)
  }, [item.product.id, item.quantity, onUpdateQuantity])

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateQuantity(item.product.id, parseInt(e.target.value) || 0)
  }, [item.product.id, onUpdateQuantity])

  const handleRemove = useCallback(() => {
    onRemove(item.product.id)
  }, [item.product.id, onRemove])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 lg:p-3 border rounded-lg gap-2 sm:gap-0">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm lg:text-base truncate">{item.product.name}</div>
        <div className="text-xs lg:text-sm text-gray-500">
          {item.product.barcode} • {formatCurrency(item.unitPrice)}
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-2 lg:gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            className="w-8 h-8 lg:w-9 lg:h-9 p-0 touch-manipulation"
          >
            -
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-12 lg:w-16 text-center text-sm lg:text-base h-8 lg:h-9"
            min="0"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            className="w-8 h-8 lg:w-9 lg:h-9 p-0 touch-manipulation"
          >
            +
          </Button>
        </div>
        
        <div className="text-right min-w-[60px] lg:min-w-[80px]">
          <div className="font-semibold text-sm lg:text-base">{formatCurrency(item.totalAmount)}</div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-600 hover:text-red-700 w-8 h-8 lg:w-9 lg:h-9 p-0 touch-manipulation"
        >
          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
        </Button>
      </div>
    </div>
  )
})

CartItemComponent.displayName = 'CartItemComponent'