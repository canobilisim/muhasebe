# Customer Payments System Update

## Summary

The customer payment system has been refactored to use a dedicated `customer_payments` table instead of creating negative sales records. This provides better data modeling, improved query performance, and clearer separation of concerns.

## What Changed

### Database Schema
- **New Table**: `customer_payments` table with proper structure for payment records
- **Migration**: `006_customer_payments_table.sql` creates the table with indexes and RLS policies
- **Payment Number**: Auto-generated unique payment numbers via `generate_payment_number` RPC function

### Services
- **CustomerPaymentService**: New service for managing payment records
  - `createPayment()`: Create a new payment record
  - `getCustomerPayments()`: Get all payments for a customer
  - `deletePayment()`: Delete a payment record

- **CustomerService**: Updated to work with new payment system
  - `getCustomerTransactions()`: Now includes both sales and payments
  - `updateCustomerBalance()`: Simplified to use direct updates

### UI Components
- **FastSalePage**: Payment receive modal now uses `CustomerPaymentService`
- **CustomerDetailPage**: Payment modal uses `CustomerPaymentService`
- **PaymentDetailModal**: New modal component for displaying payment details
  - Shows payment number, amount, type, date, and user information
  - Visually enhanced with icons and colored cards
  - Displays payment notes if available
  - Used in CustomerTransactionsTable for payment detail viewing

### Type Definitions
- Added `CustomerPayment`, `CustomerPaymentInsert`, `CustomerPaymentUpdate`
- Added `CustomerPaymentWithDetails` for joined queries
- Added `CustomerTransaction` type for unified transaction view

## Benefits

### 1. Better Data Model
- Payments are now first-class entities, not negative sales
- Clear separation between sales and payments
- Easier to understand and maintain

### 2. Improved Performance
- Dedicated indexes for payment queries
- No need to filter negative sales
- Faster customer transaction history

### 3. Better Audit Trail
- Clear distinction between sales and payments
- Proper payment metadata (payment_type, payment_date, notes)
- Better reporting capabilities

### 4. Type Safety
- Proper TypeScript types for all payment operations
- Compile-time validation of payment data
- Better IDE autocomplete and error detection

## Usage Examples

### Creating a Payment (Fast Sale Page)
```typescript
// Ödeme kaydı oluştur
await CustomerPaymentService.createPayment({
  customer_id: activeCustomer.id,
  amount: amount,
  payment_type: paymentReceiveType,
  payment_date: new Date().toISOString(),
  notes: 'Hızlı satış ekranından alınan ödeme'
});

// Müşteri bakiyesini güncelle
await CustomerService.updateCustomer(activeCustomer.id, {
  current_balance: (activeCustomer.current_balance || 0) - amount
});
```

### Getting Customer Transactions
```typescript
// Satışlar ve ödemeler birlikte
const transactions = await CustomerService.getCustomerTransactions(customerId);

// transactions array contains:
// - type: 'sale' | 'payment'
// - date: transaction date
// - amount: positive for sales, negative for payments
// - balance: running balance after transaction
```

### Getting Customer Payments Only
```typescript
const payments = await CustomerPaymentService.getCustomerPayments(customerId);

// Returns array of CustomerPaymentWithDetails
// Includes customer and user information
```

## Migration Guide

### For Developers

1. **Update Code**: Replace negative sale creation with `CustomerPaymentService.createPayment()`
2. **Update Queries**: Use `getCustomerTransactions()` for unified view
3. **Test**: Verify payment creation and balance updates work correctly

### For Database

1. **Apply Migration**: Run `006_customer_payments_table.sql`
2. **Verify**: Check table creation and RLS policies
3. **Test**: Create test payments and verify data integrity

## API Changes

### New Endpoints (via CustomerPaymentService)
```typescript
// Create payment
CustomerPaymentService.createPayment(payment: Omit<CustomerPaymentInsert, 'branch_id' | 'user_id'>): Promise<CustomerPayment>

// Get customer payments
CustomerPaymentService.getCustomerPayments(customerId: string): Promise<CustomerPaymentWithDetails[]>

// Delete payment
CustomerPaymentService.deletePayment(id: string): Promise<void>
```

### Updated Endpoints
```typescript
// Now includes payments
CustomerService.getCustomerTransactions(customerId: string): Promise<CustomerTransaction[]>
```

## Testing Checklist

- [ ] Create payment from Fast Sale page
- [ ] Create payment from Customer Detail page
- [ ] Verify customer balance updates correctly
- [ ] Check transaction history shows both sales and payments
- [ ] Verify RLS policies (branch isolation)
- [ ] Test payment deletion
- [ ] Verify payment type filtering
- [ ] Check date range filtering

## Backward Compatibility

- Existing negative sales records (if any) are not automatically migrated
- Old code using negative sales will continue to work but should be updated
- The `update_customer_balance` RPC function is no longer needed

## Future Enhancements

1. **Payment Receipts**: Generate receipts for payments
2. **Payment Methods**: Add more payment types (bank transfer, check, etc.)
3. **Payment Reconciliation**: Match payments with invoices
4. **Payment Reports**: Dedicated payment analytics and reports
5. **Partial Payments**: Link payments to specific sales
6. **Payment Reversals**: Support for payment cancellations

## Payment Number System

### Auto-Generated Payment Numbers
- Format: `ODM-YYYYMMDD-NNNNNN` (e.g., "ODM-20241021-000001")
- Generated via `generate_payment_number` RPC function
- Unique per branch and date
- Sequential numbering resets daily
- Automatically assigned on payment creation

### Implementation
```typescript
// In CustomerPaymentService.createPayment()
const { data: paymentNumberData } = await supabase
  .rpc('generate_payment_number', { branch_uuid: userProfile.branch_id })

// Payment number is automatically included in the payment record
const payment = await supabase.from('customer_payments').insert({
  ...paymentData,
  payment_number: paymentNumberData
})
```

## Related Files

### Database
- `supabase/migrations/006_customer_payments_table.sql`
- `supabase/migrations/006_customer_payments_table_README.md`
- RPC Function: `generate_payment_number` (generates unique payment numbers)

### Services
- `src/services/customerPaymentService.ts`
- `src/services/customerService.ts`

### Types
- `src/types/index.ts`
- `src/types/database.ts`

### UI
- `src/pages/pos/FastSalePage.tsx`
- `src/pages/CustomerDetailPage.tsx`
- `src/components/customers/CustomerTransactionsTable.tsx`
- `src/components/customers/PaymentDetailModal.tsx`

### Documentation
- `README.md` (updated API section)
- `docs/CUSTOMER_PAYMENTS_UPDATE.md` (this file)

## Support

For questions or issues related to this update, please:
1. Check the migration README
2. Review the code examples above
3. Test in development environment first
4. Contact the development team if issues persist
