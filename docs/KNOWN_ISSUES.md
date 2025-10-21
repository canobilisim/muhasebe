# Known Issues

## Active Issues

### 1. CustomerTransactionsTable Import Error

**File**: `src/components/customers/CustomerTransactionsTable.tsx`

**Issue**: Incorrect import statement for `isAdmin` function

**Current Code** (❌ Incorrect):
```typescript
import { isAdmin } from '@/lib/supabase'
```

**Error Message**:
```
Module '"@/lib/supabase"' has no exported member 'isAdmin'.
```

**Root Cause**:
- The `isAdmin` function is not exported from `@/lib/supabase`
- The function exists in the `useAuth` hook at `@/hooks/useAuth.ts`
- React hooks must be called inside React components, not imported as standalone functions

**Solution**:

Replace the import and usage:

```typescript
// Remove this import
// import { isAdmin } from '@/lib/supabase'

// Add this import
import { useAuth } from '@/hooks/useAuth'

// Inside the component
export const CustomerTransactionsTable = ({ 
  transactions, 
  onViewSaleDetail,
  onViewPaymentDetail,
  onDeleteSale,
  onDeletePayment
}: CustomerTransactionsTableProps) => {
  // Use the hook
  const { isAdmin } = useAuth()
  const showDeleteButton = isAdmin()
  
  // Rest of the component...
}
```

**Impact**:
- TypeScript compilation error
- Component will not render correctly
- Delete buttons for admin users will not work

**Priority**: High (Blocks functionality)

**Status**: Needs fix

**Related Files**:
- `src/components/customers/CustomerTransactionsTable.tsx` (needs fix)
- `src/hooks/useAuth.ts` (correct implementation)
- `docs/CUSTOMER_TRANSACTIONS_TABLE.md` (documented)

---

## Fixed Issues

### None yet

---

## Notes

- Always use React hooks inside components, not as standalone imports
- The `useAuth` hook provides role-based access control functions
- Check TypeScript errors before committing code
